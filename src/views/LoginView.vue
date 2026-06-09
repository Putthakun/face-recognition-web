<template>
  <div class="login-page">
    <div class="login-card">

      <div class="card-head">
        <h1 class="title">Sign in</h1>
        <p class="subtitle">Face Recognition Attendance System</p>
      </div>

      <form class="form" @submit.prevent="handleLogin">
        <div class="field">
          <label class="label" for="employeeId">Employee ID</label>
          <div class="input-wrap" :class="{ focused: focusedField === 'employeeId', error: errors.employeeId }">
            <i class="ti ti-id-badge input-icon"></i>
            <input
              id="employeeId"
              v-model="form.employeeId"
              type="text"
              class="input"
              placeholder="Enter your employee ID"
              autocomplete="username"
              @focus="focusedField = 'employeeId'"
              @blur="focusedField = null"
            />
          </div>
          <span v-if="errors.employeeId" class="error-msg">{{ errors.employeeId }}</span>
        </div>

        <div class="field">
          <label class="label" for="password">Password</label>
          <div class="input-wrap" :class="{ focused: focusedField === 'password', error: errors.password }">
            <i class="ti ti-lock input-icon"></i>
            <input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              class="input"
              placeholder="Enter your password"
              autocomplete="current-password"
              @focus="focusedField = 'password'"
              @blur="focusedField = null"
            />
            <button type="button" class="eye-btn" @click="showPassword = !showPassword" tabindex="-1">
              <i :class="showPassword ? 'ti ti-eye-off' : 'ti ti-eye'"></i>
            </button>
          </div>
          <span v-if="errors.password" class="error-msg">{{ errors.password }}</span>
        </div>

        <div v-if="loginError" class="alert-error">
          <i class="ti ti-alert-circle"></i>
          {{ loginError }}
        </div>

        <button type="submit" class="btn-login" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          <span v-else><i class="ti ti-login"></i> Sign in</span>
        </button>
      </form>

      <p class="footer-text">Face Recognition Attendance &copy; {{ year }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const route  = useRoute()
const auth   = useAuthStore()

const form = ref({ employeeId: '', password: '' })
const errors = ref({ employeeId: '', password: '' })
const loginError = ref('')
const loading = ref(false)
const showPassword = ref(false)
const focusedField = ref<string | null>(null)

const year = computed(() => new Date().getFullYear())

function validate(): boolean {
  errors.value = { employeeId: '', password: '' }
  let ok = true
  if (!form.value.employeeId.trim()) {
    errors.value.employeeId = 'Please enter your employee ID'
    ok = false
  }
  if (!form.value.password) {
    errors.value.password = 'Please enter your password'
    ok = false
  }
  return ok
}

async function handleLogin() {
  if (!validate()) return

  loading.value = true
  loginError.value = ''

  try {
    const res = await fetch('http://localhost:5081/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        EmpId: form.value.employeeId,
        Password: form.value.password,
      }),
    })

    if (res.ok) {
      const data = await res.json()
      auth.setToken(data.token)
      const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/camera'
      router.push(redirect)
    } else if (res.status === 401) {
      loginError.value = 'Invalid employee ID or password'
    } else {
      loginError.value = `Server error (${res.status})`
    }
  } catch {
    loginError.value = 'Cannot connect to server. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: #F8FAFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--vt-font-family-base, sans-serif);
}

.login-card {
  background: #fff;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  padding: 40px 36px 32px;
  width: 100%;
  max-width: 380px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 28px;
}
.brand-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #2563EB;
}
.brand-name {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.card-head {
  margin-bottom: 28px;
}
.title {
  font-size: 22px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 4px;
}
.subtitle {
  font-size: 13px;
  color: #6B7280;
  margin: 0;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

.input-wrap {
  display: flex;
  align-items: center;
  border: 1.5px solid #E5E7EB;
  border-radius: 10px;
  background: #F9FAFB;
  transition: border-color 0.15s, box-shadow 0.15s;
  overflow: hidden;
}
.input-wrap.focused {
  border-color: #2563EB;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  background: #fff;
}
.input-wrap.error {
  border-color: #EF4444;
}

.input-icon {
  color: #9CA3AF;
  font-size: 15px;
  padding: 0 10px 0 14px;
  flex-shrink: 0;
}
.input-wrap.focused .input-icon {
  color: #2563EB;
}

.input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
  color: #111827;
  padding: 10px 12px 10px 0;
  min-width: 0;
}
.input::placeholder {
  color: #D1D5DB;
}

.eye-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #9CA3AF;
  padding: 0 12px;
  font-size: 15px;
  display: flex;
  align-items: center;
}
.eye-btn:hover {
  color: #6B7280;
}

.error-msg {
  font-size: 12px;
  color: #EF4444;
}

.alert-error {
  background: #FEF2F2;
  border: 1px solid #FECACA;
  border-radius: 8px;
  color: #991B1B;
  font-size: 13px;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-login {
  background: #2563EB;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 11px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 4px;
  transition: background 0.15s;
}
.btn-login:hover:not(:disabled) {
  background: #1D4ED8;
}
.btn-login:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

.footer-text {
  text-align: center;
  font-size: 11px;
  color: #D1D5DB;
  margin: 24px 0 0;
}
</style>
