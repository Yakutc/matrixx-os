import { useEffect, useState } from 'react'

export function useClock(): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])
  return now
}

export function timeParts(now: Date): { hours: string; minutes: string; seconds: string } {
  return {
    hours: String(now.getHours()).padStart(2, '0'),
    minutes: String(now.getMinutes()).padStart(2, '0'),
    seconds: String(now.getSeconds()).padStart(2, '0'),
  }
}

export function shortDate(now: Date): string {
  return now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function longDate(now: Date): string {
  return now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

export function weekday(now: Date): string {
  return now.toLocaleDateString('en-US', { weekday: 'short' })
}
