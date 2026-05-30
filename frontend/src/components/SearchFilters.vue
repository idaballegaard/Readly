<script setup lang="ts">
defineProps<{
  searchTitle: string
  searchGenre: string
  sortBy: string
  availableGenres: string[]
  resultCount: number
}>()

const emit = defineEmits<{
  'update:searchTitle': [value: string]
  'update:searchGenre': [value: string]
  'update:sortBy': [value: string]
}>()
</script>

<template>
  <div class="search-filters">
    <div class="search-filters-grid">
      <div>
        <label class="filter-label">
          Search by Title
        </label>
        <input
          data-testid="search-title-input"
          :value="searchTitle"
          type="text"
          placeholder="Book title..."
          class="filter-control"
          @input="emit('update:searchTitle', ($event.target as HTMLInputElement).value)"
        />
      </div>

      <div>
        <label class="filter-label">
          Filter by Genre
        </label>
        <select
          data-testid="search-genre-select"
          :value="searchGenre"
          class="filter-control"
          @change="emit('update:searchGenre', ($event.target as HTMLSelectElement).value)"
        >
          <option value="">All Genres</option>
          <option
            v-for="genre in availableGenres"
            :key="genre"
            :value="genre"
          >
            {{ genre }}
          </option>
        </select>
      </div>

      <div>
        <label class="filter-label">
          Sort by
        </label>
        <select
          data-testid="sort-by-select"
          :value="sortBy"
          class="filter-control"
          @change="emit('update:sortBy', ($event.target as HTMLSelectElement).value)"
        >
          <option value="rating">Highest Rating</option>
          <option value="published">Newest Published</option>
        </select>
      </div>

      <div class="result-wrap">
        <div class="result-text" data-testid="result-count">
          {{ resultCount }} book{{ resultCount !== 1 ? 's' : '' }} found
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-filters {
  border: 1px solid rgba(120, 135, 190, 0.24);
  border-radius: 1rem;
  background: linear-gradient(145deg, rgba(8, 18, 40, 0.78), rgba(9, 12, 30, 0.84));
  box-shadow: 0 18px 48px rgba(5, 8, 22, 0.45);
  padding: 1.25rem;
}

.search-filters-grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 1rem;
}

.filter-label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 700;
  color: #cdd8ff;
}

.filter-control {
  width: 100%;
  border-radius: 0.55rem;
  border: 1px solid rgba(118, 128, 172, 0.34);
  background: rgba(12, 21, 43, 0.88);
  color: #eef2ff;
  padding: 0.55rem 0.7rem;
  outline: none;
}

.filter-control:focus {
  border-color: rgba(166, 122, 255, 0.85);
  box-shadow: 0 0 0 2px rgba(130, 85, 240, 0.28);
}

.filter-control option {
  background: #10182f;
  color: #f2f5ff;
}

.result-wrap {
  display: flex;
  align-items: flex-end;
}

.result-text {
  font-size: 0.875rem;
  color: #a6b0cf;
}

@media (min-width: 768px) {
  .search-filters-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>