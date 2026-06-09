import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))

  const isLoggedIn = computed(() => !!token.value)

  function setToken(jwt: string) {
    token.value = jwt
    localStorage.setItem('token', jwt)
  }

  function logout() {
    token.value = null
    localStorage.removeItem('token')
  }

  return { token, isLoggedIn, setToken, logout }
})
