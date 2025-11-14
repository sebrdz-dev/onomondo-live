# Detailed Project Structure

This document provides a comprehensive breakdown of the project folder structure for the Electron GUI application.

## Root Directory

```
onomondo-live-gui/
├── .gitignore                    # Git ignore rules
├── .editorconfig                 # Editor configuration
├── package.json                  # Root package.json
├── electron-builder.yml          # Electron Builder configuration
├── README.md                     # Main project README
├── LICENSE                       # License file
└── docs/                         # Documentation folder
    ├── ARCHITECTURE.md
    ├── PHASES.md
    ├── PROJECT_STRUCTURE.md
    └── API.md
```

## Main Process (main/)

The main process runs in Node.js and manages the Electron application lifecycle.

```
main/
├── main.js                       # Electron main entry point
│   ├── App initialization
│   ├── Window creation
│   ├── IPC setup
│   └── App lifecycle handlers
│
├── cli-wrapper.js                # CLI subprocess management
│   ├── spawnCapture()
│   ├── parseOutput()
│   ├── handleErrors()
│   └── process lifecycle
│
├── file-manager.js               # File operations
│   ├── saveDialog()
│   ├── openFileLocation()
│   ├── readPCAP()
│   └── validatePCAP()
│
├── state-manager.js              # Capture state management
│   ├── activeCaptures
│   ├── captureHistory
│   └── session metadata
│
└── ipc-handlers.js               # IPC channel handlers
    ├── capture handlers
    ├── file handlers
    ├── settings handlers
    └── packet handlers
```

### main.js Structure

```javascript
// Main responsibilities:
- Initialize Electron app
- Create BrowserWindow
- Set up IPC listeners
- Handle app lifecycle (ready, window-all-closed, activate)
- Load renderer process
- Manage window state
```

### cli-wrapper.js Structure

```javascript
// Main responsibilities:
- Spawn onomondo-live subprocess
- Parse stderr/stdout
- Extract status messages
- Extract statistics
- Handle process errors
- Emit events to main process
- Support multiple concurrent captures
```

### file-manager.js Structure

```javascript
// Main responsibilities:
- Show file save dialog
- Open file in system explorer
- Read PCAP files
- Validate PCAP format
- Generate default filenames
- Manage file paths
```

### state-manager.js Structure

```javascript
// Main responsibilities:
- Track active capture sessions
- Store capture history
- Manage session metadata
- Persist state to disk
- Load state on startup
```

## Renderer Process (renderer/)

The renderer process runs React and provides the user interface.

