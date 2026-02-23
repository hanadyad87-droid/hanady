<template>
  <div class="flex min-h-screen bg-gray-100">
    <Sidebar class="fixed top-0 right-0 h-screen w-24 md:w-64 z-50" />

    <div class="flex-1 p-6 min-h-screen mr-24 md:mr-64">
      <Navbar />

      <div class="bg-white p-6 rounded-xl shadow max-w-4xl mx-auto mt-6">
        <h3 class="text-xl font-bold">البيانات المالية</h3>

        <!-- معلومات الموظف -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label class="label">اسم الموظف</label>
            <input type="text" v-model="employeeName" class="input bg-gray-100" readonly />
          </div>
          <div>
            <label class="label">رقم الموظف</label>
            <input type="text" v-model="employeeNumber" class="input bg-gray-100" readonly />
          </div>
        </div>

        <!-- البيانات المالية -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">

          <div>
            <label class="label">البنك</label>
            <select v-model.number="form.bankId" class="input">
              <option :value="null">اختر</option>
              <option v-for="b in banks" :key="b.id" :value="b.id">{{ b.name }}</option>
            </select>
          </div>

          <div>
            <label class="label">فرع البنك</label>
            <select v-model.number="form.bankBranchId" class="input">
              <option :value="null">اختر</option>
              <option v-for="br in bankBranches" :key="br.id" :value="br.id">{{ br.name }}</option>
            </select>
          </div>

          <div>
            <label class="label">رقم الحساب</label>
            <input type="text" v-model="form.accountNumber" class="input" />
          </div>

          <div>
            <label class="label">رقم الحساب الجديد</label>
            <input type="text" v-model="form.newAccountNumber" class="input" />
          </div>

          <div>
            <label class="label">الرقم الإداري</label>
            <input type="text" v-model="form.administrativeNumber" class="input" />
          </div>

          <div>
            <label class="label">الراتب الأساسي</label>
            <input type="number" v-model.number="form.basicSalary" class="input" />
          </div>

          <div>
            <label class="label">الدرجة الوظيفية</label>
            <select v-model.number="form.jobGradeId" class="input">
              <option :value="null">اختر</option>
              <option v-for="g in jobGrades" :key="g.id" :value="g.id">{{ g.name }}</option>
            </select>
          </div>

          <div>
            <label class="label">تاريخ الدرجة</label>
            <input type="date" v-model="form.jobGradeDate" class="input" />
          </div>

          <div>
            <label class="label">العلاوة</label>
            <input type="number" v-model.number="form.allowance" class="input" />
          </div>

          <div>
            <label class="label">تاريخ الحصول عليها</label>
            <input type="date" v-model="form.allowanceDate" class="input" />
          </div>

          <div>
            <label class="label"> المربوط الحالي</label>
            <input type="number" v-model.number="form.currentLinkedSalary" class="input" />
          </div>

          <div>
            <label class="label">تاريخ الحصول عليه</label>
            <input type="date" v-model="form.currentLinkedSalaryDate" class="input" />
          </div>

          <div>
            <label class="label">الدرجة المنتدب اليها</label>
            <select v-model.number="form.delegatedGradeId" class="input">
              <option :value="null">اختر</option>
              <option v-for="g in jobGrades" :key="g.id" :value="g.id">{{ g.name }}</option>
            </select>
          </div>

          <div>
            <label class="label">تاريخ الحصول عليها</label>
            <input type="date" v-model="form.delegatedGradeDate" class="input" />
          </div>

        </div>

        <div class="flex justify-center mt-8">
          <button @click="save" class="bg-primary text-white py-2 px-6 rounded-lg">
            حفظ البيانات المالية
          </button>
        </div>

        <Toast
          v-if="toast.visible"
          :message="toast.message"
          :type="toast.type"
          @onConfirm="toast.visible = false"
        />
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from "@/components/Sidebar.vue";
import Navbar from "@/components/Navbar.vue";
import Toast from "@/components/Toast.vue";
import api from "@/services/api";

