<template>
  <div class="tx-page">
    <AppNavbar />

    <!-- Topbar -->
    <div class="topbar">
      <div class="page-info">
        <h2 class="page-title">Transactions</h2>
        <span class="count-badge">{{ total }} total</span>
      </div>
    </div>

    <!-- Table -->
    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th class="th-sortable" @click="toggleSort">
              Time
              <span class="sort-icon">{{ sortDesc ? '↓' : '↑' }}</span>
            </th>
            <th>Employee</th>
            <th>Camera</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="4" class="empty-row">
              <span class="spinner-lg"></span>
            </td>
          </tr>
          <tr v-else-if="transactions.length === 0">
            <td colspan="4" class="empty-row">
              <i class="ti ti-list-x"></i>
              No transactions found
            </td>
          </tr>
          <tr v-for="tx in transactions" :key="tx.transactionId" class="tx-row">
            <td class="cell-time">
              <div class="time-main">{{ formatTime(tx.createdAt) }}</div>
              <div class="time-date">{{ formatDate(tx.createdAt) }}</div>
            </td>
            <td>
              <div class="emp-cell">
                <div class="emp-avatar" :style="avatarStyle(tx.empName)">
                  {{ initials(tx.empName) }}
                </div>
                <div>
                  <div class="emp-name">{{ tx.empName ?? 'Unknown' }}</div>
                  <div class="emp-id" v-if="tx.empId">ID: {{ tx.empId }}</div>
                </div>
              </div>
            </td>
            <td>
              <div class="camera-cell" v-if="tx.cameraLocation">
                <i class="ti ti-map-pin cam-icon"></i>
                <span>{{ tx.cameraLocation }}</span>
                <span class="cam-id">{{ formatCameraId(tx.cameraId) }}</span>
              </div>
              <span v-else class="text-muted">—</span>
            </td>
            <td>
              <span class="status-badge" :class="tx.empId ? 'status-known' : 'status-unknown'">
                {{ tx.empId ? 'Identified' : 'Unknown' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div class="pagination" v-if="totalPages > 1">
        <button class="btn-page" :disabled="page === 1" @click="changePage(page - 1)">
          <i class="ti ti-chevron-left"></i>
        </button>
        <span class="page-info-text">Page {{ page }} of {{ totalPages }}</span>
        <button class="btn-page" :disabled="page === totalPages" @click="changePage(page + 1)">
          <i class="ti ti-chevron-right"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AppNavbar from '@/components/AppNavbar.vue'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/composables/useToast'

interface Transaction {
  transactionId: number
  empId:         number | null
  empName:       string | null
  cameraId:      number | null
  cameraLocation: string | null
  createdAt:     string
}

const BASE_URL  = 'http://localhost:5081'
const auth      = useAuthStore()
const { show }  = useToast()

const transactions = ref<Transaction[]>([])
const total        = ref(0)
const page         = ref(1)
const pageSize     = 50
const loading      = ref(false)
const sortDesc     = ref(true)

const totalPages = computed(() => Math.ceil(total.value / pageSize))

function authHeader(): Record<string, string> {
  return auth.token ? { Authorization: `Bearer ${auth.token}` } : {}
}

async function fetchTransactions() {
  loading.value = true
  try {
    const res = await fetch(
      `${BASE_URL}/api/transactions?page=${page.value}&pageSize=${pageSize}&sortDesc=${sortDesc.value}`,
      { headers: authHeader() }
    )
    if (res.ok) {
      const data = await res.json()
      transactions.value = data.items
      total.value        = data.total
    } else {
      show(`Failed to load transactions (${res.status})`, 'error')
    }
  } catch {
    show('Cannot connect to server', 'error')
  } finally {
    loading.value = false
  }
}

function changePage(p: number) {
  page.value = p
  fetchTransactions()
}

function toggleSort() {
  sortDesc.value = !sortDesc.value
  page.value = 1
  fetchTransactions()
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(dt: string): string {
  return new Date(dt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function formatDate(dt: string): string {
  return new Date(dt).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatCameraId(id: number | null): string {
  return id != null ? `camera-${String(id).padStart(3, '0')}` : ''
}

const AVATAR_COLORS = [
  { bg: '#DBEAFE', color: '#1D4ED8' },
  { bg: '#D1FAE5', color: '#065F46' },
  { bg: '#EDE9FE', color: '#5B21B6' },
  { bg: '#FEE2E2', color: '#991B1B' },
  { bg: '#FEF3C7', color: '#92400E' },
]

function avatarStyle(name: string | null) {
  if (!name) return { background: '#F3F4F6', color: '#9CA3AF' }
  const c = AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]!
  return { background: c.bg, color: c.color }
}

function initials(name: string | null): string {
  if (!name) return '?'
  return name.split(' ').map(w => w[0] ?? '').slice(0, 2).join('').toUpperCase()
}

onMounted(fetchTransactions)
</script>

<style scoped>
.tx-page { display: flex; flex-direction: column; height: 100vh; background: #F9FAFB; }

.topbar { background: #fff; border-bottom: 1px solid #E5E7EB; padding: 14px 24px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; }
.page-info { display: flex; align-items: center; gap: 10px; }
.page-title { font-size: 17px; font-weight: 700; color: #111827; margin: 0; }
.count-badge { font-size: 12px; background: #F3F4F6; color: #6B7280; padding: 2px 10px; border-radius: 99px; }

.table-wrap { flex: 1; overflow-y: auto; padding: 20px 24px; display: flex; flex-direction: column; gap: 16px; }
.table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #E5E7EB; }
.table thead { background: #F9FAFB; }
.table th { text-align: left; font-size: 11px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em; padding: 11px 16px; border-bottom: 1px solid #E5E7EB; }
.th-sortable { cursor: pointer; user-select: none; }
.th-sortable:hover { color: #374151; }
.sort-icon { margin-left: 4px; font-style: normal; }
.table td { padding: 12px 16px; border-bottom: 1px solid #F3F4F6; font-size: 13px; color: #111827; vertical-align: middle; }
.tx-row:last-child td { border-bottom: none; }
.tx-row:hover td { background: #FAFAFA; }

.cell-time .time-main { font-weight: 500; font-variant-numeric: tabular-nums; }
.cell-time .time-date { font-size: 11px; color: #9CA3AF; margin-top: 1px; }

.emp-cell { display: flex; align-items: center; gap: 10px; }
.emp-avatar { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 600; flex-shrink: 0; }
.emp-name { font-weight: 500; }
.emp-id { font-size: 11px; color: #9CA3AF; margin-top: 1px; }

.camera-cell { display: flex; align-items: center; gap: 6px; }
.cam-icon { color: #9CA3AF; font-size: 13px; }
.cam-id { font-size: 11px; color: #9CA3AF; font-family: monospace; }
.text-muted { color: #D1D5DB; }

.status-badge { font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 99px; }
.status-known   { background: #D1FAE5; color: #065F46; }
.status-unknown { background: #FEF3C7; color: #92400E; }

.empty-row { text-align: center; color: #9CA3AF; padding: 48px 16px !important; }
.empty-row i { display: block; font-size: 28px; margin-bottom: 8px; }

.pagination { display: flex; align-items: center; justify-content: center; gap: 12px; padding: 8px 0; }
.btn-page { background: #fff; border: 1px solid #E5E7EB; border-radius: 8px; width: 32px; height: 32px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #374151; transition: all 0.15s; }
.btn-page:hover:not(:disabled) { background: #F3F4F6; }
.btn-page:disabled { opacity: 0.4; cursor: not-allowed; }
.page-info-text { font-size: 13px; color: #6B7280; }

.spinner-lg { width: 24px; height: 24px; border: 3px solid #E5E7EB; border-top-color: #2563EB; border-radius: 50%; animation: spin 0.6s linear infinite; display: inline-block; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
