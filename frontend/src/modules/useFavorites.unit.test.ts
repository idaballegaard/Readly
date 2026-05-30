import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { API_BASE_URL } from '../config/api'

const mockGetAuthToken = vi.hoisted(() => vi.fn())

vi.mock('./useAuth', () => ({
  getAuthToken: mockGetAuthToken
}))

import { useFavorites } from './useFavorites'

function createResponse(data: unknown, ok = true): Response {
  return {
    ok,
    json: async () => data
  } as Response
}

describe('useFavorites', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
    mockGetAuthToken.mockReset()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('loads favorites when authenticated', async () => {
    mockGetAuthToken.mockReturnValue('token-123')

    const fetchMock = vi.mocked(fetch)
    fetchMock.mockResolvedValueOnce(
      createResponse({
        data: {
          favoriteBookIds: ['1'],
          favoriteBooks: [{ _id: '1', title: 'Book One' }]
        }
      })
    )

    const { favoriteBookIds, favoriteBooks, error, fetchFavorites, isFavorite } = useFavorites()

    await fetchFavorites()

    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/user/favorites`, {
      headers: {
        'Content-Type': 'application/json',
        'auth-token': 'token-123'
      }
    })
    expect(favoriteBookIds.value).toEqual(['1'])
    expect(favoriteBooks.value).toEqual([{ _id: '1', title: 'Book One' }])
    expect(isFavorite('1')).toBe(true)
    expect(error.value).toBeNull()
  })

  it('toggles a favorite book and updates local state', async () => {
    mockGetAuthToken.mockReturnValue('token-123')

    const fetchMock = vi.mocked(fetch)
    fetchMock.mockResolvedValueOnce(
      createResponse({
        data: {
          isFavorite: true,
          favoriteBookIds: ['1'],
          favoriteBooks: [{ _id: '1', title: 'Book One' }]
        }
      })
    )

    const { favoriteBookIds, favoriteBooks, toggleFavorite } = useFavorites()

    const result = await toggleFavorite('1')

    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/user/favorites/1`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': 'token-123'
      }
    })
    expect(result).toBe(true)
    expect(favoriteBookIds.value).toEqual(['1'])
    expect(favoriteBooks.value).toEqual([{ _id: '1', title: 'Book One' }])
  })

  it('sets an error when authentication is missing', async () => {
    mockGetAuthToken.mockReturnValue(null)

    const { error, fetchFavorites } = useFavorites()

    await fetchFavorites()

    expect(error.value).toBe('You must be logged in')
    expect(vi.mocked(fetch)).not.toHaveBeenCalled()
  })
})