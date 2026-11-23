export interface ParsedCommand {
  name: string
  args: string[]
  raw: string
}

export function tokenize(input: string): string[] {
  const tokens: string[] = []
  let current = ''
  let quote: '"' | "'" | null = null
  for (let index = 0; index < input.length; index += 1) {
    const char = input[index]
    if (quote) {
      if (char === quote) {
        quote = null
      } else {
        current += char
      }
      continue
    }
    if (char === '"' || char === "'") {
      quote = char
      continue
    }
    if (char === ' ' || char === '\t') {
      if (current) {
        tokens.push(current)
        current = ''
      }
      continue
    }
    current += char
  }
  if (current) tokens.push(current)
  return tokens
}

export function parseCommand(input: string): ParsedCommand | null {
  const tokens = tokenize(input.trim())
  if (tokens.length === 0) return null
  const [name, ...args] = tokens
  return { name: name.toLowerCase(), args, raw: input.trim() }
}