export default {
  name: "EmployeeFinancialPage",
  components: { Sidebar, Navbar, Toast },
  props: ["publicId"],

  data() {
    return {
      internalPublicId: null,
      employeeName: "",
      employeeNumber: "",
      form: {
        bankId: null,
        bankBranchId: null,
        accountNumber: "",
        newAccountNumber: "",
        administrativeNumber: "",
        basicSalary: null,
        jobGradeId: null,
        jobGradeDate: null,
        allowance: null,
        allowanceDate: null,
        currentLinkedSalary: null,
        currentLinkedSalaryDate: null,
        delegatedGradeId: null,
        delegatedGradeDate: null
      },
      toast: { visible: false, message: "", type: "success" },
      banks: [
        { id: 1, name: "البنك الأهلي" },
        { id: 2, name: "بنك ليبيا" }
      ],
      bankBranches: [
        { id: 1, name: "الفرع الرئيسي" },
        { id: 2, name: "فرع الجنوب" }
      ],
      jobGrades: [
        { id: 1, name: "الأولى" },
        { id: 2, name: "الثانية" },
        { id: 3, name: "الثالثة" },
        { id: 4, name: "الرابعة" }
      ]
    };
  },

  watch: {
    publicId: {
      immediate: true,
      handler(val) {
        if (val) {
          this.internalPublicId = val;
          this.loadEmployeeData(val);
          this.loadFinancialData(val);
        }
      }
    }
  },

  methods: {
    showToast(message, type = "success") {
      this.toast = { visible: true, message, type };
    },

    async loadEmployeeData(publicId) {
      try {
        const res = await api.get(`/Employee/details/${publicId}`);
        this.employeeName = res.data.fullName;
        this.employeeNumber = res.data.employeeNumber;
      } catch {
        this.showToast("❌ فشل تحميل بيانات الموظف", "error");
      }
    },

    async loadFinancialData(publicId) {
      try {
        const res = await api.get(`/EmployeeFinancial/employee/${publicId}`);
        const data = res.data;

        if (data) {
          this.form.bankId = data.bankId || null;
          this.form.bankBranchId = data.bankBranchId || null;
          this.form.accountNumber = data.accountNumber || "";
          this.form.newAccountNumber = data.newAccountNumber || "";
          this.form.administrativeNumber = data.administrativeNumber || "";
          this.form.basicSalary = data.basicSalary || null;
          this.form.jobGradeId = data.jobGradeId || null;
          this.form.jobGradeDate = data.jobGradeDate ? data.jobGradeDate.split("T")[0] : null;
          this.form.allowance = data.allowance || null;
          this.form.allowanceDate = data.allowanceDate ? data.allowanceDate.split("T")[0] : null;
          this.form.currentLinkedSalary = data.currentLinkedSalary || null;
          this.form.currentLinkedSalaryDate = data.currentLinkedSalaryDate
            ? data.currentLinkedSalaryDate.split("T")[0]
            : null;
          this.form.delegatedGradeId = data.delegatedGradeId || null;
          this.form.delegatedGradeDate = data.delegatedGradeDate ? data.delegatedGradeDate.split("T")[0] : null;
        }
      } catch (err) {
        console.error(err.response?.data);
        this.showToast("❌ فشل تحميل البيانات المالية", "error");
      }
    },

    async save() {
      if (!this.internalPublicId) {
        return this.showToast("❌ لم يتم تحديد الموظف", "error");
      }

      const payload = {
        employeePublicId: this.internalPublicId,
        bankId: this.form.bankId,
        bankBranchId: this.form.bankBranchId,
        accountNumber: this.form.accountNumber,
        newAccountNumber: this.form.newAccountNumber,
        administrativeNumber: this.form.administrativeNumber,
        basicSalary: this.form.basicSalary,
        jobGradeId: this.form.jobGradeId,
        jobGradeDate: this.form.jobGradeDate
          ? new Date(this.form.jobGradeDate).toISOString()
          : null,
        allowance: this.form.allowance,
        allowanceDate: this.form.allowanceDate
          ? new Date(this.form.allowanceDate).toISOString()
          : null,
        currentLinkedSalary: this.form.currentLinkedSalary,
        currentLinkedSalaryDate: this.form.currentLinkedSalaryDate
          ? new Date(this.form.currentLinkedSalaryDate).toISOString()
          : null,
        delegatedGradeId: this.form.delegatedGradeId,
        delegatedGradeDate: this.form.delegatedGradeDate
          ? new Date(this.form.delegatedGradeDate).toISOString()
          : null
      };

      try {
        await api.post("/EmployeeFinancial/create-or-update", payload);
        this.showToast("✅ تم حفظ البيانات المالية بنجاح");
      } catch (err) {
        console.error(err.response?.data);
        this.showToast("❌ فشل حفظ البيانات المالية", "error");
      }
    }
  }
};
</script>

<style scoped>
.input { @apply border rounded px-3 py-2 w-full; }
.label { @apply text-sm text-gray-700 mb-1 block; }
</style>