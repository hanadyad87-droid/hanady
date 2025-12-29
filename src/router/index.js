import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../views/LoginPage.vue'
import Dashboard from '../views/Dashboard.vue'
import LeavesPage from '../views/LeavesPage.vue'

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
    meta: { role: ['Employee', 'SuperAdmin'] } // كل واحد ممكن يشوف
  },
  {
    path: '/employee',
    name: 'EmployeePage',
    component: () => import('../views/AddEmployee.vue'), // حاليا AddEmployee، لاحقًا ممكن صفحة قائمة الموظفين
    meta: { role: ['SuperAdmin'] } // بس الادمن يشوف
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

// حماية الصفحات حسب الدور
router.beforeEach((to, from, next) => {
  const user = JSON.parse(localStorage.getItem('user'))

  if (to.meta.role) {
    if (!user || !to.meta.role.includes(user.role)) {
      alert('غير مسموح بالدخول')
      return next('/') // ارجع للصفحة الرئيسية
    }
  }

  next()
})

export default router
