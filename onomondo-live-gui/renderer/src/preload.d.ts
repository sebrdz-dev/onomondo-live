// Type definitions for Electron preload API
export interface ElectronAPI {
  getVersion: () => Promise<string>
  getPlatform: () => Promise<string>
  checkNode: () => Promise<{ installed: boolean; valid: boolean; version: string | null }>
  on: (channel: string, callback: (...args: any[]) => void) => void
  send: (channel: string, data?: any) => void
  invoke: (channel: string, data?: any) => Promise<any>
  removeListener: (channel: string, callback: (...args: any[]) => void) => void
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}

