import { describe, expect, it } from 'vitest'
import { parseCommand, tokenize } from './parse'

describe('terminal parser', () => {
  it('parses a command with arguments', () => {
    expect(parseCommand('theme amber')).toEqual({
      name: 'theme',
      args: ['amber'],
      raw: 'theme amber',
    })
  })

  it('keeps quoted arguments together', () => {
    expect(tokenize('echo "привет мир"')).toEqual(['echo', 'привет мир'])
    expect(tokenize("cd '/объект 09'")).toEqual(['cd', '/объект 09'])
  })

  it('lowercases only the command name', () => {
    expect(parseCommand('WHOAMI')).toEqual({ name: 'whoami', args: [], raw: 'WHOAMI' })
  })

  it('returns null for blank input', () => {
    expect(parseCommand('   ')).toBeNull()
    expect(parseCommand('\t\n')).toBeNull()
  })

  it('handles repeated spaces', () => {
    expect(tokenize('  ls   -a  ')).toEqual(['ls', '-a'])
  })

  it('treats an unclosed quote as the rest of the input', () => {
    expect(tokenize('echo "не закрыто')).toEqual(['echo', 'не закрыто'])
  })
})
