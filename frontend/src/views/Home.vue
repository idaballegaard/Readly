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
  <div class="home-shell">
    <div class="home-glow home-glow-left"></div>
    <div class="home-glow home-glow-right"></div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">
      <section class="relative rounded-2xl overflow-hidden border border-indigo-400/25 shadow-2xl mb-12">
        <img
          src="https://images.unsplash.com/photo-1507842217343-583bb7270b66"
          class="w-full h-[320px] sm:h-[380px] object-cover brightness-[0.35]"
        />
        <div class="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-transparent"></div>

        <div class="absolute inset-0 flex items-center px-6 sm:px-10">
          <div class="max-w-xl">
            <h1 class="text-4xl sm:text-6xl font-black leading-tight text-white mb-4">
              Find your next
              <span class="block text-purple-400">great read</span>
            </h1>

            <p class="text-gray-300 text-base sm:text-lg mb-7">
              Explore thousands of books across genres. Find what to read next.
            </p>

            <div class="flex flex-wrap gap-3">
              <button
                @click="router.push('/books')"
                class="home-primary-btn"
              >
                Explore Books
              </button>

              <button
                @click="router.push('/profile')"
                class="home-secondary-btn"
              >
                View My Favorites
              </button>
            </div>
          </div>
        </div>
      </section>

      <section class="mb-12">
        <div class="section-header">
          <div>
            <h2 class="section-title">Highest Rated Books</h2>
            <p class="section-tagline">Community favorites with the strongest ratings right now.</p>
          </div>
          <router-link to="/books" class="section-link">View all</router-link>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
          <BookCard
            v-for="book in featuredBooks"
            :key="book._id"
            :book="book"
            @select="router.push(`/books/${book._id}`)"
          />
        </div>
      </section>

      <section class="mb-12">
        <div class="section-header">
          <div>
            <h2 class="section-title">Recommended For You</h2>
            <p class="section-tagline">Personalized picks from the same genres as your saved favorites.</p>
          </div>
          <router-link to="/books" class="section-link">View all</router-link>
        </div>

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
          class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5"
        >
          <BookCard
            v-for="book in recommendedBooks"
            :key="book._id"
            :book="book"
            @select="router.push(`/books/${book._id}`)"
          />
        </div>
      </section>

      <section class="rounded-2xl border border-indigo-400/20 bg-gradient-to-r from-indigo-950/70 via-slate-900/80 to-purple-950/70 p-5 sm:p-6">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 class="text-xl sm:text-2xl font-bold text-white mb-1">Start your reading adventure today</h3>
            <p class="text-gray-300">Join thousands of book lovers and discover your next favorite book.</p>
          </div>
          <button
            class="home-primary-btn w-full md:w-auto"
            @click="router.push('/books')"
          >
            Create Your Reading List
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.home-shell {
  position: relative;
  overflow: hidden;
  background: radial-gradient(circle at 15% 20%, rgba(70, 32, 130, 0.35), transparent 30%),
              radial-gradient(circle at 85% 10%, rgba(24, 69, 148, 0.28), transparent 40%),
              linear-gradient(135deg, #020611 0%, #050e1f 38%, #020712 100%);
}

.home-glow {
  position: absolute;
  width: 380px;
  height: 380px;
  border-radius: 9999px;
  filter: blur(90px);
  pointer-events: none;
  opacity: 0.2;
}

.home-glow-left {
  top: -140px;
  left: -160px;
  background: #7f5af0;
}

.home-glow-right {
  top: 120px;
  right: -190px;
  background: #2563eb;
}

.home-primary-btn {
  border: 1px solid rgba(167, 139, 250, 0.7);
  border-radius: 0.65rem;
  padding: 0.6rem 1.2rem;
  font-weight: 700;
  color: #ffffff;
  background: linear-gradient(135deg, rgba(126, 70, 255, 0.9), rgba(111, 66, 193, 0.85));
  transition: transform 160ms ease, box-shadow 160ms ease;
}

.home-primary-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 28px rgba(124, 58, 237, 0.35);
}

.home-secondary-btn {
  border: 1px solid rgba(154, 112, 252, 0.55);
  border-radius: 0.65rem;
  padding: 0.6rem 1.2rem;
  font-weight: 700;
  color: #e9ddff;
  background: rgba(30, 24, 52, 0.52);
  transition: background-color 160ms ease;
}

.home-secondary-btn:hover {
  background: rgba(69, 52, 124, 0.45);
}

.section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.section-title {
  font-size: 1.85rem;
  line-height: 1.15;
  font-weight: 800;
  color: #f5f7ff;
}

.section-tagline {
  margin-top: 0.25rem;
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

@media (max-width: 768px) {
  .section-title {
    font-size: 1.45rem;
  }

  .section-tagline {
    font-size: 0.9rem;
  }
}
</style>