# GitHub Projects Setup Guide

This document provides instructions for creating GitHub Projects for each development phase.

## Overview

Each phase of development should have its own GitHub Project board for tracking progress. Projects help organize tasks, track progress, and provide visibility into the development workflow.

## Project Structure

Each GitHub Project should have the following columns:
- **To Do** - Tasks not yet started
- **In Progress** - Tasks currently being worked on
- **Review** - Tasks completed and ready for review
- **Done** - Completed and reviewed tasks

## Phase Projects

### Phase 1: Foundation Setup
**Project Name**: `Phase 1: Foundation Setup`

**Issues to Create:**
1. Initialize Electron project structure
2. Configure package.json with Electron dependencies
3. Set up React in renderer process
4. Create basic main.js with window management
5. Implement IPC channels (basic)
6. Add Node.js detection utility
7. Configure electron-builder
8. Set up development scripts
9. Create basic UI layout

**Labels:**
- `phase-1`
- `foundation`
- `setup`

---

### Phase 2: CLI Integration
**Project Name**: `Phase 2: CLI Integration`

**Issues to Create:**
1. Create cli-wrapper.js module
2. Implement subprocess spawning
3. Parse stderr for status messages
4. Extract connection status
5. Extract authentication status
6. Extract subscription status
7. Handle process errors
8. Implement process cleanup
9. Add process monitoring

**Labels:**
- `phase-2`
- `cli-integration`
- `backend`

---

### Phase 3: Connection UI
**Project Name**: `Phase 3: Connection UI`

**Issues to Create:**
1. Create ConnectionPanel component
2. Implement API key input field
3. Add secure storage (electron-store)
4. Create SIM ID input component
5. Implement validation logic
6. Add multiple SIM management
7. Create connection status UI
8. Implement test connection button
9. Add error message display

**Labels:**
- `phase-3`
- `ui`
- `connection`

---

### Phase 4: Capture Controls
**Project Name**: `Phase 4: Capture Controls`

**Issues to Create:**
1. Create CaptureControls component
2. Implement file save dialog
3. Add start/stop button logic
4. Integrate with CLI wrapper
5. Implement session state management
6. Add pause/resume functionality
7. Support multiple concurrent captures
8. Add capture session tracking

**Labels:**
- `phase-4`
- `ui`
- `capture`

---

### Phase 5: Live Statistics
**Project Name**: `Phase 5: Live Statistics`

**Issues to Create:**
1. Create StatsPanel component
2. Implement statistics tracking
3. Parse CLI output for stats
4. Add packet count display
5. Add byte count display (formatted)
6. Implement capture timer
7. Calculate data rates
8. Add per-SIM statistics
9. Implement auto-refresh

**Labels:**
- `phase-5`
- `ui`
- `statistics`

---

### Phase 6: Packet Preview
**Project Name**: `Phase 6: Packet Preview`

**Issues to Create:**
1. Create PacketList component
2. Implement PCAP file reader
3. Parse packet headers
4. Extract basic packet info
5. Create packet table UI
6. Add sorting functionality
7. Implement virtual scrolling
8. Create PacketDetails component
9. Add packet detail view
10. Implement auto-scroll option

**Labels:**
- `phase-6`
- `ui`
- `packets`

---

### Phase 7: Filtering System
**Project Name**: `Phase 7: Filtering System`

**Issues to Create:**
1. Create FilterPanel component
2. Implement filter logic
3. Add size range filter
4. Add timestamp range filter
5. Add SIM ID filter
6. Create filter preset system
7. Implement real-time filtering
8. Add filter UI controls
9. Save/load filter presets

**Labels:**
- `phase-7`
- `ui`
- `filtering`

---

### Phase 8: Capture History
**Project Name**: `Phase 8: Capture History`

**Issues to Create:**
1. Create CaptureHistory component
2. Implement session tracking
3. Store session metadata
4. Create history list UI
5. Add session details view
6. Implement open file location
7. Add delete session action
8. Create export functionality
9. Add session search/filter

