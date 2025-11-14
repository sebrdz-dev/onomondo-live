import { useState, useEffect } from 'react'
import { useCapture } from '../hooks/useCapture'
import { formatBytes, formatDuration, formatDataRate, formatPacketRate } from '../utils/formatters'

function StatsPanel ({ activeCaptureId }) {
  const { captures } = useCapture()
  const [currentTime, setCurrentTime] = useState(Date.now())

  // Update current time every second for timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Find active capture
  const activeCapture = captures.find(c => 
    c.captureId === activeCaptureId && c.status === 'running'
  )

  if (!activeCapture) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Statistics</h2>
        <p className="text-gray-500">No active capture</p>
      </div>
    )
  }

  const duration = currentTime - (activeCapture.startTime || currentTime)
  const packets = activeCapture.packets || 0
  const bytes = activeCapture.bytes || 0

  // Calculate rates
  const packetRate = duration > 0 ? (packets / duration) * 1000 : 0
  const byteRate = duration > 0 ? (bytes / duration) * 1000 : 0

  // Per-SIM stats (if available)
  const simStats = activeCapture.subscribed || []

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-4">Live Statistics</h2>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Packets</div>
          <div className="text-2xl font-bold text-blue-700">
            {packets.toLocaleString()}
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Bytes</div>
          <div className="text-2xl font-bold text-green-700">
            {formatBytes(bytes)}
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Duration</div>
          <div className="text-2xl font-bold text-purple-700">
            {formatDuration(duration)}
          </div>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Packet Rate</div>
          <div className="text-2xl font-bold text-orange-700">
            {formatPacketRate(packets, duration)}
          </div>
        </div>
      </div>

      {/* Data Rate */}
      <div className="mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Data Rate</div>
          <div className="text-xl font-semibold text-gray-800">
            {formatDataRate(bytes, duration)}
          </div>
        </div>
      </div>

      {/* Per-SIM Statistics */}
      {simStats.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Per-SIM Statistics</h3>
          <div className="space-y-2">
            {simStats.map((simId, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-sm text-gray-700">SIM: {simId}</span>
                  <span className="text-sm text-gray-600">
                    Active
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Capture Info */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600 space-y-1">
          <div className="flex justify-between">
            <span>Capture ID:</span>
            <span className="font-mono">{activeCapture.captureId}</span>
          </div>
          {activeCapture.filename && (
            <div className="flex justify-between">
              <span>File:</span>
              <span className="font-mono text-xs truncate max-w-xs">
                {activeCapture.filename.split('/').pop() || activeCapture.filename.split('\\').pop()}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StatsPanel

