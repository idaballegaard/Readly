<script setup lang="ts">
interface BookCardData {
  _id: string
  title: string
  author?: string
  imageUrl: string
  rating?: number
}

withDefaults(
  defineProps<{
    book: BookCardData
    showFavorite?: boolean
    favoriteActive?: boolean
    favoriteDisabled?: boolean
  }>(),
  {
    showFavorite: false,
    favoriteActive: false,
    favoriteDisabled: false
  }
)

const emit = defineEmits<{
  select: []
  toggleFavorite: []
}>()
</script>

<template>
  <div
    :data-testid="`book-card-${book._id}`"
    class="cursor-pointer group"
    @click="emit('select')"
  >
    <div class="relative bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition duration-300">
      <button
        v-if="showFavorite"
        :data-testid="`favorite-toggle-${book._id}`"
        :aria-label="favoriteActive ? `Remove ${book.title} from favorites` : `Add ${book.title} to favorites`"
        class="absolute top-2 right-2 text-xl z-10 disabled:opacity-60"
        :disabled="favoriteDisabled"
        @click.stop="emit('toggleFavorite')"
      >
        <span v-if="favoriteActive">❤️</span>
        <span v-else>🤍</span>
      </button>

      <div class="overflow-hidden">
        <img
          :src="book.imageUrl"
          :alt="book.title"
          class="w-full h-64 object-cover group-hover:scale-105 transition duration-300"
        />
      </div>

      <div class="p-3">
        <h3 class="truncate text-sm font-semibold group-hover:text-purple-400 transition">
          {{ book.title }}
        </h3>

        <p class="text-xs text-gray-400">
          {{ book.author }}
        </p>

        <p class="text-purple-400 text-sm mt-1">
          ⭐ {{ book.rating }}
        </p>
      </div>
    </div>
  </div>
</template>