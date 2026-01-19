import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../views/LoginPage.vue'
import Dashboard from '../views/Dashboard.vue'
import LeavesPage from '../views/LeavesPage.vue'
import RequestsPage from '../views/Requests.vue'
import EmployeeQualification from "../views/EmployeeQualification.vue";
import UpdateInfo from "../views/UpdateInfo.vue";
import PermissionsPage from '../views/PermissionsPage.vue';
import ManagerLeavesPage from '../views/ManagerLeavesPage.vue';
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
    path: "/update-info",
    name: "UpdateInfo",
    component: UpdateInfo
  },
  {
    path: '/leaves',
    name: 'LeavesPage',
    component: LeavesPage,
    meta: { role: ['موظف', 'SuperAdmin'] }
  },
  {
  path: "/employee-qualification",
  component: EmployeeQualification
},

  
  {
    path: '/requests',
    name: 'RequestsPage',
    component: RequestsPage,
    meta: { role: ['موظف', 'SuperAdmin'] }
  },
  
 {
  path: '/manager/leaves',
  name: 'ManagerLeavesPage',
  component: ManagerLeavesPage,
  meta: { role: ['مدير قسم', 'مدير إدارة فرعية', 'مدير إدارة', 'SuperAdmin'] }
}
,
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
  },
    {
    path: '/permissions',
    name: 'PermissionsPage',
    component: PermissionsPage,
    meta: { role: ['SuperAdmin', 'Admin'] } // <--- حدد من يسمح له بالدخول
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 🔐 Route Guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  let role = localStorage.getItem('role')?.trim(); // ✅ trim مهم
  if (!role) role = 'موظف'; // افتراضي

  if (to.meta.role) {
    if (!token) {
      alert('الرجاء تسجيل الدخول');
      return next('/');
    }

    if (!to.meta.role.includes(role)) {
      alert('غير مسموح بالدخول');
      return next('/dashboard');
    }
  }

  next();
});


export default router
