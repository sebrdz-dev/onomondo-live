import { formatTimestamp } from '../utils/formatters'

function PacketDetails ({ packet, onClose }) {
  if (!packet) return null

  // Convert packet data to hex string
  const hexString = packet.data
    ? Array.from(packet.data)
        .map(b => b.toString(16).padStart(2, '0'))
        .join(' ')
    : ''

  // Group hex into 16-byte rows
  const hexRows = []
  if (hexString) {
    const bytes = hexString.split(' ')
    for (let i = 0; i < bytes.length; i += 16) {
      hexRows.push(bytes.slice(i, i + 16).join(' '))
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full m-4 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-semibold">Packet Details</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="px-6 py-4 overflow-y-auto flex-1">
          {/* Packet Header Info */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-3">Packet Information</h4>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Index:</span>
                <span className="font-mono">{packet.index}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Timestamp:</span>
                <span className="font-mono">
                  {packet.timestamp
                    ? formatTimestamp(packet.timestamp)
                    : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Size:</span>
                <span className="font-mono">{packet.size} bytes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Original Length:</span>
                <span className="font-mono">
                  {packet.originalLength || packet.size} bytes
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Protocol:</span>
                <span className="font-mono">{packet.protocol || 'Unknown'}</span>
              </div>
            </div>
          </div>

          {/* Hex View */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-3">Hex View</h4>
            <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <div className="space-y-1">
                {hexRows.map((row, index) => (
                  <div key={index} className="flex">
                    <span className="text-gray-500 mr-4 w-16">
                      {index.toString(16).padStart(4, '0').toUpperCase()}0
                    </span>
                    <span>{row}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ASCII View */}
          {packet.data && (
            <div>
              <h4 className="text-lg font-semibold mb-3">ASCII View</h4>
              <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                {Array.from(packet.data)
                  .map(b => {
                    const char = String.fromCharCode(b)
                    return /[\x20-\x7E]/.test(char) ? char : '.'
                  })
                  .join('')}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default PacketDetails