```
renderer/
├── index.html                    # HTML entry point
├── package.json                  # Frontend dependencies
├── vite.config.js               # Vite configuration (or webpack)
├── tailwind.config.js           # Tailwind CSS configuration
├── postcss.config.js            # PostCSS configuration
│
├── src/
│   ├── main.jsx                 # React entry point
│   │   └── ReactDOM.render()
│   │
│   ├── App.jsx                   # Main app component
│   │   ├── Layout structure
│   │   ├── Route management
│   │   └── Context providers
│   │
│   ├── components/
│   │   ├── ConnectionPanel.jsx   # Connection management
│   │   │   ├── API key input
│   │   │   ├── SIM ID inputs
│   │   │   ├── Connection status
│   │   │   └── Test connection
│   │   │
│   │   ├── CaptureControls.jsx   # Capture controls
│   │   │   ├── Start/stop button
│   │   │   ├── File location picker
│   │   │   ├── Pause/resume
│   │   │   └── Session info
│   │   │
│   │   ├── StatsPanel.jsx        # Statistics display
│   │   │   ├── Packet count
│   │   │   ├── Byte count
│   │   │   ├── Duration timer
│   │   │   ├── Data rates
│   │   │   └── Per-SIM stats
│   │   │
│   │   ├── PacketList.jsx       # Packet table
│   │   │   ├── Virtual scrolling
│   │   │   ├── Sortable columns
│   │   │   ├── Row selection
│   │   │   └── Auto-scroll
│   │   │
│   │   ├── PacketDetails.jsx    # Packet detail view
│   │   │   ├── Packet header
│   │   │   ├── Packet payload
│   │   │   ├── Hex view
│   │   │   └── Protocol info
│   │   │
│   │   ├── FilterPanel.jsx      # Filtering UI
│   │   │   ├── Size filter
│   │   │   ├── Timestamp filter
│   │   │   ├── SIM filter
│   │   │   └── Preset management
│   │   │
│   │   ├── CaptureHistory.jsx   # History list
│   │   │   ├── Session list
│   │   │   ├── Session details
│   │   │   ├── Quick actions
│   │   │   └── Export
│   │   │
│   │   └── SettingsPanel.jsx    # Settings UI
│   │       ├── Save location
│   │       ├── Theme selector
│   │       ├── Auto-start toggle
│   │       └── Other preferences
│   │
│   ├── hooks/
│   │   ├── useCapture.js        # Capture state hook
│   │   │   ├── startCapture()
│   │   │   ├── stopCapture()
│   │   │   ├── captureStatus
│   │   │   └── activeCaptures
│   │   │
│   │   ├── usePackets.js        # Packet data hook
│   │   │   ├── packets state
│   │   │   ├── loadPackets()
│   │   │   ├── filterPackets()
│   │   │   └── packet details
│   │   │
│   │   └── useIPC.js            # IPC communication hook
│   │       ├── send()
│   │       ├── on()
│   │       ├── removeListener()
│   │       └── error handling
│   │
│   ├── context/
│   │   ├── CaptureContext.jsx   # Global capture state
│   │   │   ├── Provider component
│   │   │   ├── Active captures
│   │   │   ├── Statistics
│   │   │   └── Actions
│   │   │
│   │   └── SettingsContext.jsx   # Global settings state
│   │       ├── Provider component
│   │       ├── Settings state
│   │       └── Update actions
│   │
│   ├── utils/
│   │   ├── packet-parser.js     # PCAP parsing utilities
│   │   │   ├── parsePCAPHeader()
│   │   │   ├── parsePacketHeader()
│   │   │   ├── extractPacketInfo()
│   │   │   └── validatePCAP()
│   │   │
│   │   ├── filters.js           # Filter logic
│   │   │   ├── filterBySize()
│   │   │   ├── filterByTimestamp()
│   │   │   ├── filterBySIM()
│   │   │   └── applyFilters()
│   │   │
│   │   └── formatters.js        # Data formatting
│   │       ├── formatBytes()
│   │       ├── formatDuration()
│   │       ├── formatTimestamp()
│   │       └── formatDataRate()
│   │
│   └── styles/
│       └── main.css             # Tailwind imports and custom styles
│
└── public/
    └── icons/                   # App icons
        ├── icon.icns            # Mac icon
        ├── icon.ico             # Windows icon
        └── icon.png             # PNG versions
```

## Build Configuration

```
electron-builder.yml              # Electron Builder config
├── Mac configuration
│   ├── DMG settings
│   ├── Code signing (optional)
│   └── App bundle settings
│
└── Windows configuration
    ├── NSIS installer
    ├── Code signing (optional)
    └── App settings
```

## Development Scripts

In root `package.json`:

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:main\" \"npm run dev:renderer\"",
    "dev:main": "electron .",
    "dev:renderer": "vite",
    "build": "npm run build:renderer && electron-builder",
    "build:renderer": "vite build",
    "build:mac": "electron-builder --mac",
    "build:win": "electron-builder --win",
    "lint": "eslint .",
    "test": "jest"
  }
}
```

## File Naming Conventions

- **Components**: PascalCase (e.g., `ConnectionPanel.jsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useCapture.js`)
- **Utils**: camelCase (e.g., `packet-parser.js`)
- **Context**: PascalCase with `Context` suffix (e.g., `CaptureContext.jsx`)
- **Main process**: kebab-case (e.g., `cli-wrapper.js`)

## Import Paths

Use absolute imports from `src/`:

```javascript
// Good
import { ConnectionPanel } from '@/components/ConnectionPanel'
import { useCapture } from '@/hooks/useCapture'
import { formatBytes } from '@/utils/formatters'

// Configure in vite.config.js or jsconfig.json
```

## State Management Strategy

1. **Local State**: Component-specific state using `useState`
2. **Context State**: Global app state (captures, settings) using Context API
3. **IPC State**: Data from main process via IPC hooks
4. **Persistent State**: Settings and history stored via electron-store

## Component Hierarchy

```
App
├── Layout
│   ├── Header
│   ├── Sidebar (optional)
│   └── Main Content
│       ├── ConnectionPanel
│       ├── CaptureControls
│       ├── StatsPanel
│       ├── PacketList
│       │   └── PacketDetails (modal/panel)
│       ├── FilterPanel
│       ├── CaptureHistory
│       └── SettingsPanel
└── Context Providers
    ├── CaptureContext
    └── SettingsContext
```

