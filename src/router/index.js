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

import EvaluationPage from "../views/Evaluation.vue";
import KnowledgePage from "../views/Knowledge.vue";
import DepartmentsManagement from "../views/DepartmentsManagement.vue";
import ManagerComplaints from "../views/ManagerComplaints.vue";
import AnnouncementsPage from "../views/Announcements.vue";
import FAQManagement from "../views/FAQManagement.vue";
import RequestSettingsPage from '@/views/RequestSettingsPage.vue';
import AdminInfo from '../views/AdminInfoPage.vue';  // صفحة مستقلة للإدارية
import EmployeeFinancialPage from '../views/EmployeeFinancialPage.vue'; // صفحة مستقلة للمالية
import BasicInfoPage from "@/views/BasicInfoPage.vue";
import DepartmentRequestsPage from "@/views/DepartmentRequestsPage.vue";
import ManagerTasksPage from "../views/ManagerTasksPage.vue";
import EmployeeTasksPage from "../views/EmployeeTasksPage.vue";
import ReportsPage from "../views/ReportsPage.vue";
import DelegationPage from "../views/DelegationPage.vue";
import CompanyFormsManager from "../views/UploadCompanyForm.vue"
import EmployeeCompanyForms from "../views/EmployeeCompanyForms.vue"
import AuditLogsPage from "../views/AuditLogs.vue";
const routes = [
  { path: '/', name: 'LoginPage', component: LoginPage },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/update-info', name: 'UpdateInfo', component: UpdateInfo },
 {
    path: "/employees/create",
    name: "CreateEmployee",
    component: BasicInfoPage
  },
  {
  path: "/manager-tasks",
  name: "ManagerTasks",
  component: ManagerTasksPage,
  meta: { role: ['5'] } // المدراء
},
{
  path: "/audit-logs",
  name: "AuditLogs",
  component: AuditLogsPage,
  meta: { role: ['1'] } // فقط SuperAdmin
},
{
  path: "/delegation",
  name: "Delegation",
  component: DelegationPage,
  meta: { role: ['5','3','4'] }
},
{
  path: "/my-tasks",
  name: "EmployeeTasks",
  component: EmployeeTasksPage,
  meta: { role: ['6'] } // الموظفين
},
 {
  path: "/department-requests",
  name: "DepartmentRequests",
  component: DepartmentRequestsPage,
  meta: { role: ['2','6','5'] } // فقط الإدارات / المدراء الذين لهم صلاحية رؤية الطلبات
},
  {
    path: '/request-settings',
    name: 'RequestSettings',
    component: RequestSettingsPage,
    meta: {
      title: 'إعدادات توجيه الطلبات',
      roles: [1] // فقط الأدمن (SuperAdmin)
    }
  },
  {
  path: "/reports",
  name: "Reports",
  component: ReportsPage,
  meta: { role: ['3','4','5'] }
},
  {
  path: "/company-forms/manage",
  name: "CompanyFormsManager",
  component: CompanyFormsManager,
  meta: { role: ['1','2','3','4','5'] } // المسؤولين
},

{
  path: "/company-forms",
  name: "EmployeeCompanyForms",
  component: EmployeeCompanyForms,
  meta: { role: ['6'] } // الموظفين
},
{
  path: "/financial-info/:publicId",
  name: "EmployeeFinancial",
  component: EmployeeFinancialPage,
  props: true // يمكن تمرير employeeId كـ prop
},
  { path: '/leaves', component: LeavesPage, meta: { role: ['5','2','3','4','6'] } },
  { path: "/employee-qualification", component: EmployeeQualification },

  { path: '/requests', component: RequestsPage, meta: { role: ['5','1','2','3','4','6'] } },
  { path: '/manager/leaves', component: ManagerLeavesPage, meta: { role: ['1','2','3','4','5'] } },
  
  { path: '/employees', component: () => import('../views/Employees.vue'), meta: { role:['1'] } },
 { 
  path: "/employees/:publicId",
  name: "EmployeeFullView",
  component: () => import("../views/EmployeeView.vue"),
  meta: { role: ['1','2','3','4','5','6'] }
},
  { path: '/employees/add', component: () => import('../views/AddEmployee.vue'), meta: { role: ['1'] } },
{
  path: "/admin-info/:publicId",
  name: "AdminInfo",
  component: AdminInfo,
  props: true // مهم جدًا
}

,
{
  path: "/employees/:publicId/edit-basic",
  name: "BasicInfo",
  component: BasicInfoPage,
  props: true
}
,
// Administrative Info
{
  path: "/employees/:publicId/edit-admin",
  name: "AdminInfo",
  component: AdminInfo,
  props: true
},

// Financial Info
{
  path: "/employees/:publicId/edit-financial",
  name: "EmployeeFinancial",
  component: EmployeeFinancialPage,
  props: true
},

  { path: "/departments-management", component: DepartmentsManagement, meta: { role: ['1'] } },

  { path: "/manager/complaints", component: ManagerComplaints, meta: { role: ['2','3','4'] } },

  { path: "/announcements", component: AnnouncementsPage, meta: { role: ['1','2','3','4'] } },

  { path: '/permissions', component: PermissionsPage, meta: { role: ['1'] } },

  { path: "/notifications", component: NotificationsPage },

  { path: "/complaints", component: ComplaintsPage, meta: { role: ['6'] } },

  { path: "/tasks", component: TasksPage, meta: { role: ['1','2','3','4','5','6'] } },



  { path: "/evaluation", component: EvaluationPage, meta: { role: ['1','2','3','4','5','6'] } },

  { path: "/knowledge", component: KnowledgePage, meta: { role: ['1','2','3','4','5','6'] } },

  { path: "/faq-mangement", component: FAQManagement, meta: { role: ['1','2'] } }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});


/* 🔥 الحارس المعدل لدعم تعدد الرولات */
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  const roles = JSON.parse(localStorage.getItem('roles') || '[]');

  if (to.meta.role) {

    if (!token || roles.length === 0) {
      alert('الرجاء تسجيل الدخول');
      return next('/');
    }

    // يتحقق لو عنده أي رول من المسموح
    const hasAccess = roles.some(r => 
      to.meta.role.includes(r.toString())
    );

    if (!hasAccess) {
      alert('غير مسموح بالدخول');
      return next('/dashboard');
    }

  }

  next();
});

export default router; 