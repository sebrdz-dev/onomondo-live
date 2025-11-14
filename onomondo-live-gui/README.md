# Onomondo Live GUI

Electron-based desktop application providing a visual interface for `onomondo-live`.

## Development

### Prerequisites

- Node.js >= 14.8.0
- npm or yarn

### Setup

1. Install root dependencies:
```bash
npm install
```

This will also install renderer dependencies automatically via the `postinstall` script.

### Running in Development

Start both the Electron main process and Vite dev server:

```bash
npm run dev
```

This will:
- Start Vite dev server on http://localhost:5173
- Launch Electron with hot reload

### Building

Build for production:

```bash
npm run build
```

Build for specific platform:

```bash
npm run build:mac    # macOS
npm run build:win    # Windows
```

## Project Structure

- `main/` - Electron main process (Node.js)
- `renderer/` - React renderer process (UI)
- `docs/` - Documentation

See [PROJECT_STRUCTURE.md](../PROJECT_STRUCTURE.md) for detailed structure.

## Architecture

See [GUI_ARCHITECTURE.md](../GUI_ARCHITECTURE.md) for complete architecture documentation.

