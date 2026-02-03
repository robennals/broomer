// Registry for accessing terminal buffers from outside the Terminal component
// Used for copying terminal content via keyboard shortcut

type BufferGetter = () => string

const bufferGetters = new Map<string, BufferGetter>()

export const terminalBufferRegistry = {
  register(sessionId: string, getter: BufferGetter) {
    bufferGetters.set(sessionId, getter)
  },

  unregister(sessionId: string) {
    bufferGetters.delete(sessionId)
  },

  getBuffer(sessionId: string): string | null {
    const getter = bufferGetters.get(sessionId)
    return getter ? getter() : null
  },

  // Get last N lines from buffer
  getLastLines(sessionId: string, lineCount: number): string | null {
    const buffer = this.getBuffer(sessionId)
    if (!buffer) return null

    const lines = buffer.split('\n')
    const lastLines = lines.slice(-lineCount)
    return lastLines.join('\n')
  }
}
