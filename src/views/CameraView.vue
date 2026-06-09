<template>
  <div class="camera-page">

    <!-- Navbar -->
    <nav class="navbar">
      <div class="brand">
        <span class="brand-dot"></span>
        Face recognition attendace system
      </div>
      <div class="nav-tabs">
        <router-link to="/camera"       class="tab" active-class="active"><i class="ti ti-camera"></i> Camera</router-link>
        <router-link to="/transactions" class="tab" active-class="active"><i class="ti ti-list"></i> Transactions</router-link>
        <router-link to="/employee"     class="tab" active-class="active"><i class="ti ti-users"></i> Employee</router-link>
        <router-link to="/monitor"      class="tab" active-class="active"><i class="ti ti-activity"></i> Monitor</router-link>
      </div>
      <div class="user-info">
        <div class="avatar-sm">PK</div>
        <span>Putthakun</span>
      </div>
    </nav>

    <!-- Subbar -->
    <div class="subbar">
      <div class="datetime">
        <span class="date-label">{{ currentDate }}</span>
        <span class="time-label">{{ currentTime }}</span>
      </div>
      <div class="cam-selector">
        <span class="live-dot"></span>
        <i class="ti ti-video"></i>
        MOON — Camera 01
        <i class="ti ti-chevron-down"></i>
      </div>
    </div>

    <!-- Content -->
    <div class="content">

      <!-- Stream -->
      <div class="stream-wrap">
        <div class="stream-box">
          <img :src="STREAM_URL" alt="Live stream" class="stream-img" />
          <div class="stream-hud">
            <div class="hud-badge"><span class="live-dot"></span> Live</div>
          </div>
        </div>
      </div>

      <!-- Transaction panel -->
      <div class="side-panel">
        <div class="panel-header">
          <div class="panel-title">
            <span class="pulse"></span>
            Transactions
          </div>
          <div class="panel-count">{{ transactions.length }} today</div>
        </div>

        <div class="tx-list">
          <div
            v-for="(tx, index) in transactions"
            :key="tx.id ?? index"
            class="tx-item"
          >
            <div class="tx-avatar" :style="avatarStyle(tx.name)">
              {{ initials(tx.name) }}
            </div>
            <div class="tx-body">
              <div class="tx-name">{{ tx.name }}</div>
              <div class="tx-meta">
                <span>ID: {{ tx.id ?? '—' }}</span>
                <span>Location: {{ tx.location }}</span>
              </div>
            </div>
            <div class="tx-right">
              <div class="conf-pill" :class="tx.confidence >= 0.7 ? 'conf-high' : 'conf-low'">
                {{ Math.round(tx.confidence * 100) }}%
              </div>
              <div v-if="index === 0" class="new-pill">new</div>
              <div class="tx-time">{{ formatTime(tx.timestamp) }}</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
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

onMounted(() => {
  store.startPolling(3000)
  clockTimer = setInterval(() => { now.value = new Date() }, 1000)
})

onUnmounted(() => {
  store.stopPolling()
  if (clockTimer) clearInterval(clockTimer)
})

interface AvatarStyle {
  bg: string
  color: string
}

const AVATAR_COLORS: AvatarStyle[] = [
  { bg: '#E1F5EE', color: '#085041' },
  { bg: '#EEEDFE', color: '#3C3489' },
  { bg: '#FBEAF0', color: '#72243E' },
  { bg: '#FAEEDA', color: '#633806' },
  { bg: '#E6F1FB', color: '#0C447C' },
]

function avatarStyle(name: string): { background: string; color: string } {
  if (!name || name === 'Unknown') return { background: '#F1EFE8', color: '#5F5E5A' }
  const i = name.charCodeAt(0) % AVATAR_COLORS.length
  const c = AVATAR_COLORS[i]
  if (!c) return { background: '#F1EFE8', color: '#5F5E5A' }
  return { background: c.bg, color: c.color }
}

function initials(name: string): string {
  if (!name || name === 'Unknown') return '?'
  return name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
}

