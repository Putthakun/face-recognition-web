import { ref } from 'vue'

type ToastType = 'info' | 'success' | 'error' | 'warning'

interface Toast {
  id: number
  message: string
  type: ToastType
}

const toasts = ref<Toast[]>([])
let _id = 0

export function useToast() {
  function show(message: string, type: ToastType = 'info', duration = 4000) {
    const id = _id++
    toasts.value.push({ id, message, type })
    setTimeout(() => dismiss(id), duration)
  }

  function dismiss(id: number) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  return { toasts, show, dismiss }
}
