<template>
  <div class="flex min-h-screen bg-gray-50 font-cairo" dir="rtl">
    <Sidebar />

    <div class="flex-1 w-full min-w-0 p-4 sm:p-6 mr-0 lg:mr-60">
      <Navbar />

      <div v-if="loading" class="text-center mt-20 text-primary animate-pulse font-bold">
        جاري تحميل بيانات الموظف...
      </div>

      <template v-else>
        <div class="flex justify-between items-center mb-8 mt-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-[#E9F5DB] text-primary rounded-xl flex items-center justify-center text-xl font-bold shadow-sm">
              {{ employee.fullName ? employee.fullName.charAt(0) : '?' }}
            </div>
            <div>
              <h1 class="text-xl font-bold text-gray-800">{{ employee.fullName }}</h1>
              <p class="text-gray-400 text-xs">ملف الموظف الشامل</p>
            </div>
          </div>
          <button @click="$router.go(-1)" class="text-gray-400 hover:text-primary transition-colors flex items-center gap-1 text-sm font-semibold">
            <span>رجوع</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative">
            <button @click="goToBasicEdit" class="absolute top-4 left-4 p-2 text-gray-300 hover:text-primary hover:bg-gray-50 rounded-full transition-all" title="تعديل">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
              </svg>
            </button>

            <h3 class="font-bold text-gray-800 border-r-4 border-primary pr-3 mb-6">البيانات الأساسية</h3>
            
            <div class="space-y-4">
              <div class="flex flex-col">
                <span class="text-xs text-gray-400 mb-0.5">الاسم الكامل</span>
                <span class="text-gray-700 font-medium">{{ employee.fullName || '-' }}</span>
              </div>
              <div class="flex flex-col">
                <span class="text-xs text-gray-400 mb-0.5">اسم الأم</span>
                <span class="text-gray-700 font-medium">{{ employee.motherName || '-' }}</span>
              </div>
              <div class="flex flex-col">
                <span class="text-xs text-gray-400 mb-0.5">البريد الإلكتروني</span>
                <span class="text-gray-700 font-medium truncate">{{ employee.email || '-' }}</span>
              </div>
              <div class="flex flex-col">
                <span class="text-xs text-gray-400 mb-0.5">الحالة الاجتماعية</span>
                <span class="text-gray-700 font-medium">{{ employee.maritalStatus || '-' }}</span>
              </div>
              <div class="flex flex-col">
                <span class="text-xs text-gray-400 mb-0.5">رقم الهاتف</span>
                <span class="text-gray-700 font-medium">{{ employee.phone1 || '-' }}</span>
              </div>
              <div class="flex flex-col">
                <span class="text-xs text-gray-400 mb-0.5">موقع العمل</span>
                <span class="text-gray-700 font-medium">{{ administrative.workLocationName || '-' }}</span>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative">
            <button @click="goToAdminEdit" class="absolute top-4 left-4 p-2 text-gray-300 hover:text-orange-600 hover:bg-gray-50 rounded-full transition-all" title="تعديل">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
              </svg>
            </button>

            <h3 class="font-bold text-gray-800 border-r-4 border-orange-600 pr-3 mb-6">البيانات الإدارية</h3>
            
            <div class="space-y-4">
              <div class="flex flex-col">
                <span class="text-xs text-gray-400 mb-0.5">الإدارة</span>
                <span class="text-gray-700 font-medium">{{ administrative.departmentName || '-' }}</span>
              </div>
              <div class="flex flex-col">
                <span class="text-xs text-gray-400 mb-0.5">القسم</span>
                <span class="text-gray-700 font-medium">{{ administrative.sectionName || '-' }}</span>
              </div>
              <div class="flex flex-col">
                <span class="text-xs text-gray-400 mb-0.5">الإدارة الفرعية</span>
                <span class="text-gray-700 font-medium">{{ administrative.subDepartmentName || '-' }}</span>
              </div>
              <div class="flex flex-col">
                <span class="text-xs text-gray-400 mb-0.5">الدرجة</span>
                <span class="text-gray-700 font-medium">{{ administrative.jobGradeName || '-' }}</span>
              </div>
              <div class="flex flex-col">
                <span class="text-xs text-gray-400 mb-0.5">رصيد الإجازات</span>
                <span class="text-orange-600 font-bold">{{ administrative.leaveBalance || 0 }} يوم</span>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative">
            <button @click="goToFinancialEdit" class="absolute top-4 left-4 p-2 text-gray-300 hover:text-blue-600 hover:bg-gray-50 rounded-full transition-all" title="تعديل">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
              </svg>
            </button>

            <h3 class="font-bold text-gray-800 border-r-4 border-blue-600 pr-3 mb-6">البيانات المالية</h3>
            
            <div class="space-y-4">
              <div class="flex justify-between items-end border-b border-gray-50 pb-3">
                <div class="flex flex-col">
                  <span class="text-xs text-gray-400 mb-0.5">المرتب الأساسي</span>
                  <span class="text-gray-900 font-bold text-lg">{{ financial.basicSalary || 0 }} د.ل</span>
                </div>
                <div class="flex flex-col items-end">
                  <span class="text-xs text-gray-400 mb-0.5">العلاوة</span>
                  <span class="text-blue-600 font-bold">{{ financial.allowance || 0 }} د.ل</span>
                </div>
              </div>
              <div class="flex flex-col">
                <span class="text-xs text-gray-400 mb-0.5">رقم الحساب</span>
                <span class="text-gray-700 font-medium">{{ financial.accountNumber || '-' }}</span>
              </div>
              <div class="flex flex-col">
                <span class="text-xs text-gray-400 mb-0.5">المصرف</span>
                <span class="text-gray-700 font-medium">{{ getBankName(financial.bankId) }}</span>
              </div>
              <div class="flex flex-col">
                <span class="text-xs text-gray-400 mb-0.5">المصرف الفرعي</span>
                <span class="text-gray-700 font-medium">{{ getBankBranchName(financial.bankBranchId) }}</span>
              </div>
            </div>
          </div>

        </div>
      </template>
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
      loading: true,
      employee: {},
      administrative: {},
      financial: {},
      banks: [],
      branches: []
    };
  },

  async mounted() {
    const publicId = this.$route.params.publicId;
    try {
      await Promise.all([
        this.fetchEmployee(publicId),
        this.fetchAdministrative(publicId),
        this.fetchFinancial(publicId),
        this.fetchBanks(),
        this.fetchBranches()
      ]);
    } finally {
      this.loading = false;
    }
  },

  methods: {
    async fetchEmployee(id) {
      const { data } = await api.get(`/Employee/details/${id}`);
      this.employee = data || {};
    },
    async fetchAdministrative(publicId) {
      try {
        const { data } = await api.get(`/EmployeeAdministrative/by-publicid/${publicId}`);
        this.administrative = data || {};
      } catch { this.administrative = {}; }
    },
    async fetchFinancial(publicId) {
      try {
        const { data } = await api.get(`/EmployeeFinancial/employee/${publicId}`);
        this.financial = data || {};
      } catch { this.financial = {}; }
    },
    async fetchBanks() {
      try {
        const { data } = await api.get("/Bank");
        this.banks = data || [];
      } catch { this.banks = []; }
    },
    async fetchBranches() {
      try {
        const { data } = await api.get("/BankBranch");
        this.branches = data || [];
      } catch { this.branches = []; }
    },
    getBankName(id) {
      return this.banks.find(b => b.id === id)?.name || "-";
    },
    getBankBranchName(id) {
      return this.branches.find(b => b.id === id)?.name || "-";
    },
    goToBasicEdit() {
      this.$router.push({ name: "BasicInfo", params: { publicId: this.employee.publicId } });
    },
    goToAdminEdit() {
      this.$router.push({ name: "AdminInfo", params: { publicId: this.employee.publicId } });
    },
    goToFinancialEdit() {
      this.$router.push({ name: "EmployeeFinancial", params: { publicId: this.employee.publicId } });
    }
  }
};
</script>