<template>
  <div class="camera-page">
    <AppNavbar />

    <!-- Subbar -->
    <div class="subbar">
      <div class="datetime">
        <span class="date-label">{{ currentDate }}</span>
        <span class="time-label">{{ currentTime }}</span>
      </div>
      <div class="cam-selector">
        <span class="live-dot red"></span>
        <i class="ti ti-video"></i>
        MOON — Camera 01
        <i class="ti ti-chevron-down"></i>
      </div>
    </div>

    <!-- Content -->
    <div class="content">

      <!-- Left: stream + stats -->
      <div class="main-col">
        <div class="stream-box">
          <img :src="STREAM_URL" alt="Live stream" class="stream-img" />
          <div class="stream-overlay-tl">
            <span class="hud-badge"><span class="live-dot red blink"></span> Live</span>
          </div>
          <div class="stream-overlay-br">
            <span class="hud-badge">{{ currentTime }}</span>
          </div>
        </div>

        <!-- Stats row below stream -->
        <div class="stats-row">
          <div class="stat-card">
            <div class="stat-value">{{ store.todayCount }}</div>
            <div class="stat-label">Today</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ identifiedCount }}</div>
            <div class="stat-label">Identified</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ unknownCount }}</div>
            <div class="stat-label">Unknown</div>
          </div>
        </div>
      </div>

      <!-- Right: transaction sidebar -->
      <div class="side-panel">
        <div class="panel-header">
          <div class="panel-title">
            <span class="pulse"></span>
            Recent Activity
          </div>
          <div class="panel-count">{{ store.todayCount }} today</div>
        </div>

        <div class="tx-list">
          <div v-if="store.isLoading && transactions.length === 0" class="tx-empty">
            <span class="spinner"></span>
          </div>
          <div v-else-if="transactions.length === 0" class="tx-empty">
            <i class="ti ti-clock"></i>
            <span>No activity yet</span>
          </div>
          <div
            v-for="(tx, index) in transactions"
            :key="tx.transactionId"
            class="tx-item"
            :class="{ 'tx-new': index === 0 }"
          >
            <div class="tx-avatar" :style="avatarStyle(tx.empName)">
              {{ initials(tx.empName) }}
            </div>
            <div class="tx-body">
              <div class="tx-name">{{ tx.empName ?? 'Unknown' }}</div>
              <div class="tx-time-inline">{{ formatTime(tx.createdAt) }}</div>
            </div>
            <div class="tx-right">
              <span class="status-pill" :class="tx.empId ? 'pill-ok' : 'pill-unknown'">
                {{ tx.empId ? 'Match' : 'Unknown' }}
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import AppNavbar from '@/components/AppNavbar.vue'
import { STREAM_URL } from '@/services/streamApi'
import { useRecognitionStore } from '@/stores/recognitionStore'
import { storeToRefs } from 'pinia'

const store = useRecognitionStore()
const { transactions } = storeToRefs(store)

const now = ref<Date>(new Date())
let clockTimer: ReturnType<typeof setInterval> | null = null

const currentDate = computed<string>(() =>
  now.value.toLocaleDateString('th-TH', { year: 'numeric', month: '2-digit', day: '2-digit' })
)
const currentTime = computed<string>(() =>
  now.value.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
)

const identifiedCount = computed(() => transactions.value.filter(t => t.empId).length)
const unknownCount    = computed(() => transactions.value.filter(t => !t.empId).length)

onMounted(() => {
  store.startPolling(5000)
  clockTimer = setInterval(() => { now.value = new Date() }, 1000)
})
onUnmounted(() => {
  store.stopPolling()
  if (clockTimer) clearInterval(clockTimer)
})

const AVATAR_COLORS = [
  { bg: '#DBEAFE', color: '#1D4ED8' },
  { bg: '#D1FAE5', color: '#065F46' },
  { bg: '#EDE9FE', color: '#5B21B6' },
  { bg: '#FEE2E2', color: '#991B1B' },
  { bg: '#FEF3C7', color: '#92400E' },
]

function avatarStyle(name: string | null): { background: string; color: string } {
  if (!name) return { background: '#F3F4F6', color: '#9CA3AF' }
  const c = AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]!
  return { background: c.bg, color: c.color }
}
function initials(name: string | null): string {
  if (!name) return '?'
  return name.split(' ').map((w: string) => w[0] ?? '').slice(0, 2).join('').toUpperCase()
}
function formatTime(dt: string): string {
  return new Date(dt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}
</script>

<style scoped>
/* ── Page shell ─────────────────────────────────────────────────────────── */
.camera-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background: #F1F5F9;
}

/* ── Subbar ──────────────────────────────────────────────────────────────── */
.subbar {
  background: #fff;
  border-bottom: 1px solid #E5E7EB;
  padding: 8px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}