function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}
</script>

<style scoped>
.camera-page { display: flex; flex-direction: column; height: 100vh; font-family: var(--vt-font-family-base, sans-serif); }

.navbar { background: #fff; border-bottom: 1px solid #E5E7EB; padding: 0 20px; display: flex; align-items: center; justify-content: space-between; height: 52px; flex-shrink: 0; }
.brand { font-size: 15px; font-weight: 600; color: #111827; display: flex; align-items: center; gap: 8px; }
.brand-dot { width: 8px; height: 8px; border-radius: 50%; background: #2563EB; }
.nav-tabs { display: flex; gap: 2px; }
.tab { font-size: 13px; padding: 6px 14px; border-radius: 8px; color: #6B7280; text-decoration: none; display: flex; align-items: center; gap: 6px; }
.tab.active { background: #EFF6FF; color: #1D4ED8; font-weight: 500; }
.user-info { display: flex; align-items: center; gap: 10px; font-size: 13px; color: #6B7280; }
.avatar-sm { width: 30px; height: 30px; border-radius: 50%; background: #DBEAFE; color: #1D4ED8; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; }

.subbar { background: #fff; border-bottom: 1px solid #E5E7EB; padding: 10px 20px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; }
.datetime { display: flex; align-items: baseline; gap: 10px; }
.date-label { font-size: 12px; color: #9CA3AF; }
.time-label { font-size: 20px; font-weight: 600; color: #111827; font-variant-numeric: tabular-nums; }
.cam-selector { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #4B5563; background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 6px 12px; cursor: pointer; }
.live-dot { width: 6px; height: 6px; border-radius: 50%; background: #EF4444; display: inline-block; }

.content { display: grid; grid-template-columns: 1fr 280px; flex: 1; overflow: hidden; }

.stream-wrap { padding: 16px; height: 100%; box-sizing: border-box; display: flex; }
.stream-box { background: #111; border-radius: 12px; overflow: hidden; position: relative; flex: 1; }
.stream-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.stream-hud { position: absolute; bottom: 10px; left: 12px; right: 12px; display: flex; justify-content: space-between; }
.hud-badge { background: rgba(0,0,0,0.55); color: #ccc; font-size: 11px; padding: 3px 8px; border-radius: 6px; display: flex; align-items: center; gap: 5px; }

.side-panel { border-left: 1px solid #E5E7EB; background: #fff; display: flex; flex-direction: column; overflow: hidden; }
.panel-header { padding: 14px 16px 10px; border-bottom: 1px solid #E5E7EB; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; }
.panel-title { font-size: 13px; font-weight: 600; color: #111827; display: flex; align-items: center; gap: 6px; }
.pulse { width: 6px; height: 6px; border-radius: 50%; background: #10B981; display: inline-block; }
.panel-count { font-size: 11px; color: #6B7280; background: #F3F4F6; padding: 2px 8px; border-radius: 99px; }

.tx-list { flex: 1; overflow-y: auto; }
.tx-item { padding: 11px 16px; border-bottom: 1px solid #F3F4F6; display: flex; gap: 10px; align-items: flex-start; }
.tx-item:last-child { border-bottom: none; }
.tx-avatar { width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; flex-shrink: 0; }
.tx-body { flex: 1; min-width: 0; }
.tx-name { font-size: 13px; font-weight: 500; color: #111827; }
.tx-meta { font-size: 11px; color: #9CA3AF; margin-top: 2px; display: flex; flex-direction: column; gap: 1px; }
.tx-right { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; flex-shrink: 0; }
.conf-pill { font-size: 11px; font-weight: 600; padding: 2px 7px; border-radius: 99px; }
.conf-high { background: #D1FAE5; color: #065F46; }
.conf-low  { background: #FEE2E2; color: #991B1B; }
.new-pill { font-size: 10px; background: #DBEAFE; color: #1E40AF; padding: 1px 6px; border-radius: 99px; }
.tx-time { font-size: 10px; color: #D1D5DB; }
</style>
