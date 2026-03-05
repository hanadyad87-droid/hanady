<template>
  <div class="flex min-h-screen bg-gray-100" dir="rtl">
    <!-- Sidebar -->
    <Sidebar class="fixed top-0 right-0 h-screen w-24 md:w-64 z-50" />

    <div class="flex-1 p-6 min-h-screen mr-24 md:mr-64">
      <!-- Navbar -->
      <Navbar />

      <div class="bg-white p-6 rounded-xl shadow max-w-4xl mx-auto mt-6">
        <h3 class="text-xl font-bold">البيانات الأساسية</h3>

        <!-- الفورم -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">

          <div>
            <label class="label">اسم المستخدم</label>
            <input v-model="form.Username" class="input" placeholder="اسم المستخدم" />
          </div>

          <div>
            <label class="label">البريد الإلكتروني</label>
            <input v-model="form.Email" type="email" class="input" placeholder="example@mail.com" @blur="validateEmail" />
          </div>

          <div>
            <label class="label">الاسم الكامل</label>
            <input v-model="form.FullName" @keypress="allowArabic($event, 'FullName')" class="input" placeholder="اكتب بالعربية فقط" />
          </div>

          <div>
            <label class="label">اسم الأم</label>
            <input v-model="form.MotherName" @keypress="allowArabic($event, 'MotherName')" class="input" placeholder="اكتب بالعربية فقط" />
          </div>

          <div>
            <label class="label">الرقم الوطني</label>
            <input v-model="form.NationalId" @input="validateNationalId" @keypress="allowDigits($event)" class="input" />
          </div>

          <div>
            <label class="label">رقم الهاتف 1</label>
            <input v-model="form.Phone1" @input="validatePhone('Phone1')" @keypress="allowDigits($event)" class="input" placeholder="091xxxxxxx" />
          </div>

          <div>
            <label class="label">رقم الهاتف 2 (اختياري)</label>
            <input v-model="form.Phone2" @input="validatePhone('Phone2')" @keypress="allowDigits($event)" class="input" placeholder="092xxxxxxx" />
          </div>

          <div>
            <label class="label">تاريخ الميلاد</label>
            <input type="date" v-model="form.BirthDate" class="input" />
          </div>

          <div>
            <label class="label">الجنس</label>
            <div class="flex gap-4">
              <label class="inline-flex items-center gap-2">
                <input type="radio" value="ذكر" v-model="form.Gender" />
                ذكر
              </label>
              <label class="inline-flex items-center gap-2">
                <input type="radio" value="أنثى" v-model="form.Gender" />
                أنثى
              </label>
            </div>
          </div>

          <div>
            <label class="label">الحالة الاجتماعية</label>
            <select v-model.number="form.MaritalStatusId" class="input">
              <option :value="1">أعزب</option>
              <option :value="2">متزوج</option>
              <option :value="3">مطلق</option>
              <option :value="4">أرمل</option>
            </select>
          </div>

          <div>
            <label class="label">رفع صورة الموظف</label>
            <input ref="photoInput" type="file" @change="handleFile" accept=".png,.jpeg,.jpg" class="input" />
          </div>

          <div class="flex flex-col gap-2 mt-2">
            <label class="inline-flex items-center gap-2">
              <input type="checkbox" v-model="form.IsHR" />
              HR
            </label>
            <label class="inline-flex items-center gap-2">
              <input type="checkbox" v-model="form.IsSuperAdmin" />
              SuperAdmin
            </label>
          </div>

        </div>

        <div class="flex justify-center mt-6">
          <button @click="save" class="bg-primary text-white py-2 px-6 rounded-lg">
            حفظ البيانات الأساسية
          </button>
        </div>

        <Toast v-if="toast.visible" :message="toast.message" :type="toast.type" @onConfirm="toast.visible = false" />
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