<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import BookCard from '../components/BookCard.vue'
import SearchFilters from '../components/SearchFilters.vue'
import { useFavorites } from '../modules/useFavorites'
import { useBooks } from '../modules/useBooks'

// Hent bøger
const router = useRouter()
const { loading, error, books, fetchBooks } = useBooks()
const searchTitle = ref('')
const searchGenre = ref('')
const browseGenre = ref('')
const sortBy = ref('rating')
const {
  loading: favoritesLoading,
  error: favoritesError,
  fetchFavorites,
  toggleFavorite,
  isFavorite
} = useFavorites()

onMounted(async () => {
  await Promise.all([fetchBooks(), fetchFavorites()])
})

const favoritePendingIds = ref<string[]>([])

const handleFavorite = async (id: string) => {
  if (favoritePendingIds.value.includes(id)) {
    return
  }

  favoritePendingIds.value.push(id)

  try {
    await toggleFavorite(id)
  } finally {
    favoritePendingIds.value = favoritePendingIds.value.filter((pendingId) => pendingId !== id)
  }
}

const goToBook = (id: string) => {
  router.push(`/books/${id}`)
}

const filteredAndSortedBooks = computed(() => {
  const filtered = books.value.filter((book) => {
    const titleMatch = book.title.toLowerCase().includes(searchTitle.value.toLowerCase())
    const genreMatch = !searchGenre.value || book.genre?.toLowerCase().includes(searchGenre.value.toLowerCase())

    return titleMatch && genreMatch
  })

  if (sortBy.value === 'rating') {
    filtered.sort((firstBook, secondBook) => (secondBook.rating || 0) - (firstBook.rating || 0))
  } else {
    filtered.sort(
      (firstBook, secondBook) =>
        new Date(secondBook.publishedDate || 0).getTime() - new Date(firstBook.publishedDate || 0).getTime()
    )
  }

  return filtered
})

const hasActiveFilters = computed(() => {
  return Boolean(searchTitle.value.trim() || searchGenre.value || sortBy.value !== 'rating')
})

// Få de højeste ratede bøger
const highestRatedBooks = computed(() => {
  return [...books.value]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 4)
})

const topSectionBooks = computed(() => {
  return hasActiveFilters.value ? filteredAndSortedBooks.value : highestRatedBooks.value
})

// Få unikke genres
const availableGenres = computed(() => {
  const genres = new Set(books.value.map(book => book.genre).filter(Boolean))
  return Array.from(genres).sort()
})

const booksForBrowse = computed(() => {
  if (!browseGenre.value) {
    return books.value
  }

  return books.value.filter((book) => book.genre === browseGenre.value)
})

// Gruppér efter genre
const groupedBooks = computed(() => {
  return booksForBrowse.value.reduce((acc: any, book: any) => {
    const genre = book.genre || 'Other'
    if (!acc[genre]) acc[genre] = []
    acc[genre].push(book)
    return acc
  }, {})
})
</script>

