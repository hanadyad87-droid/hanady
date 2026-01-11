import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../views/LoginPage.vue'
import Dashboard from '../views/Dashboard.vue'
import LeavesPage from '../views/LeavesPage.vue'
import RequestsPage from '../views/Requests.vue'

const routes = [
  {
    path: '/',
    name: 'LoginPage',
    component: LoginPage
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/leaves',
    name: 'LeavesPage',
    component: LeavesPage,
    meta: { role: ['Employee', 'SuperAdmin'] }
  },

  // ✅ صفحة الطلبات الموحدة
  {
    path: '/requests',
    name: 'RequestsPage',
    component: RequestsPage,
    meta: { role: ['Employee', 'SuperAdmin'] }
  },

  {
    path: '/employee',
    name: 'EmployeePage',
    component: () => import('../views/AddEmployee.vue'),
    meta: { role: ['SuperAdmin'] }
  },
  {
    path: '/employee/add',
    name: 'AddEmployee',
    component: () => import('../views/AddEmployee.vue'),
    meta: { role: ['SuperAdmin'] }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 🔐 Route Guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')

  if (to.meta.role) {
    if (!token) {
      alert('الرجاء تسجيل الدخول')
      return next('/')
    }

    if (!to.meta.role.includes(role)) {
      alert('غير مسموح بالدخول')
      return next('/dashboard')
    }
  }

  next()
})

export default router
