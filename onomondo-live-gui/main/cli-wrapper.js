const { spawn } = require('child_process')
const { EventEmitter } = require('events')

class CLIWrapper extends EventEmitter {
  constructor () {
    super()
    this.processes = new Map() // Map of captureId -> process
    this.captureStates = new Map() // Map of captureId -> state
  }

  /**
   * Start a capture session
   * @param {Object} options - Capture options
   * @param {string} options.captureId - Unique capture session ID
   * @param {string} options.apiKey - Onomondo API key
   * @param {string[]} options.simIds - Array of SIM IDs (9 digits each)
   * @param {string} options.filename - Output PCAP filename
   * @param {string} [options.apiUrl] - Optional API URL (defaults to https://api.onomondo.com)
   */
  startCapture (options) {
    const { captureId, apiKey, simIds, filename, apiUrl } = options

    // Validate inputs
    if (!captureId || !apiKey || !simIds || !filename) {
      throw new Error('Missing required capture options')
    }

    if (!Array.isArray(simIds) || simIds.length === 0) {
      throw new Error('At least one SIM ID is required')
    }

    // Validate SIM IDs are 9 digits
    const invalidSims = simIds.filter(id => !/^\d{9}$/.test(id))
    if (invalidSims.length > 0) {
      throw new Error(`Invalid SIM IDs: ${invalidSims.join(', ')}. Must be exactly 9 digits.`)
    }

    // Check if capture already exists
    if (this.processes.has(captureId)) {
      throw new Error(`Capture ${captureId} is already running`)
    }

    // Build command arguments
    const args = ['--key', apiKey]
    
    // Add SIM IDs
    simIds.forEach(simId => {
      args.push('--sim', simId)
    })

    // Add filename
    args.push('--filename', filename)

    // Add API URL if provided
    if (apiUrl) {
      args.push('--api', apiUrl)
    }

    // Spawn onomondo-live process
    // Note: Assumes onomondo-live is installed globally or in PATH
    const process = spawn('onomondo-live', args, {
      stdio: ['ignore', 'pipe', 'pipe'] // stdin ignored, stdout/stderr piped
    })

    // Initialize capture state
    const state = {
      captureId,
      apiKey: apiKey.substring(0, 10) + '...', // Partial key for logging
      simIds,
      filename,
      status: 'starting',
      packets: 0,
      bytes: 0,
      startTime: Date.now(),
      connected: false,
      authenticated: false,
      subscribed: new Set()
    }

    this.processes.set(captureId, process)
    this.captureStates.set(captureId, state)

    // Handle stdout (PCAP data - we don't need to parse this)
    process.stdout.on('data', (data) => {
      // PCAP data goes to stdout, we don't need to process it
      // It's being written directly to the file by onomondo-live
    })

    // Handle stderr (status messages and statistics)
    let stderrBuffer = ''
    process.stderr.on('data', (data) => {
      stderrBuffer += data.toString()
      const lines = stderrBuffer.split('\n')
      stderrBuffer = lines.pop() || '' // Keep incomplete line in buffer

      lines.forEach(line => {
        this.parseStderrLine(captureId, line.trim())
      })
    })

    // Handle process errors
    process.on('error', (error) => {
      state.status = 'error'
      this.emit('error', { captureId, error: error.message })
      this.cleanup(captureId)
    })

    // Handle process exit
    process.on('exit', (code, signal) => {
      state.status = 'stopped'
      this.emit('stopped', {
        captureId,
        code,
        signal,
        packets: state.packets,
        bytes: state.bytes,
        duration: Date.now() - state.startTime
      })
      this.cleanup(captureId)
    })

    // Emit started event
    this.emit('started', { captureId, filename, simIds })

    return captureId
  }