**Labels:**
- `phase-8`
- `ui`
- `history`

---

### Phase 9: Settings & Polish
**Project Name**: `Phase 9: Settings & Polish`

**Issues to Create:**
1. Create SettingsPanel component
2. Implement default save location
3. Add theme preferences
4. Add auto-start option
5. Improve error messages
6. Add loading states
7. UI/UX improvements
8. Write user documentation
9. Add tooltips and help text

**Labels:**
- `phase-9`
- `ui`
- `settings`
- `polish`

---

### Phase 10: Build & Distribution
**Project Name**: `Phase 10: Build & Distribution`

**Issues to Create:**
1. Configure electron-builder.yml
2. Set up Mac build configuration
3. Set up Windows build configuration
4. Add app icons
5. Test Mac build
6. Test Windows build
7. Create build scripts
8. Document build process
9. Set up release workflow

**Labels:**
- `phase-10`
- `build`
- `distribution`

---

## Creating Projects via GitHub CLI

You can use GitHub CLI to create projects programmatically:

```bash
# Install GitHub CLI if not already installed
# brew install gh (Mac)
# choco install gh (Windows)

# Authenticate
gh auth login

# Create a project (example for Phase 1)
gh project create "Phase 1: Foundation Setup" --owner sebrdz-dev --repo onomondo-live

# Create issues for Phase 1
gh issue create --title "Initialize Electron project structure" \
  --body "Set up the basic Electron project structure with main and renderer processes" \
  --label "phase-1,foundation,setup" \
  --project "Phase 1: Foundation Setup"
```

## Creating Projects via GitHub Web UI

1. Go to the repository
2. Click on "Projects" tab
3. Click "New project"
4. Choose "Board" template
5. Name it according to the phase (e.g., "Phase 1: Foundation Setup")
6. Add columns: To Do, In Progress, Review, Done
7. Create issues for each task
8. Add labels to issues
9. Add issues to the project board

## Milestones

Create a milestone for each phase:
- **Phase 1 Milestone**: `v0.1.0 - Foundation`
- **Phase 2 Milestone**: `v0.2.0 - CLI Integration`
- **Phase 3 Milestone**: `v0.3.0 - Connection UI`
- **Phase 4 Milestone**: `v0.4.0 - Capture Controls`
- **Phase 5 Milestone**: `v0.5.0 - Live Statistics`
- **Phase 6 Milestone**: `v0.6.0 - Packet Preview`
- **Phase 7 Milestone**: `v0.7.0 - Filtering System`
- **Phase 8 Milestone**: `v0.8.0 - Capture History`
- **Phase 9 Milestone**: `v0.9.0 - Settings & Polish`
- **Phase 10 Milestone**: `v1.0.0 - Build & Distribution`

## Issue Templates

Create issue templates for consistency:

### Feature Request Template
```markdown
## Description
Brief description of the feature

## Phase
Which phase does this belong to?

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Technical Notes
Any technical considerations
```

### Bug Report Template
```markdown
## Description
Brief description of the bug

## Steps to Reproduce
1. Step 1
2. Step 2

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., macOS 14.0]
- Node.js version: [e.g., 20.0.0]
- Electron version: [e.g., 28.0.0]
```

## Automation

Consider using GitHub Actions to:
- Auto-move issues to "Done" when PR is merged
- Update project board when issues are closed
- Create release notes from completed milestones

## Project Dependencies

Link related issues using:
- `Depends on #123` - This issue depends on another
- `Blocks #456` - This issue blocks another
- `Relates to #789` - Related issue

## Progress Tracking

Each project should track:
- Total issues
- Issues in progress
- Issues completed
- Estimated completion date
- Blockers

## Weekly Reviews

Schedule weekly reviews to:
- Update project status
- Identify blockers
- Adjust priorities
- Move completed items to "Done"
- Plan next week's work

