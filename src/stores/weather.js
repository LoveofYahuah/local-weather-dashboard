import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useWeatherStore = defineStore('weather', () => {
  const current = ref(null)
  const forecast = ref([])
  const city = ref('Port Harcourt')
  const loading = ref(false)
  const error = ref(null)
  const searchResults = ref([]) // New state: stores list of suggested places

  // Action 1: Search for matches inside Nigeria
  async function searchCities(query) {
    loading.value = true
    error.value = null
    searchResults.value = []
    
    try {
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?country_code=NG&name=${encodeURIComponent(query)}&count=5&language=en&format=json`
      const geoResponse = await fetch(geoUrl)
      const geoData = await geoResponse.json()

      if (!geoData.results || geoData.results.length === 0) {
        throw new Error('No matching places found. Try another search.')
      }

      searchResults.value = geoData.results // Store the list of matches
    } catch (err) {
      error.value = err.message
      searchResults.value = []
    } finally {
      loading.value = false
    }
  }

  // Action 2: Fetch weather for a selected coordinate
  async function fetchWeatherByCoordinates(latitude, longitude, name) {
    loading.value = true
    error.value = null
    searchResults.value = [] // Clear search suggestions after selection
    city.value = name

    try {
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`
      const weatherResponse = await fetch(weatherUrl)
      const weatherData = await weatherResponse.json()

      current.value = weatherData.current_weather

      forecast.value = weatherData.daily.time.map((date, index) => ({
        date: date,
        max: weatherData.daily.temperature_2m_max[index],
        min: weatherData.daily.temperature_2m_min[index],
        code: weatherData.daily.weathercode[index]
      })).slice(1, 6)

    } catch (err) {
      error.value = err.message
      current.value = null
      forecast.value = []
    } finally {
      loading.value = false
    }
  }

  // Action 3: Initial loading (Port Harcourt)
  async function initDefaultCity(cityName = 'Port Harcourt') {
    loading.value = true
    try {
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?country_code=NG&name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`
      const geoResponse = await fetch(geoUrl)
      const geoData = await geoResponse.json()
      if (geoData.results && geoData.results.length > 0) {
        const firstResult = geoData.results[0]
        await fetchWeatherByCoordinates(firstResult.latitude, firstResult.longitude, firstResult.name)
      }
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  function getWeatherEmoji(code) {
    if (code === 0) return '☀️'
    if (code >= 1 && code <= 3) return '⛅'
    if (code >= 45 && code <= 48) return '🌫️'
    if (code >= 51 && code <= 67) return '🌧️'
    if (code >= 71 && code <= 77) return '❄️'
    if (code >= 80 && code <= 82) return '🌦️'
    if (code >= 95 && code <= 99) return '⛈️'
    return '❓'
  }

  return { current, forecast, city, loading, error, searchResults, searchCities, fetchWeatherByCoordinates, initDefaultCity, getWeatherEmoji }
})