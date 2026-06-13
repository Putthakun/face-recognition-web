import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getTransactions, type Transaction } from '@/services/streamApi'

export const useRecognitionStore = defineStore('recognition', () => {
  const transactions = ref<Transaction[]>([])
  const isLoading    = ref<boolean>(false)

  // Count only today's transactions
  const todayCount = computed(() => {
    const today = new Date().toDateString()
    return transactions.value.filter(t => new Date(t.createdAt).toDateString() === today).length
  })

  async function fetchTransactions(): Promise<void> {
    isLoading.value = true
    try {
      const fresh = await getTransactions()
      // Prepend new items so latest is always on top
      transactions.value = fresh
    } finally {
      isLoading.value = false
    }
  }

  let pollInterval: ReturnType<typeof setInterval> | null = null

  function startPolling(intervalMs: number = 5000): void {
    fetchTransactions()
    pollInterval = setInterval(fetchTransactions, intervalMs)
  }

  function stopPolling(): void {
    if (pollInterval) {
      clearInterval(pollInterval)
      pollInterval = null
    }
  }

  return { transactions, isLoading, todayCount, startPolling, stopPolling }
})