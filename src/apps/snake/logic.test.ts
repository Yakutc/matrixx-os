import { describe, expect, it } from 'vitest'
import {
  COLS,
  createInitialState,
  nextFood,
  step,
  turnDirection,
  type Point,
  type SnakeState,
} from './logic'

function state(snake: Point[], dir: Point, food: Point = { x: 10, y: 10 }): SnakeState {
  return { snake, dir, food, alive: true, score: 0 }
}

describe('snake logic', () => {
  it('creates a snake with food outside the body', () => {
    for (let index = 0; index < 40; index += 1) {
      const game = createInitialState()
      expect(game.snake).toHaveLength(4)
      expect(game.snake.some((part) => part.x === game.food.x && part.y === game.food.y)).toBe(
        false,
      )
    }
  })

  it('moves the head and keeps length without food', () => {
    const game = state([{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }], { x: 1, y: 0 }, { x: 10, y: 10 })
    const next = step(game)
    expect(next.snake[0]).toEqual({ x: 6, y: 5 })
    expect(next.snake).toHaveLength(3)
    expect(next.score).toBe(0)
  })

  it('grows and scores when eating', () => {
    const game = state([{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }], { x: 1, y: 0 }, { x: 6, y: 5 })
    const next = step(game)
    expect(next.snake).toHaveLength(4)
    expect(next.score).toBe(1)
    expect(next.food).not.toEqual({ x: 6, y: 5 })
  })

  it('dies against the wall', () => {
    const game = state([{ x: COLS - 1, y: 5 }, { x: COLS - 2, y: 5 }], { x: 1, y: 0 })
    expect(step(game).alive).toBe(false)
  })

  it('dies against itself', () => {
    const game = state(
      [
        { x: 2, y: 1 },
        { x: 1, y: 1 },
        { x: 1, y: 2 },
        { x: 2, y: 2 },
        { x: 3, y: 2 },
      ],
      { x: 0, y: 1 },
      { x: 10, y: 10 },
    )
    expect(step(game).alive).toBe(false)
  })

  it('allows moving into the cell the tail is leaving', () => {
    const game = state(
      [
        { x: 2, y: 2 },
        { x: 2, y: 1 },
        { x: 1, y: 1 },
        { x: 1, y: 2 },
      ],
      { x: 0, y: 1 },
      { x: 10, y: 10 },
    )
    const next = step({ ...game, dir: { x: -1, y: 0 } })
    expect(next.alive).toBe(true)
  })

  it('blocks a direct reversal', () => {
    expect(turnDirection({ x: 1, y: 0 }, { x: -1, y: 0 })).toEqual({ x: 1, y: 0 })
    expect(turnDirection({ x: 1, y: 0 }, { x: 0, y: 1 })).toEqual({ x: 0, y: 1 })
  })

  it('never places food on the snake', () => {
    const snake = [{ x: 0, y: 0 }, { x: 1, y: 0 }]
    for (let index = 0; index < 30; index += 1) {
      const food = nextFood(snake)
      expect(snake.some((part) => part.x === food.x && part.y === food.y)).toBe(false)
    }
  })
})
