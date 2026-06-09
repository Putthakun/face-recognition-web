import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getTransactions, type Transaction } from '@/services/streamApi'

export const useRecognitionStore = defineStore('recognition', () => {
  const transactions = ref<Transaction[]>([])
  const isLoading = ref<boolean>(false)

  async function fetchTransactions(): Promise<void> {
    isLoading.value = true
    try {
      transactions.value = await getTransactions()
    } finally {
      isLoading.value = false
    }
  }

  let pollInterval: ReturnType<typeof setInterval> | null = null

  function startPolling(intervalMs: number = 3000): void {
    fetchTransactions()
    pollInterval = setInterval(fetchTransactions, intervalMs)
  }

  function stopPolling(): void {
    if (pollInterval) {
      clearInterval(pollInterval)
      pollInterval = null
    }
  }

  return { transactions, isLoading, startPolling, stopPolling }
})