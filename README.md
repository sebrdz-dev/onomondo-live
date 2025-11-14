# onomondo-live

Capture all traffic between a device and the network, seen from the network's perspective.

Output to a pcap file, or pipe to another tool that can read pcap files (like Wireshark).

## Installation

You need to have [node](https://nodejs.org/en/download/) and `npm` installed on your system.

Then run this command:
`$ npm install onomondo-live --global`

## Usage

You need to use the id of one or more of your sims, and an Onomondo api key.

If you want to listen to multiple sims you can supply multiple --sim params, like this: `--sim=111111111 --sim=222222222`

### Write to file
`$ onomondo-live --key=onok_a1b2c3.f00ba5 --sim=012345678 --filename=output.pcap`

### Write to standard output
`$ onomondo-live --key=onok_a1b2c3.f00ba5 --sim=012345678 -`

### Pipe to Wireshark example
`$ onomondo-live --key=onok_a1b2c3.f00ba5 --sim=012345678 - | wireshark -k -i -`

## GUI Application (In Development)

A cross-platform Electron-based GUI application is being developed to provide a visual interface for `onomondo-live`. The GUI wraps the CLI as a subprocess, making it resilient to changes in the underlying CLI structure.

### Documentation

- [GUI Architecture](./GUI_ARCHITECTURE.md) - Complete architecture documentation
- [Development Phases](./PHASES.md) - Development phases and GitHub project setup
- [Project Structure](./PROJECT_STRUCTURE.md) - Detailed folder structure
- [Git Commit Plan](./GIT_COMMIT_PLAN.md) - Commit strategy and conventions

### Status

The GUI project is currently in the planning phase. Architecture and documentation have been established. Implementation will begin following the phased approach outlined in [PHASES.md](./PHASES.md).

