<script setup>
import { onMounted, ref } from 'vue'
import { useWeatherStore } from '../stores/weather'

const store = useWeatherStore()
const searchInput = ref('')

// Fetch default city weather when page loads
onMounted(() => {
  store.fetchWeather('Port Harcourt')
})

const handleSearch = () => {
  if (searchInput.value.trim()) {
    store.fetchWeather(searchInput.value)
    searchInput.value = ''
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    
    <!-- Title / Branding -->
    <div class="text-center mb-8">
      <h1 class="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
        Cloud Weather Dashboard
      </h1>
      <p class="text-slate-400 text-sm mt-1">Vue 3 + Pinia Serverless SPA</p>
    </div>

    <!-- Search Bar -->
    <div class="mb-8">
      <form @submit.prevent="handleSearch" class="flex gap-2 max-w-md mx-auto">
        <input 
          v-model="searchInput"
          type="text" 
          placeholder="Search for a city..." 
          class="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
        />
        <button 
          type="submit" 
          class="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition"
        >
          Search
        </button>
      </form>
    </div>

    <!-- Error State -->
    <div v-if="store.error" class="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-xl text-center mb-8">
      {{ store.error }}
    </div>

    <!-- Loading State -->
    <div v-if="store.loading" class="text-center text-blue-400 font-semibold mb-8 animate-pulse">
      Loading cloud data...
    </div>

    <!-- Weather Dashboard Content -->
    <div v-else-if="store.current">
      
      <!-- Current Weather Card -->
      <div class="bg-slate-800/50 backdrop-blur-md border border-slate-700 p-8 rounded-3xl shadow-2xl mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <span class="text-xs font-bold tracking-widest text-blue-400 uppercase">CURRENTLY IN</span>
          <h2 class="text-4xl font-black text-white mt-1">{{ store.city }}</h2>
          <p class="text-slate-400 mt-2">Wind speed: {{ store.current.windspeed }} km/h</p>
        </div>
        <div class="text-center md:text-right">
          <div class="text-7xl font-light">
            {{ store.getWeatherEmoji(store.current.weathercode) }}
            <span class="font-black">{{ Math.round(store.current.temperature) }}°C</span>
          </div>
        </div>
      </div>

      <!-- 5-Day Forecast Grid -->
      <h3 class="text-lg font-bold text-slate-300 mb-4 px-2">5-Day Forecast</h3>
      <div class="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div 
          v-for="day in store.forecast" 
          :key="day.date" 
          class="bg-slate-800/30 border border-slate-800 rounded-2xl p-4 text-center hover:border-slate-700 transition"
        >
          <p class="text-xs font-semibold text-slate-400 uppercase">
            {{ new Date(day.date).toLocaleDateString('en', { weekday: 'short' }) }}
          </p>
          <div class="text-3xl my-2">
            {{ store.getWeatherEmoji(day.code) }}
          </div>
          <div class="flex justify-center gap-2 text-sm">
            <span class="font-bold text-white">{{ Math.round(day.max) }}°</span>
            <span class="text-slate-500">{{ Math.round(day.min) }}°</span>
          </div>
        </div>
      </div>

    </div>

  </div>
</template>