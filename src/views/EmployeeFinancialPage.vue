<template>
  <div class="flex min-h-screen bg-gray-100 font-cairo" dir="rtl">
    <Sidebar class="fixed top-0 right-0 h-screen w-24 md:w-64 z-50" />

    <div class="flex-1 p-6 mr-24 md:mr-64">
      <Navbar />

      <div class="bg-white p-8 rounded-2xl shadow-lg max-w-5xl mx-auto mt-6 border border-gray-100">
      <div class="border-b pb-4 mb-8 flex justify-between items-center">
  <h2 class="text-2xl font-bold text-gray-800">البيانات المالية</h2>
  <div class="flex gap-2">
    <span v-if="employeeNumber" class="text-sm font-medium bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
      ID: {{ employeeNumber }}
    </span>
    <span class="text-sm font-medium bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
      {{ employeeName || 'جاري التحميل...' }}
    </span>
  </div>
</div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
          
          <div class="flex flex-col relative">
            <label class="label">المصرف</label>
            <select v-model="form.bankId" class="input bg-white cursor-pointer" @change="onBankChange">
              <option :value="null">اختر المصرف...</option>
              <option v-for="b in banks" :key="b.id" :value="b.id">{{ b.name }}</option>
            </select>
            <p v-if="errors.bankId" class="error-msg">{{ errors.bankId }}</p>
          </div>

          <div class="flex flex-col relative">
            <label class="label">الفرع</label>
            <select v-model="form.bankBranchId" class="input bg-white cursor-pointer" :disabled="!form.bankId">
              <option :value="null">اختر الفرع...</option>
              <option v-for="b in filteredBranches" :key="b.id" :value="b.id">{{ b.name }}</option>
            </select>
            <p v-if="errors.bankBranchId" class="error-msg">{{ errors.bankBranchId }}</p>
          </div>

          <div class="flex flex-col relative">
            <label class="label">رقم الحساب المحلي</label>
            <input v-model="form.accountNumber" maxlength="15" @keypress="allowDigits" class="input text-left" dir="ltr" placeholder="000000000" />
            <p v-if="errors.accountNumber" class="error-msg">{{ errors.accountNumber }}</p>
          </div>

          <div class="flex flex-col relative">
            <label class="label">رقم الحساب الدولي (IBAN)</label>
            <input v-model="form.newAccountNumber" maxlength="25" @input="validateIBAN" class="input text-left uppercase" dir="ltr" placeholder="LY00..." />
            <p v-if="errors.newAccountNumber" class="error-msg">{{ errors.newAccountNumber }}</p>
          </div>

          <div class="flex flex-col relative">
            <label class="label">الرقم الإداري</label>
            <input v-model="form.administrativeNumber" @keypress="allowDigits" class="input" placeholder="ارقام فقط" />
          </div>

          <div class="flex flex-col relative">
            <label class="label">المرتب الأساسي (د.ل)</label>
            <input v-model.number="form.basicSalary" type="number" step="0.01" class="input font-bold" />
            <p v-if="errors.basicSalary" class="error-msg">{{ errors.basicSalary }}</p>
          </div>

          <div class="flex flex-col relative">
            <label class="label">الدرجة</label>
            <select v-model="form.jobGradeId" class="input bg-white cursor-pointer">
              <option :value="null">اختر الدرجة...</option>
              <option v-for="g in jobGrades" :key="g.id" :value="g.id">{{ g.name }}</option>
            </select>
            <p v-if="errors.jobGradeId" class="error-msg">{{ errors.jobGradeId }}</p>
          </div>

          <div class="flex flex-col">
            <label class="label">تاريخ الدرجة</label>
            <input type="date" v-model="form.jobGradeDate" class="input" />
          </div>

          <div class="flex flex-col relative">
            <label class="label">العلاوة</label>
            <input v-model.number="form.allowance" type="number" step="0.01" class="input" />
          </div>

          <div class="flex flex-col">
            <label class="label">تاريخ العلاوة</label>
            <input type="date" v-model="form.allowanceDate" class="input" />
          </div>

          <div class="flex flex-col relative">
            <label class="label">المرتب المربوط</label>
            <input v-model.number="form.currentLinkedSalary" type="number" step="0.01" class="input" />
          </div>

          <div class="flex flex-col">
            <label class="label">تاريخ المرتب المربوط</label>
            <input type="date" v-model="form.currentLinkedSalaryDate" class="input" />
          </div>

          <div class="flex flex-col">
            <label class="label">الدرجة المنتدب لها</label>
            <select v-model="form.delegatedGradeId" class="input bg-white">
              <option :value="null">لا يوجد</option>
              <option v-for="g in jobGrades" :key="g.id" :value="g.id">{{ g.name }}</option>
            </select>
          </div>

          <div class="flex flex-col">
            <label class="label">تاريخ الندب</label>
            <input type="date" v-model="form.delegatedGradeDate" class="input" :disabled="!form.delegatedGradeId" />
          </div>

        </div>

        <div class="flex justify-center gap-4 mt-12">
          <button @click="save" :disabled="loading" 
                  class="bg-primary hover:bg-green-700 text-white font-bold py-3 px-16 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50">
            <span v-if="loading">جاري المعالجة...</span>
            <span v-else>حفظ البيانات المالية</span>
          </button>
        </div>
      </div>
    </div>

    <Toast v-if="showToast" :message="toastMessage" :type="toastType" />
  </div>
</template>

<script>
import Sidebar from "@/components/Sidebar.vue";
import Navbar from "@/components/Navbar.vue";
import Toast from "@/components/Toast.vue";
import api from "@/services/api";

