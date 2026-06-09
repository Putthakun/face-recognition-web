const BASE_URL = 'http://127.0.0.1:8000'

export const STREAM_URL = `${BASE_URL}/stream`

export interface Transaction {
  id: string | null
  name: string
  location: string
  confidence: number
  timestamp: Date
}

export const getTransactions = async (): Promise<Transaction[]> => {
  // TODO: replace with real endpoint when ready
  // const res = await axios.get<Transaction[]>(`${BASE_URL}/transactions`)
  // return res.data

  return [
    { id: '2024120', name: 'Supharoke', location: 'MOON', confidence: 0.97, timestamp: new Date(Date.now() - 1000 * 60 * 0) },
    { id: '2024123', name: 'Nattawut',  location: 'MOON', confidence: 0.91, timestamp: new Date(Date.now() - 1000 * 60 * 2) },
    { id: null,      name: 'Unknown',   location: 'MOON', confidence: 0.38, timestamp: new Date(Date.now() - 1000 * 60 * 5) },
    { id: '2024118', name: 'Malee W.',  location: 'MOON', confidence: 0.88, timestamp: new Date(Date.now() - 1000 * 60 * 8) },
    { id: '2024115', name: 'Anan T.',   location: 'MOON', confidence: 0.95, timestamp: new Date(Date.now() - 1000 * 60 * 12) },
  ]
}