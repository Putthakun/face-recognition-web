<template>
  <div class="employee-page">

    <AppNavbar />

    <!-- Topbar -->
    <div class="topbar">
      <div class="page-info">
        <h2 class="page-title">Employees</h2>
        <span class="count-badge">{{ employees.filter(e => e.empId !== 1111).length }} total</span>
      </div>
      <div class="topbar-right">
        <div class="search-wrap">
          <i class="ti ti-search search-icon"></i>
          <input v-model="search" class="search-input" placeholder="Search by name or ID…" />
        </div>
        <button class="btn-add" @click="openModal()">
          <i class="ti ti-plus"></i> Add Employee
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>ID</th>
            <th>Role</th>
            <th>Photo</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filtered.length === 0">
            <td colspan="5" class="empty-row">
              <i class="ti ti-users-off"></i>
              No employees found
            </td>
          </tr>
          <tr v-for="emp in filtered" :key="emp.empId" class="emp-row">
            <td>
              <div class="emp-cell">
                <div class="emp-avatar" :style="avatarStyle(emp.name)">
                  <span>{{ initials(emp.name) }}</span>
                </div>
                <span class="emp-name">{{ emp.name }}</span>
              </div>
            </td>
            <td class="cell-id">{{ emp.empId }}</td>
            <td><span class="role-badge" :class="roleBadgeClass(emp.role)">{{ emp.role }}</span></td>
            <td>
              <span class="photo-status no-photo">
                <i class="ti ti-photo-off"></i> None
              </span>
            </td>
            <td>
              <button class="btn-edit" @click="openModal(emp)">
                <i class="ti ti-edit"></i> Edit
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

    <!-- Modal panel -->
    <Transition name="modal">
      <div v-if="showModal" class="modal">
        <div class="modal-header">
          <h3 class="modal-title">{{ editing ? 'Edit Employee' : 'Add Employee' }}</h3>
          <button class="modal-close" @click="closeModal"><i class="ti ti-x"></i></button>
        </div>

        <form class="modal-body" @submit.prevent="handleSubmit">

          <!-- Photo upload -->
          <div class="photo-section">
            <div
              class="photo-drop"
              :class="{ 'has-photo': form.photoPreview }"
              @click="fileInput?.click()"
              @dragover.prevent
              @drop.prevent="handleDrop"
            >
              <img v-if="form.photoPreview" :src="form.photoPreview" class="photo-preview" />
              <div v-else class="photo-placeholder">
                <i class="ti ti-camera-plus"></i>
                <span>Upload face photo</span>
                <small>Click or drag & drop</small>
              </div>
            </div>
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              class="hidden-input"
              @change="handleFileChange"
            />
            <button
              v-if="form.photoPreview"
              type="button"
              class="btn-remove-photo"
              @click="removePhoto"
            >
              <i class="ti ti-trash"></i> Remove photo
            </button>
            <span v-if="errors.photo" class="error-msg">{{ errors.photo }}</span>
          </div>

          <!-- Fields -->
          <div class="fields">

            <div class="field">
              <label class="label" for="empId">Employee ID</label>
              <div class="input-wrap" :class="{ error: errors.empId, focused: focused === 'empId' }">
                <i class="ti ti-id-badge input-icon"></i>
                <input
                  id="empId"
                  v-model="form.empId"
                  class="input"
                  placeholder="e.g. EMP001"
                  :disabled="!!editing"
                  @focus="focused = 'empId'"
                  @blur="focused = null"
                />
              </div>
              <span v-if="errors.empId" class="error-msg">{{ errors.empId }}</span>
            </div>

            <div class="field">
              <label class="label" for="name">Full Name</label>
              <div class="input-wrap" :class="{ error: errors.name, focused: focused === 'name' }">
                <i class="ti ti-user input-icon"></i>
                <input
                  id="name"
                  v-model="form.name"
                  class="input"
                  placeholder="e.g. John Doe"
                  @focus="focused = 'name'"
                  @blur="focused = null"
                />
              </div>
              <span v-if="errors.name" class="error-msg">{{ errors.name }}</span>
            </div>

            <div class="field">
              <label class="label" for="role">Role</label>

              <!-- Loading -->
              <div v-if="rolesLoading" class="input-wrap roles-state">
                <span class="spinner-sm"></span>
                <span class="state-text">Loading roles…</span>
              </div>

              <!-- Error -->
              <div v-else-if="rolesError" class="input-wrap roles-state roles-error">
                <i class="ti ti-alert-circle state-icon"></i>
                <span class="state-text">Failed to load roles</span>
                <button type="button" class="btn-retry" @click="fetchRoles">Retry</button>
              </div>

              <!-- Custom dropdown -->
              <div v-else ref="dropdownRef" class="dropdown" :class="{ open: dropdownOpen, error: errors.role }">
                <button
                  type="button"
                  class="dropdown-trigger"
                  @click="dropdownOpen = !dropdownOpen"
                >
                  <i class="ti ti-briefcase input-icon"></i>
                  <span :class="form.role ? 'dropdown-value' : 'dropdown-placeholder'">
                    {{ form.role || 'Select a role' }}
                  </span>
                  <i class="ti ti-chevron-down dropdown-arrow"></i>
                </button>
                <ul v-if="dropdownOpen" class="dropdown-list">
                  <li
                    v-for="r in roles"
                    :key="r.roleName"
                    class="dropdown-item"
                    :class="{ selected: form.role === r.roleName }"
                    @mousedown.prevent="selectRole(r.roleName)"
                  >
                    <i v-if="form.role === r.roleName" class="ti ti-check check-icon"></i>
                    {{ r.roleName }}
                    <span v-if="r.isSystem" class="system-badge">System</span>
                  </li>
                </ul>
              </div>

              <span v-if="errors.role" class="error-msg">{{ errors.role }}</span>
            </div>

            <!-- Password — shown only when selected role is isSystem -->
            <Transition name="fade">
              <div v-if="selectedRole?.isSystem" class="field">
                <label class="label" for="password">Password</label>
                <div class="input-wrap" :class="{ error: errors.password, focused: focused === 'password' }">
                  <i class="ti ti-lock input-icon"></i>
                  <input
                    id="password"
                    v-model="form.password"
                    :type="showPassword ? 'text' : 'password'"
                    class="input"
                    placeholder="Set a system password"
                    @focus="focused = 'password'"
                    @blur="focused = null"
                  />
                  <button type="button" class="eye-btn" @click="showPassword = !showPassword" tabindex="-1">
                    <i :class="showPassword ? 'ti ti-eye-off' : 'ti ti-eye'"></i>
                  </button>
                </div>
                <span v-if="errors.password" class="error-msg">{{ errors.password }}</span>
              </div>
            </Transition>

          </div>

          <div class="modal-footer">

            <!-- Confirm delete — takes full row -->
            <template v-if="editing && confirmDelete">
              <div class="confirm-zone">
                <span class="confirm-text">Remove this employee?</span>
                <button type="button" class="btn-confirm-delete" :disabled="deleting" @click="handleDelete">
                  <span v-if="deleting" class="spinner"></span>
                  <span v-else>Yes, delete</span>
                </button>
                <button type="button" class="btn-cancel-delete" @click="confirmDelete = false">Cancel</button>
              </div>
            </template>

            <!-- Normal footer -->
            <template v-else>
              <div class="footer-left">
                <button v-if="editing" type="button" class="btn-delete" @click="confirmDelete = true">
                  <i class="ti ti-trash"></i> Delete
                </button>
              </div>
              <div class="footer-right">
                <button type="button" class="btn-cancel" @click="closeModal">Cancel</button>
                <button type="submit" class="btn-save" :disabled="saving">
                  <span v-if="saving" class="spinner"></span>
                  <span v-else><i class="ti ti-check"></i> {{ editing ? 'Save changes' : 'Add Employee' }}</span>
                </button>
              </div>
            </template>

          </div>

        </form>
      </div>
    </Transition>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import AppNavbar from '@/components/AppNavbar.vue'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/composables/useToast'

