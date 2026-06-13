const STREAM_BASE = 'http://127.0.0.1:8000'
const API_BASE    = 'http://localhost:5081'

export const STREAM_URL = `${STREAM_BASE}/stream`

export interface Transaction {
  transactionId: number
  empId:         number | null
  empName:       string | null
  cameraId:      number | null
  cameraLocation: string | null
  createdAt:     string
}

interface ApiResponse {
  total:    number
  page:     number
  pageSize: number
  items:    Transaction[]
}

export const getTransactions = async (): Promise<Transaction[]> => {
  const token = localStorage.getItem('token')
  const headers: Record<string, string> = token
    ? { Authorization: `Bearer ${token}` }
    : {}

  const res = await fetch(`${API_BASE}/api/transactions?page=1&pageSize=20&sortDesc=true`, { headers })
  if (!res.ok) return []

  const data: ApiResponse = await res.json()
  return data.items
}