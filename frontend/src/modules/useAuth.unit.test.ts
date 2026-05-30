import { beforeEach, describe, expect, it } from 'vitest'

import { clearAuthState, getAuthState, isAuthenticated } from './useAuth'

const AUTH_KEY = 'auth'

describe('useAuth storage helpers', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns null when auth does not exist', () => {
    expect(getAuthState()).toBeNull()
    expect(isAuthenticated()).toBe(false)
  })

  it('reads persisted auth state and validates authentication', () => {
    localStorage.setItem(
      AUTH_KEY,
      JSON.stringify({
        token: 'token-123',
        user: { id: '1', name: 'Ida', email: 'ida@example.com' }
      })
    )

    expect(getAuthState()).toEqual({
      token: 'token-123',
      user: { id: '1', name: 'Ida', email: 'ida@example.com' }
    })
    expect(isAuthenticated()).toBe(true)
  })

  it('clears broken stored JSON safely', () => {
    localStorage.setItem(AUTH_KEY, '{bad json')

    expect(getAuthState()).toBeNull()
    expect(localStorage.getItem(AUTH_KEY)).toBeNull()
  })

  it('removes auth state via clearAuthState', () => {
    localStorage.setItem(AUTH_KEY, JSON.stringify({ token: 'x', user: { email: 'a@b.com' } }))

    clearAuthState()

    expect(localStorage.getItem(AUTH_KEY)).toBeNull()
  })
})