interface Employee {
  empId:    number
  name:     string
  role:     string | null
  isActive: boolean | null
  createdAt: string | null
}

interface FormState {
  empId:        string
  name:         string
  role:         string
  password:     string
  photoFile:    File | null
  photoPreview: string | null
}

const BASE_URL = 'http://localhost:5081'

interface RoleOption {
  roleName: string
  isSystem: boolean
}

const auth         = useAuthStore()
const { show }     = useToast()
const roles        = ref<RoleOption[]>([])
const rolesLoading = ref(true)
const rolesError   = ref(false)

const selectedRole = computed(() =>
  roles.value.find(r => r.roleName === form.value.role) ?? null
)

function authHeader(): Record<string, string> {
  return auth.token ? { Authorization: `Bearer ${auth.token}` } : {}
}

async function fetchEmployees() {
  try {
    const res = await fetch(`${BASE_URL}/api/admin/employees`, {
      headers: authHeader(),
    })
    if (res.ok) {
      employees.value = await res.json()
    } else {
      show(`Failed to load employees (${res.status})`, 'error')
    }
  } catch {
    show('Cannot connect to server — employees unavailable', 'error')
  }
}

async function fetchRoles() {
  rolesLoading.value = true
  rolesError.value   = false
  try {
    const res = await fetch(`${BASE_URL}/api/role`, {
      headers: authHeader(),
    })
    if (res.ok) {
      const data = await res.json()
      roles.value = data as RoleOption[]
    } else {
      rolesError.value = true
      show(`Failed to load roles (${res.status})`, 'error')
    }
  } catch {
    rolesError.value = true
    show('Cannot connect to server — roles unavailable', 'error')
  } finally {
    rolesLoading.value = false
  }
}

