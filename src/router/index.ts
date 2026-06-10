import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CameraView from '../views/CameraView.vue'
import CameraManageView from '../views/CameraManageView.vue'
import LoginView from '../views/LoginView.vue'
import EmployeeView from '../views/EmployeeView.vue'
import { useToast } from '@/composables/useToast'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/camera',
      name: 'camera',
      component: CameraView,
      meta: { requiresAuth: true },
    },
    {
      path: '/employee',
      name: 'employee',
      component: EmployeeView,
      meta: { requiresAuth: true },
    },
    {
      path: '/cameras',
      name: 'cameras',
      component: CameraManageView,
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach((to) => {
  const token = localStorage.getItem('token')

  if (to.meta.requiresAuth && !token) {
    const { show } = useToast()
    show('Please sign in to continue', 'warning')
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.name === 'login' && token) return { name: 'camera' }
})

export default router