export default {
  props: ["publicId"],
  components: { Sidebar, Navbar, Toast },
  data() {
    return {
      form: {
        bankId: null, bankBranchId: null, accountNumber: "", newAccountNumber: "LY",
        administrativeNumber: "", basicSalary: null, jobGradeId: null,
        jobGradeDate: "", allowance: null, allowanceDate: "",
        currentLinkedSalary: null, currentLinkedSalaryDate: "",
        delegatedGradeId: null, delegatedGradeDate: ""
      },
      employeeName: "",
      employeeNumber: "",
      banks: [],
      branches: [],
      jobGrades: [],
      errors: {},
      loading: false,
      showToast: false,
      toastMessage: "",
      toastType: "success"
    };
  },

  computed: {
    filteredBranches() {
      return this.branches.filter(b => b.bankId === this.form.bankId);
    }
  },

  async mounted() {
    if (this.publicId) {
      await this.initData();
    }
  },

  methods: {
    triggerToast(msg, type = "success") {
      this.toastMessage = msg;
      this.toastType = type;
      this.showToast = true;
      setTimeout(() => (this.showToast = false), 4000);
    },

    allowDigits(e) { if (!/[0-9]/.test(e.key)) e.preventDefault(); },

    validateIBAN() {
      if (!this.form.newAccountNumber.startsWith("LY")) this.form.newAccountNumber = "LY";
      this.form.newAccountNumber = "LY" + this.form.newAccountNumber.substring(2).replace(/\D/g, "");
      this.errors.newAccountNumber = this.form.newAccountNumber.length !== 25 ? "رقم IBAN الليبي يجب أن يكون 25 خانة" : "";
    },

    onBankChange() { this.form.bankBranchId = null; },

 async initData() {
  try {
    this.loading = true;
    // 1. تحميل المصارف والدرجات
    const [b, br, g] = await Promise.all([
      api.get("/Bank"),
      api.get("/BankBranch"),
      api.get("/JobGrade")
    ]);
    this.banks = b.data;
    this.branches = br.data;
    this.jobGrades = g.data;

    // 2. تحميل بيانات الموظف الأساسية
    const emp = await api.get(`/Employee/details/${this.publicId}`);
    this.employeeName = emp.data.fullName;
    // السطر الناقص الذي يحل مشكلتك:
    this.employeeNumber = emp.data.employeeNumber; 
    
    // 3. محاولة تحميل البيانات المالية
    try {
      const fin = await api.get(`/EmployeeFinancial/employee/${this.publicId}`);
      if (fin.data) {
        this.form = {
          ...fin.data,
          jobGradeDate: this.formatDate(fin.data.jobGradeDate),
          allowanceDate: this.formatDate(fin.data.allowanceDate),
          currentLinkedSalaryDate: this.formatDate(fin.data.currentLinkedSalaryDate),
          delegatedGradeDate: this.formatDate(fin.data.delegatedGradeDate)
        };
        if (!this.form.newAccountNumber) this.form.newAccountNumber = "LY";
      }
    } catch (finErr) {
      // إذا لم توجد بيانات (404) لا تظهر خطأ
      if (finErr.response && finErr.response.status === 404) {
        console.log("موظف جديد - لا توجد بيانات مالية.");
        this.form.newAccountNumber = "LY";
      } else {
        this.triggerToast("خطأ في جلب البيانات المالية", "error");
      }
    }
  } catch (err) {
    this.triggerToast("خطأ في تحميل بيانات الموظف", "error");
  } finally { 
    this.loading = false; 
  }
},

    formatDate(d) { return d ? d.split("T")[0] : ""; },

    async save() {
      // التحقق من الحقول الأساسية
      this.errors = {};
      if (!this.form.bankId) this.errors.bankId = "المصرف مطلوب";
      if (!this.form.bankBranchId) this.errors.bankBranchId = "الفرع مطلوب";
      if (!this.form.accountNumber) this.errors.accountNumber = "رقم الحساب مطلوب";
      if (this.form.newAccountNumber.length !== 25) this.errors.newAccountNumber = "IBAN غير مكتمل";
      if (!this.form.basicSalary) this.errors.basicSalary = "المرتب مطلوب";
      if (!this.form.jobGradeId) this.errors.jobGradeId = "الدرجة مطلوبة";

      if (Object.keys(this.errors).length > 0) {
        return this.triggerToast("يرجى تصحيح الأخطاء أولاً", "error");
      }

      try {
        this.loading = true;
        const payload = { 
          employeePublicId: this.publicId, 
          ...this.form,
          // التأكد من إرسال التواريخ بتنسيق ISO
          jobGradeDate: this.form.jobGradeDate ? new Date(this.form.jobGradeDate).toISOString() : null,
          allowanceDate: this.form.allowanceDate ? new Date(this.form.allowanceDate).toISOString() : null,
          currentLinkedSalaryDate: this.form.currentLinkedSalaryDate ? new Date(this.form.currentLinkedSalaryDate).toISOString() : null,
          delegatedGradeDate: this.form.delegatedGradeDate ? new Date(this.form.delegatedGradeDate).toISOString() : null
        };
        
        await api.post("/EmployeeFinancial/create-or-update", payload);
        this.triggerToast("تم حفظ البيانات المالية بنجاح ✅");
        setTimeout(() => this.$router.push('/employees'), 1500);
      } catch (err) {
        this.triggerToast(err.response?.data?.message || "فشل الحفظ", "error");
      } finally { this.loading = false; }
    }
  }
};
</script>

<style scoped>
.input { @apply w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-right bg-gray-50; }
.label { @apply text-sm font-bold text-gray-600 mb-2 block; }
.error-msg { @apply text-red-600 text-[11px] mt-1 absolute top-full right-0 font-bold; }
</style>