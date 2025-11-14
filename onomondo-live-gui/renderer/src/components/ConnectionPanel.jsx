import { useState, useEffect } from 'react'
import { useIPC } from '../hooks/useIPC'

function ConnectionPanel ({ onConnectionReady, onApiKeyChange, onSimIdsChange }) {
  const { invoke, on, removeListener } = useIPC()
  
  const [apiKey, setApiKey] = useState('')
  const [simIds, setSimIds] = useState([''])
  const [connectionStatus, setConnectionStatus] = useState({
    connected: false,
    authenticated: false,
    error: null
  })
  const [isTesting, setIsTesting] = useState(false)
  const [simErrors, setSimErrors] = useState({})

  // Load saved API key from settings
  useEffect(() => {
    invoke('settings:get', 'apiKey').then(key => {
      if (key) {
        setApiKey(key)
      }
    })
  }, [invoke])

  // Listen for connection status updates
  useEffect(() => {
    const handleConnectionStatus = (data) => {
      setConnectionStatus({
        connected: data.connected || false,
        authenticated: data.authenticated || false,
        error: data.error || null
      })
    }

    on('connection:status', handleConnectionStatus)
    
    return () => {
      removeListener('connection:status', handleConnectionStatus)
    }
  }, [on, removeListener])

  // Validate SIM ID
  const validateSimId = (simId) => {
    if (!simId) return { valid: false, error: 'SIM ID is required' }
    if (!/^\d{9}$/.test(simId)) {
      return { valid: false, error: 'SIM ID must be exactly 9 digits' }
    }
    return { valid: true, error: null }
  }

  // Handle SIM ID change
  const handleSimChange = (index, value) => {
    const newSimIds = [...simIds]
    newSimIds[index] = value
    setSimIds(newSimIds)

    // Validate
    const validation = validateSimId(value)
    setSimErrors(prev => ({
      ...prev,
      [index]: validation.error
    }))

    // Notify parent
    if (onSimIdsChange) {
      onSimIdsChange(newSimIds)
    }
    if (onConnectionReady) {
      const allValid = newSimIds.every((id, idx) => {
        if (idx === index) return validation.valid
        return validateSimId(id).valid
      })
      const hasApiKey = apiKey.length > 0
      onConnectionReady(allValid && hasApiKey && newSimIds.every(id => id.length > 0))
    }
  }

  // Add new SIM ID field
  const addSim = () => {
    const newSimIds = [...simIds, '']
    setSimIds(newSimIds)
    if (onSimIdsChange) {
      onSimIdsChange(newSimIds)
    }
  }

  // Remove SIM ID field
  const removeSim = (index) => {
    if (simIds.length > 1) {
      const newSimIds = simIds.filter((_, i) => i !== index)
      setSimIds(newSimIds)
      if (onSimIdsChange) {
        onSimIdsChange(newSimIds)
      }
      setSimErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[index]
        // Reindex errors
        const reindexed = {}
        Object.keys(newErrors).forEach(key => {
          const keyNum = parseInt(key, 10)
          if (keyNum < index) {
            reindexed[key] = newErrors[key]
          } else if (keyNum > index) {
            reindexed[keyNum - 1] = newErrors[key]
          }
        })
        return reindexed
      })
    }
  }

  // Handle API key change
  const handleApiKeyChange = (value) => {
    setApiKey(value)
    // Save to settings
    invoke('settings:set', 'apiKey', value)
    
    // Notify parent
    if (onApiKeyChange) {
      onApiKeyChange(value)
    }
    if (onConnectionReady) {
      const allValid = simIds.every((id, idx) => validateSimId(id).valid)
      onConnectionReady(allValid && value.length > 0 && simIds.every(id => id.length > 0))
    }
  }

  // Test connection
  const handleTestConnection = async () => {
    // Validate inputs
    if (!apiKey) {
      setConnectionStatus({
        connected: false,
        authenticated: false,
        error: 'API key is required'
      })
      return
    }

    const validSims = simIds.filter(id => id.length > 0)
    if (validSims.length === 0) {
      setConnectionStatus({
        connected: false,
        authenticated: false,
        error: 'At least one SIM ID is required'
      })
      return
    }

    const invalidSims = validSims.filter(id => !validateSimId(id).valid)
    if (invalidSims.length > 0) {
      setConnectionStatus({
        connected: false,
        authenticated: false,
        error: 'Some SIM IDs are invalid'
      })
      return
    }

    setIsTesting(true)
    setConnectionStatus({
      connected: false,
      authenticated: false,
      error: null
    })

    // Start a temporary capture to test connection
    try {
      const result = await invoke('capture:start', {
        captureId: `test-${Date.now()}`,
        apiKey,
        simIds: validSims,
        filename: '/tmp/test-connection.pcap' // Temporary file
      })

      if (result.success) {
        // Stop the test capture after a short delay
        setTimeout(() => {
          invoke('capture:stop', result.captureId)
        }, 2000)
      } else {
        setConnectionStatus({
          connected: false,
          authenticated: false,
          error: result.error || 'Connection test failed'
        })
        setIsTesting(false)
      }
    } catch (error) {
      setConnectionStatus({
        connected: false,
        authenticated: false,
        error: error.message || 'Connection test failed'
      })
      setIsTesting(false)
    }
  }

  // Get status color
  const getStatusColor = () => {
    if (connectionStatus.error) return 'text-red-600'
    if (connectionStatus.connected && connectionStatus.authenticated) return 'text-green-600'
    if (connectionStatus.connected) return 'text-yellow-600'
    return 'text-gray-600'
  }

  // Get status text
  const getStatusText = () => {
    if (isTesting) return 'Testing connection...'
    if (connectionStatus.error) return `Error: ${connectionStatus.error}`
    if (connectionStatus.connected && connectionStatus.authenticated) return 'Connected and authenticated'
    if (connectionStatus.connected) return 'Connected'
    return 'Not connected'
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-4">Connection Settings</h2>

      {/* API Key Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Onomondo API Key
        </label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => handleApiKeyChange(e.target.value)}
          placeholder="onok_xxxxx.xxxxx"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="mt-1 text-sm text-gray-500">
          Generate an API key at{' '}
          <a
            href="https://app.onomondo.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            app.onomondo.com
          </a>
        </p>
      </div>

      {/* SIM IDs */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          SIM IDs (9 digits each)
        </label>
        {simIds.map((simId, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={simId}
              onChange={(e) => handleSimChange(index, e.target.value)}
              placeholder="012345678"
              maxLength={9}
              className={`flex-1 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                simErrors[index] ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {simIds.length > 1 && (
              <button
                onClick={() => removeSim(index)}
                className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        {simIds.some((_, idx) => simErrors[idx]) && (
          <p className="text-sm text-red-600 mt-1">
            {Object.values(simErrors).find(err => err)}
          </p>
        )}
        <button
          onClick={addSim}
          className="mt-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          + Add SIM
        </button>
      </div>

      {/* Connection Status */}
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            connectionStatus.connected && connectionStatus.authenticated
              ? 'bg-green-500'
              : connectionStatus.error
              ? 'bg-red-500'
              : 'bg-gray-400'
          }`} />
          <span className={getStatusColor()}>
            {getStatusText()}
          </span>
        </div>
      </div>

      {/* Test Connection Button */}
      <button
        onClick={handleTestConnection}
        disabled={isTesting || !apiKey || simIds.every(id => !id)}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isTesting ? 'Testing...' : 'Test Connection'}
      </button>
    </div>
  )
}

export default ConnectionPanel

