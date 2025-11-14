import { useEffect } from 'react'

/**
 * Hook for IPC communication
 */
export function useIPC () {
  const send = (channel, data) => {
    if (window.electronAPI && window.electronAPI.send) {
      window.electronAPI.send(channel, data)
    }
  }

  const invoke = async (channel, data) => {
    if (window.electronAPI && window.electronAPI.invoke) {
      try {
        return await window.electronAPI.invoke(channel, data)
      } catch (error) {
        console.error(`IPC invoke error for channel ${channel}:`, error)
        throw error
      }
    }
    console.warn('electronAPI not available, returning null')
    return null
  }

  const on = (channel, callback) => {
    if (window.electronAPI && window.electronAPI.on) {
      window.electronAPI.on(channel, callback)
    }
  }

  const removeListener = (channel, callback) => {
    if (window.electronAPI && window.electronAPI.removeListener) {
      window.electronAPI.removeListener(channel, callback)
    }
  }

  return { send, invoke, on, removeListener }
}

