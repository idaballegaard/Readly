import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { API_BASE_URL } from '../config/api'
import {
  clearAuthState,
  getAuthState,
  getAuthToken,
  getStoredUser,
  isAuthenticated,
  loginUser,
  registerUser
} from './useAuth'

const AUTH_KEY = 'auth'

function createResponse(data: unknown, ok = true): Response {
  return {
    ok,
    json: async () => data
  } as Response
}

describe('useAuth storage helpers', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
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

  it('returns stored user and token helpers', () => {
    localStorage.setItem(
      AUTH_KEY,
      JSON.stringify({
        token: 'token-123',
        user: { id: '1', name: 'Ida', email: 'ida@example.com' }
      })
    )

    expect(getStoredUser()).toEqual({
      id: '1',
      name: 'Ida',
      email: 'ida@example.com'
    })
    expect(getAuthToken()).toBe('token-123')
  })

  it('stores auth state after a successful login', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      createResponse({
        error: null,
        data: {
          token: 'token-123',
          user: { id: '1', name: 'Ida', email: 'ida@example.com' }
        }
      })
    )

    vi.stubGlobal('fetch', fetchMock)

    const user = await loginUser('ida@example.com', 'secret123')

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_BASE_URL}/user/login`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          email: 'ida@example.com',
          password: 'secret123'
        })
      })
    )
    expect(user).toEqual({
      id: '1',
      name: 'Ida',
      email: 'ida@example.com'
    })
    expect(getAuthToken()).toBe('token-123')
  })

  it('registers a user and then logs in', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(createResponse({ error: null, data: 'user-id' }))
      .mockResolvedValueOnce(
        createResponse({
          error: null,
          data: {
            token: 'token-456',
            user: { id: '2', name: 'Ida Ballegaard', email: 'ida@example.com' }
          }
        })
      )

    vi.stubGlobal('fetch', fetchMock)

    const user = await registerUser('Ida Ballegaard', 'ida@example.com', 'secret123')

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      `${API_BASE_URL}/user/register`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          name: 'Ida Ballegaard',
          email: 'ida@example.com',
          password: 'secret123'
        })
      })
    )
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      `${API_BASE_URL}/user/login`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          email: 'ida@example.com',
          password: 'secret123'
        })
      })
    )
    expect(user).toEqual({
      id: '2',
      name: 'Ida Ballegaard',
      email: 'ida@example.com'
    })
    expect(getAuthToken()).toBe('token-456')
  })

  it('throws when login fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(createResponse({ error: 'Unable to login' }, false))
    )

    await expect(loginUser('ida@example.com', 'wrong-password')).rejects.toThrow('Unable to login')
    expect(localStorage.getItem(AUTH_KEY)).toBeNull()
  })
})
