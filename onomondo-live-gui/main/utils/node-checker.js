const { execSync } = require('child_process')

const MIN_NODE_VERSION = '14.8.0'

/**
 * Check if Node.js is installed and meets minimum version requirement
 * @returns {Object} { installed: boolean, valid: boolean, version: string }
 */
function checkNodeVersion () {
  try {
    const version = execSync('node --version', { encoding: 'utf-8' }).trim()
    const versionNumber = version.replace('v', '')
    
    return {
      installed: true,
      valid: compareVersions(versionNumber, MIN_NODE_VERSION) >= 0,
      version: versionNumber
    }
  } catch (error) {
    return {
      installed: false,
      valid: false,
      version: null
    }
  }
}

/**
 * Compare two version strings
 * @param {string} v1 - Version 1
 * @param {string} v2 - Version 2
 * @returns {number} -1 if v1 < v2, 0 if v1 === v2, 1 if v1 > v2
 */
function compareVersions (v1, v2) {
  const parts1 = v1.split('.').map(Number)
  const parts2 = v2.split('.').map(Number)
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = parts1[i] || 0
    const part2 = parts2[i] || 0
    
    if (part1 < part2) return -1
    if (part1 > part2) return 1
  }
  
  return 0
}

module.exports = {
  checkNodeVersion,
  compareVersions
}

