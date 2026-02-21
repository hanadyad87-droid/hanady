<template>
  <div class="flex min-h-screen bg-gray-100" dir="rtl">
    <Sidebar class="fixed top-0 right-0 h-screen w-24 md:w-64 z-50" />
    <div class="flex-1 p-6 mr-24 md:mr-64">
      <Navbar />
      <div class="bg-white p-6 rounded-xl shadow max-w-4xl mx-auto mt-6">
        <h2 class="text-xl font-bold mb-6 text-right">إضافة موظف - البيانات الأساسية</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Username -->
          <div class="flex flex-col relative">
            <label class="label">اسم المستخدم</label>
            <input v-model="form.Username" class="input" placeholder="اسم المستخدم" />
            <span v-if="errors.Username" class="text-red-600 text-xs mt-1 absolute top-full right-0">{{ errors.Username }}</span>
          </div>
          <!-- Email -->
          <div class="flex flex-col relative">
            <label class="label">البريد الإلكتروني</label>
            <input v-model="form.Email" type="email" class="input" placeholder="example@mail.com" @blur="validateEmail" />
            <span v-if="errors.Email" class="text-red-600 text-xs mt-1 absolute top-full right-0">{{ errors.Email }}</span>
          </div>
          <!-- FullName -->
          <div class="flex flex-col relative">
            <label class="label">الاسم الكامل</label>
            <input v-model="form.FullName" @keypress="allowArabic($event, 'FullName')" class="input" placeholder="اكتب بالعربية فقط" />
            <span v-if="errors.FullName" class="text-red-600 text-xs mt-1 absolute top-full right-0">{{ errors.FullName }}</span>
          </div>
          <!-- MotherName -->
          <div class="flex flex-col relative">
            <label class="label">اسم الأم</label>
            <input v-model="form.MotherName" @keypress="allowArabic($event, 'MotherName')" class="input" placeholder="اكتب بالعربية فقط" />
            <span v-if="errors.MotherName" class="text-red-600 text-xs mt-1 absolute top-full right-0">{{ errors.MotherName }}</span>
          </div>
          <!-- NationalId -->
          <div class="flex flex-col relative">
            <label class="label">الرقم الوطني</label>
            <input v-model="form.NationalId" @input="validateNationalId" @keypress="allowDigits($event)" class="input" />
            <span v-if="errors.NationalId" class="text-red-600 text-xs mt-1 absolute top-full right-0">{{ errors.NationalId }}</span>
          </div>
          <!-- Phone1 -->
          <div class="flex flex-col relative">
            <label class="label">رقم الهاتف 1</label>
            <input v-model="form.Phone1" @input="validatePhone('Phone1')" @keypress="allowDigits($event)" class="input" placeholder="091xxxxxxx" />
            <span v-if="errors.Phone1" class="text-red-600 text-xs mt-1 absolute top-full right-0">{{ errors.Phone1 }}</span>
          </div>
          <!-- Phone2 -->
          <div class="flex flex-col relative">
            <label class="label">رقم الهاتف 2 (اختياري)</label>
            <input v-model="form.Phone2" @input="validatePhone('Phone2')" @keypress="allowDigits($event)" class="input" placeholder="092xxxxxxx" />
            <span v-if="errors.Phone2" class="text-red-600 text-xs mt-1 absolute top-full right-0">{{ errors.Phone2 }}</span>
          </div>
          <!-- BirthDate -->
          <div class="flex flex-col">
            <label class="label">تاريخ الميلاد</label>
            <input type="date" v-model="form.BirthDate" class="input" />
          </div>
          <!-- Gender -->
          <div class="flex flex-col">
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
          <!-- MaritalStatusId -->
          <div class="flex flex-col">
            <label class="label">الحالة الاجتماعية</label>
            <select v-model.number="form.MaritalStatusId" class="input">
              <option :value="1">أعزب</option>
              <option :value="2">متزوج</option>
              <option :value="3">مطلق</option>
              <option :value="4">أرمل</option>
            </select>
          </div>
          <!-- Photo -->
          <div class="flex flex-col relative">
            <label class="label">رفع صورة الموظف (PNG/JPEG/JPG)</label>
            <input ref="photoInput" type="file" @change="handleFile" accept=".png,.jpeg,.jpg" class="input" />
            <span v-if="errors.Photo" class="text-red-600 text-xs mt-1 absolute top-full right-0">{{ errors.Photo }}</span>
          </div>
          <!-- IsHR & IsSuperAdmin -->
          <div class="flex flex-col gap-2 mt-4">
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

        <!-- Save Button -->
        <div class="flex justify-center mt-8">
          <button @click="save" class="bg-primary hover:bg-primaryDark text-white py-2 px-6 rounded-lg transition w-full max-w-xs">
            حفظ البيانات الأساسية
          </button>
        </div>

        <Toast v-if="toastMessage" :message="toastMessage" :type="toastType" />
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from "../components/Sidebar.vue";
import Navbar from "../components/Navbar.vue";
import Toast from "../components/Toast.vue";
import api from "../services/api";