onMounted(() => {
  fetchEmployees()
  fetchRoles()
  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})

const AVATAR_COLORS = [
  { bg: '#DBEAFE', color: '#1D4ED8' },
  { bg: '#D1FAE5', color: '#065F46' },
  { bg: '#EDE9FE', color: '#5B21B6' },
  { bg: '#FEE2E2', color: '#991B1B' },
  { bg: '#FEF3C7', color: '#92400E' },
]

// --- State ---
const employees = ref<Employee[]>([])

const search       = ref('')
const showModal    = ref(false)
const editing      = ref<Employee | null>(null)
const saving       = ref(false)
const focused      = ref<string | null>(null)
const fileInput    = ref<HTMLInputElement | null>(null)
const dropdownOpen   = ref(false)
const dropdownRef    = ref<HTMLElement | null>(null)
const showPassword   = ref(false)
const confirmDelete  = ref(false)
const deleting       = ref(false)

function selectRole(r: string) {
  form.value.role = r
  dropdownOpen.value   = false
}

function handleClickOutside(e: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    dropdownOpen.value = false
  }
}

const form = ref<FormState>({
  empId:        '',
  name:         '',
  role:         '',
  password:     '',
  photoFile:    null,
  photoPreview: null,
})

const errors = ref({ empId: '', name: '', role: '', password: '', photo: '' })

// --- Computed ---
const filtered = computed(() => {
  const q = search.value.toLowerCase()
  return employees.value.filter(e =>
    e.empId !== 1111 &&
    (e.name.toLowerCase().includes(q) || String(e.empId).includes(q))
  )
})

// --- Modal ---
function openModal(emp?: Employee) {
  editing.value = emp ?? null
  if (emp) {
    form.value = { empId: String(emp.empId), name: emp.name, role: emp.role ?? '', password: '', photoFile: null, photoPreview: null }
  } else {
    form.value = { empId: '', name: '', role: '', password: '', photoFile: null, photoPreview: null }
  }
  errors.value = { empId: '', name: '', role: '', password: '', photo: '' }
  showPassword.value = false
  showModal.value = true
}

function closeModal() {
  showModal.value    = false
  editing.value      = null
  dropdownOpen.value = false
  confirmDelete.value = false
}

async function handleDelete() {
  if (!editing.value) return
  deleting.value = true
  try {
    const res = await fetch(`http://localhost:5081/api/admin/employees/${editing.value.empId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${auth.token}` },
    })
    if (res.status === 204) {
      employees.value = employees.value.filter(e => e.empId !== editing.value!.empId)
      show('Employee deleted successfully', 'success')
      closeModal()
    } else if (res.status === 404) {
      show('Employee not found', 'error')
      confirmDelete.value = false
    } else {
      show(`Unexpected error (${res.status})`, 'error')
    }
  } catch {
    show('Cannot connect to server', 'error')
  } finally {
    deleting.value = false
  }
}

// --- Photo ---
function handleFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) applyPhoto(file)
}

function handleDrop(e: DragEvent) {
  const file = e.dataTransfer?.files?.[0]
  if (file && file.type.startsWith('image/')) applyPhoto(file)
}

function applyPhoto(file: File) {
  form.value.photoFile = file
  const reader = new FileReader()
  reader.onload = (e) => { form.value.photoPreview = e.target?.result as string }
  reader.readAsDataURL(file)
}

function removePhoto() {
  form.value.photoFile = null
  form.value.photoPreview = null
  if (fileInput.value) fileInput.value.value = ''
}

