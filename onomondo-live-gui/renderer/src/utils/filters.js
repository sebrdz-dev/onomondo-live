/**
 * Packet filtering utilities
 */

/**
 * Apply filters to packets
 * @param {Array} packets - Array of packets
 * @param {Object} filters - Filter object
 * @returns {Array} - Filtered packets
 */
export function applyFilters (packets, filters) {
  if (!filters || Object.keys(filters).length === 0) {
    return packets
  }

  return packets.filter(packet => {
    // Size filter
    if (filters.sizeMin !== undefined && packet.size < filters.sizeMin) {
      return false
    }
    if (filters.sizeMax !== undefined && packet.size > filters.sizeMax) {
      return false
    }

    // Timestamp filter
    if (filters.timestampMin !== undefined && packet.timestamp < filters.timestampMin) {
      return false
    }
    if (filters.timestampMax !== undefined && packet.timestamp > filters.timestampMax) {
      return false
    }

    // SIM ID filter
    if (filters.simIds && filters.simIds.length > 0) {
      // This would need to be stored in packet metadata
      // For now, we'll skip this check
    }

    // Protocol filter
    if (filters.protocol && packet.protocol !== filters.protocol) {
      return false
    }

    return true
  })
}

/**
 * Create default filter preset
 * @returns {Object} - Default filter object
 */
export function createDefaultFilter () {
  return {
    sizeMin: undefined,
    sizeMax: undefined,
    timestampMin: undefined,
    timestampMax: undefined,
    simIds: [],
    protocol: undefined
  }
}

/**
 * Validate filter object
 * @param {Object} filter - Filter object
 * @returns {Object} - { valid: boolean, error: string }
 */
export function validateFilter (filter) {
  if (filter.sizeMin !== undefined && filter.sizeMax !== undefined) {
    if (filter.sizeMin > filter.sizeMax) {
      return { valid: false, error: 'Minimum size cannot be greater than maximum size' }
    }
  }

  if (filter.timestampMin !== undefined && filter.timestampMax !== undefined) {
    if (filter.timestampMin > filter.timestampMax) {
      return { valid: false, error: 'Minimum timestamp cannot be greater than maximum timestamp' }
    }
  }

  return { valid: true }
}

