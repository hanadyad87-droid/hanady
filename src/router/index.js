import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../views/LoginPage.vue'
import Dashboard from '../views/Dashboard.vue'
import LeavesPage from '../views/LeavesPage.vue'
import RequestsPage from '../views/Requests.vue'
import EmployeeQualification from "../views/EmployeeQualification.vue";
import UpdateInfo from "../views/UpdateInfo.vue";
import PermissionsPage from '../views/PermissionsPage.vue';
import ManagerLeavesPage from '../views/ManagerLeavesPage.vue';
import NotificationsPage from '../views/NotificationsPage.vue';
import ComplaintsPage from "../views/Complaints.vue";
import TasksPage from "../views/Tasks.vue";
import TemplatesPage from "../views/Templates.vue";
import EvaluationPage from "../views/Evaluation.vue";
import KnowledgePage from "../views/Knowledge.vue";
import DepartmentsManagement from "../views/DepartmentsManagement.vue";
const routes = [
  { path: '/', name: 'LoginPage', component: LoginPage },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/update-info', name: 'UpdateInfo', component: UpdateInfo },


  { path: '/leaves', name: 'LeavesPage', component: LeavesPage, meta: { role: ['5','2','3','4'] } },
  { path: "/employee-qualification", component: EmployeeQualification },

  { path: '/requests', name: 'RequestsPage', component: RequestsPage, meta: { role: ['5','1','2','3','4'] } },
  { path: '/manager/leaves', name: 'ManagerLeavesPage', component: ManagerLeavesPage, meta: { role: ['1','2','3','4'] } },
  
  { path: '/employees', name: 'EmployeesList', component: () => import('../views/Employees.vue'), meta: { role:['1'] } },
  { path: "/employees/:id", name: "EmployeeView", component: () => import("../views/EmployeeView.vue"), meta: { role: ['1','2','3','4','5'] } },
  { path: '/employees/add', name: 'AddEmployee', component: () => import('../views/AddEmployee.vue'), meta: { role: ['1'] } },
{
  path: "/departments-management",
  name: "DepartmentsManagement",
  component: DepartmentsManagement,
  meta: { role: ['1'] } 
},
  { path: '/permissions', name: 'PermissionsPage', component: PermissionsPage, meta: { role: ['1'] } }, // SuperAdmin فقط
  { path: "/notifications", name: "Notifications", component: NotificationsPage },
  { path: "/complaints", name: "Complaints", component: ComplaintsPage, meta: { role: ['1','2','3','4','5'] } },
  { path: "/tasks", name: "Tasks", component: TasksPage, meta: { role: ['1','2','3','4','5'] } },
  { path: "/templates", name: "Templates", component: TemplatesPage, meta: { role: ['1'] } }, // SuperAdmin فقط
  { path: "/evaluation", name: "Evaluation", component: EvaluationPage, meta: { role: ['1','2','3','4','5'] } },
  { path: "/knowledge", name: "Knowledge", component: KnowledgePage, meta: { role: ['1','2','3','4','5'] } }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});


router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  const roleId = localStorage.getItem('roleId'); // رقم الدور المخزن عند login

 
  if (to.meta.role) {
    if (!token || !roleId) {
      alert('الرجاء تسجيل الدخول');
      return next('/');
    }

  
    if (!to.meta.role.includes(roleId)) {
      alert('غير مسموح بالدخول');
      return next('/dashboard');
    }
  }

  next();
});

export default router;