// --- Validation ---
function validate(): boolean {
  errors.value = { empId: '', name: '', role: '', password: '', photo: '' }
  let ok = true
  if (!form.value.empId.trim())  { errors.value.empId = 'Employee ID is required'; ok = false }
  if (!form.value.name.trim())   { errors.value.name  = 'Full name is required';   ok = false }
  if (!form.value.role)          { errors.value.role  = 'Please select a role';    ok = false }
  if (!form.value.photoPreview)  { errors.value.photo = 'Face photo is required';  ok = false }
  if (selectedRole.value?.isSystem && !form.value.password) {
    errors.value.password = 'Password is required for system roles'
    ok = false
  }
  if (!editing.value) {
    const dup = employees.value.some(e => e.empId === Number(form.value.empId.trim()))
    if (dup) { errors.value.empId = 'This ID already exists'; ok = false }
  }
  return ok
}

// --- Submit ---
async function handleSubmit() {
  if (!validate()) return
  saving.value = true

  try {
    const payload = new FormData()
    payload.append('empId', form.value.empId.trim())
    payload.append('name',  form.value.name.trim())
    payload.append('role',  form.value.role)
    if (selectedRole.value?.isSystem) payload.append('password', form.value.password)
    if (form.value.photoFile) payload.append('photo', form.value.photoFile)

    const res = await fetch(`${BASE_URL}/api/admin/employees`, {
      method: 'POST',
      headers: authHeader(),
      body: payload,
    })

    if (res.ok) {
      show('Employee added successfully', 'success')
      await fetchEmployees() // refresh list from server
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

// --- Helpers ---
function initials(name: string): string {
  return name.split(' ').map(w => w[0] ?? '').slice(0, 2).join('').toUpperCase()
}

function avatarStyle(name: string) {
  const c = AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]!
  return { background: c.bg, color: c.color }
}

function roleBadgeClass(role: string | null) {
  return {
    'role-admin':      role === 'Admin',
    'role-manager':    role === 'Manager',
    'role-supervisor': role === 'Supervisor',
    'role-employee':   role === 'Employee',
  }
}
</script>

<style scoped>
.employee-page { display: flex; flex-direction: column; height: 100vh; background: #F9FAFB; font-family: var(--vt-font-family-base, sans-serif); }

/* Topbar */
.topbar { background: #fff; border-bottom: 1px solid #E5E7EB; padding: 14px 24px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; }
.page-info { display: flex; align-items: center; gap: 10px; }
.page-title { font-size: 17px; font-weight: 700; color: #111827; margin: 0; }
.count-badge { font-size: 12px; background: #F3F4F6; color: #6B7280; padding: 2px 10px; border-radius: 99px; }
.topbar-right { display: flex; align-items: center; gap: 10px; }

.search-wrap { display: flex; align-items: center; border: 1.5px solid #E5E7EB; border-radius: 8px; background: #F9FAFB; padding: 0 12px; gap: 8px; }
.search-icon { color: #9CA3AF; font-size: 14px; }
.search-input { border: none; background: transparent; outline: none; font-size: 13px; color: #111827; padding: 7px 0; width: 220px; }
.search-input::placeholder { color: #D1D5DB; }

.btn-add { background: #2563EB; color: #fff; border: none; border-radius: 8px; padding: 8px 16px; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: background 0.15s; }
.btn-add:hover { background: #1D4ED8; }

/* Table */
.table-wrap { flex: 1; overflow-y: auto; padding: 20px 24px; }
.table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #E5E7EB; }
.table thead { background: #F9FAFB; }
.table th { text-align: left; font-size: 11px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em; padding: 11px 16px; border-bottom: 1px solid #E5E7EB; }
.table td { padding: 13px 16px; border-bottom: 1px solid #F3F4F6; font-size: 13px; color: #111827; vertical-align: middle; }
.emp-row:last-child td { border-bottom: none; }
.emp-row:hover td { background: #FAFAFA; }

.emp-cell { display: flex; align-items: center; gap: 10px; }
.emp-avatar { width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; flex-shrink: 0; overflow: hidden; }
.avatar-img { width: 100%; height: 100%; object-fit: cover; }
.emp-name { font-weight: 500; }
.cell-id { color: #6B7280; font-family: monospace; font-size: 12px; }

.role-badge { font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 99px; }
.role-admin      { background: #FEE2E2; color: #991B1B; }
.role-manager    { background: #EDE9FE; color: #5B21B6; }
.role-supervisor { background: #FEF3C7; color: #92400E; }
.role-employee   { background: #D1FAE5; color: #065F46; }

.photo-status { font-size: 11px; display: flex; align-items: center; gap: 4px; }
.has-photo { color: #065F46; }
.no-photo  { color: #9CA3AF; }

.btn-edit { background: #F3F4F6; border: 1px solid #E5E7EB; border-radius: 7px; padding: 5px 12px; font-size: 12px; font-weight: 500; color: #374151; cursor: pointer; display: flex; align-items: center; gap: 5px; transition: all 0.15s; }
.btn-edit:hover { background: #EFF6FF; border-color: #BFDBFE; color: #1D4ED8; }

.empty-row { text-align: center; color: #9CA3AF; padding: 48px 16px !important; display: table-cell; }
.empty-row i { display: block; font-size: 28px; margin-bottom: 8px; }

/* Modal overlay */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.3); backdrop-filter: blur(2px); z-index: 100; }

/* Modal panel */
.modal { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #fff; border-radius: 16px; width: 100%; max-width: 440px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); z-index: 101; }

.modal-header { padding: 20px 24px 0; display: flex; align-items: center; justify-content: space-between; }
.modal-title { font-size: 16px; font-weight: 700; color: #111827; margin: 0; }
.modal-close { background: none; border: none; cursor: pointer; color: #9CA3AF; font-size: 18px; display: flex; align-items: center; padding: 2px; border-radius: 4px; }
.modal-close:hover { color: #374151; background: #F3F4F6; }

.modal-body { padding: 20px 24px 24px; display: flex; flex-direction: column; gap: 20px; }

/* Photo upload */
.photo-section { display: flex; flex-direction: column; align-items: center; gap: 10px; }
.photo-drop { width: 110px; height: 110px; border-radius: 50%; border: 2px dashed #D1D5DB; background: #F9FAFB; cursor: pointer; display: flex; align-items: center; justify-content: center; overflow: hidden; transition: border-color 0.15s, background 0.15s; }
.photo-drop:hover, .photo-drop.has-photo { border-color: #2563EB; border-style: solid; }
.photo-preview { width: 100%; height: 100%; object-fit: cover; }
.photo-placeholder { display: flex; flex-direction: column; align-items: center; gap: 4px; color: #9CA3AF; text-align: center; }
.photo-placeholder i    { font-size: 24px; color: #D1D5DB; }
.photo-placeholder span { font-size: 11px; font-weight: 500; }
.photo-placeholder small { font-size: 10px; color: #D1D5DB; }
.hidden-input { display: none; }
.btn-remove-photo { background: none; border: none; font-size: 12px; color: #EF4444; cursor: pointer; display: flex; align-items: center; gap: 4px; }
.btn-remove-photo:hover { color: #B91C1C; }

/* Fields */
.fields { display: flex; flex-direction: column; gap: 14px; }
.field  { display: flex; flex-direction: column; gap: 6px; }
.label  { font-size: 13px; font-weight: 500; color: #374151; }

.input-wrap { display: flex; align-items: center; border: 1.5px solid #E5E7EB; border-radius: 10px; background: #F9FAFB; transition: border-color 0.15s, box-shadow 0.15s; overflow: hidden; }
.input-wrap.focused { border-color: #2563EB; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); background: #fff; }
.input-wrap.error   { border-color: #EF4444; }
.input-wrap.focused .input-icon { color: #2563EB; }
.input-icon { color: #9CA3AF; font-size: 15px; padding: 0 10px 0 14px; flex-shrink: 0; }
.input { flex: 1; border: none; background: transparent; outline: none; font-size: 14px; color: #111827; padding: 10px 12px 10px 0; min-width: 0; }
.input::placeholder { color: #D1D5DB; }
.input:disabled { color: #6B7280; cursor: not-allowed; }
.dropdown { position: relative; }
.dropdown-trigger { width: 100%; display: flex; align-items: center; border: 1.5px solid #E5E7EB; border-radius: 10px; background: #F9FAFB; padding: 0; cursor: pointer; text-align: left; transition: border-color 0.15s, box-shadow 0.15s; }
.dropdown.open .dropdown-trigger { border-color: #2563EB; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); background: #fff; }
.dropdown.error .dropdown-trigger { border-color: #EF4444; }
.dropdown.open .input-icon { color: #2563EB; }
.dropdown-placeholder { flex: 1; font-size: 14px; color: #D1D5DB; padding: 10px 0; }
.dropdown-value       { flex: 1; font-size: 14px; color: #111827; padding: 10px 0; }
.dropdown-arrow { color: #9CA3AF; font-size: 13px; padding-right: 12px; transition: transform 0.15s; }
.dropdown.open .dropdown-arrow { transform: rotate(180deg); }

.dropdown-list { position: absolute; top: calc(100% + 6px); left: 0; right: 0; background: #fff; border: 1px solid #E5E7EB; border-radius: 10px; box-shadow: 0 8px 24px rgba(0,0,0,0.08); z-index: 200; overflow: hidden; padding: 4px; }
.dropdown-item { display: flex; align-items: center; gap: 8px; padding: 9px 12px; font-size: 13px; color: #111827; border-radius: 7px; cursor: pointer; }
.dropdown-item:hover { background: #F3F4F6; }
.dropdown-item.selected { background: #EFF6FF; color: #1D4ED8; font-weight: 500; }
.check-icon { font-size: 13px; color: #2563EB; }
.system-badge { margin-left: auto; font-size: 10px; font-weight: 600; background: #EDE9FE; color: #5B21B6; padding: 1px 7px; border-radius: 99px; }

.eye-btn { background: none; border: none; cursor: pointer; color: #9CA3AF; padding: 0 12px; font-size: 15px; display: flex; align-items: center; }
.eye-btn:hover { color: #6B7280; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s, transform 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-6px); }
.error-msg { font-size: 12px; color: #EF4444; }

.roles-state { padding: 10px 14px; gap: 8px; cursor: default; }
.roles-error { border-color: #FECACA; background: #FEF2F2; }
.state-icon  { color: #EF4444; font-size: 15px; }
.state-text  { font-size: 13px; color: #6B7280; flex: 1; }
.roles-error .state-text { color: #991B1B; }
.btn-retry   { font-size: 12px; font-weight: 600; color: #2563EB; background: none; border: none; cursor: pointer; padding: 0; flex-shrink: 0; }
.btn-retry:hover { text-decoration: underline; }
.spinner-sm  { width: 14px; height: 14px; border: 2px solid #E5E7EB; border-top-color: #2563EB; border-radius: 50%; animation: spin 0.6s linear infinite; flex-shrink: 0; }

/* Footer */
.modal-footer { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding-top: 4px; }
.footer-left  { display: flex; align-items: center; gap: 8px; }
.footer-right { display: flex; align-items: center; gap: 10px; margin-left: auto; }

.btn-delete { background: none; border: 1px solid #FECACA; border-radius: 9px; padding: 9px 14px; font-size: 13px; font-weight: 500; color: #EF4444; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.15s; }
.btn-delete:hover { background: #FEF2F2; border-color: #FCA5A5; }

.confirm-zone { display: flex; align-items: center; gap: 8px; width: 100%; }
.confirm-text { font-size: 12px; color: #6B7280; white-space: nowrap; }
.btn-confirm-delete { background: #EF4444; color: #fff; border: none; border-radius: 8px; padding: 7px 14px; font-size: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; min-width: 88px; justify-content: center; transition: background 0.15s; }
.btn-confirm-delete:hover:not(:disabled) { background: #DC2626; }
.btn-confirm-delete:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-cancel-delete { background: none; border: none; font-size: 12px; color: #6B7280; cursor: pointer; padding: 0; }
.btn-cancel-delete:hover { color: #374151; }
.btn-cancel { background: #F3F4F6; border: 1px solid #E5E7EB; border-radius: 9px; padding: 9px 18px; font-size: 13px; font-weight: 500; color: #374151; cursor: pointer; transition: background 0.15s; }
.btn-cancel:hover { background: #E5E7EB; }
.btn-save { background: #2563EB; color: #fff; border: none; border-radius: 9px; padding: 9px 20px; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 7px; transition: background 0.15s; min-width: 130px; justify-content: center; }
.btn-save:hover:not(:disabled) { background: #1D4ED8; }
.btn-save:disabled { opacity: 0.6; cursor: not-allowed; }

.spinner { width: 15px; height: 15px; border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff; border-radius: 50%; animation: spin 0.6s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Transitions */
.overlay-enter-active, .overlay-leave-active { transition: opacity 0.2s; }
.overlay-enter-from,   .overlay-leave-to     { opacity: 0; }

.modal-enter-active, .modal-leave-active { transition: opacity 0.2s, transform 0.2s; }
.modal-enter-from,   .modal-leave-to     { opacity: 0; transform: translate(-50%, -48%); }
</style>
