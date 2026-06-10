<template>
  <div class="camera-manage-page">

    <AppNavbar />

    <!-- Topbar -->
    <div class="topbar">
      <div class="page-info">
        <h2 class="page-title">Cameras</h2>
        <span class="count-badge">{{ cameras.length }} total</span>
      </div>
      <button class="btn-add" @click="openModal()">
        <i class="ti ti-plus"></i> Add Camera
      </button>
    </div>

    <!-- Table -->
    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>Camera ID</th>
            <th>Location</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="cameras.length === 0">
            <td colspan="3" class="empty-row">
              <i class="ti ti-video-off"></i>
              No cameras found
            </td>
          </tr>
          <tr v-for="cam in cameras" :key="cam.cameraId" class="cam-row">
            <td class="cell-id">{{ formatCameraId(cam.cameraId) }}</td>
            <td>
              <div class="location-cell">
                <i class="ti ti-map-pin location-icon"></i>
                {{ cam.location }}
              </div>
            </td>
            <td>
              <button class="btn-delete" @click="confirmDelete(cam)">
                <i class="ti ti-trash"></i> Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal overlay -->
    <Transition name="overlay">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal" />
    </Transition>

    <!-- Add Modal -->
    <Transition name="modal">
      <div v-if="showModal" class="modal">
        <div class="modal-header">
          <h3 class="modal-title">Add Camera</h3>
          <button class="modal-close" @click="closeModal"><i class="ti ti-x"></i></button>
        </div>

        <form class="modal-body" @submit.prevent="handleSubmit">
          <div class="field">
            <label class="label">Location</label>
            <div class="input-wrap" :class="{ error: errors.location, focused: focused === 'location' }">
              <i class="ti ti-map-pin input-icon"></i>
              <input
                v-model="form.location"
                class="input"
                placeholder="e.g. Factory Entrance"
                @focus="focused = 'location'"
                @blur="focused = null"
              />
            </div>
            <span v-if="errors.location" class="error-msg">{{ errors.location }}</span>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-cancel" @click="closeModal">Cancel</button>
            <button type="submit" class="btn-save" :disabled="saving">
              <span v-if="saving" class="spinner"></span>
              <span v-else><i class="ti ti-check"></i> Add Camera</span>
            </button>
          </div>
        </form>
      </div>
    </Transition>

    <!-- Delete Confirm Modal -->
    <Transition name="overlay">
      <div v-if="deleteTarget" class="modal-overlay" @click.self="deleteTarget = null" />
    </Transition>

    <Transition name="modal">
      <div v-if="deleteTarget" class="modal modal-sm">
        <div class="modal-header">
          <h3 class="modal-title">Delete Camera</h3>
          <button class="modal-close" @click="deleteTarget = null"><i class="ti ti-x"></i></button>
        </div>
        <div class="modal-body">
          <p class="confirm-text">
            Delete <strong>{{ formatCameraId(deleteTarget.cameraId) }}</strong> ({{ deleteTarget.location }})?
            This cannot be undone.
          </p>
          <div class="modal-footer">
            <button class="btn-cancel" @click="deleteTarget = null">Cancel</button>
            <button class="btn-danger" :disabled="saving" @click="handleDelete">
              <span v-if="saving" class="spinner"></span>
              <span v-else><i class="ti ti-trash"></i> Delete</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AppNavbar from '@/components/AppNavbar.vue'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/composables/useToast'

interface Camera {
  cameraId: number
  location: string
}

const BASE_URL = 'http://localhost:5081'
const auth     = useAuthStore()
const { show } = useToast()

const cameras     = ref<Camera[]>([])
const showModal   = ref(false)
const saving      = ref(false)
const focused     = ref<string | null>(null)
const deleteTarget = ref<Camera | null>(null)

const form   = ref({ location: '' })
const errors = ref({ location: '' })

function authHeader(): Record<string, string> {
  return auth.token ? { Authorization: `Bearer ${auth.token}` } : {}
}

async function fetchCameras() {
  try {
    const res = await fetch(`${BASE_URL}/api/admin/cameras`, {
      headers: authHeader(),
    })
    if (res.ok) cameras.value = await res.json()
    else show(`Failed to load cameras (${res.status})`, 'error')
  } catch {
    show('Cannot connect to server', 'error')
  }
}

function openModal() {
  form.value   = { location: '' }
  errors.value = { location: '' }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

function validate(): boolean {
  errors.value = { location: '' }
  let ok = true
  if (!form.value.location.trim()) { errors.value.location = 'Location is required'; ok = false }
  return ok
}

async function handleSubmit() {
  if (!validate()) return
  saving.value = true
  try {
    const res = await fetch(`${BASE_URL}/api/admin/cameras`, {
      method: 'POST',
      headers: { ...authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: form.value.location.trim(),
      }),
    })
    if (res.ok) {
      show('Camera added successfully', 'success')
      await fetchCameras()
      closeModal()
    } else {
      const err = await res.json().catch(() => ({}))
      show(err.message ?? `Error (${res.status})`, 'error')
    }
  } catch {
    show('Cannot connect to server', 'error')
  } finally {
    saving.value = false
  }
}

function confirmDelete(cam: Camera) {
  deleteTarget.value = cam
}

