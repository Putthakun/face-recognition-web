<template>
  <div class="employee-page">

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

    <!-- Topbar -->
    <div class="topbar">
      <div class="page-info">
        <h2 class="page-title">Employees</h2>
        <span class="count-badge">{{ employees.length }} total</span>
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
          <tr v-for="emp in filtered" :key="emp.emp_id" class="emp-row">
            <td>
              <div class="emp-cell">
                <div class="emp-avatar" :style="avatarStyle(emp.name)">
                  <img v-if="emp.photoUrl" :src="emp.photoUrl" class="avatar-img" />
                  <span v-else>{{ initials(emp.name) }}</span>
                </div>
                <span class="emp-name">{{ emp.name }}</span>
              </div>
            </td>
            <td class="cell-id">{{ emp.emp_id }}</td>
            <td><span class="role-badge" :class="roleBadgeClass(emp.role_name)">{{ emp.role_name }}</span></td>
            <td>
              <span v-if="emp.photoUrl" class="photo-status has-photo">
                <i class="ti ti-photo-check"></i> Uploaded
              </span>
              <span v-else class="photo-status no-photo">
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
          </div>

          <!-- Fields -->
          <div class="fields">

            <div class="field">
              <label class="label" for="emp_id">Employee ID</label>
              <div class="input-wrap" :class="{ error: errors.emp_id, focused: focused === 'emp_id' }">
                <i class="ti ti-id-badge input-icon"></i>
                <input
                  id="emp_id"
                  v-model="form.emp_id"
                  class="input"
                  placeholder="e.g. EMP001"
                  :disabled="!!editing"
                  @focus="focused = 'emp_id'"
                  @blur="focused = null"
                />
              </div>
              <span v-if="errors.emp_id" class="error-msg">{{ errors.emp_id }}</span>
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
              <div class="input-wrap" :class="{ error: errors.role_name, focused: focused === 'role' }">
                <i class="ti ti-briefcase input-icon"></i>
                <select
                  id="role"
                  v-model="form.role_name"
                  class="input select"
                  @focus="focused = 'role'"
                  @blur="focused = null"
                >
                  <option value="" disabled>Select a role</option>
                  <option v-for="r in ROLES" :key="r" :value="r">{{ r }}</option>
                </select>
                <i class="ti ti-chevron-down select-arrow"></i>
              </div>
              <span v-if="errors.role_name" class="error-msg">{{ errors.role_name }}</span>
            </div>

          </div>

          <div class="modal-footer">
            <button type="button" class="btn-cancel" @click="closeModal">Cancel</button>
            <button type="submit" class="btn-save" :disabled="saving">
              <span v-if="saving" class="spinner"></span>
              <span v-else><i class="ti ti-check"></i> {{ editing ? 'Save changes' : 'Add Employee' }}</span>
            </button>
          </div>

        </form>
      </div>
    </Transition>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Employee {
  emp_id:    string
  name:      string
  role_name: string
  photoUrl:  string | null
}

interface FormState {
  emp_id:       string
  name:         string
  role_name:    string
  photoFile:    File | null
  photoPreview: string | null
}

const ROLES = ['Employee', 'Supervisor', 'Manager', 'Admin']

const AVATAR_COLORS = [
  { bg: '#DBEAFE', color: '#1D4ED8' },
  { bg: '#D1FAE5', color: '#065F46' },
  { bg: '#EDE9FE', color: '#5B21B6' },
  { bg: '#FEE2E2', color: '#991B1B' },
  { bg: '#FEF3C7', color: '#92400E' },
]

// --- State ---
const employees = ref<Employee[]>([
  { emp_id: 'EMP001', name: 'Supharoke K.',  role_name: 'Employee',   photoUrl: null },
  { emp_id: 'EMP002', name: 'Nattawut P.',   role_name: 'Manager',    photoUrl: null },
  { emp_id: 'EMP003', name: 'Malee W.',      role_name: 'Employee',   photoUrl: null },
  { emp_id: 'EMP004', name: 'Anan T.',       role_name: 'Supervisor', photoUrl: null },
])

const search   = ref('')
const showModal = ref(false)
const editing   = ref<Employee | null>(null)
const saving    = ref(false)
const focused   = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

const form = ref<FormState>({
  emp_id:       '',
  name:         '',
  role_name:    '',
  photoFile:    null,
  photoPreview: null,
})

