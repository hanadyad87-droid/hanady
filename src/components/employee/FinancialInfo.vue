<template>
  <div dir="rtl" class="w-full">

    <h3 class="text-xl font-bold mb-4 text-right text-black-800">
      البيانات المالية
    </h3>

    <!-- اختيار الموظف -->
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
        <label class="text-sm text-gray-600 mb-1">المصرف</label>
        <select v-model.number="form.bankId" class="input select-rtl" :disabled="!canEdit">
         
          <option v-for="bank in banks" :key="bank.id" :value="bank.id">{{ bank.name }}</option>
        </select>
      </div>

      <div class="flex flex-col">
        <label class="text-sm text-gray-600 mb-1">فرع المصرف</label>
        <select v-model.number="form.bankBranchId" class="input select-rtl" :disabled="!canEdit">
        
          <option v-for="branch in filteredBranches" :key="branch.id" :value="branch.id">{{ branch.name }}</option>
        </select>
      </div>

      <div class="flex flex-col">
        <label class="text-sm text-gray-600 mb-1">رقم الحساب</label>
        <input type="text" v-model="form.accountNumber" class="input" :disabled="!canEdit"/>
      </div>

      <div class="flex flex-col">
        <label class="text-sm text-gray-600 mb-1">الرقم بالملاك الإداري</label>
        <input type="text" v-model="form.administrativeNumber" class="input" :disabled="!canEdit"/>
      </div>

      <div class="flex flex-col">
        <label class="text-sm text-gray-600 mb-1">المرتب الأساسي</label>
        <input type="number" v-model.number="form.basicSalary" class="input" :disabled="!canEdit" />
      </div>

      <div class="flex flex-col">
        <label class="text-sm text-gray-600 mb-1">الدرجة الوظيفية</label>
        <select v-model.number="form.jobGradeId" class="input select-rtl" :disabled="!canEdit">
         
          <option v-for="grade in jobGrades" :key="grade.id" :value="grade.id">{{ grade.name }}</option>
        </select>
      </div>

      <div class="flex flex-col">
        <label class="text-sm text-gray-600 mb-1">تاريخ الحصول عليها</label>
        <input type="date" v-model="form.jobGradeDate" class="input" :disabled="!canEdit" />
      </div>

      <div class="flex flex-col">
        <label class="text-sm text-gray-600 mb-1">العلاوة</label>
        <input type="number" v-model.number="form.allowance" class="input" :disabled="!canEdit" />
      </div>

      <div class="flex flex-col">
        <label class="text-sm text-gray-600 mb-1">تاريخ الحصول عليها</label>
        <input type="date" v-model="form.allowanceDate" class="input" :disabled="!canEdit" />
      </div>

      <div class="flex flex-col">
        <label class="text-sm text-gray-600 mb-1">المربوط الحالي</label>
        <input type="number" v-model.number="form.currentLinkedSalary" class="input" :disabled="!canEdit" />
      </div>

      <div class="flex flex-col">
        <label class="text-sm text-gray-600 mb-1">تاريخ الحصول عليه</label>
        <input type="date" v-model="form.currentLinkedSalaryDate" class="input" :disabled="!canEdit" />
      </div>

      <div class="flex flex-col">
        <label class="text-sm text-gray-600 mb-1">الدرجة المنتدب إليها</label>
        <select v-model.number="form.delegatedGradeId" class="input select-rtl" :disabled="!canEdit">
         
          <option v-for="grade in jobGrades" :key="grade.id" :value="grade.id">{{ grade.name }}</option>
        </select>
      </div>

      <div class="flex flex-col">
        <label class="text-sm text-gray-600 mb-1">تاريخ الحصول عليها</label>
        <input type="date" v-model="form.delegatedGradeDate" class="input" :disabled="!canEdit" />
      </div>

    </div>

    <!-- زر الحفظ -->
    <div class="flex justify-center mt-8">
      <button
        @click="save"
        :disabled="!canEdit"
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
      form: {
        employeeId: 0,
        bankId: 0,
        bankBranchId: 0,
        accountNumber: "",
        administrativeNumber: "",
        basicSalary: 0,
        jobGradeId: 0,
        jobGradeDate: "",
        allowance: 0,
        allowanceDate: "",
        currentLinkedSalary: 0,
        currentLinkedSalaryDate: "",
        delegatedGradeId: 0,
        delegatedGradeDate: ""
      },
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
    canEdit() {
      return this.selectedEmployee !== null;
    },
    filteredBranches() {
      return this.branches.filter(b => b.bankId === this.form.bankId);
    }
  },

  watch: {
    async selectedEmployee(newVal) {
      this.employeeId = newVal ? newVal.id : 0;
      this.form.employeeId = this.employeeId;

      if (newVal) {
        await this.loadFinancialData(newVal.id);
      } else {
        this.resetForm();
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
        this.employees = res.data || [];
      } catch (err) {
        this.showToast("خطأ في جلب قائمة الموظفين", "error");
      }
    },

    async loadFinancialData(employeeId) {
      try {
        const res = await api.get(`/EmployeeFinancial/employee/${employeeId}`);
        if (res.data) {
          const data = {
            ...res.data,
            jobGradeDate: res.data.jobGradeDate?.substr(0,10) || "",
            allowanceDate: res.data.allowanceDate?.substr(0,10) || "",
            currentLinkedSalaryDate: res.data.currentLinkedSalaryDate?.substr(0,10) || "",
            delegatedGradeDate: res.data.delegatedGradeDate?.substr(0,10) || ""
          };
          this.form = { ...this.form, ...data };
          this.showToast("⚠️ هذا الموظف لديه بيانات مالية مسبقة", "warning");
        }
      } catch (err) {
        if (err.response?.status === 404) this.resetForm();
        else this.showToast("خطأ أثناء جلب البيانات المالية", "error");
      }
    },

    toISOStringSafe(date) {
      return date ? new Date(date).toISOString() : null;
    },

    async save() {
      if (!this.selectedEmployee) {
        this.showToast("الرجاء اختيار الموظف أولاً", "error");
        return;
      }

      const payload = {
        ...this.form,
        jobGradeDate: this.toISOStringSafe(this.form.jobGradeDate),
        allowanceDate: this.toISOStringSafe(this.form.allowanceDate),
        currentLinkedSalaryDate: this.toISOStringSafe(this.form.currentLinkedSalaryDate),
        delegatedGradeDate: this.toISOStringSafe(this.form.delegatedGradeDate)
      };

      try {
        await api.post("/EmployeeFinancial/create-or-update", payload);
        this.showToast("تم حفظ البيانات المالية بنجاح ✅", "success");

  // بعد الحفظ، نمسح الفورم
    this.resetForm();
    this.selectedEmployee = null;
    this.employeeId = null;

      } catch (err) {
        this.showToast("خطأ أثناء حفظ البيانات المالية ❌", "error");
        console.error(err);
      }
    },

    resetForm() {
      this.form = {
        employeeId: this.employeeId,
        bankId: 0,
        bankBranchId: 0,
        accountNumber: "",
        administrativeNumber: "",
        basicSalary: 0,
        jobGradeId: 0,
        jobGradeDate: "",
        allowance: 0,
        allowanceDate: "",
        currentLinkedSalary: 0,
        currentLinkedSalaryDate: "",
        delegatedGradeId: 0,
        delegatedGradeDate: ""
      };
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
  @apply p-2 border rounded-lg;
}
</style>