async function handleDelete() {
  if (!deleteTarget.value) return
  saving.value = true
  try {
    const res = await fetch(`${BASE_URL}/api/admin/cameras/${deleteTarget.value.cameraId}`, {
      method: 'DELETE',
      headers: authHeader(),
    })
    if (res.ok || res.status === 204) {
      show('Camera deleted', 'success')
      deleteTarget.value = null
      await fetchCameras()
    } else {
      show(`Error (${res.status})`, 'error')
    }
  } catch {
    show('Cannot connect to server', 'error')
  } finally {
    saving.value = false
  }
}

function formatCameraId(id: number): string {
  return `camera-${String(id).padStart(3, '0')}`
}

onMounted(fetchCameras)
</script>

<style scoped>
.camera-manage-page { display: flex; flex-direction: column; height: 100vh; background: #F9FAFB; }

.topbar { background: #fff; border-bottom: 1px solid #E5E7EB; padding: 14px 24px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; }
.page-info { display: flex; align-items: center; gap: 10px; }
.page-title { font-size: 17px; font-weight: 700; color: #111827; margin: 0; }
.count-badge { font-size: 12px; background: #F3F4F6; color: #6B7280; padding: 2px 10px; border-radius: 99px; }
.btn-add { background: #2563EB; color: #fff; border: none; border-radius: 8px; padding: 8px 16px; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; }
.btn-add:hover { background: #1D4ED8; }

.table-wrap { flex: 1; overflow-y: auto; padding: 20px 24px; }
.table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #E5E7EB; }
.table thead { background: #F9FAFB; }
.table th { text-align: left; font-size: 11px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em; padding: 11px 16px; border-bottom: 1px solid #E5E7EB; }
.table td { padding: 13px 16px; border-bottom: 1px solid #F3F4F6; font-size: 13px; color: #111827; vertical-align: middle; }
.cam-row:last-child td { border-bottom: none; }
.cam-row:hover td { background: #FAFAFA; }
.cell-id { font-family: monospace; font-size: 13px; font-weight: 600; color: #2563EB; }
.location-cell { display: flex; align-items: center; gap: 6px; }
.location-icon { color: #9CA3AF; font-size: 14px; }
.empty-row { text-align: center; color: #9CA3AF; padding: 48px 16px !important; }
.empty-row i { display: block; font-size: 28px; margin-bottom: 8px; }

.btn-delete { background: #FEF2F2; border: 1px solid #FECACA; border-radius: 7px; padding: 5px 12px; font-size: 12px; font-weight: 500; color: #DC2626; cursor: pointer; display: flex; align-items: center; gap: 5px; transition: all 0.15s; }
.btn-delete:hover { background: #FEE2E2; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.3); backdrop-filter: blur(2px); z-index: 100; }
.modal { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #fff; border-radius: 16px; width: 100%; max-width: 400px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); z-index: 101; }
.modal-sm { max-width: 340px; }
.modal-header { padding: 20px 24px 0; display: flex; align-items: center; justify-content: space-between; }
.modal-title { font-size: 16px; font-weight: 700; color: #111827; margin: 0; }
.modal-close { background: none; border: none; cursor: pointer; color: #9CA3AF; font-size: 18px; display: flex; align-items: center; padding: 2px; border-radius: 4px; }
.modal-close:hover { color: #374151; background: #F3F4F6; }
.modal-body { padding: 20px 24px 24px; display: flex; flex-direction: column; gap: 16px; }

.field { display: flex; flex-direction: column; gap: 6px; }
.label { font-size: 13px; font-weight: 500; color: #374151; }
.input-wrap { display: flex; align-items: center; border: 1.5px solid #E5E7EB; border-radius: 10px; background: #F9FAFB; transition: border-color 0.15s, box-shadow 0.15s; }
.input-wrap.focused { border-color: #2563EB; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); background: #fff; }
.input-wrap.error { border-color: #EF4444; }
.input-icon { color: #9CA3AF; font-size: 15px; padding: 0 10px 0 14px; flex-shrink: 0; }
.input-wrap.focused .input-icon { color: #2563EB; }
.input { flex: 1; border: none; background: transparent; outline: none; font-size: 14px; color: #111827; padding: 10px 12px 10px 0; }
.input::placeholder { color: #D1D5DB; }
.error-msg { font-size: 12px; color: #EF4444; }

.confirm-text { font-size: 14px; color: #374151; margin: 0; line-height: 1.6; }

.modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding-top: 4px; }
.btn-cancel { background: #F3F4F6; border: 1px solid #E5E7EB; border-radius: 9px; padding: 9px 18px; font-size: 13px; font-weight: 500; color: #374151; cursor: pointer; }
.btn-cancel:hover { background: #E5E7EB; }
.btn-save { background: #2563EB; color: #fff; border: none; border-radius: 9px; padding: 9px 20px; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 7px; min-width: 120px; justify-content: center; }
.btn-save:hover:not(:disabled) { background: #1D4ED8; }
.btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-danger { background: #DC2626; color: #fff; border: none; border-radius: 9px; padding: 9px 20px; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 7px; min-width: 100px; justify-content: center; }
.btn-danger:hover:not(:disabled) { background: #B91C1C; }
.btn-danger:disabled { opacity: 0.6; cursor: not-allowed; }

.spinner { width: 15px; height: 15px; border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff; border-radius: 50%; animation: spin 0.6s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.overlay-enter-active, .overlay-leave-active { transition: opacity 0.2s; }
.overlay-enter-from, .overlay-leave-to { opacity: 0; }
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s, transform 0.2s; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: translate(-50%, -48%); }
</style>