  /**
   * Parse a line from stderr
   * @param {string} captureId - Capture session ID
   * @param {string} line - Line to parse
   */
  parseStderrLine (captureId, line) {
    if (!line) return

    const state = this.captureStates.get(captureId)
    if (!state) return

    // Parse version message
    if (line.includes('Onomondo Live')) {
      // Version info, can be logged but not critical
      return
    }

    // Parse connection status
    if (line.includes('Connected and authenticated')) {
      state.connected = true
      state.authenticated = true
      state.status = 'connected'
      this.emit('connection-status', {
        captureId,
        connected: true,
        authenticated: true
      })
      return
    }

    // Parse subscription confirmation
    const subscribedMatch = line.match(/Attached\. SIM id=(\d{9})\. ip=([\d.]+)/)
    if (subscribedMatch) {
      const [, simId, ip] = subscribedMatch
      state.subscribed.add(simId)
      this.emit('subscribed', {
        captureId,
        simId,
        ip
      })
      return
    }

    // Parse packet statistics
    // Format: "Captured: 123 packets (456.78 KB)"
    const statsMatch = line.match(/Captured:\s+(\d+)\s+packet.*?\(([^)]+)\)/)
    if (statsMatch) {
      const [, packetCount, byteString] = statsMatch
      state.packets = parseInt(packetCount, 10)
      
      // Parse byte string (e.g., "456.78 KB")
      state.bytes = this.parseByteString(byteString)
      
      this.emit('stats-update', {
        captureId,
        packets: state.packets,
        bytes: state.bytes
      })
      return
    }

    // Parse error messages
    if (line.includes('Error:') || line.includes('error')) {
      this.emit('error', {
        captureId,
        error: line
      })
      return
    }

    // Parse authentication failure
    if (line.includes('Authenticated failed') || line.includes('Not authenticated')) {
      state.authenticated = false
      state.status = 'auth-failed'
      this.emit('connection-status', {
        captureId,
        connected: false,
        authenticated: false,
        error: 'Authentication failed'
      })
      return
    }

    // Parse disconnection
    if (line.includes('Connection closed') || line.includes('disconnected')) {
      state.connected = false
      this.emit('connection-status', {
        captureId,
        connected: false,
        authenticated: state.authenticated
      })
      return
    }

    // Log unparsed lines for debugging
    if (line.length > 0 && !line.match(/^\[.*?\]/)) {
      // Not a timestamped log line, might be important
      this.emit('log', { captureId, message: line })
    }
  }

  /**
   * Parse byte string to bytes
   * @param {string} byteString - String like "456.78 KB"
   * @returns {number} - Bytes as number
   */
  parseByteString (byteString) {
    const units = {
      'B': 1,
      'KB': 1024,
      'MB': 1024 * 1024,
      'GB': 1024 * 1024 * 1024
    }

    const match = byteString.match(/^([\d.]+)\s*([KMGT]?B)$/i)
    if (match) {
      const [, value, unit] = match
      const multiplier = units[unit.toUpperCase()] || 1
      return Math.round(parseFloat(value) * multiplier)
    }

    return 0
  }

  /**
   * Stop a capture session
   * @param {string} captureId - Capture session ID
   */
  stopCapture (captureId) {
    const process = this.processes.get(captureId)
    if (!process) {
      throw new Error(`Capture ${captureId} not found`)
    }

    // Kill the process
    process.kill('SIGTERM')
    
    // If it doesn't exit gracefully, force kill after 2 seconds
    setTimeout(() => {
      if (this.processes.has(captureId)) {
        const proc = this.processes.get(captureId)
        if (proc && !proc.killed) {
          proc.kill('SIGKILL')
        }
      }
    }, 2000)
  }

  /**
   * Get capture status
   * @param {string} captureId - Capture session ID
   * @returns {Object|null} - Capture state or null if not found
   */
  getCaptureStatus (captureId) {
    const state = this.captureStates.get(captureId)
    if (!state) return null

    return {
      ...state,
      subscribed: Array.from(state.subscribed),
      duration: Date.now() - state.startTime
    }
  }

  /**
   * Get all active captures
   * @returns {Array} - Array of capture IDs
   */
  getActiveCaptures () {
    return Array.from(this.processes.keys())
  }

  /**
   * Cleanup capture resources
   * @param {string} captureId - Capture session ID
   */
  cleanup (captureId) {
    const process = this.processes.get(captureId)
    if (process && !process.killed) {
      process.kill('SIGTERM')
    }
    this.processes.delete(captureId)
    this.captureStates.delete(captureId)
  }

  /**
   * Stop all captures
   */
  stopAll () {
    const captureIds = Array.from(this.processes.keys())
    captureIds.forEach(id => this.stopCapture(id))
  }
}

module.exports = CLIWrapper

