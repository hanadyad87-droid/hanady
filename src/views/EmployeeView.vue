<template>
  <div class="flex min-h-screen bg-white font-cairo">
    
    <Sidebar class="fixed top-0 right-0 h-screen w-24 md:w-64 bg-navbar text-white p-4 z-50" />

    <div class="flex-1 p-6 min-h-screen mr-24 md:mr-64">
      <Navbar />

      <!-- Loading -->
      <div v-if="loading" class="text-center mt-20 text-lg text-gray-600">
        جاري تحميل البيانات...
      </div>

      <template v-else>

        <!-- شريط اسم الموظف -->
        <div v-if="employee.fullName"
             class="bg-white rounded-xl2 shadow-card p-6 mb-6 flex flex-col md:flex-row justify-between items-center text-right"
             dir="rtl">
          <div>
            <h1 class="text-3xl font-bold text-primary mb-2 md:mb-0">
              {{ employee.fullName }}
            </h1>
            <p class="text-gray-600">عرض معلومات الموظف</p>
          </div>
        </div>

        <!-- البطاقات -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          <!-- البيانات الأساسية -->
          <div v-if="employee"
               class="bg-white rounded-xl2 shadow-card p-6 text-right">
            <h3 class="text-lg font-semibold mb-4 border-b pb-1 text-primary">
              البيانات الأساسية
            </h3>

            <div class="grid gap-2">
              <div><strong>الاسم:</strong> {{ employee.fullName || '-' }}</div>
              <div><strong>الادارة:</strong> {{ employee.departmentName || '-' }}</div>
              <div><strong>رقم الهاتف 1:</strong> {{ employee.phone1 || '-' }}</div>
              <div><strong>رقم الهاتف 2:</strong> {{ employee.phone2 || '-' }}</div>
              <div><strong>الحالة الاجتماعية:</strong> {{ employee.maritalStatus || '-' }}</div>
            </div>

            <div class="mt-6 flex justify-center">
              <button @click="goToBasicEdit"
                      class="bg-primary text-white px-6 py-2 rounded-xl2">
                تعديل البيانات الأساسية
              </button>
            </div>
          </div>

          <!-- البيانات الإدارية -->
          <div v-if="administrative"
               class="bg-white rounded-xl2 shadow-card p-6 text-right">
            <h3 class="text-lg font-semibold mb-4 border-b pb-1 text-primary">
              البيانات الإدارية
            </h3>

            <div class="grid gap-2">
              <div><strong>الوظيفة:</strong> {{ administrative.jobTitle || '-' }}</div>
              <div><strong>الادارة:</strong> {{ administrative.department || '-' }}</div>
              <div><strong>الادارة الفرعية:</strong> {{ administrative.subDepartment || '-' }}</div>
              <div><strong>القسم:</strong> {{ administrative.section || '-' }}</div>
              <div><strong>تاريخ المباشرة:</strong> {{ formatDate(administrative.startWorkDate) }}</div>
              <div><strong>مكان العمل:</strong> {{ administrative.workLocation || '-' }}</div>
              <div><strong>رصيد الإجازات:</strong> {{ administrative.leaveBalance || '-' }}</div>
            </div>

            <div class="mt-6 flex justify-center">
              <button @click="goToAdminEdit"
                      class="bg-primary text-white px-6 py-2 rounded-xl2">
                تعديل البيانات الإدارية
              </button>
            </div>
          </div>

          <!-- البيانات المالية -->
          <div v-if="financial"
               class="bg-white rounded-xl2 shadow-card p-6 text-right">
            <h3 class="text-lg font-semibold mb-4 border-b pb-1 text-primary">
              البيانات المالية
            </h3>

            <div class="grid gap-2">
              <div><strong>المرتب الأساسي:</strong> {{ financial.basicSalary || '-' }}</div>
              <div><strong>العلاوات:</strong> {{ financial.allowance || '-' }}</div>
              <div><strong>رقم الحساب:</strong> {{ financial.accountNumber || '-' }}</div>
              <div><strong>المصرف:</strong> {{ getBankName(financial.bankId) }}</div>
              <div><strong>فرع المصرف:</strong> {{ getBankBranchName(financial.bankBranchId) }}</div>
            </div>

            <div class="mt-6 flex justify-center">
              <button @click="goToFinancialEdit"
                      class="bg-primary text-white px-6 py-2 rounded-xl2">
                تعديل البيانات المالية
              </button>
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
      financial: {}
    };
  },
async mounted() {
  const publicId = this.$route.params.publicId;

  try {
    await Promise.all([
      this.fetchEmployee(publicId),
      this.fetchAdministrative(publicId),
      this.fetchFinancial(publicId)
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
    const { data } = await api.get(
      `/EmployeeAdministrative/by-publicid/${publicId}`
    );
    this.administrative = data || {};
  } catch (error) {
    if (error.response?.status === 404) {
      // ما عنده بيانات إدارية → عادي
      this.administrative = {};
    } else {
      console.error("خطأ في البيانات الإدارية:", error);
    }
  }
},

    async fetchFinancial(publicId) {
  try {
    const { data } = await api.get(
      `/EmployeeFinancial/employee/${publicId}`
    );
    this.financial = data || {};
  } catch (error) {
    if (error.response?.status === 404) {
      // ما عنده بيانات مالية → عادي
      this.financial = {};
    } else {
      console.error("خطأ في البيانات المالية:", error);
    }
  }
},

    formatDate(dateStr) {
      if (!dateStr) return "-";
      return new Date(dateStr).toLocaleDateString("ar-LB");
    },

    getBankName(bankId) {
      const banks = [
        { id: 1, name: "الجمهورية" },
        { id: 2, name: "الصحاري" },
        { id: 3, name: "الأمان" },
        { id: 4, name: "النوران" },
        { id: 5, name: "الوحدة" }
      ];
      return banks.find(b => b.id === bankId)?.name || "-";
    },

    getBankBranchName(branchId) {
      const branches = [
        { id: 1, name: "فرع المركز" },
        { id: 2, name: "فرع السوق" },
        { id: 3, name: "فرع الشمال" },
        { id: 4, name: "فرع الجنوب" },
        { id: 5, name: "فرع الرئيسي" },
        { id: 6, name: "فرع المدينة" },
        { id: 7, name: "فرع الوحدة" }
      ];
      return branches.find(b => b.id === branchId)?.name || "-";
    },

    goToBasicEdit() {
      if (!this.employee.publicId) return;
      this.$router.push({
        name: "BasicInfo",
        params: { publicId: this.employee.publicId }
      });
    },

    goToAdminEdit() {
      if (!this.employee.publicId) return;
      this.$router.push({
        name: "AdminInfo",
        params: { publicId: this.employee.publicId }
      });
    },

    goToFinancialEdit() {
      if (!this.employee.publicId) return;
      this.$router.push({
        name: "EmployeeFinancial",
        params: { publicId: this.employee.publicId }
      });
    }
  }
};
</script>