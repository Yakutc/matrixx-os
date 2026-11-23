export interface Point {
  x: number
  y: number
}

export interface SnakeState {
  snake: Point[]
  food: Point
  dir: Point
  alive: boolean
  score: number
}

export const COLS = 24
export const ROWS = 18

const RIGHT: Point = { x: 1, y: 0 }

export function samePoint(a: Point, b: Point): boolean {
  return a.x === b.x && a.y === b.y
}

export function nextFood(snake: Point[], random: () => number = Math.random): Point {
  const free: Point[] = []
  for (let y = 0; y < ROWS; y += 1) {
    for (let x = 0; x < COLS; x += 1) {
      if (!snake.some((part) => part.x === x && part.y === y)) free.push({ x, y })
    }
  }
  if (free.length === 0) return { x: 0, y: 0 }
  return free[Math.min(free.length - 1, Math.floor(random() * free.length))]
}

export function createInitialState(random: () => number = Math.random): SnakeState {
  const centerX = Math.floor(COLS / 2)
  const centerY = Math.floor(ROWS / 2)
  const snake = [
    { x: centerX, y: centerY },
    { x: centerX - 1, y: centerY },
    { x: centerX - 2, y: centerY },
    { x: centerX - 3, y: centerY },
  ]
  return {
    snake,
    food: nextFood(snake, random),
    dir: { ...RIGHT },
    alive: true,
    score: 0,
  }
}

export function turnDirection(current: Point, next: Point): Point {
  if (next.x === -current.x && next.y === -current.y) return current
  if (next.x === current.x && next.y === current.y) return current
  return next
}

export function step(state: SnakeState): SnakeState {
  const head = state.snake[0]
  const nextHead = { x: head.x + state.dir.x, y: head.y + state.dir.y }
  if (nextHead.x < 0 || nextHead.x >= COLS || nextHead.y < 0 || nextHead.y >= ROWS) {
    return { ...state, alive: false }
  }
  const ate = samePoint(nextHead, state.food)
  const body = ate ? state.snake : state.snake.slice(0, -1)
  if (body.some((part) => samePoint(part, nextHead))) {
    return { ...state, alive: false }
  }
  const snake = [nextHead, ...body]
  return {
    snake,
    food: ate ? nextFood(snake) : state.food,
    dir: state.dir,
    alive: true,
    score: state.score + (ate ? 1 : 0),
  }
}
