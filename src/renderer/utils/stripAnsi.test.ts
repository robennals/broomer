import { describe, it, expect } from 'vitest'
import { stripAnsi } from './stripAnsi'

describe('stripAnsi', () => {
  it('returns plain text unchanged', () => {
    expect(stripAnsi('hello world')).toBe('hello world')
  })

  it('strips CSI color codes', () => {
    expect(stripAnsi('\x1b[31mred\x1b[0m')).toBe('red')
  })

  it('strips bold and underline', () => {
    expect(stripAnsi('\x1b[1mbold\x1b[22m \x1b[4munderline\x1b[24m')).toBe('bold underline')
  })

  it('strips cursor movement sequences', () => {
    expect(stripAnsi('\x1b[2Aup\x1b[3Bdown')).toBe('updown')
  })

  it('strips OSC sequences (e.g. terminal title)', () => {
    expect(stripAnsi('\x1b]0;title\x07text')).toBe('text')
  })

  it('strips OSC sequences with ST terminator', () => {
    expect(stripAnsi('\x1b]0;title\x1b\\text')).toBe('text')
  })

  it('strips DCS sequences', () => {
    expect(stripAnsi('\x1bPdata\x1b\\text')).toBe('text')
  })

  it('strips SS2/SS3 sequences', () => {
    expect(stripAnsi('\x1bNx\x1bOytext')).toBe('text')
  })

  it('strips standalone ESC and BEL characters', () => {
    expect(stripAnsi('hello\x1b\x07world')).toBe('helloworld')
  })

  it('strips non-printable control characters', () => {
    expect(stripAnsi('a\x01b\x02c')).toBe('abc')
  })

  it('handles empty string', () => {
    expect(stripAnsi('')).toBe('')
  })

  it('strips multiple sequences in a row', () => {
    expect(stripAnsi('\x1b[1m\x1b[31m\x1b[4mhello\x1b[0m')).toBe('hello')
  })

  it('strips CSI question mark sequences (e.g. cursor hide/show)', () => {
    expect(stripAnsi('\x1b[?25lhidden\x1b[?25h')).toBe('hidden')
  })

  it('preserves newlines and tabs', () => {
    expect(stripAnsi('line1\nline2\ttab')).toBe('line1\nline2\ttab')
  })
})
