const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const { checkNodeVersion } = require('./utils/node-checker')
const { registerIpcHandlers } = require('./ipc-handlers')

// Keep a global reference of the window object
let mainWindow

function createWindow () {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    },
    icon: path.join(__dirname, '../renderer/public/icons/icon.png')
  })

  // Load the app
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged
  if (isDev) {
    // In development, load from Vite dev server
    const devUrl = 'http://localhost:5173'
    mainWindow.loadURL(devUrl).catch(err => {
      console.error('Failed to load dev server:', err)
      // Show error to user
      mainWindow.webContents.executeJavaScript(`
        document.body.innerHTML = '<div style="padding: 20px; font-family: sans-serif;">
          <h1>Development Server Not Ready</h1>
          <p>Please wait for the Vite dev server to start on port 5173.</p>
          <p>If this persists, check that the dev server is running.</p>
        </div>'
      `)
    })
    // Open DevTools in development
    mainWindow.webContents.openDevTools()
    
    // Handle dev server connection errors
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
      if (errorCode === -106) {
        console.error('Failed to connect to dev server. Make sure Vite is running on port 5173')
        mainWindow.webContents.executeJavaScript(`
          document.body.innerHTML = '<div style="padding: 20px; font-family: sans-serif;">
            <h1>Connection Error</h1>
            <p>Failed to connect to Vite dev server at http://localhost:5173</p>
            <p>Error: ${errorDescription}</p>
            <p>Please ensure the dev server is running.</p>
          </div>'
        `)
      }
    })
  } else {
    // In production, load from built files
    mainWindow.loadFile(path.join(__dirname, '../renderer/dist/index.html'))
  }

  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    mainWindow = null
    global.mainWindow = null
  })

  // Store reference globally for IPC handlers
  global.mainWindow = mainWindow
}

// Check Node.js version on startup
app.whenReady().then(() => {
  const nodeCheck = checkNodeVersion()
  if (!nodeCheck.installed) {
    console.error('Node.js is not installed or not found in PATH')
    // Could show a dialog here
  } else if (!nodeCheck.valid) {
    console.warn(`Node.js version ${nodeCheck.version} is below minimum required (14.8.0)`)
  }

  // Register IPC handlers
  registerIpcHandlers()

  createWindow()
})

// Quit when all windows are closed
app.on('window-all-closed', () => {
  // On macOS, keep app running even when all windows are closed
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS, re-create window when dock icon is clicked
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// Basic IPC Handlers (others registered in ipc-handlers.js)
ipcMain.handle('app:get-version', () => {
  return app.getVersion()
})

ipcMain.handle('app:get-platform', () => {
  return process.platform
})

ipcMain.handle('node:check', () => {
  return checkNodeVersion()
})

// Handle app protocol for security
app.setAsDefaultProtocolClient('onomondo-live-gui')