export default {
  name: "BasicInfoPage",
  components: { Sidebar, Navbar, Toast },
  data() {
    return {
      form: {
        Username: "",
        Email: "",
        FullName: "",
        MotherName: "",
        NationalId: "",
        Phone1: "",
        Phone2: "",
        BirthDate: "",
        Gender: "ذكر",
        MaritalStatusId: 1,
        IsHR: false,
        IsSuperAdmin: false
      },
      file: null,
      errors: {},
      toastMessage: "",
      toastType: "success"
    };
  },
  methods: {
    allowDigits(event) { if (!/[0-9]/.test(event.key)) event.preventDefault(); },
    allowArabic(event, field) { if (!/[\u0621-\u064A\s]/.test(event.key)) { event.preventDefault(); this.errors[field] = "يجب أن يكون بالعربية فقط"; } else { this.errors[field] = ""; } },
    validateNationalId() { this.errors.NationalId = /^\d{12}$/.test(this.form.NationalId) ? "" : "الرقم الوطني يجب أن يكون 12 رقماً"; },
    validatePhone(field) { const val = this.form[field]; this.errors[field] = val && !/^\d{10}$/.test(val) ? "رقم الهاتف يجب أن يكون 10 أرقام" : ""; },
    validateEmail() { const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; this.errors.Email = re.test(this.form.Email) ? "" : "البريد الإلكتروني غير صحيح"; },
    handleFile(event) { const file = event.target.files[0]; if (!file) return; const allowedTypes = ["image/png", "image/jpeg", "image/jpg"]; if (!allowedTypes.includes(file.type)) { this.errors.Photo = "الملف غير مدعوم"; this.file = null; return; } this.errors.Photo = ""; this.file = file; },
    
    save() {
      // تحقق الحقول
      const requiredFields = ["Username","Email","FullName","MotherName","NationalId","Phone1","BirthDate","Gender"];
      for (let f of requiredFields) {
        if (!this.form[f]) { this.toastMessage = `يرجى ملء الحقل: ${f}`; this.toastType = "error"; return; }
      }
      this.validateEmail();
      if (Object.values(this.errors).some(e => e)) { this.toastMessage = "يرجى تصحيح الحقول قبل الحفظ"; this.toastType = "error"; return; }

      const formData = new FormData();
      Object.keys(this.form).forEach(k => formData.append(k, this.form[k] ?? ""));
      if (this.file) formData.append("Photo", this.file);

      api.post("/Employee/create-account", formData, { headers: { "Content-Type": "multipart/form-data" } })
        .then(res => {
          const newEmployeeId = res.data.employeeId;
          const newEmployeePublicId = res.data.publicId;
          console.log("ID الموظف الجديد:", newEmployeeId);
          console.log("PublicId:", newEmployeePublicId);

          this.toastMessage = "تم إنشاء الموظف بنجاح ✅";
          this.toastType = "success";

          this.resetForm();

          // إرسال PublicId للصفحة الإدارية
      this.$router.push({ name: 'AdminInfo', params: { publicId: newEmployeePublicId } });
  })
       
        .catch(err => {
          console.error(err);
          this.toastMessage = err.response?.data?.message || "خطأ في الحفظ ❌";
          this.toastType = "error";
        });
    },

    resetForm() {
      this.form = {
        Username: "",
        Email: "",
        FullName: "",
        MotherName: "",
        NationalId: "",
        Phone1: "",
        Phone2: "",
        BirthDate: "",
        Gender: "ذكر",
        MaritalStatusId: 1,
        IsHR: false,
        IsSuperAdmin: false
      };
      this.errors = {};
      this.file = null;
      if (this.$refs.photoInput) this.$refs.photoInput.value = null;
    }
  }
};
</script>

<style scoped>
.input { @apply p-2 border rounded-lg text-right; }
.label { @apply text-sm text-gray-600 mb-1 block; }
</style>