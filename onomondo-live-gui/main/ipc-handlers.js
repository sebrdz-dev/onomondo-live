const { dialog } = require('electron')
const path = require('path')
const CLIWrapper = require('./cli-wrapper')
const Store = require('electron-store')

// Initialize stores
const settingsStore = new Store({ name: 'settings' })

// Initialize CLI wrapper
const cliWrapper = new CLIWrapper()

// Set up CLI wrapper event forwarding to renderer
cliWrapper.on('started', (data) => {
  if (global.mainWindow) {
    global.mainWindow.webContents.send('capture:started', data)
  }
})

cliWrapper.on('stopped', (data) => {
  if (global.mainWindow) {
    global.mainWindow.webContents.send('capture:stopped', data)
  }
})

cliWrapper.on('error', (data) => {
  if (global.mainWindow) {
    global.mainWindow.webContents.send('capture:error', data)
  }
})

cliWrapper.on('connection-status', (data) => {
  if (global.mainWindow) {
    global.mainWindow.webContents.send('connection:status', data)
  }
})

cliWrapper.on('subscribed', (data) => {
  if (global.mainWindow) {
    global.mainWindow.webContents.send('subscribed:packets', data)
  }
})

cliWrapper.on('stats-update', (data) => {
  if (global.mainWindow) {
    global.mainWindow.webContents.send('stats:update', data)
  }
})

cliWrapper.on('log', (data) => {
  if (global.mainWindow) {
    global.mainWindow.webContents.send('log', data)
  }
})

/**
 * Register all IPC handlers
 */
function registerIpcHandlers () {
  // Capture handlers
  require('electron').ipcMain.handle('capture:start', async (event, options) => {
    try {
      const captureId = cliWrapper.startCapture(options)
      return { success: true, captureId }
    } catch (error) {
      return { success: false, error: error.message }
    }
  })

  require('electron').ipcMain.handle('capture:stop', async (event, captureId) => {
    try {
      cliWrapper.stopCapture(captureId)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  })

  require('electron').ipcMain.handle('capture:status', async (event, captureId) => {
    return cliWrapper.getCaptureStatus(captureId)
  })

  require('electron').ipcMain.handle('capture:list', async () => {
    return cliWrapper.getActiveCaptures()
  })

  // File handlers
  require('electron').ipcMain.handle('file:save-dialog', async (event, options = {}) => {
    const defaultPath = options.defaultPath || settingsStore.get('defaultSaveLocation', '')
    const result = await dialog.showSaveDialog({
      title: 'Save PCAP File',
      defaultPath: defaultPath || path.join(require('os').homedir(), 'capture.pcap'),
      filters: [
        { name: 'PCAP Files', extensions: ['pcap'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['createDirectory']
    })

    if (!result.canceled && result.filePath) {
      // Save default location for next time
      settingsStore.set('defaultSaveLocation', path.dirname(result.filePath))
      return { success: true, filePath: result.filePath }
    }

    return { success: false, canceled: true }
  })

  require('electron').ipcMain.handle('file:open-location', async (event, filePath) => {
    const { shell } = require('electron')
    const path = require('path')
    
    try {
      // Open file location in system file manager
      shell.showItemInFolder(filePath)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  })

  // Settings handlers
  require('electron').ipcMain.handle('settings:get', async (event, key) => {
    if (key) {
      return settingsStore.get(key)
    }
    return settingsStore.store
  })

  require('electron').ipcMain.handle('settings:set', async (event, key, value) => {
    settingsStore.set(key, value)
    return { success: true }
  })

  // Cleanup on app quit
  require('electron').app.on('before-quit', () => {
    cliWrapper.stopAll()
  })
}

module.exports = {
  registerIpcHandlers,
  cliWrapper
}

