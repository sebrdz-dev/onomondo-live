import { useState, useEffect } from 'react'
import { useIPC } from '../hooks/useIPC'
import { createDefaultFilter, validateFilter } from '../utils/filters'

function FilterPanel ({ onFilterChange, packets }) {
  const { invoke } = useIPC()
  const [filters, setFilters] = useState(createDefaultFilter())
  const [presets, setPresets] = useState([])
  const [presetName, setPresetName] = useState('')

  // Load saved presets
  useEffect(() => {
    invoke('settings:get', 'filterPresets').then(savedPresets => {
      if (savedPresets) {
        setPresets(savedPresets)
      }
    })
  }, [invoke])

  // Notify parent of filter changes
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(filters)
    }
  }, [filters, onFilterChange])

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value }
      const validation = validateFilter(newFilters)
      if (!validation.valid) {
        // Could show error message here
        return prev
      }
      return newFilters
    })
  }

  // Clear filters
  const clearFilters = () => {
    setFilters(createDefaultFilter())
  }

  // Save preset
  const savePreset = () => {
    if (!presetName.trim()) {
      alert('Please enter a preset name')
      return
    }

    const newPresets = [...presets, { name: presetName, filters: { ...filters } }]
    setPresets(newPresets)
    invoke('settings:set', 'filterPresets', newPresets)
    setPresetName('')
  }

  // Load preset
  const loadPreset = (preset) => {
    setFilters({ ...preset.filters })
  }

  // Delete preset
  const deletePreset = (index) => {
    const newPresets = presets.filter((_, i) => i !== index)
    setPresets(newPresets)
    invoke('settings:set', 'filterPresets', newPresets)
  }

  const hasActiveFilters = Object.values(filters).some(v => {
    if (Array.isArray(v)) return v.length > 0
    return v !== undefined && v !== null && v !== ''
  })

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Filters</h2>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-red-600 hover:text-red-700"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Size Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Packet Size (bytes)
        </label>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            value={filters.sizeMin || ''}
            onChange={(e) => handleFilterChange('sizeMin', e.target.value ? parseInt(e.target.value) : undefined)}
            placeholder="Min"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
            min="0"
          />
          <span className="text-gray-500">-</span>
          <input
            type="number"
            value={filters.sizeMax || ''}
            onChange={(e) => handleFilterChange('sizeMax', e.target.value ? parseInt(e.target.value) : undefined)}
            placeholder="Max"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
            min="0"
          />
        </div>
      </div>

      {/* Timestamp Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Timestamp Range
        </label>
        <div className="flex gap-2 items-center">
          <input
            type="datetime-local"
            value={filters.timestampMin ? new Date(filters.timestampMin).toISOString().slice(0, 16) : ''}
            onChange={(e) => handleFilterChange('timestampMin', e.target.value ? new Date(e.target.value).getTime() : undefined)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
          />
          <span className="text-gray-500">-</span>
          <input
            type="datetime-local"
            value={filters.timestampMax ? new Date(filters.timestampMax).toISOString().slice(0, 16) : ''}
            onChange={(e) => handleFilterChange('timestampMax', e.target.value ? new Date(e.target.value).getTime() : undefined)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      {/* Protocol Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Protocol
        </label>
        <select
          value={filters.protocol || ''}
          onChange={(e) => handleFilterChange('protocol', e.target.value || undefined)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="">All</option>
          <option value="IPv4">IPv4</option>
          <option value="IPv6">IPv6</option>
          <option value="TCP">TCP</option>
          <option value="UDP">UDP</option>
          <option value="Unknown">Unknown</option>
        </select>
      </div>

      {/* Filter Presets */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h3 className="text-lg font-semibold mb-3">Presets</h3>
        
        {/* Save Preset */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            placeholder="Preset name"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
          />
          <button
            onClick={savePreset}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Save
          </button>
        </div>

        {/* Preset List */}
        {presets.length > 0 && (
          <div className="space-y-2">
            {presets.map((preset, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
              >
                <span className="text-sm">{preset.name}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => loadPreset(preset)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Load
                  </button>
                  <button
                    onClick={() => deletePreset(index)}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default FilterPanel

