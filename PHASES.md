# Development Phases

This document outlines the development phases for the Electron GUI application. Each phase corresponds to a GitHub Project for tracking progress.

## Phase 1: Foundation Setup

**GitHub Project**: `Phase 1: Foundation Setup`

**Objectives:**
- Set up Electron project structure
- Configure build tools (electron-builder)
- Set up development environment
- Create basic main process
- Create basic renderer process with React
- Establish IPC communication
- Node.js detection and validation

**Deliverables:**
- Working Electron app that opens a window
- Basic IPC communication between main and renderer
- Node.js version check on startup
- Development scripts and hot reload

**Tasks:**
- [ ] Initialize Electron project structure
- [ ] Configure package.json with Electron dependencies
- [ ] Set up React in renderer process
- [ ] Create basic main.js with window management
- [ ] Implement IPC channels (basic)
- [ ] Add Node.js detection utility
- [ ] Configure electron-builder
- [ ] Set up development scripts
- [ ] Create basic UI layout

**Estimated Duration**: 2-3 days

---

## Phase 2: CLI Integration

**GitHub Project**: `Phase 2: CLI Integration`

**Objectives:**
- Implement CLI wrapper module
- Spawn onomondo-live subprocess
- Parse CLI output
- Handle subprocess lifecycle
- Basic error handling

**Deliverables:**
- CLI wrapper that can spawn onomondo-live
- Output parsing for status messages
- Process management (start/stop)
- Error handling and reporting

**Tasks:**
- [ ] Create cli-wrapper.js module
- [ ] Implement subprocess spawning
- [ ] Parse stderr for status messages
- [ ] Extract connection status
- [ ] Extract authentication status
- [ ] Extract subscription status
- [ ] Handle process errors
- [ ] Implement process cleanup
- [ ] Add process monitoring

**Estimated Duration**: 3-4 days

---

## Phase 3: Connection UI

**GitHub Project**: `Phase 3: Connection UI`

**Objectives:**
- Build connection panel UI
- API key input and storage
- SIM ID input with validation
- Multiple SIM support
- Connection status display
- Test connection functionality

**Deliverables:**
- ConnectionPanel component
- Secure API key storage
- SIM ID validation (9 digits)
- Add/remove multiple SIMs
- Connection status indicator
- Error message display

**Tasks:**
- [ ] Create ConnectionPanel component
- [ ] Implement API key input field
- [ ] Add secure storage (electron-store)
- [ ] Create SIM ID input component
- [ ] Implement validation logic
- [ ] Add multiple SIM management
- [ ] Create connection status UI
- [ ] Implement test connection button
- [ ] Add error message display

**Estimated Duration**: 2-3 days

---

## Phase 4: Capture Controls

**GitHub Project**: `Phase 4: Capture Controls`

**Objectives:**
- Build capture control UI
- File save location picker
- Start/stop capture functionality
- Multiple simultaneous captures
- Capture session management

**Deliverables:**
- CaptureControls component
- File dialog integration
- Start/stop buttons
- Session state management
- Multiple capture support

**Tasks:**
- [ ] Create CaptureControls component
- [ ] Implement file save dialog
- [ ] Add start/stop button logic
- [ ] Integrate with CLI wrapper
- [ ] Implement session state management
- [ ] Add pause/resume functionality
- [ ] Support multiple concurrent captures
- [ ] Add capture session tracking

**Estimated Duration**: 3-4 days

---

## Phase 5: Live Statistics

**GitHub Project**: `Phase 5: Live Statistics`

**Objectives:**
- Display real-time statistics
- Packet count and byte count
- Capture duration
- Data rate calculations
- Per-SIM statistics

**Deliverables:**
- StatsPanel component
- Real-time statistics updates
- Formatted data display
- Timer functionality
- Per-SIM breakdown

**Tasks:**
- [ ] Create StatsPanel component
- [ ] Implement statistics tracking
- [ ] Parse CLI output for stats
- [ ] Add packet count display
- [ ] Add byte count display (formatted)
- [ ] Implement capture timer
- [ ] Calculate data rates
- [ ] Add per-SIM statistics
- [ ] Implement auto-refresh

**Estimated Duration**: 2-3 days

---

## Phase 6: Packet Preview

**GitHub Project**: `Phase 6: Packet Preview`

