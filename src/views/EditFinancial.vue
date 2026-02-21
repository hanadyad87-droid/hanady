<template>
  <div class="flex min-h-screen bg-background" dir="rtl">
    <!-- Sidebar ثابت -->
    <Sidebar class="fixed top-0 right-0 h-screen w-24 md:w-64 bg-primary text-white p-4 z-50" />

    <!-- المحتوى الرئيسي -->
    <div class="flex-1 p-6 min-h-screen mr-24 md:mr-64">
      <Navbar />

      <div class="bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
        <h2 class="text-2xl font-bold mb-6 text-right">تعديل البيانات المالية للموظف</h2>

        <!-- الفورم -->
        <div v-if="form">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <!-- المصرف -->
            <div class="flex flex-col">
              <label class="text-sm text-gray-600 mb-1">المصرف</label>
              <select v-model.number="form.bankId" class="input select-rtl">
                <option v-for="bank in banks" :key="bank.id" :value="bank.id">{{ bank.name }}</option>
              </select>
            </div>

            <!-- فرع المصرف -->
            <div class="flex flex-col">
              <label class="text-sm text-gray-600 mb-1">فرع المصرف</label>
              <select v-model.number="form.bankBranchId" class="input select-rtl">
                <option v-for="branch in filteredBranches" :key="branch.id" :value="branch.id">{{ branch.name }}</option>
              </select>
            </div>

            <!-- رقم الحساب -->
            <div class="flex flex-col">
              <label class="text-sm text-gray-600 mb-1">رقم الحساب</label>
              <input type="text" v-model="form.accountNumber" class="input" />
            </div>

            <!-- الرقم بالملاك الإداري -->
            <div class="flex flex-col">
              <label class="text-sm text-gray-600 mb-1">الرقم بالملاك الإداري</label>
              <input type="text" v-model="form.administrativeNumber" class="input" />
            </div>

            <!-- المرتب الأساسي -->
            <div class="flex flex-col">
              <label class="text-sm text-gray-600 mb-1">المرتب الأساسي</label>
              <input type="number" v-model.number="form.basicSalary" class="input" />
            </div>

            <!-- العلاوة -->
            <div class="flex flex-col">
              <label class="text-sm text-gray-600 mb-1">العلاوة</label>
              <input type="number" v-model.number="form.allowance" class="input" />
            </div>

            <!-- تاريخ الحصول على العلاوة -->
            <div class="flex flex-col">
              <label class="text-sm text-gray-600 mb-1">تاريخ الحصول عليها</label>
              <input type="date" v-model="form.allowanceDate" class="input" />
            </div>

            <!-- الدرجة الوظيفية -->
            <div class="flex flex-col">
              <label class="text-sm text-gray-600 mb-1">الدرجة الوظيفية</label>
              <select v-model.number="form.jobGradeId" class="input select-rtl">
                <option v-for="grade in jobGrades" :key="grade.id" :value="grade.id">{{ grade.name }}</option>
              </select>
            </div>

            <!-- تاريخ الحصول على الدرجة -->
            <div class="flex flex-col">
              <label class="text-sm text-gray-600 mb-1">تاريخ الحصول عليها</label>
              <input type="date" v-model="form.jobGradeDate" class="input" />
            </div>

          </div>

          <!-- زر الحفظ -->
          <div class="flex justify-center mt-6">
            <button @click="save" class="bg-primary hover:bg-primaryDark text-white py-2 px-6 rounded-lg">
              حفظ البيانات المالية
            </button>
          </div>
        </div>

        <!-- إشعار Toast -->
        <ToastPage v-if="toastMessage" :message="toastMessage" :type="toastType" @close="toastMessage = ''" />
      </div>
    </div>
  </div>
</template>

<script>
import api from "../services/api";
import Sidebar from "@/components/Sidebar.vue";
import Navbar from "@/components/Navbar.vue";
import ToastPage from "@/components/Toast.vue";

export default {
  name: "EditFinancial",
  components: { Sidebar, Navbar, ToastPage },
  data() {
    return {
      form: null,
      banks: [
        { id: 1, name: "الجمهورية" },
        { id: 2, name: "الصحاري" },
        { id: 3, name: "الأمان" },
        { id: 4, name: "النوران" },
        { id: 5, name: "الوحدة" }
      ],
      branches: [
        { id: 1, name: "فرع المركز", bankId: 1 },
        { id: 2, name: "فرع السوق", bankId: 1 },
        { id: 3, name: "فرع الشمال", bankId: 2 },
        { id: 4, name: "فرع الجنوب", bankId: 2 },
        { id: 5, name: "فرع الرئيسي", bankId: 3 },
        { id: 6, name: "فرع المدينة", bankId: 4 },
        { id: 7, name: "فرع الوحدة", bankId: 5 }
      ],
      jobGrades: [
        { id: 1, name: "درجة أولى" },
        { id: 2, name: "درجة ثانية" },
        { id: 3, name: "درجة ثالثة" }
      ],
      toastMessage: "",
      toastType: "success"
    };
  },
  computed: {
    filteredBranches() {
      return this.branches.filter(b => b.bankId === this.form?.bankId);
    }
  },
  async mounted() {
    const employeeId = Number(this.$route.params.id);
    await this.loadFinancial(employeeId);
  },
  methods: {
    async loadFinancial(employeeId) {
      try {
        const { data } = await api.get(`/EmployeeFinancial/employee/${employeeId}`);
        if (data) {
          this.form = {
            ...data,
            jobGradeDate: data.jobGradeDate?.substr(0, 10) || "",
            allowanceDate: data.allowanceDate?.substr(0, 10) || ""
          };
        }
      } catch (err) {
        this.showToast("خطأ في جلب البيانات المالية", "error");
        this.form = {
          employeeId: employeeId,
          bankId: 0,
          bankBranchId: 0,
          accountNumber: "",
          administrativeNumber: "",
          basicSalary: 0,
          jobGradeId: 0,
          jobGradeDate: "",
          allowance: 0,
          allowanceDate: ""
        };
      }
    },
    async save() {
      try {
        await api.put(`/EmployeeFinancial/employee/${this.form.employeeId}`, this.form);
        this.showToast("تم حفظ البيانات المالية بنجاح ✅", "success");
      } catch (err) {
        this.showToast("خطأ أثناء حفظ البيانات المالية ❌", "error");
        console.error(err);
      }
    },
    showToast(message, type = "success") {
      this.toastMessage = message;
      this.toastType = type;
      setTimeout(() => (this.toastMessage = ""), 3000);
    }
  }
};
</script>

<style scoped>
.input {
  width: 100%;
  border: 1px solid #ccc;
  padding: 8px;
  border-radius: 8px;
}
.bg-background {
  background-color: #f9fafb;
}
</style>