const errors = ref({ emp_id: '', name: '', role_name: '' })

// --- Computed ---
const filtered = computed(() => {
  const q = search.value.toLowerCase()
  return employees.value.filter(e =>
    e.name.toLowerCase().includes(q) || e.emp_id.toLowerCase().includes(q)
  )
})

// --- Modal ---
function openModal(emp?: Employee) {
  editing.value = emp ?? null
  if (emp) {
    form.value = { emp_id: emp.emp_id, name: emp.name, role_name: emp.role_name, photoFile: null, photoPreview: emp.photoUrl }
  } else {
    form.value = { emp_id: '', name: '', role_name: '', photoFile: null, photoPreview: null }
  }
  errors.value = { emp_id: '', name: '', role_name: '' }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editing.value = null
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
  errors.value = { emp_id: '', name: '', role_name: '' }
  let ok = true
  if (!form.value.emp_id.trim())    { errors.value.emp_id    = 'Employee ID is required'; ok = false }
  if (!form.value.name.trim())      { errors.value.name      = 'Full name is required';   ok = false }
  if (!form.value.role_name)        { errors.value.role_name = 'Please select a role';    ok = false }
  if (!editing.value) {
    const dup = employees.value.some(e => e.emp_id === form.value.emp_id.trim())
    if (dup) { errors.value.emp_id = 'This ID already exists'; ok = false }
  }
  return ok
}

// --- Submit ---
async function handleSubmit() {
  if (!validate()) return
  saving.value = true

  try {
    const payload = new FormData()
    payload.append('emp_id',    form.value.emp_id.trim())
    payload.append('name',      form.value.name.trim())
    payload.append('role_name', form.value.role_name)
    if (form.value.photoFile) payload.append('photo', form.value.photoFile)

    // TODO: replace with real API call
    // const url    = editing.value ? `/api/employees/${form.value.emp_id}` : '/api/employees'
    // const method = editing.value ? 'PUT' : 'POST'
    // await fetch(url, { method, body: payload })

    await new Promise(r => setTimeout(r, 600)) // simulate

    if (editing.value) {
      const idx = employees.value.findIndex(e => e.emp_id === editing.value!.emp_id)
      if (idx !== -1) {
        employees.value[idx] = {
          emp_id:    form.value.emp_id.trim(),
          name:      form.value.name.trim(),
          role_name: form.value.role_name,
          photoUrl:  form.value.photoPreview,
        }
      }
    } else {
      employees.value.unshift({
        emp_id:    form.value.emp_id.trim(),
        name:      form.value.name.trim(),
        role_name: form.value.role_name,
        photoUrl:  form.value.photoPreview,
      })
    }

    closeModal()
  } finally {
    saving.value = false
  }
}

// --- Helpers ---
function initials(name: string): string {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

function avatarStyle(name: string) {
  const c = AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]!
  return { background: c.bg, color: c.color }
}

function roleBadgeClass(role: string) {
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

/* Navbar */
.navbar { background: #fff; border-bottom: 1px solid #E5E7EB; padding: 0 20px; display: flex; align-items: center; justify-content: space-between; height: 52px; flex-shrink: 0; }
.brand { font-size: 15px; font-weight: 600; color: #111827; display: flex; align-items: center; gap: 8px; }
.brand-dot { width: 8px; height: 8px; border-radius: 50%; background: #2563EB; }
.nav-tabs { display: flex; gap: 2px; }
.tab { font-size: 13px; padding: 6px 14px; border-radius: 8px; color: #6B7280; text-decoration: none; display: flex; align-items: center; gap: 6px; }
.tab.active { background: #EFF6FF; color: #1D4ED8; font-weight: 500; }
.user-info { display: flex; align-items: center; gap: 10px; font-size: 13px; color: #6B7280; }
.avatar-sm { width: 30px; height: 30px; border-radius: 50%; background: #DBEAFE; color: #1D4ED8; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; }

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
.modal { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #fff; border-radius: 16px; width: 100%; max-width: 440px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); z-index: 101; overflow: hidden; }

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
.select { appearance: none; cursor: pointer; }
.select-arrow { color: #9CA3AF; font-size: 13px; padding-right: 12px; pointer-events: none; }
.error-msg { font-size: 12px; color: #EF4444; }

/* Footer */
.modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding-top: 4px; }
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
