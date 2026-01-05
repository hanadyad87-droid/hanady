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
    meta: { role: ['Employee', 'SuperAdmin'] }
  },
  {
  path: "/requests/update-info",
  component: () => import("../views/requests/UpdateInfo.vue")
},
{
  path: "/requests/transfer",
  component: () => import("../views/requests/Transfer.vue")
},
{
  path: "/requests/permission",
  component: () => import("../views/requests/Permission.vue")
},
{
  path: "/requests/training",
  component: () => import("../views/requests/Training.vue")
},
{
  path: "/requests/marriage",
  component: () => import("../views/requests/Marriage.vue")
},
{
  path: "/requests/internet",
  component: () => import("../views/requests/Internet.vue")
},
{
  path: "/requests/maintenance",
  component: () => import("../views/requests/Maintenance.vue")
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

  // لو الصفحة محمية بدور
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