.datetime { display: flex; align-items: baseline; gap: 10px; }
.date-label { font-size: 12px; color: #9CA3AF; }
.time-label { font-size: 18px; font-weight: 600; color: #111827; font-variant-numeric: tabular-nums; }
.cam-selector {
  display: flex; align-items: center; gap: 7px;
  font-size: 13px; color: #4B5563;
  background: #F9FAFB; border: 1px solid #E5E7EB;
  border-radius: 8px; padding: 5px 12px; cursor: pointer;
}

/* ── Content grid ────────────────────────────────────────────────────────── */
.content {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 0;
  overflow: hidden;
  min-height: 0;
}

/* ── Left column ─────────────────────────────────────────────────────────── */
.main-col {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  overflow: hidden;
  min-height: 0;
}

.stream-box {
  position: relative;
  background: #0F172A;
  border-radius: 14px;
  overflow: hidden;
  /* 16:9 but capped so it doesn't overflow */
  flex: 1;
  min-height: 0;
  max-height: calc(100vh - 200px);
}
.stream-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}
.stream-overlay-tl {
  position: absolute; top: 10px; left: 12px;
}
.stream-overlay-br {
  position: absolute; bottom: 10px; right: 12px;
}
.hud-badge {
  background: rgba(0,0,0,0.6);
  color: #E2E8F0;
  font-size: 11px;
  padding: 3px 9px;
  border-radius: 6px;
  display: flex; align-items: center; gap: 5px;
  backdrop-filter: blur(4px);
}

/* ── Stats row ───────────────────────────────────────────────────────────── */
.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  flex-shrink: 0;
}
.stat-card {
  background: #fff;
  border-radius: 10px;
  padding: 10px 14px;
  border: 1px solid #E5E7EB;
  text-align: center;
}
.stat-value { font-size: 22px; font-weight: 700; color: #111827; line-height: 1; }
.stat-label { font-size: 11px; color: #9CA3AF; margin-top: 3px; text-transform: uppercase; letter-spacing: 0.04em; }

/* ── Sidebar ─────────────────────────────────────────────────────────────── */
.side-panel {
  border-left: 1px solid #E5E7EB;
  background: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}
.panel-header {
  padding: 14px 16px 12px;
  border-bottom: 1px solid #E5E7EB;
  display: flex; align-items: center; justify-content: space-between;
  flex-shrink: 0;
}
.panel-title { font-size: 13px; font-weight: 600; color: #111827; display: flex; align-items: center; gap: 7px; }
.pulse {
  width: 7px; height: 7px; border-radius: 50%; background: #10B981;
  box-shadow: 0 0 0 0 rgba(16,185,129,0.4);
  animation: pulse-ring 2s ease-out infinite;
  display: inline-block;
}
@keyframes pulse-ring {
  0%   { box-shadow: 0 0 0 0 rgba(16,185,129,0.4); }
  70%  { box-shadow: 0 0 0 6px rgba(16,185,129,0); }
  100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }
}
.panel-count { font-size: 11px; color: #6B7280; background: #F3F4F6; padding: 2px 9px; border-radius: 99px; }

/* ── Transaction list ────────────────────────────────────────────────────── */
.tx-list { flex: 1; overflow-y: auto; min-height: 0; }
.tx-list::-webkit-scrollbar { width: 3px; }
.tx-list::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 99px; }

.tx-item {
  padding: 10px 14px;
  border-bottom: 1px solid #F9FAFB;
  display: flex; gap: 10px; align-items: center;
  transition: background 0.15s;
}
.tx-item:hover { background: #FAFAFA; }
.tx-item:last-child { border-bottom: none; }

.tx-avatar {
  width: 32px; height: 32px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; flex-shrink: 0;
}
.tx-body { flex: 1; min-width: 0; }
.tx-name { font-size: 13px; font-weight: 500; color: #111827; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tx-time-inline { font-size: 11px; color: #9CA3AF; margin-top: 1px; }

.tx-right { flex-shrink: 0; }
.status-pill {
  font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 99px;
}
.pill-ok      { background: #D1FAE5; color: #065F46; }
.pill-unknown { background: #FEF3C7; color: #92400E; }

.tx-new { animation: flash 0.8s ease; }
@keyframes flash { 0%,100% { background: transparent; } 40% { background: #EFF6FF; } }

.tx-empty {
  padding: 40px 16px; text-align: center;
  color: #9CA3AF; font-size: 12px;
  display: flex; flex-direction: column; align-items: center; gap: 8px;
}
.tx-empty i { font-size: 24px; color: #D1D5DB; }

/* ── Shared dots ─────────────────────────────────────────────────────────── */
.live-dot { width: 6px; height: 6px; border-radius: 50%; display: inline-block; flex-shrink: 0; }
.red { background: #EF4444; }
.blink { animation: blink 1.2s ease-in-out infinite; }
@keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0.3; } }

/* ── Spinner ─────────────────────────────────────────────────────────────── */
.spinner {
  width: 20px; height: 20px;
  border: 2px solid #E5E7EB; border-top-color: #2563EB;
  border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
