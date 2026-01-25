<template>
  <div class="flex min-h-screen bg-background">
    <Sidebar class="fixed top-0 right-0 h-screen w-24 md:w-64 bg-primary text-white p-4 z-50" />
    <div class="flex-1 p-6 min-h-screen mr-24 md:mr-64">

      <Navbar />

      <!-- تأكد إن employee موجود -->
      <div v-if="employee">
        <!-- العنوان -->
        <div class="bg-white rounded-xl shadow-lg p-6 mb-6 max-w-6xl mx-auto text-right">
          <h2 class="text-2xl font-bold">{{ employee.fullName }}</h2>
          <p class="text-gray-500 mt-1">عرض معلومات الموظف والإجازات</p>
        </div>

        <!-- بيانات الموظف الأساسية -->
        <div class="bg-white rounded-xl shadow-lg p-6 mb-6 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 text-right">
          <div v-if="employee.fullName"><strong>الاسم:</strong> {{ employee.fullName }}</div>
          <div v-if="employee.employeeNumber"><strong>الرقم الوظيفي:</strong> {{ employee.employeeNumber }}</div>
          <div v-if="employee.department"><strong>القسم:</strong> {{ employee.department }}</div>
          <div v-if="employee.jobTitle"><strong>الوظيفة:</strong> {{ employee.jobTitle }}</div>
          <div v-if="employee.workLocation"><strong>الموقع:</strong> {{ employee.workLocation }}</div>
          <div v-if="employee.employmentStatus"><strong>الحالة:</strong> {{ employee.employmentStatus }}</div>
          <div v-if="employee.maritalStatus"><strong>الحالة الاجتماعية:</strong> {{ employee.maritalStatus }}</div>
          <div v-if="employee.jobGrade"><strong>الدرجة الوظيفية:</strong> {{ employee.jobGrade }}</div>
        </div>

        <!-- البيانات الإدارية -->
        <div v-if="administrative" class="bg-white rounded-xl shadow-lg p-6 mb-6 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 text-right">
          <h3 class="text-xl font-bold col-span-2 mb-4">البيانات الإدارية</h3>
          <div v-if="administrative.contractType"><strong>نوع العقد:</strong> {{ administrative.contractType }}</div>
          <div v-if="administrative.fileNumber"><strong>رقم الملف:</strong> {{ administrative.fileNumber }}</div>
          <div v-if="administrative.contractStartDate"><strong>تاريخ بدء العقد:</strong> {{ formatDate(administrative.contractStartDate) }}</div>
          <div v-if="administrative.contractEndDate"><strong>تاريخ انتهاء العقد:</strong> {{ formatDate(administrative.contractEndDate) }}</div>
        </div>

        <!-- البيانات المالية -->
        <div v-if="financial" class="bg-white rounded-xl shadow-lg p-6 mb-6 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 text-right">
          <h3 class="text-xl font-bold col-span-2 mb-4">البيانات المالية</h3>
          <div v-if="financial.basicSalary"><strong>المرتب الأساسي:</strong> {{ financial.basicSalary }}</div>
          <div v-if="financial.allowances"><strong>البدلات:</strong> {{ financial.allowances }}</div>
          <div v-if="financial.deductions"><strong>الاستقطاعات:</strong> {{ financial.deductions }}</div>
          <div v-if="financial.bankName"><strong>المصرف:</strong> {{ financial.bankName }}</div>
          <div v-if="financial.bankBranchName"><strong>فرع المصرف:</strong> {{ financial.bankBranchName }}</div>
        </div>

        <!-- جدول الإجازات -->
        <div v-if="leaves.length > 0" class="bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto mt-4">
          <h3 class="font-bold text-right mb-3">إجازات الموظف</h3>
          <table class="w-full border text-sm text-center">
            <thead class="bg-gray-100">
              <tr>
                <th class="border p-1">من</th>
                <th class="border p-1">إلى</th>
                <th class="border p-1">عدد الأيام</th>
                <th class="border p-1">الحالة</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="leave in leaves" :key="leave.id">
                <td class="border p-1">{{ formatDate(leave.fromDate) }}</td>
                <td class="border p-1">{{ formatDate(leave.toDate) }}</td>
                <td class="border p-1">{{ leave.totalDays }}</td>
                <td class="border p-1" :class="{
                  'text-orange-500': leave.status === 'قيد_الانتظار',
                  'text-green-500': leave.status !== 'قيد_الانتظار'
                }">{{ leave.status?.replace('_', ' ') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="text-center text-gray-500 mt-4">لا توجد إجازات</div>
      </div>

      <!-- Loading message -->
      <div v-else class="text-center p-6 text-gray-500">جارٍ تحميل بيانات الموظف...</div>
    </div>
  </div>
</template>

<script>
import Sidebar from "../components/Sidebar.vue";
import Navbar from "../components/Navbar.vue";
import api from "../services/api";

export default {
  name: "EmployeeFullView",
  components: { Sidebar, Navbar },

  data() {
    return {
      employee: null,
      administrative: null,
      financial: null,
      leaves: []
    };
  },

  async mounted() {
    const id = Number(this.$route.params.id);
    await this.fetchEmployee(id);
    await this.fetchAdministrative(id);
    await this.fetchFinancial(id);
    await this.fetchLeaves(id);
  },

  methods: {
    async fetchEmployee(id) {
      try {
        const { data } = await api.get('/Employee/all');
        const emp = data.find(e => e.id === id);
        if (emp) this.employee = emp;
      } catch (err) {
        console.error("خطأ في جلب بيانات الموظف:", err);
      }
    },

    async fetchAdministrative(id) {
      try {
        const { data } = await api.get(`/EmployeeAdministrative/by-employee/${id}`);
        this.administrative = data || null;
      } catch (err) {
        this.administrative = null;
      }
    },

    async fetchFinancial(id) {
      try {
        const { data } = await api.get(`/EmployeeFinancial/by-employee/${id}`);
        this.financial = {
          ...data,
          bankName: data.bankName || null,
          bankBranchName: data.bankBranchName || null
        };
      } catch (err) {
        this.financial = null;
      }
    },

    async fetchLeaves(id) {
      try {
        const { data } = await api.get(`/LeaveRequest/employee/${id}`);
        this.leaves = data.map(l => ({
          ...l,
          status: l.status || "قيد_الانتظار"
        }));
      } catch (err) {
        console.error("خطأ في جلب الإجازات:", err);
        this.leaves = [];
      }
    },

    formatDate(dateStr) {
      if (!dateStr) return "-";
      const d = new Date(dateStr);
      return d.toLocaleDateString("ar-LB");
    }
  }
};
</script>

<style scoped>
.input {
  @apply p-2 border rounded-lg;
}
</style>
