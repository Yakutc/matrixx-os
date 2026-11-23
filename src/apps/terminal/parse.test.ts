import { describe, expect, it } from 'vitest'
import { parseCommand, tokenize } from './parse'

describe('terminal parser', () => {
  it('parses a command with arguments', () => {
    expect(parseCommand('theme dark')).toEqual({
      name: 'theme',
      args: ['dark'],
      raw: 'theme dark',
    })
  })

  it('keeps quoted arguments together', () => {
    expect(tokenize('echo "hello world"')).toEqual(['echo', 'hello world'])
    expect(tokenize("cd '/opt/sector-09'")).toEqual(['cd', '/opt/sector-09'])
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
    expect(tokenize('echo "not closed')).toEqual(['echo', 'not closed'])
  })
})
