import { useState, useEffect, useMemo } from 'react'
import { useIPC } from '../hooks/useIPC'
import { formatTimestamp } from '../utils/formatters'
import PacketDetails from './PacketDetails'

function PacketList ({ filePath, activeCaptureId }) {
  const { invoke, on, removeListener } = useIPC()
  const [packets, setPackets] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedPacket, setSelectedPacket] = useState(null)
  const [sortColumn, setSortColumn] = useState('timestamp')
  const [sortDirection, setSortDirection] = useState('desc')
  const [autoScroll, setAutoScroll] = useState(true)

  // Listen for new packets from active capture
  useEffect(() => {
    if (!activeCaptureId) return

    const handleStatsUpdate = (data) => {
      if (data.captureId === activeCaptureId) {
        // In a real implementation, we'd read the PCAP file incrementally
        // For now, we'll just update the count
        // TODO: Implement incremental PCAP reading
      }
    }

    on('stats:update', handleStatsUpdate)
    return () => removeListener('stats:update', handleStatsUpdate)
  }, [activeCaptureId, on, removeListener])

  // Load packets from file
  const loadPackets = async (path) => {
    if (!path) return

    setLoading(true)
    setError(null)

    try {
      // Read file via IPC (would need to implement in main process)
      // For now, we'll use a placeholder
      // In production, this would read the PCAP file
      setPackets([])
      setLoading(false)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  // Load packets when file path changes
  useEffect(() => {
    if (filePath) {
      loadPackets(filePath)
    }
  }, [filePath])

  // Sort packets
  const sortedPackets = useMemo(() => {
    const sorted = [...packets]
    sorted.sort((a, b) => {
      let aVal = a[sortColumn]
      let bVal = b[sortColumn]

      if (sortColumn === 'timestamp') {
        aVal = a.timestamp || 0
        bVal = b.timestamp || 0
      }

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase()
        bVal = bVal.toLowerCase()
      }

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0
      }
    })
    return sorted
  }, [packets, sortColumn, sortDirection])

  // Handle column sort
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('desc')
    }
  }

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll && sortedPackets.length > 0) {
      const listElement = document.getElementById('packet-list')
      if (listElement) {
        listElement.scrollTop = listElement.scrollHeight
      }
    }
  }, [sortedPackets.length, autoScroll])

  const SortIcon = ({ column }) => {
    if (sortColumn !== column) return null
    return sortDirection === 'asc' ? '↑' : '↓'
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Packet List</h2>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
            />
            Auto-scroll
          </label>
          <span className="text-sm text-gray-600">
            {sortedPackets.length} packets
          </span>
        </div>
      </div>

      {loading && (
        <div className="text-center py-8 text-gray-500">Loading packets...</div>
      )}

      {error && (
        <div className="text-center py-8 text-red-500">Error: {error}</div>
      )}

      {!loading && !error && sortedPackets.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No packets loaded. Start a capture to see packets here.
        </div>
      )}

      {!loading && !error && sortedPackets.length > 0 && (
        <>
          <div
            id="packet-list"
            className="border border-gray-200 rounded-md overflow-auto"
            style={{ maxHeight: '500px' }}
          >
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th
                    className="px-4 py-2 text-left cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('index')}
                  >
                    # <SortIcon column="index" />
                  </th>
                  <th
                    className="px-4 py-2 text-left cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('timestamp')}
                  >
                    Timestamp <SortIcon column="timestamp" />
                  </th>
                  <th
                    className="px-4 py-2 text-left cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('size')}
                  >
                    Size <SortIcon column="size" />
                  </th>
                  <th
                    className="px-4 py-2 text-left cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('protocol')}
                  >
                    Protocol <SortIcon column="protocol" />
                  </th>
                  <th className="px-4 py-2 text-left">Preview</th>
                </tr>
              </thead>
              <tbody>
                {sortedPackets.map((packet) => (
                  <tr
                    key={packet.index}
                    onClick={() => setSelectedPacket(packet)}
                    className={`border-t border-gray-100 hover:bg-blue-50 cursor-pointer ${
                      selectedPacket?.index === packet.index ? 'bg-blue-100' : ''
                    }`}
                  >
                    <td className="px-4 py-2 font-mono">{packet.index}</td>
                    <td className="px-4 py-2">
                      {packet.timestamp
                        ? formatTimestamp(packet.timestamp)
                        : 'N/A'}
                    </td>
                    <td className="px-4 py-2">{packet.size} bytes</td>
                    <td className="px-4 py-2">{packet.protocol || 'Unknown'}</td>
                    <td className="px-4 py-2 font-mono text-xs text-gray-600">
                      {packet.hexPreview || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedPacket && (
            <PacketDetails
              packet={selectedPacket}
              onClose={() => setSelectedPacket(null)}
            />
          )}
        </>
      )}
    </div>
  )
}

export default PacketList

