import { useState, useEffect } from 'react'
import { useIPC } from '../hooks/useIPC'
import { useCapture } from '../hooks/useCapture'
import { formatTimestamp, formatDuration, formatBytes } from '../utils/formatters'

function CaptureHistory () {
  const { invoke } = useIPC()
  const { captures } = useCapture()
  const [history, setHistory] = useState([])
  const [selectedSession, setSelectedSession] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Load history from settings
  useEffect(() => {
    invoke('settings:get', 'captureHistory').then(savedHistory => {
      if (savedHistory) {
        setHistory(savedHistory)
      }
    })
  }, [invoke])

  // Update history when captures change
  useEffect(() => {
    const completedCaptures = captures.filter(c => c.status === 'stopped' || c.status === 'error')
    const newHistory = completedCaptures.map(capture => ({
      captureId: capture.captureId,
      startTime: capture.startTime,
      endTime: capture.endTime || Date.now(),
      duration: capture.duration || (capture.endTime ? capture.endTime - capture.startTime : 0),
      packets: capture.finalPackets || capture.packets || 0,
      bytes: capture.finalBytes || capture.bytes || 0,
      simIds: capture.simIds || [],
      filename: capture.filename || '',
      status: capture.status
    }))

    if (newHistory.length > 0) {
      const updatedHistory = [...history, ...newHistory]
        .filter((session, index, self) =>
          index === self.findIndex(s => s.captureId === session.captureId)
        )
        .sort((a, b) => b.startTime - a.startTime)
        .slice(0, 50) // Keep last 50 sessions

      setHistory(updatedHistory)
      invoke('settings:set', 'captureHistory', updatedHistory)
    }
  }, [captures, invoke])

  // Filter history by search term
  const filteredHistory = history.filter(session => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      session.captureId.toLowerCase().includes(search) ||
      session.filename.toLowerCase().includes(search) ||
      session.simIds.some(id => id.includes(search))
    )
  })

  // Open file location
  const handleOpenLocation = async (session) => {
    if (session.filename) {
      await invoke('file:open-location', session.filename)
    }
  }

  // Delete session
  const handleDelete = (session) => {
    if (confirm('Are you sure you want to delete this session from history?')) {
      const updatedHistory = history.filter(s => s.captureId !== session.captureId)
      setHistory(updatedHistory)
      invoke('settings:set', 'captureHistory', updatedHistory)
      if (selectedSession?.captureId === session.captureId) {
        setSelectedSession(null)
      }
    }
  }

  // Export session info
  const handleExport = (session) => {
    const exportData = {
      captureId: session.captureId,
      startTime: formatTimestamp(session.startTime),
      endTime: formatTimestamp(session.endTime),
      duration: formatDuration(session.duration),
      packets: session.packets,
      bytes: formatBytes(session.bytes),
      simIds: session.simIds,
      filename: session.filename,
      status: session.status
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `capture-${session.captureId}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Capture History</h2>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search history..."
          className="px-4 py-2 border border-gray-300 rounded-md"
        />
      </div>

      {filteredHistory.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? 'No sessions match your search' : 'No capture history yet'}
        </div>
      )}

      {filteredHistory.length > 0 && (
        <div className="space-y-2">
          {filteredHistory.map((session) => (
            <div
              key={session.captureId}
              className={`border rounded-lg p-4 cursor-pointer hover:bg-gray-50 ${
                selectedSession?.captureId === session.captureId
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200'
              }`}
              onClick={() => setSelectedSession(session)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-sm text-gray-600">
                      {session.captureId}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        session.status === 'stopped'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {session.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>
                      <strong>Started:</strong> {formatTimestamp(session.startTime)}
                    </div>
                    <div>
                      <strong>Duration:</strong> {formatDuration(session.duration)}
                    </div>
                    <div>
                      <strong>Packets:</strong> {session.packets.toLocaleString()} |{' '}
                      <strong>Bytes:</strong> {formatBytes(session.bytes)}
                    </div>
                    {session.filename && (
                      <div className="truncate">
                        <strong>File:</strong> {session.filename.split('/').pop() || session.filename.split('\\').pop()}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  {session.filename && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleOpenLocation(session)
                      }}
                      className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                      title="Open file location"
                    >
                      📁
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleExport(session)
                    }}
                    className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
                    title="Export session info"
                  >
                    Export
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(session)
                    }}
                    className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                    title="Delete session"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Session Details Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full m-4">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-semibold">Session Details</h3>
              <button
                onClick={() => setSelectedSession(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="px-6 py-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Capture ID:</span>
                <span className="font-mono">{selectedSession.captureId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Start Time:</span>
                <span>{formatTimestamp(selectedSession.startTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">End Time:</span>
                <span>{formatTimestamp(selectedSession.endTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duration:</span>
                <span>{formatDuration(selectedSession.duration)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Packets:</span>
                <span>{selectedSession.packets.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Bytes:</span>
                <span>{formatBytes(selectedSession.bytes)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">SIM IDs:</span>
                <span className="font-mono">{selectedSession.simIds.join(', ')}</span>
              </div>
              {selectedSession.filename && (
                <div className="flex justify-between">
                  <span className="text-gray-600">File:</span>
                  <span className="font-mono text-xs truncate max-w-xs">
                    {selectedSession.filename}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span>{selectedSession.status}</span>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
              {selectedSession.filename && (
                <button
                  onClick={() => handleOpenLocation(selectedSession)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Open File Location
                </button>
              )}
              <button
                onClick={() => handleExport(selectedSession)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Export
              </button>
              <button
                onClick={() => setSelectedSession(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CaptureHistory

