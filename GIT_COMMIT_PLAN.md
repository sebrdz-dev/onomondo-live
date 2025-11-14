# Git Commit Plan

This document outlines the commit strategy for the Electron GUI project. All architecture and documentation should be committed before any implementation begins.

## Pre-Implementation Commits

### Commit 1: Architecture Documentation
**Message**: `docs: add GUI architecture and planning documentation`

**Files to commit:**
- `GUI_ARCHITECTURE.md` - Complete architecture documentation
- `PHASES.md` - Development phases with GitHub project setup
- `PROJECT_STRUCTURE.md` - Detailed folder structure
- `GIT_COMMIT_PLAN.md` - This file

**Branch**: `main` or `develop`

**Description**: 
Initial commit of all planning and architecture documentation. This establishes the foundation for the GUI project before any code is written.

---

### Commit 2: Update Main README
**Message**: `docs: update README with GUI project information`

**Files to commit:**
- `README.md` - Updated with GUI project section

**Description**:
Add a section to the main README explaining the GUI project, its relationship to the CLI tool, and how to get started.

---

## Implementation Phase Commits

### Phase 1 Commits
- `feat: initialize Electron project structure`
- `feat: set up React renderer process`
- `feat: implement basic IPC communication`
- `feat: add Node.js detection utility`

### Phase 2 Commits
- `feat: implement CLI wrapper module`
- `feat: add subprocess management`
- `feat: implement CLI output parsing`

### Phase 3 Commits
- `feat: create ConnectionPanel component`
- `feat: implement secure API key storage`
- `feat: add SIM ID validation`

### Phase 4 Commits
- `feat: create CaptureControls component`
- `feat: implement file save dialog`
- `feat: add capture session management`

### Phase 5 Commits
- `feat: create StatsPanel component`
- `feat: implement real-time statistics tracking`

### Phase 6 Commits
- `feat: create PacketList component`
- `feat: implement PCAP file reader`
- `feat: add packet detail view`

### Phase 7 Commits
- `feat: create FilterPanel component`
- `feat: implement packet filtering engine`

### Phase 8 Commits
- `feat: create CaptureHistory component`
- `feat: implement session tracking`

### Phase 9 Commits
- `feat: create SettingsPanel component`
- `feat: improve error handling`
- `style: UI/UX improvements`

### Phase 10 Commits
- `build: configure electron-builder`
- `build: add Mac build configuration`
- `build: add Windows build configuration`

## Commit Message Convention

Follow conventional commits format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding tests
- `build`: Build system changes
- `chore`: Other changes

**Examples:**
```
feat(capture): implement start/stop capture functionality

Adds the ability to start and stop packet capture sessions
through the GUI. Integrates with CLI wrapper to spawn
onomondo-live subprocess.

Closes #123
```

```
fix(cli-wrapper): handle subprocess errors gracefully

Fixes issue where subprocess errors would crash the app.
Now errors are caught and displayed to the user.

Fixes #456
```

## Branch Strategy

1. **main**: Production-ready code
2. **develop**: Integration branch for features
3. **feature/phase-X**: Feature branches for each phase
4. **hotfix/**: Critical bug fixes

## Tagging Strategy

Tag releases with semantic versioning:
- `v0.1.0` - Phase 1 complete
- `v0.2.0` - Phase 2 complete
- ...
- `v1.0.0` - First stable release

## Pre-Commit Checklist

Before committing code:
- [ ] Code follows project style guide
- [ ] No console.logs or debug code
- [ ] Error handling implemented
- [ ] Documentation updated if needed
- [ ] Tests pass (when applicable)
- [ ] No sensitive data (API keys, etc.)

## GitHub Projects Integration

Each commit should reference the relevant GitHub issue:
- `Closes #123` - Closes an issue
- `Fixes #456` - Fixes a bug
- `Relates to #789` - Related to an issue

## Documentation Updates

Documentation should be updated alongside code:
- API changes → Update `docs/API.md`
- Architecture changes → Update `GUI_ARCHITECTURE.md`
- New features → Update `README.md`

