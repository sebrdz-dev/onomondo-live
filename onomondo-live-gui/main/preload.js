const { contextBridge, ipcRenderer } = require('electron')

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getVersion: () => ipcRenderer.invoke('app:get-version'),
  getPlatform: () => ipcRenderer.invoke('app:get-platform'),
  
  // Node.js check
  checkNode: () => ipcRenderer.invoke('node:check'),
  
  // IPC event listeners
  on: (channel, callback) => {
    const validChannels = [
      'capture:started',
      'capture:stopped',
      'capture:error',
      'packet:received',
      'stats:update',
      'connection:status'
    ]
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => callback(...args))
    }
  },
  
  // IPC send
  send: (channel, data) => {
    const validChannels = [
      'capture:start',
      'capture:stop',
      'capture:status',
      'file:save-dialog',
      'file:open-location',
      'packets:read',
      'settings:get',
      'settings:set'
    ]
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data)
    }
  },
  
  // IPC invoke (request-response)
  invoke: (channel, data) => {
    const validChannels = [
      'app:get-version',
      'app:get-platform',
      'node:check',
      'capture:start',
      'capture:stop',
      'capture:status',
      'file:save-dialog',
      'file:open-location',
      'packets:read',
      'settings:get',
      'settings:set'
    ]
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, data)
    }
  },
  
  // Remove listener
  removeListener: (channel, callback) => {
    ipcRenderer.removeListener(channel, callback)
  }
})

