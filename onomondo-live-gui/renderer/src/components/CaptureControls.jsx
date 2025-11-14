import { useState, useEffect } from 'react'
import { useIPC } from '../hooks/useIPC'
import { useCapture } from '../hooks/useCapture'

function CaptureControls ({ apiKey, simIds, onCaptureStart, onCaptureStop, onFilePathChange }) {
  const { invoke } = useIPC()
  const { captures, isStarting, startCapture, stopCapture } = useCapture()
  
  const [filename, setFilename] = useState('')
  const [filePath, setFilePath] = useState('')
  const [activeCaptureId, setActiveCaptureId] = useState(null)
  const [isPaused, setIsPaused] = useState(false)

  // Generate default filename
  const generateFilename = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    return `capture-${timestamp}.pcap`
  }

  // Load default save location
  useEffect(() => {
    invoke('settings:get', 'defaultSaveLocation').then(location => {
      if (location) {
        setFilePath(location)
      }
    })
  }, [invoke])

  // Check for active capture
  useEffect(() => {
    const active = captures.find(c => c.status === 'running')
    if (active) {
      setActiveCaptureId(active.captureId)
    } else {
      setActiveCaptureId(null)
      setIsPaused(false)
    }
  }, [captures])

  // Handle file picker
  const handleFilePicker = async () => {
    const defaultName = filename || generateFilename()
    const result = await invoke('file:save-dialog', {
      defaultPath: filePath ? `${filePath}/${defaultName}` : defaultName
    })

    if (result.success && result.filePath) {
      setFilePath(result.filePath)
      setFilename(result.filePath.split('/').pop() || result.filePath.split('\\').pop())
    }
  }

  // Handle start capture
  const handleStart = async () => {
    if (!apiKey || !simIds || simIds.length === 0) {
      alert('Please configure connection settings first')
      return
    }

    const validSimIds = simIds.filter(id => id && /^\d{9}$/.test(id))
    if (validSimIds.length === 0) {
      alert('Please enter at least one valid SIM ID')
      return
    }

    if (!filePath) {
      alert('Please select a file location')
      return
    }

    try {
      const captureId = `capture-${Date.now()}`
      await startCapture({
        captureId,
        apiKey,
        simIds: validSimIds,
        filename: filePath
      })
      
      setActiveCaptureId(captureId)
      if (onFilePathChange) {
        onFilePathChange(filePath)
      }
      if (onCaptureStart) {
        onCaptureStart(captureId)
      }
    } catch (error) {
      alert(`Failed to start capture: ${error.message}`)
    }
  }

  // Handle stop capture
  const handleStop = async () => {
    if (!activeCaptureId) return

    try {
      await stopCapture(activeCaptureId)
      setActiveCaptureId(null)
      setIsPaused(false)
      if (onCaptureStop) {
        onCaptureStop(activeCaptureId)
      }
    } catch (error) {
      alert(`Failed to stop capture: ${error.message}`)
    }
  }

  // Handle pause/resume (stop and restart)
  const handlePauseResume = async () => {
    if (!activeCaptureId) return

    if (isPaused) {
      // Resume - restart capture
      const capture = captures.find(c => c.captureId === activeCaptureId)
      if (capture) {
        try {
          await startCapture({
            captureId: `capture-${Date.now()}`,
            apiKey,
            simIds: capture.simIds || simIds.filter(id => id && /^\d{9}$/.test(id)),
            filename: capture.filename || filePath
          })
          setIsPaused(false)
        } catch (error) {
          alert(`Failed to resume capture: ${error.message}`)
        }
      }
    } else {
      // Pause - stop capture
      await handleStop()
      setIsPaused(true)
    }
  }

  // Open file location
  const handleOpenLocation = async () => {
    if (!filePath) return
    await invoke('file:open-location', filePath)
  }

  const isReady = apiKey && simIds && simIds.some(id => id && /^\d{9}$/.test(id))
  const isRunning = activeCaptureId && !isPaused

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-4">Capture Controls</h2>

      {/* File Location */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Save Location
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={filePath}
            readOnly
            placeholder="Select file location..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md bg-gray-50"
          />
          <button
            onClick={handleFilePicker}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Browse...
          </button>
          {filePath && (
            <button
              onClick={handleOpenLocation}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              title="Open file location"
            >
              📁
            </button>
          )}
        </div>
        {!filePath && (
          <p className="mt-1 text-sm text-gray-500">
            Click Browse to select where to save the PCAP file
          </p>
        )}
      </div>

      {/* Capture Status */}
      {activeCaptureId && (
        <div className="mb-4 p-3 bg-blue-50 rounded-md">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-blue-700">
              Capture active: {filename || filePath.split('/').pop() || filePath.split('\\').pop()}
            </span>
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex gap-2">
        {!isRunning ? (
          <button
            onClick={handleStart}
            disabled={!isReady || !filePath || isStarting}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            {isStarting ? 'Starting...' : 'Start Capture'}
          </button>
        ) : (
          <>
            <button
              onClick={handlePauseResume}
              className="px-6 py-3 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 font-medium"
            >
              {isPaused ? 'Resume' : 'Pause'}
            </button>
            <button
              onClick={handleStop}
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
            >
              Stop Capture
            </button>
          </>
        )}
      </div>

      {/* Multiple Captures Info */}
      {captures.length > 1 && (
        <div className="mt-4 p-3 bg-yellow-50 rounded-md">
          <p className="text-sm text-yellow-700">
            {captures.filter(c => c.status === 'running').length} active capture(s)
          </p>
        </div>
      )}
    </div>
  )
}

export default CaptureControls

