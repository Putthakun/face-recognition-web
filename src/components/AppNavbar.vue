<template>
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
      <button class="btn-logout" @click="handleLogout" title="Sign out">
        <i class="ti ti-logout"></i>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const auth   = useAuthStore()
const { show } = useToast()

function handleLogout() {
  auth.logout()
  show('You have been signed out', 'info')
  router.push('/login')
}
</script>

<style scoped>
.navbar { background: #fff; border-bottom: 1px solid #E5E7EB; padding: 0 20px; display: flex; align-items: center; justify-content: space-between; height: 52px; flex-shrink: 0; }
.brand { font-size: 15px; font-weight: 600; color: #111827; display: flex; align-items: center; gap: 8px; }
.brand-dot { width: 8px; height: 8px; border-radius: 50%; background: #2563EB; }
.nav-tabs { display: flex; gap: 2px; }
.tab { font-size: 13px; padding: 6px 14px; border-radius: 8px; color: #6B7280; text-decoration: none; display: flex; align-items: center; gap: 6px; }
.tab.active { background: #EFF6FF; color: #1D4ED8; font-weight: 500; }
.user-info { display: flex; align-items: center; gap: 10px; font-size: 13px; color: #6B7280; }
.avatar-sm { width: 30px; height: 30px; border-radius: 50%; background: #DBEAFE; color: #1D4ED8; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; }
.btn-logout { background: none; border: 1px solid #E5E7EB; border-radius: 7px; width: 30px; height: 30px; cursor: pointer; color: #6B7280; font-size: 15px; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
.btn-logout:hover { background: #FEF2F2; border-color: #FECACA; color: #EF4444; }
</style>