<template>
  <div class="books-shell">
    <div class="books-glow books-glow-left"></div>
    <div class="books-glow books-glow-right"></div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">
      <section class="rounded-2xl border border-indigo-400/20 bg-gradient-to-r from-slate-950/85 via-slate-900/80 to-indigo-950/75 p-6 sm:p-8 mb-8">
        <h1 class="text-4xl sm:text-5xl font-black text-white leading-tight">
          Explore
          <span class="text-purple-400">Books</span>
        </h1>
        <p class="text-gray-300 mt-3 max-w-2xl">
          Search, filter, and discover books across genres. Build your own reading list with favorites.
        </p>
      </section>

      <section class="mb-8">
        <SearchFilters
          :searchTitle="searchTitle"
          :searchGenre="searchGenre"
          :sortBy="sortBy"
          :availableGenres="availableGenres"
          :resultCount="filteredAndSortedBooks.length"
          @update:searchTitle="searchTitle = $event"
          @update:searchGenre="searchGenre = $event"
          @update:sortBy="sortBy = $event"
        />
      </section>

      <div v-if="loading || favoritesLoading" class="surface-message text-gray-300">
        Loading...
      </div>

      <div v-else-if="error" class="surface-message text-red-300">
        {{ error }}
      </div>

      <div v-else-if="favoritesError" class="surface-message text-red-300">
        {{ favoritesError }}
      </div>

      <div v-else>
        <section class="mb-12">
          <div class="section-header">
            <div>
              <h2 class="section-title">{{ hasActiveFilters ? 'Search Results' : 'Highest Rated' }}</h2>
              <p class="section-tagline">
                {{ hasActiveFilters ? 'Books matched to your active filters.' : 'Community favorites with the strongest ratings right now.' }}
              </p>
            </div>
            <router-link
              v-if="!hasActiveFilters"
              to="/books/highest-rated"
              class="section-link"
            >
              View all
            </router-link>
          </div>

          <div
            v-if="topSectionBooks.length === 0"
            class="surface-message text-gray-300"
          >
            No books found for your current filters.
          </div>

          <div
            v-else
            class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5"
          >
            <BookCard
              v-for="book in topSectionBooks"
              :key="book._id"
              :book="book"
              :showFavorite="true"
              :favoriteActive="isFavorite(book._id)"
              :favoriteDisabled="favoritePendingIds.includes(book._id) || favoritesLoading"
              @select="goToBook(book._id)"
              @toggleFavorite="handleFavorite(book._id)"
            />
          </div>
        </section>

        <section class="mb-10">
          <div class="section-header">
            <div>
              <h2 class="section-title">Browse by Genre</h2>
              <p class="section-tagline">Switch genre to quickly focus your browsing experience.</p>
            </div>
          </div>

          <div class="flex flex-wrap gap-3">
            <button
              @click="browseGenre = ''"
              :class="[
                'genre-chip',
                browseGenre === '' ? 'genre-chip-active' : ''
              ]"
            >
              All Genres
            </button>

            <button
              v-for="genre in availableGenres"
              :key="genre"
              @click="browseGenre = genre"
              :class="[
                'genre-chip',
                browseGenre === genre ? 'genre-chip-active' : ''
              ]"
            >
              {{ genre }}
            </button>
          </div>
        </section>

        <section>
          <div
            v-for="(genreBooks, genre) in groupedBooks"
            :key="genre"
            class="mb-12"
          >
            <div class="section-header">
              <div>
                <h2 class="section-title genre-title">{{ genre }}</h2>
                <p class="section-tagline">Handpicked titles in this genre.</p>
              </div>
              <router-link :to="`/genre/${genre}`" class="section-link">
                View all
              </router-link>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
              <BookCard
                v-for="book in genreBooks"
                :key="book._id"
                :book="book"
                :showFavorite="true"
                :favoriteActive="isFavorite(book._id)"
                :favoriteDisabled="favoritePendingIds.includes(book._id) || favoritesLoading"
                @select="goToBook(book._id)"
                @toggleFavorite="handleFavorite(book._id)"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.books-shell {
  position: relative;
  overflow: hidden;
  background: radial-gradient(circle at 12% 14%, rgba(70, 32, 130, 0.34), transparent 32%),
              radial-gradient(circle at 89% 0%, rgba(24, 69, 148, 0.24), transparent 36%),
              linear-gradient(135deg, #020611 0%, #050e1f 38%, #020712 100%);
}

.books-glow {
  position: absolute;
  width: 380px;
  height: 380px;
  border-radius: 9999px;
  filter: blur(90px);
  pointer-events: none;
  opacity: 0.18;
}

.books-glow-left {
  top: -140px;
  left: -150px;
  background: #7f5af0;
}

.books-glow-right {
  top: 110px;
  right: -190px;
  background: #2563eb;
}

.section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.section-title {
  font-size: 1.7rem;
  line-height: 1.15;
  font-weight: 800;
  color: #f5f7ff;
}

.genre-title {
  color: #c4a2ff;
}

.section-tagline {
  margin-top: 0.22rem;
  color: #a6b0cf;
}

.section-link {
  margin-top: 0.45rem;
  color: #ab86ff;
  font-size: 0.92rem;
  font-weight: 700;
  transition: color 160ms ease;
}

.section-link:hover {
  color: #c7b0ff;
}

.surface-message {
  border: 1px solid rgba(65, 74, 110, 0.55);
  border-radius: 0.9rem;
  background: rgba(10, 16, 35, 0.74);
  padding: 1rem 1.1rem;
}

.genre-chip {
  border: 1px solid rgba(120, 135, 190, 0.38);
  border-radius: 9999px;
  padding: 0.5rem 0.95rem;
  color: #cfd8f7;
  font-weight: 700;
  background: rgba(13, 20, 42, 0.76);
  transition: border-color 160ms ease, color 160ms ease, transform 160ms ease, background-color 160ms ease;
}

.genre-chip:hover {
  transform: translateY(-1px);
  border-color: rgba(173, 139, 255, 0.62);
  color: #f2ebff;
}

.genre-chip-active {
  border-color: rgba(166, 122, 255, 0.82);
  color: #ffffff;
  background: linear-gradient(145deg, rgba(105, 58, 204, 0.75), rgba(92, 56, 175, 0.7));
}

@media (max-width: 768px) {
  .section-title {
    font-size: 1.35rem;
  }

  .section-tagline {
    font-size: 0.9rem;
  }
}
</style>
