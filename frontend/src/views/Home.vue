<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import BookCard from '../components/BookCard.vue'
import { useBooks } from '../modules/useBooks'
import { useFavorites } from '../modules/useFavorites'
import { getAuthToken } from '../modules/useAuth'

const router = useRouter()
const { books, fetchBooks, fetchHighestRatedBooks } = useBooks()
const { favoriteBooks, fetchFavorites } = useFavorites()
const featuredBooks = ref<any[]>([])
const isAuthenticated = ref(Boolean(getAuthToken()))
const recommendationsLoading = ref(false)

const recommendedBooks = computed(() => {
  const favoriteGenreWeights = favoriteBooks.value.reduce((weights: Record<string, number>, book: any) => {
    const genreKey = String(book.genre || '').trim().toLowerCase()

    if (!genreKey) {
      return weights
    }

    weights[genreKey] = (weights[genreKey] || 0) + 1
    return weights
  }, {})

  if (Object.keys(favoriteGenreWeights).length === 0) {
    return []
  }

  const favoriteIds = new Set(favoriteBooks.value.map((book: any) => book._id))

  return books.value
    .filter((book: any) => {
      const genreKey = String(book.genre || '').trim().toLowerCase()
      return Boolean(genreKey && favoriteGenreWeights[genreKey] && !favoriteIds.has(book._id))
    })
    .map((book: any) => {
      const genreKey = String(book.genre || '').trim().toLowerCase()
      const score = (favoriteGenreWeights[genreKey] || 0) * 100 + (book.rating || 0)

      return {
        ...book,
        recommendationScore: score
      }
    })
    .sort((firstBook: any, secondBook: any) => secondBook.recommendationScore - firstBook.recommendationScore)
      .slice(0, 4)
})

onMounted(async () => {
  featuredBooks.value = (await fetchHighestRatedBooks()) ?? []

  if (!isAuthenticated.value) {
    return
  }

  recommendationsLoading.value = true

  try {
    await Promise.all([fetchBooks(), fetchFavorites()])
  } finally {
    recommendationsLoading.value = false
  }
})
</script>

<template>
  <div class="max-w-6xl mx-auto px-6 py-12">

    <!-- HERO -->
    <div class="relative rounded-2xl overflow-hidden mb-16">

      <!-- DARK IMAGE -->
      <img
        src="https://images.unsplash.com/photo-1507842217343-583bb7270b66"
        class="w-full h-[400px] object-cover grayscale brightness-50"
      />

      <!-- EXTRA OVERLAY -->
      <div class="absolute inset-0 bg-black/50"></div>

      <!-- CONTENT -->
      <div class="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
        <h1 class="text-5xl font-bold mb-4">
          Discover Your Next
          <span class="text-purple-400">Favorite Book</span>
        </h1>

        <p class="text-gray-300 max-w-xl mx-auto mb-6">
          Explore thousands of books across genres. Find what to read next.
        </p>

        <button
          @click="router.push('/books')"
          class="bg-purple-500 hover:bg-purple-600 px-6 py-3 rounded-lg font-semibold transition"
        >
          Browse Books
        </button>
      </div>

    </div>

    <!-- FEATURED -->
    <div>
      <h2 class="text-2xl font-semibold text-purple-400 mb-6">
        Highest Rated Books
      </h2>
      <p class="text-gray-300 mb-6">
        Community favorites with the strongest ratings right now.
      </p>

      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">

        <BookCard
          v-for="book in featuredBooks"
          :key="book._id"
          :book="book"
          @select="router.push(`/books/${book._id}`)"
        />

      </div>
    </div>

    <!-- RECOMMENDED -->
    <div class="mt-16">
      <h2 class="text-2xl font-semibold text-purple-400 mb-6">
        Recommended For You
      </h2>
      <p class="text-gray-300 mb-6">
        Personalized picks from the same genres as your saved favorites.
      </p>

      <div
        v-if="!isAuthenticated"
        class="rounded-xl border border-gray-800 bg-gray-900/60 p-6 text-gray-300"
      >
        Log in to get personalized recommendations based on your favorite genres.
      </div>

      <div
        v-else-if="recommendationsLoading"
        class="rounded-xl border border-gray-800 bg-gray-900/60 p-6 text-gray-300"
      >
        Loading your recommendations...
      </div>

      <div
        v-else-if="recommendedBooks.length === 0"
        class="rounded-xl border border-gray-800 bg-gray-900/60 p-6 text-gray-300"
      >
        Add a few favorites to get recommendations in matching genres.
      </div>

      <div
        v-else
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6"
      >
        <BookCard
          v-for="book in recommendedBooks"
          :key="book._id"
          :book="book"
          @select="router.push(`/books/${book._id}`)"
        />
      </div>
    </div>

  </div>
</template>