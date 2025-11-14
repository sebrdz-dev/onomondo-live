/**
 * Basic PCAP file parser
 * Parses PCAP file format: https://wiki.wireshark.org/Development/LibpcapFileFormat
 */

/**
 * Parse PCAP file header (24 bytes)
 * @param {ArrayBuffer} buffer - File buffer
 * @returns {Object|null} - Parsed header or null if invalid
 */
export function parsePCAPHeader (buffer) {
  if (buffer.byteLength < 24) return null

  const view = new DataView(buffer)
  
  const magicNumber = view.getUint32(0, false) // Big-endian
  const majorVersion = view.getUint16(4, false)
  const minorVersion = view.getUint16(6, false)
  const gmtOffset = view.getInt32(8, false)
  const timestampAccuracy = view.getUint32(12, false)
  const snapshotLength = view.getUint32(16, false)
  const linkLayerType = view.getUint32(20, false)

  // Validate magic number (0xa1b2c3d4 for standard pcap)
  if (magicNumber !== 0xa1b2c3d4 && magicNumber !== 0xd4c3b2a1) {
    return null // Invalid format
  }

  return {
    magicNumber,
    majorVersion,
    minorVersion,
    gmtOffset,
    timestampAccuracy,
    snapshotLength,
    linkLayerType
  }
}

/**
 * Parse a single packet header (16 bytes)
 * @param {DataView} view - DataView of the buffer
 * @param {number} offset - Byte offset
 * @returns {Object|null} - Parsed packet header or null
 */
export function parsePacketHeader (view, offset) {
  if (offset + 16 > view.byteLength) return null

  const timestampSeconds = view.getUint32(offset, false)
  const timestampMicroseconds = view.getUint32(offset + 4, false)
  const capturedLength = view.getUint32(offset + 8, false)
  const originalLength = view.getUint32(offset + 12, false)

  return {
    timestampSeconds,
    timestampMicroseconds,
    timestamp: timestampSeconds * 1000 + Math.floor(timestampMicroseconds / 1000),
    capturedLength,
    originalLength,
    offset: offset + 16 // Start of packet data
  }
}

/**
 * Parse PCAP file and extract packets
 * @param {ArrayBuffer} buffer - File buffer
 * @returns {Array} - Array of parsed packets
 */
export function parsePCAPFile (buffer) {
  const header = parsePCAPHeader(buffer)
  if (!header) {
    throw new Error('Invalid PCAP file format')
  }

  const view = new DataView(buffer)
  const packets = []
  let offset = 24 // Skip header

  while (offset + 16 <= view.byteLength) {
    const packetHeader = parsePacketHeader(view, offset)
    if (!packetHeader) break

    const packetData = new Uint8Array(
      buffer,
      packetHeader.offset,
      packetHeader.capturedLength
    )

    // Extract basic info from packet (simplified - just first few bytes)
    const packetInfo = extractPacketInfo(packetData, packetHeader)

    packets.push({
      ...packetHeader,
      ...packetInfo,
      index: packets.length,
      data: packetData
    })

    // Move to next packet
    offset = packetHeader.offset + packetHeader.capturedLength
  }

  return { header, packets }
}

/**
 * Extract basic information from packet data
 * @param {Uint8Array} data - Packet data
 * @param {Object} header - Packet header
 * @returns {Object} - Basic packet info
 */
function extractPacketInfo (data, header) {
  // Very basic parsing - just show hex preview
  const previewLength = Math.min(16, data.length)
  const preview = Array.from(data.slice(0, previewLength))
    .map(b => b.toString(16).padStart(2, '0'))
    .join(' ')

  // Try to detect if it's IP (first byte might indicate)
  let protocol = 'Unknown'
  if (data.length > 0) {
    // Very basic detection
    if (data[0] === 0x45 || data[0] === 0x46) {
      protocol = 'IPv4'
    } else if (data[0] === 0x60) {
      protocol = 'IPv6'
    }
  }

  return {
    size: header.capturedLength,
    preview,
    protocol,
    hexPreview: preview
  }
}

/**
 * Validate PCAP file format
 * @param {ArrayBuffer} buffer - File buffer
 * @returns {boolean} - True if valid PCAP format
 */
export function validatePCAP (buffer) {
  return parsePCAPHeader(buffer) !== null
}

