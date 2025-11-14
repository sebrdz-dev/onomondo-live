import { useState, useEffect } from 'react'
import ConnectionPanel from './components/ConnectionPanel'
import CaptureControls from './components/CaptureControls'
import StatsPanel from './components/StatsPanel'
import PacketList from './components/PacketList'
import FilterPanel from './components/FilterPanel'
import CaptureHistory from './components/CaptureHistory'
import SettingsPanel from './components/SettingsPanel'
import { useIPC } from './hooks/useIPC'
import { applyFilters } from './utils/filters'

function App () {
  const { invoke } = useIPC()
  const [apiKey, setApiKey] = useState('')
  const [simIds, setSimIds] = useState([''])
  const [activeCaptureId, setActiveCaptureId] = useState(null)
  const [filePath, setFilePath] = useState('')
  const [connectionReady, setConnectionReady] = useState(false)
  const [activeTab, setActiveTab] = useState('capture')
  const [filters, setFilters] = useState(null)
  const [packets, setPackets] = useState([])
  const [electronAPIAvailable, setElectronAPIAvailable] = useState(false)

  // Check if electronAPI is available
  useEffect(() => {
    const checkAPI = () => {
      if (window.electronAPI) {
        setElectronAPIAvailable(true)
        // Load saved API key and SIMs
        invoke('settings:get', 'apiKey').then(key => {
          if (key) setApiKey(key)
        }).catch(err => console.error('Error loading API key:', err))
        invoke('settings:get', 'simIds').then(ids => {
          if (ids && ids.length > 0) setSimIds(ids)
        }).catch(err => console.error('Error loading SIM IDs:', err))
      } else {
        // Retry after a short delay
        setTimeout(checkAPI, 100)
      }
    }
    checkAPI()
  }, [invoke])

  // Handle connection ready
  const handleConnectionReady = (ready) => {
    setConnectionReady(ready)
  }

  // Handle capture start
  const handleCaptureStart = (captureId) => {
    setActiveCaptureId(captureId)
  }

  // Handle capture stop
  const handleCaptureStop = (captureId) => {
    if (activeCaptureId === captureId) {
      setActiveCaptureId(null)
    }
  }

  // Handle filter change
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
    if (newFilters && packets.length > 0) {
      const filtered = applyFilters(packets, newFilters)
      setPackets(filtered)
    }
  }

  const tabs = [
    { id: 'capture', label: 'Capture' },
    { id: 'packets', label: 'Packets' },
    { id: 'history', label: 'History' },
    { id: 'settings', label: 'Settings' }
  ]

  // Show loading state if electronAPI is not available
  if (!electronAPIAvailable) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading application...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Onomondo Live GUI
          </h1>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {activeTab === 'capture' && (
          <div className="space-y-6">
            <ConnectionPanel
              onConnectionReady={handleConnectionReady}
              onApiKeyChange={setApiKey}
              onSimIdsChange={setSimIds}
            />
            <CaptureControls
              apiKey={apiKey}
              simIds={simIds}
              onCaptureStart={handleCaptureStart}
              onCaptureStop={handleCaptureStop}
              onFilePathChange={setFilePath}
            />
            {activeCaptureId && (
              <StatsPanel activeCaptureId={activeCaptureId} />
            )}
          </div>
        )}

        {activeTab === 'packets' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <FilterPanel
                onFilterChange={handleFilterChange}
                packets={packets}
              />
            </div>
            <div className="lg:col-span-3">
              <PacketList
                filePath={filePath}
                activeCaptureId={activeCaptureId}
              />
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <CaptureHistory />
        )}

        {activeTab === 'settings' && (
          <SettingsPanel />
        )}
      </main>
    </div>
  )
}

export default App
