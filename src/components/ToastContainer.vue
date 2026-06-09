<template>
  <Teleport to="body">
    <div class="toast-stack">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast"
          :class="`toast-${toast.type}`"
        >
          <i :class="iconMap[toast.type]" class="toast-icon"></i>
          <span class="toast-msg">{{ toast.message }}</span>
          <button class="toast-close" @click="dismiss(toast.id)">
            <i class="ti ti-x"></i>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useToast } from '@/composables/useToast'

const { toasts, dismiss } = useToast()

const iconMap = {
  info:    'ti ti-info-circle',
  success: 'ti ti-circle-check',
  error:   'ti ti-alert-circle',
  warning: 'ti ti-alert-triangle',
}
</script>

<style scoped>
.toast-stack {
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 9999;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  min-width: 280px;
  max-width: 360px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  pointer-events: all;
  border: 1px solid transparent;
}

.toast-info    { background: #EFF6FF; color: #1D4ED8; border-color: #BFDBFE; }
.toast-success { background: #F0FDF4; color: #15803D; border-color: #BBF7D0; }
.toast-error   { background: #FEF2F2; color: #991B1B; border-color: #FECACA; }
.toast-warning { background: #FFFBEB; color: #92400E; border-color: #FDE68A; }

.toast-icon { font-size: 16px; flex-shrink: 0; }
.toast-msg  { flex: 1; line-height: 1.4; }

.toast-close {
  background: none;
  border: none;
  cursor: pointer;
  color: inherit;
  opacity: 0.5;
  padding: 0;
  font-size: 14px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}
.toast-close:hover { opacity: 1; }

.toast-enter-active { transition: all 0.25s ease; }
.toast-leave-active { transition: all 0.2s ease; }
.toast-enter-from   { opacity: 0; transform: translateX(20px); }
.toast-leave-to     { opacity: 0; transform: translateX(20px); }
</style>
