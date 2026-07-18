import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useWeatherStore = defineStore('weather', () => {
  // State (Our reactive data)
  const current = ref(null)
  const forecast = ref([])
  const city = ref('Port Harcourt')
  const loading = ref(false)
  const error = ref(null)

  // Actions (Functions that call our Cloud APIs)
  async function fetchWeather(searchCity = 'Port Harcourt') {
    loading.value = true
    error.value = null
    
    try {
      // Step 1: Call Geocoding Cloud API to translate "City Name" to Lat/Lon coordinates
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchCity)}&count=1&language=en&format=json`
      const geoResponse = await fetch(geoUrl)
      const geoData = await geoResponse.json()

      if (!geoData.results || geoData.results.length === 0) {
        throw new Error('City not found. Please try another city.')
      }

      const location = geoData.results[0]
      city.value = location.name

      // Step 2: Call Weather Cloud API using coordinates
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`
      const weatherResponse = await fetch(weatherUrl)
      const weatherData = await weatherResponse.json()

      // Step 3: Store current weather data
      current.value = weatherData.current_weather

      // Step 4: Store next 5 days of forecast (excluding today)
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

  // Helper function to turn Open-Meteo codes into simple Emojis
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

  return { current, forecast, city, loading, error, fetchWeather, getWeatherEmoji }
})