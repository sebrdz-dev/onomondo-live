import { useState, useEffect } from 'react'
import { useIPC } from '../hooks/useIPC'

function SettingsPanel () {
  const { invoke } = useIPC()
  const [settings, setSettings] = useState({
    defaultSaveLocation: '',
    theme: 'light',
    autoStart: false
  })
  const [saved, setSaved] = useState(false)

  // Load settings
  useEffect(() => {
    invoke('settings:get').then(savedSettings => {
      if (savedSettings) {
        setSettings(prev => ({
          ...prev,
          ...savedSettings
        }))
      }
    })
  }, [invoke])

  // Handle setting change
  const handleSettingChange = async (key, value) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    await invoke('settings:set', key, value)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  // Handle save location picker
  const handleSaveLocationPicker = async () => {
    const result = await invoke('file:save-dialog', {
      defaultPath: settings.defaultSaveLocation
    })
    if (result.success && result.filePath) {
      // Extract directory from file path
      const lastSlash = Math.max(result.filePath.lastIndexOf('/'), result.filePath.lastIndexOf('\\'))
      const dir = lastSlash > 0 ? result.filePath.substring(0, lastSlash) : result.filePath
      await handleSettingChange('defaultSaveLocation', dir)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Settings</h2>
        {saved && (
          <span className="text-sm text-green-600">Saved!</span>
        )}
      </div>

      {/* Default Save Location */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Default Save Location
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={settings.defaultSaveLocation}
            readOnly
            placeholder="No default location set"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md bg-gray-50"
          />
          <button
            onClick={handleSaveLocationPicker}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Browse...
          </button>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Default directory for saving PCAP files
        </p>
      </div>

      {/* Theme Preference */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Theme
        </label>
        <select
          value={settings.theme}
          onChange={(e) => handleSettingChange('theme', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="system">System</option>
        </select>
        <p className="mt-1 text-sm text-gray-500">
          Choose your preferred color theme
        </p>
      </div>

      {/* Auto-start */}
      <div className="mb-6">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.autoStart}
            onChange={(e) => handleSettingChange('autoStart', e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">
            Auto-start capture on app launch
          </span>
        </label>
        <p className="mt-1 text-sm text-gray-500 ml-6">
          Automatically start the last capture session when the app opens
        </p>
      </div>

      {/* About */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold mb-2">About</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p>Onomondo Live GUI v0.1.0</p>
          <p>Visual interface for onomondo-live</p>
          <p>
            <a
              href="https://github.com/sebrdz-dev/onomondo-live"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              GitHub Repository
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default SettingsPanel

