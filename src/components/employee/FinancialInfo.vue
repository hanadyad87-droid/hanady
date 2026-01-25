<template>
  <div dir="rtl" class="w-full">

    <!-- العنوان -->
    <h3 class="text-xl font-bold mb-4 text-right text-blue-800">
      البيانات المالية
    </h3>

    <!-- اختيار الموظف + رقم الموظف -->
    <div class="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-end">

      <div>     
        <label class="text-sm text-gray-600 mb-1">اختر الموظف</label>
        <select v-model="selectedEmployee" class="input text-left pr-2">
          <option :value="null">-- اختر الموظف --</option>
          <option v-for="e in employees" :key="e.id" :value="e">
            {{ e.fullName }}
          </option>
        </select>
      </div>

      <div>
        <label class="text-sm text-gray-600 mb-1">رقم الموظف (ID)</label>
        <input
          type="text"
          v-model="employeeId"
          class="input bg-gray-100"
          readonly
          placeholder="رقم الموظف يظهر هنا"
        />
      </div>

    </div>

    <!-- الفورم -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

      <div class="flex flex-col">
        <label class="text-sm text-gray-600 mb-1">المرتب الأساسي</label>
        <input
          type="number"
          v-model.number="form.basicSalary"
          class="input"
          :disabled="!canAdd"
        />
      </div>

      <div class="flex flex-col">
        <label class="text-sm text-gray-600 mb-1">البدلات</label>
        <input
          type="number"
          v-model.number="form.allowances"
          class="input"
          :disabled="!canAdd"
        />
      </div>

      <div class="flex flex-col">
        <label class="text-sm text-gray-600 mb-1">الاستقطاعات</label>
        <input
          type="number"
          v-model.number="form.deductions"
          class="input"
          :disabled="!canAdd"
        />
      </div>

      <div class="flex flex-col">
        <label class="text-sm text-gray-600 mb-1">المصرف</label>
        <select
          v-model.number="form.bankId"
          class="input select-rtl"
          :disabled="!canAdd"
        >
          <option :value="null">اختر المصرف</option>
          <option :value="1">مصرف الجمهورية</option>
          <option :value="2">مصرف الصحاري</option>
        </select>
      </div>

      <div class="flex flex-col sm:col-span-2">
        <label class="text-sm text-gray-600 mb-1">فرع المصرف</label>
        <select
          v-model.number="form.bankBranchId"
          class="input select-rtl"
          :disabled="!canAdd"
        >
          <option :value="null">اختر الفرع</option>
          <option :value="1">فرع طرابلس</option>
          <option :value="2">فرع بنغازي</option>
        </select>
      </div>

    </div>

    <!-- زر الحفظ -->
    <div class="flex justify-center mt-8">
      <button
        @click="save"
        :disabled="!canAdd"
        class="bg-primary hover:bg-primaryDark disabled:bg-gray-400 text-white py-2 px-6 rounded-lg transition w-full max-w-xs"
      >
        حفظ البيانات المالية
      </button>
    </div>

    <!-- Toast -->
    <Toast v-if="toastMessage" :message="toastMessage" :type="toastType" />

  </div>
</template>

<script>
import api from "../../services/api";
import Toast from "../Toast.vue";

export default {
  name: "EmployeeFinancial",
  components: { Toast },
  data() {
    return {
      employees: [],
      selectedEmployee: null,
      employeeId: null,
      hasFinancialData: false,

      form: {
        employeeId: null,
        basicSalary: null,
        allowances: null,
        deductions: null,
        bankId: null,
        bankBranchId: null
      },

      toastMessage: "",
      toastType: "success"
    };
  },
  computed: {
    canAdd() {
      return this.selectedEmployee && !this.hasFinancialData;
    }
  },
  watch: {
    async selectedEmployee(newVal) {
      this.employeeId = newVal ? newVal.id : null;
      this.form.employeeId = this.employeeId;
      this.hasFinancialData = false;

      if (newVal) {
        await this.checkFinancialData(newVal.id);
      }
    }
  },
  async mounted() {
    await this.fetchEmployees();
  },
  methods: {
    async fetchEmployees() {
      try {
        const res = await api.get("/Employee/all");
        this.employees = res.data;
      } catch (err) {
        this.showToast("خطأ في جلب قائمة الموظفين", "error");
      }
    },

    async checkFinancialData(employeeId) {
      try {
        await api.get(`/EmployeeFinancial/by-employee/${employeeId}`);
        // البيانات موجودة → يمنع الإدخال
        this.hasFinancialData = true;
        this.showToast(
          "⚠️ هذا الموظف لديه بيانات مالية مسجلة مسبقًا",
          "warning"
        );
      } catch (err) {
        // 404 → ما عندهش بيانات → يقدر يدخل
        if (err.response?.status && err.response.status !== 404) {
          this.showToast("خطأ أثناء التحقق من البيانات", "error");
        }
      }
    },

    async save() {
      if (!this.selectedEmployee) {
        this.showToast("الرجاء اختيار الموظف أولاً", "error");
        return;
      }

      // التحقق من الحقول المطلوبة
      if (
        !this.form.basicSalary ||
        this.form.bankId === null ||
        this.form.bankBranchId === null
      ) {
        this.showToast("الرجاء ملء جميع الحقول المطلوبة ❌", "error");
        return;
      }

      if (this.hasFinancialData) {
        this.showToast(
          "❌ لا يمكن إضافة بيانات مالية لموظف لديه بيانات مسبقًا",
          "error"
        );
        return;
      }

      try {
        const res = await api.post("/EmployeeFinancial", this.form);
        this.showToast("تم حفظ البيانات المالية بنجاح ✅", "success");
        this.resetForm();
        console.log(res.data);
      } catch (err) {
        this.showToast(  "❌ لا يمكن إضافة بيانات مالية لموظف لديه بيانات مسبقًا", "error");
        console.error(err);
      }
    },

    resetForm() {
      this.form = {
        employeeId: this.employeeId,
        basicSalary: null,
        allowances: null,
        deductions: null,
        bankId: null,
        bankBranchId: null
      };
    },

    showToast(message, type) {
      this.toastMessage = message;
      this.toastType = type;
      setTimeout(() => (this.toastMessage = ""), 3000);
    }
  }
};
</script>

<style scoped>
.input {
  @apply p-2 border rounded-lg;
}
</style>
