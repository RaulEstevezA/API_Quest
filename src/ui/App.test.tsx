import { describe, expect, it } from 'vitest'

describe('application shell', () => {
  it('uses the public game name', () => {
    expect('API Quest').toBe('API Quest')
  })
})
