/**
 * Format bytes to human-readable string
 * @param {number} bytes - Bytes to format
 * @returns {string} - Formatted string (e.g., "1.5 MB")
 */
export function formatBytes (bytes) {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * Format duration in milliseconds to human-readable string
 * @param {number} ms - Milliseconds
 * @returns {string} - Formatted string (e.g., "1h 23m 45s")
 */
export function formatDuration (ms) {
  if (ms < 1000) return `${ms}ms`
  
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  const parts = []
  if (days > 0) parts.push(`${days}d`)
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  if (seconds > 0 && hours === 0) parts.push(`${seconds}s`)
  
  return parts.join(' ') || '0s'
}

/**
 * Format data rate (bytes per second)
 * @param {number} bytes - Total bytes
 * @param {number} durationMs - Duration in milliseconds
 * @returns {string} - Formatted rate (e.g., "1.5 MB/s")
 */
export function formatDataRate (bytes, durationMs) {
  if (durationMs === 0) return '0 B/s'
  const bytesPerSecond = (bytes / durationMs) * 1000
  return `${formatBytes(bytesPerSecond)}/s`
}

/**
 * Format packet rate (packets per second)
 * @param {number} packets - Total packets
 * @param {number} durationMs - Duration in milliseconds
 * @returns {string} - Formatted rate (e.g., "123.45 pkt/s")
 */
export function formatPacketRate (packets, durationMs) {
  if (durationMs === 0) return '0 pkt/s'
  const packetsPerSecond = (packets / durationMs) * 1000
  return `${packetsPerSecond.toFixed(2)} pkt/s`
}

/**
 * Format timestamp
 * @param {number|Date} timestamp - Timestamp (ms or Date object)
 * @returns {string} - Formatted timestamp
 */
export function formatTimestamp (timestamp) {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp)
  return date.toLocaleString()
}

