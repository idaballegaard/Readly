import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { API_BASE_URL } from '../config/api'
import { useBooks } from './useBooks'

function createResponse(data: unknown): Response {
  return {
    ok: true,
    json: async () => data
  } as Response
}

describe('useBooks', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('fetches books and updates state', async () => {
    const fetchMock = vi.mocked(fetch)
    fetchMock.mockResolvedValueOnce(
      createResponse([
        { _id: '1', title: 'Book One' },
        { _id: '2', title: 'Book Two' }
      ])
    )

    const { books, loading, error, fetchBooks } = useBooks()

    await fetchBooks()

    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/books`)
    expect(books.value).toEqual([
      { _id: '1', title: 'Book One' },
      { _id: '2', title: 'Book Two' }
    ])
    expect(error.value).toBeNull()
    expect(loading.value).toBe(false)
  })

  it('returns the first book for fetchBookById', async () => {
    const fetchMock = vi.mocked(fetch)
    fetchMock.mockResolvedValueOnce(
      createResponse([{ _id: '1', title: 'Book One' }])
    )

    const { loading, error, fetchBookById } = useBooks()

    const book = await fetchBookById('1')

    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/books/1`)
    expect(book).toEqual({ _id: '1', title: 'Book One' })
    expect(error.value).toBeNull()
    expect(loading.value).toBe(false)
  })

  it('returns highest rated books', async () => {
    const fetchMock = vi.mocked(fetch)
    fetchMock.mockResolvedValueOnce(
      createResponse([
        { _id: '1', rating: 5 },
        { _id: '2', rating: 4.5 }
      ])
    )

    const { fetchHighestRatedBooks } = useBooks()

    const books = await fetchHighestRatedBooks()

    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/books/highest-rated`)
    expect(books).toEqual([
      { _id: '1', rating: 5 },
      { _id: '2', rating: 4.5 }
    ])
  })

  it('sets an error when fetch fails', async () => {
    const fetchMock = vi.mocked(fetch)
    fetchMock.mockRejectedValueOnce(new Error('network down'))

    const { error, fetchBooks } = useBooks()

    await fetchBooks()

    expect(error.value).toBe('Kunne ikke hente bøger')
  })
})