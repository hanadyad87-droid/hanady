<template>
  <div class="flex min-h-screen bg-background">
    <!-- Sidebar -->
    <Sidebar class="fixed top-0 right-0 h-screen w-24 md:w-64 bg-primary text-white p-4 z-50" />

    <!-- المحتوى -->
    <div class="flex-1 p-6 min-h-screen mr-24 md:mr-64">
      <Navbar />

      <!-- شريط اسم الموظف + زر الطباعة -->
      <div v-if="employee" class="bg-white rounded-2xl shadow-lg p-6 mb-6 flex flex-col md:flex-row justify-between items-center text-right" dir="rtl">
        <div>
          <h1 class="text-3xl font-bold text-primary mb-2 md:mb-0">{{ employee.fullName }}</h1>
          <p class="text-gray-600">عرض معلومات الموظف</p>
        </div>

        <!-- زر الطباعة -->
        <button 
          @click="printEmployee"
          class="bg-primary hover:bg-primaryDark text-white px-4 py-2 rounded-lg transition-colors shadow mt-4 md:mt-0"
        >
          🖨️ طباعة
        </button>
      </div>

      <!-- البطائق الرئيسية -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- البيانات الأساسية -->
        <div v-if="employee" class="p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300" dir="rtl">
          <h3 class="text-lg font-semibold mb-2 text-right border-b pb-1 text-primary">البيانات الأساسية</h3>
          <div class="grid grid-cols-1 gap-2 text-right">
            <div><strong>الاسم:</strong> {{ employee.fullName || '-' }}</div>
            <div><strong>القسم:</strong> {{ employee.department || '-' }}</div>
            <div><strong>الوظيفة:</strong> {{ employee.jobTitle || '-' }}</div>
            <div><strong>الموقع:</strong> {{ employee.workLocation || '-' }}</div>
            <div><strong>الحالة الوظيفية:</strong> {{ employee.employmentStatus || '-' }}</div>
            <div><strong>الحالة الاجتماعية:</strong> {{ employee.maritalStatus || '-' }}</div>
            <div><strong>الدرجة الوظيفية:</strong> {{ employee.jobGrade || '-' }}</div>
          </div>
        </div>

        <!-- البيانات الإدارية -->
        <div v-if="administrative" class="p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300" dir="rtl">
          <h3 class="text-lg font-semibold mb-2 text-right border-b pb-1 text-primary">البيانات الإدارية</h3>
          <div class="grid grid-cols-1 gap-2 text-right">
            <div><strong>نوع العقد:</strong> {{ administrative.contractType || '-' }}</div>
            <div><strong>رقم الملف:</strong> {{ administrative.fileNumber || '-' }}</div>
            <div><strong>تاريخ بدء العقد:</strong> {{ formatDate(administrative.contractStartDate) }}</div>
            <div><strong>تاريخ انتهاء العقد:</strong> {{ formatDate(administrative.contractEndDate) }}</div>
          </div>
        </div>

        <!-- البيانات المالية -->
        <div v-if="financial" class="p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300" dir="rtl">
          <h3 class="text-lg font-semibold mb-2 text-right border-b pb-1 text-primary">البيانات المالية</h3>
          <div class="grid grid-cols-1 gap-2 text-right">
            <div><strong>المرتب الأساسي:</strong> {{ financial.basicSalary || '-' }}</div>
            <div><strong>البدلات:</strong> {{ financial.allowances || '-' }}</div>
            <div><strong>الاستقطاعات:</strong> {{ financial.deductions || '-' }}</div>
            <div><strong>المصرف:</strong> {{ financial.bankName || '-' }}</div>
            <div><strong>فرع المصرف:</strong> {{ financial.bankBranchName || '-' }}</div>
          </div>
        </div>
      </div>

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
        this.employee = data.find(e => e.id === id) || null;
      } catch (err) {
        console.error("خطأ في جلب بيانات الموظف:", err);
        this.employee = null;
      }
    },

    async fetchAdministrative(id) {
      try {
        const { data } = await api.get('/EmployeeAdministrative/get-all');
        this.administrative = data.find(e => e.employeeId === id) || null;
      } catch (err) {
        console.error("خطأ في البيانات الإدارية:", err);
        this.administrative = null;
      }
    },

    async fetchFinancial(id) {
      try {
        const { data } = await api.get('/EmployeeFinancial/get-all');
        const fin = data.find(e => e.employeeId === id) || null;
        if (fin) {
          this.financial = {
            ...fin,
            bankBranchName: fin.bankBranch || null
          };
        } else this.financial = null;
      } catch (err) {
        console.error("خطأ في البيانات المالية:", err);
        this.financial = null;
      }
    },

    async fetchLeaves(id) {
      try {
        const { data } = await api.get(`/LeaveRequest/employee/${id}`);
        this.leaves = data.map(l => ({ ...l, status: l.status || "قيد_الانتظار" }));
      } catch (err) {
        console.error("خطأ في جلب الإجازات:", err);
        this.leaves = [];
      }
    },

    formatDate(dateStr) {
      if (!dateStr) return "-";
      return new Date(dateStr).toLocaleDateString("ar-LB");
    },

    printEmployee() {
      const printContent = this.$el.innerHTML;
      const originalContent = document.body.innerHTML;
      document.body.innerHTML = printContent;
      window.print();
      document.body.innerHTML = originalContent;
      window.location.reload(); // لإعادة تحميل Vue بعد الطباعة
    }
  }
};
</script>

<style scoped>
.bg-background {
  background-color: #f9fafb;
}
.text-primary {
  color: #1e40af; /* نفس لون العناوين في باقي الصفحات */
}
.card:hover {
  transform: translateY(-2px);
}
</style>