**Objectives:**
- Display captured packets in table
- Basic packet information
- Packet detail view
- PCAP file reading
- Virtual scrolling for performance

**Deliverables:**
- PacketList component
- PacketDetails component
- Basic PCAP parser
- Packet table with sorting
- Detail view modal/panel

**Tasks:**
- [ ] Create PacketList component
- [ ] Implement PCAP file reader
- [ ] Parse packet headers
- [ ] Extract basic packet info
- [ ] Create packet table UI
- [ ] Add sorting functionality
- [ ] Implement virtual scrolling
- [ ] Create PacketDetails component
- [ ] Add packet detail view
- [ ] Implement auto-scroll option

**Estimated Duration**: 4-5 days

---

## Phase 7: Filtering System

**GitHub Project**: `Phase 7: Filtering System`

**Objectives:**
- Implement packet filtering
- Filter by size, timestamp, SIM
- Filter presets
- Real-time filter application
- Filter UI components

**Deliverables:**
- FilterPanel component
- Filter engine
- Filter preset management
- Real-time filtering
- Filter UI controls

**Tasks:**
- [ ] Create FilterPanel component
- [ ] Implement filter logic
- [ ] Add size range filter
- [ ] Add timestamp range filter
- [ ] Add SIM ID filter
- [ ] Create filter preset system
- [ ] Implement real-time filtering
- [ ] Add filter UI controls
- [ ] Save/load filter presets

**Estimated Duration**: 3-4 days

---

## Phase 8: Capture History

**GitHub Project**: `Phase 8: Capture History`

**Objectives:**
- Track capture sessions
- Display session history
- Session metadata
- Quick actions (open, delete)
- Export session info

**Deliverables:**
- CaptureHistory component
- Session storage
- History list UI
- Quick action buttons
- Export functionality

**Tasks:**
- [ ] Create CaptureHistory component
- [ ] Implement session tracking
- [ ] Store session metadata
- [ ] Create history list UI
- [ ] Add session details view
- [ ] Implement open file location
- [ ] Add delete session action
- [ ] Create export functionality
- [ ] Add session search/filter

**Estimated Duration**: 2-3 days

---

## Phase 9: Settings & Polish

**GitHub Project**: `Phase 9: Settings & Polish`

**Objectives:**
- Build settings panel
- App preferences
- Error handling improvements
- UI/UX polish
- Documentation

**Deliverables:**
- SettingsPanel component
- Settings persistence
- Improved error handling
- Polished UI
- User documentation

**Tasks:**
- [ ] Create SettingsPanel component
- [ ] Implement default save location
- [ ] Add theme preferences
- [ ] Add auto-start option
- [ ] Improve error messages
- [ ] Add loading states
- [ ] UI/UX improvements
- [ ] Write user documentation
- [ ] Add tooltips and help text

**Estimated Duration**: 3-4 days

---

## Phase 10: Build & Distribution

**GitHub Project**: `Phase 10: Build & Distribution`

**Objectives:**
- Configure electron-builder
- Create Mac build (.dmg)
- Create Windows build (.exe)
- Test on both platforms
- Distribution setup

**Deliverables:**
- Working Mac build
- Working Windows build
- Build scripts
- Distribution documentation
- Release process

**Tasks:**
- [ ] Configure electron-builder.yml
- [ ] Set up Mac build configuration
- [ ] Set up Windows build configuration
- [ ] Add app icons
- [ ] Test Mac build
- [ ] Test Windows build
- [ ] Create build scripts
- [ ] Document build process
- [ ] Set up release workflow

**Estimated Duration**: 2-3 days

---

## Total Estimated Duration

**All Phases**: 28-38 days (approximately 6-8 weeks)

## GitHub Projects Setup

Each phase should be created as a GitHub Project with:
- Project board with columns: To Do, In Progress, Review, Done
- Issues for each task
- Milestone for phase completion
- Labels for task types (feature, bug, documentation)

## Phase Dependencies

- Phase 1 must complete before all others
- Phase 2 must complete before Phases 3-10
- Phase 3 must complete before Phase 4
- Phase 4 must complete before Phases 5-8
- Phase 5 can run parallel with Phase 6
- Phase 6 must complete before Phase 7
- Phase 7 can run parallel with Phase 8
- Phase 9 can start after Phase 5
- Phase 10 requires all previous phases

