# Electron GUI Architecture for Onomondo Live

## Overview

This document outlines the architecture for building an Electron-based desktop application that provides a visual interface for `onomondo-live`. The GUI wraps the CLI as a subprocess to maintain resilience to upstream changes in the `onomondo-live` package.

## Technology Stack

- **Framework**: Electron (main + renderer processes)
- **UI Framework**: React
- **Styling**: Tailwind CSS
- **State Management**: React Context API + Hooks
- **IPC**: Electron's ipcMain/ipcRenderer
- **Subprocess**: Node.js child_process.spawn
- **File Operations**: Electron dialog API + Node.js fs
- **Settings Storage**: electron-store

## Architecture Principles

1. **CLI Wrapper Pattern**: Wrap `onomondo-live` as a subprocess rather than importing directly
2. **Separation of Concerns**: Clear separation between main process (Node.js) and renderer process (React)
3. **Resilience**: Design to handle changes in `onomondo-live` CLI output format
4. **Extensibility**: Architecture prepared for future advanced features
5. **Cross-Platform**: Support Mac and Windows with single codebase

## Project Structure

```
onomondo-live-gui/
├── package.json                 # Root package.json with Electron deps
├── electron-builder.yml         # Build configuration for Mac/Windows
├── .gitignore
├── README.md
├── main/                        # Electron main process (Node.js)
│   ├── main.js                  # Main entry point, window management
│   ├── cli-wrapper.js           # Subprocess management for onomondo-live
│   ├── file-manager.js          # PCAP file operations
│   ├── state-manager.js         # Capture session state management
│   └── ipc-handlers.js          # IPC channel handlers
├── renderer/                    # Electron renderer process (React)
│   ├── index.html               # HTML entry point
│   ├── package.json             # Frontend dependencies
│   ├── src/
│   │   ├── main.jsx             # React entry point
│   │   ├── App.jsx              # Main app component
│   │   ├── components/
│   │   │   ├── ConnectionPanel.jsx      # API key, SIM selection
│   │   │   ├── CaptureControls.jsx      # Start/stop, file location
│   │   │   ├── StatsPanel.jsx           # Live packet/byte stats
│   │   │   ├── PacketList.jsx           # Packet preview table
│   │   │   ├── PacketDetails.jsx        # Packet detail view
│   │   │   ├── FilterPanel.jsx          # Packet filtering UI
│   │   │   ├── CaptureHistory.jsx       # Previous captures list
│   │   │   └── SettingsPanel.jsx        # App settings
│   │   ├── hooks/
│   │   │   ├── useCapture.js            # Capture state hook
│   │   │   ├── usePackets.js            # Packet data hook
│   │   │   └── useIPC.js                # IPC communication hook
│   │   ├── context/
│   │   │   ├── CaptureContext.jsx       # Global capture state
│   │   │   └── SettingsContext.jsx       # Global settings state
│   │   ├── utils/
│   │   │   ├── packet-parser.js         # Basic packet parsing
│   │   │   ├── filters.js               # Filter logic
│   │   │   └── formatters.js            # Data formatting utilities
│   │   └── styles/
│   │       └── main.css                  # Tailwind imports
│   └── public/
│       └── icons/                        # App icons
└── docs/                        # Documentation
    ├── ARCHITECTURE.md          # This file
    ├── PHASES.md                # Development phases
    ├── PROJECT_STRUCTURE.md     # Detailed structure
    └── API.md                   # IPC API documentation
```

## Process Communication

### Main Process (main/)
- Manages Electron app lifecycle
- Spawns and manages `onomondo-live` subprocess
- Handles file system operations
- Manages app settings
- Provides IPC endpoints for renderer

### Renderer Process (renderer/)
- React-based UI
- Communicates with main process via IPC
- Manages UI state
- Displays real-time capture data

### IPC Channels

**From Renderer to Main:**
- `capture:start` - Start capture session
- `capture:stop` - Stop capture session
- `capture:status` - Get capture status
- `file:save-dialog` - Open file save dialog
- `file:open-location` - Open file in system explorer
- `packets:read` - Read packets from PCAP file
- `settings:get` - Get app settings
- `settings:set` - Update app settings
- `node:check` - Check if Node.js is installed

**From Main to Renderer:**
- `capture:started` - Capture started event
- `capture:stopped` - Capture stopped event
- `capture:error` - Capture error event
- `packet:received` - New packet received
- `stats:update` - Statistics update
- `connection:status` - Connection status change

## CLI Wrapper Design

The `cli-wrapper.js` module spawns `onomondo-live` as a child process and:

1. **Process Management**
   - Spawn process with appropriate arguments
   - Monitor process lifecycle
   - Handle process errors and crashes
   - Support multiple concurrent captures

2. **Output Parsing**
   - Parse stderr for status messages (connection, authentication, subscription)
   - Extract packet count and byte statistics
   - Parse error messages
   - Handle version warnings

3. **Event Emission**
   - Emit structured events for renderer process
   - Normalize CLI output to consistent format
   - Handle edge cases and malformed output

## Data Flow

1. User enters API key and SIM IDs in UI
2. User clicks "Start Capture"
3. Renderer sends `capture:start` IPC message
4. Main process spawns `onomondo-live` subprocess
5. CLI wrapper parses subprocess output
6. Main process emits IPC events to renderer
7. Renderer updates UI with real-time data
8. Packets are written to PCAP file
9. User can view packet preview in UI
10. User clicks "Stop Capture"
11. Main process kills subprocess
12. Capture session saved to history

## Security Considerations

- API keys stored securely using electron-store with encryption
- No API keys in logs or error messages
- File system access limited to user-selected directories
- Subprocess execution validated
- Input validation for SIM IDs and API keys

## Performance Considerations

- Virtual scrolling for large packet lists
- Debounced statistics updates
- Lazy loading of packet details
- Efficient PCAP file reading (streaming)
- Memory management for long-running captures

## Future Extensibility

The architecture is designed to support:

- Plugin system for packet analyzers
- Protocol decoder modules
- Custom export formats
- Integration with Wireshark/tshark
- Advanced filtering engine
- Packet replay functionality
- Network topology visualization
- SQLite database for metadata
- Indexed packet storage

