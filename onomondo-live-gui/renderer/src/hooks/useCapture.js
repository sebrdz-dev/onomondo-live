import { useState, useEffect, useCallback } from 'react'
import { useIPC } from './useIPC'

export function useCapture () {
  const { invoke, on, removeListener } = useIPC()
  const [captures, setCaptures] = useState(new Map())
  const [isStarting, setIsStarting] = useState(false)

  // Listen for capture events
  useEffect(() => {
    const handleStarted = (data) => {
      setCaptures(prev => {
        const newCaptures = new Map(prev)
        const capture = newCaptures.get(data.captureId) || {}
        newCaptures.set(data.captureId, {
          ...capture,
          ...data,
          status: 'running',
          startTime: Date.now()
        })
        return newCaptures
      })
      setIsStarting(false)
    }

    const handleStopped = (data) => {
      setCaptures(prev => {
        const newCaptures = new Map(prev)
        const capture = newCaptures.get(data.captureId)
        if (capture) {
          newCaptures.set(data.captureId, {
            ...capture,
            status: 'stopped',
            endTime: Date.now(),
            finalPackets: data.packets,
            finalBytes: data.bytes,
            duration: data.duration
          })
        }
        return newCaptures
      })
    }

    const handleError = (data) => {
      setCaptures(prev => {
        const newCaptures = new Map(prev)
        const capture = newCaptures.get(data.captureId)
        if (capture) {
          newCaptures.set(data.captureId, {
            ...capture,
            status: 'error',
            error: data.error
          })
        }
        return newCaptures
      })
      setIsStarting(false)
    }

    const handleStatsUpdate = (data) => {
      setCaptures(prev => {
        const newCaptures = new Map(prev)
        const capture = newCaptures.get(data.captureId)
        if (capture) {
          newCaptures.set(data.captureId, {
            ...capture,
            packets: data.packets,
            bytes: data.bytes
          })
        }
        return newCaptures
      })
    }

    on('capture:started', handleStarted)
    on('capture:stopped', handleStopped)
    on('capture:error', handleError)
    on('stats:update', handleStatsUpdate)

    return () => {
      removeListener('capture:started', handleStarted)
      removeListener('capture:stopped', handleStopped)
      removeListener('capture:error', handleError)
      removeListener('stats:update', handleStatsUpdate)
    }
  }, [on, removeListener])

  // Start capture
  const startCapture = useCallback(async (options) => {
    setIsStarting(true)
    try {
      const result = await invoke('capture:start', options)
      if (!result.success) {
        setIsStarting(false)
        throw new Error(result.error || 'Failed to start capture')
      }
      return result.captureId
    } catch (error) {
      setIsStarting(false)
      throw error
    }
  }, [invoke])

  // Stop capture
  const stopCapture = useCallback(async (captureId) => {
    try {
      const result = await invoke('capture:stop', captureId)
      if (!result.success) {
        throw new Error(result.error || 'Failed to stop capture')
      }
      return true
    } catch (error) {
      throw error
    }
  }, [invoke])

  // Get capture status
  const getCaptureStatus = useCallback(async (captureId) => {
    try {
      return await invoke('capture:status', captureId)
    } catch (error) {
      return null
    }
  }, [invoke])

  // Get all active captures
  const getActiveCaptures = useCallback(async () => {
    try {
      return await invoke('capture:list')
    } catch (error) {
      return []
    }
  }, [invoke])

  return {
    captures: Array.from(captures.values()),
    isStarting,
    startCapture,
    stopCapture,
    getCaptureStatus,
    getActiveCaptures
  }
}

