<template>
  <div class="flex min-h-screen bg-gray-100 font-cairo" dir="rtl">
    <Sidebar class="fixed top-0 right-0 h-screen w-24 md:w-64 z-50" />

    <div class="flex-1 p-6 mr-24 md:mr-64">
      <Navbar />

      <div class="bg-white p-8 rounded-2xl shadow-lg max-w-5xl mx-auto mt-6 border border-gray-100">
        <div class="border-b pb-4 mb-8 flex justify-between items-center">
          <h2 class="text-2xl font-bold text-gray-800">
            {{ isEdit ? 'تعديل بيانات الموظف' : 'إضافة موظف جديد' }}
          </h2>
          <span class="text-sm text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full">البيانات الأساسية</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
          
          <div class="flex flex-col relative">
            <label class="label">اسم المستخدم</label>
            <input v-model="form.Username" class="input" placeholder="اسم الحساب" />
            <p v-if="errors.Username" class="error-msg">{{ errors.Username }}</p>
          </div>

          <div class="flex flex-col relative">
            <label class="label">البريد الإلكتروني</label>
            <input v-model="form.Email" type="email" class="input text-left" dir="ltr" placeholder="example@mail.com" @blur="validateEmail" />
            <p v-if="errors.Email" class="error-msg">{{ errors.Email }}</p>
          </div>

          <div class="flex flex-col relative">
            <label class="label">الاسم الكامل (بالعربي)</label>
            <input v-model="form.FullName" @keypress="allowArabic($event, 'FullName')" class="input" placeholder="اكتب بالعربي فقط" />
            <p v-if="errors.FullName" class="error-msg">{{ errors.FullName }}</p>
          </div>

          <div class="flex flex-col relative">
            <label class="label">اسم الأم</label>
            <input v-model="form.MotherName" @keypress="allowArabic($event, 'MotherName')" class="input" placeholder="اكتب بالعربي فقط" />
            <p v-if="errors.MotherName" class="error-msg">{{ errors.MotherName }}</p>
          </div>

          <div class="flex flex-col relative">
            <label class="label">الرقم الوطني</label>
            <input v-model="form.NationalId" maxlength="12" @input="validateNationalId" @keypress="allowDigits($event)" class="input text-left" dir="ltr" />
            <p v-if="errors.NationalId" class="error-msg">{{ errors.NationalId }}</p>
          </div>

          <div class="flex flex-col relative">
            <label class="label">رقم الهاتف 1</label>
            <input v-model="form.Phone1" maxlength="10" @input="validatePhone('Phone1')" @keypress="allowDigits($event)" class="input text-left" dir="ltr" />
            <p v-if="errors.Phone1" class="error-msg">{{ errors.Phone1 }}</p>
          </div>

          <div class="flex flex-col relative">
            <label class="label">رقم الهاتف 2 (اختياري)</label>
            <input v-model="form.Phone2" maxlength="10" @input="validatePhone('Phone2')" @keypress="allowDigits($event)" class="input text-left" dir="ltr" />
          </div>

          <div class="flex flex-col">
            <label class="label">تاريخ الميلاد</label>
            <input type="date" v-model="form.BirthDate" class="input" />
          </div>

          <div class="flex flex-col">
            <label class="label">الحالة الاجتماعية</label>
            <select v-model.number="form.MaritalStatusId" class="input bg-white cursor-pointer">
              <option :value="1">أعزب</option>
              <option :value="2">متزوج</option>
              <option :value="3">مطلق</option>
              <option :value="4">أرمل</option>
            </select>
          </div>

          <div class="flex flex-col">
            <label class="label">الجنس</label>
            <div class="flex gap-4 p-2.5 bg-gray-50 rounded-xl border border-gray-200">
              <label class="inline-flex items-center gap-2 cursor-pointer grow justify-center">
                <input type="radio" value="ذكر" v-model="form.Gender" class="w-4 h-4 accent-primary" />
                <span class="text-sm font-medium">ذكر</span>
              </label>
              <label class="inline-flex items-center gap-2 cursor-pointer grow justify-center">
                <input type="radio" value="أنثى" v-model="form.Gender" class="w-4 h-4 accent-primary" />
                <span class="text-sm font-medium">أنثى</span>
              </label>
            </div>
          </div>

          <div class="flex flex-col relative">
            <label class="label">صورة الموظف</label>
            <input ref="photoInput" type="file" @change="handleFile" accept=".png,.jpeg,.jpg" 
                   class="file:ml-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-primary file:text-white cursor-pointer border border-gray-300 p-1.5 rounded-xl transition w-full" />
            <p v-if="errors.Photo" class="error-msg">{{ errors.Photo }}</p>
          </div>

          <div class="flex flex-col">
            <label class="label">صلاحيات إدارية</label>
            <div class="flex gap-6 p-2.5 bg-gray-50 rounded-xl border border-gray-200">
              <label class="inline-flex items-center gap-2 cursor-pointer">
                <input type="checkbox" v-model="form.IsHR" class="w-5 h-5 accent-primary" />
                <span class="text-sm font-bold text-gray-700">HR</span>
              </label>
              <label class="inline-flex items-center gap-2 cursor-pointer">
                <input type="checkbox" v-model="form.IsSuperAdmin" class="w-5 h-5 accent-red-600" />
                <span class="text-sm font-bold text-red-700">Admin</span>
              </label>
            </div>
          </div>
        </div>

        <div class="flex justify-center gap-4 mt-12">
          <button @click="save" :disabled="loading" 
                  class="bg-primary hover:bg-green-700 text-white font-bold py-3 px-16 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50">
            <span v-if="loading">جاري المعالجة...</span>
            <span v-else>{{ isEdit ? 'تعديل البيانات' : 'حفظ البيانات' }}</span>
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
  components: { Sidebar, Navbar, Toast },
  data() {
    return {
      form: {
        Username: "", Email: "", FullName: "", MotherName: "", NationalId: "",
        Phone1: "", Phone2: "", BirthDate: "", Gender: "ذكر",
        MaritalStatusId: 1, IsHR: false, IsSuperAdmin: false
      },
      file: null,
      errors: {},
      showToast: false,
      toastMessage: "",
      toastType: "success",
      loading: false,
      isEdit: false
    };
  },

  async mounted() {
    const publicId = this.$route.params.publicId;
    if (publicId) {
      this.isEdit = true;
      await this.loadEmployee(publicId);
    }
  },

  methods: {
    triggerToast(msg, type = "success") {
      this.toastMessage = msg;
      this.toastType = type;
      this.showToast = true;
      setTimeout(() => (this.showToast = false), 4000);
    },

    async loadEmployee(publicId) {
      try {
        this.loading = true;
        const { data } = await api.get(`/Employee/details/${publicId}`);
        // تحويل الأسماء من السيرفر (camelCase) إلى أسماء الفورم (PascalCase)
        this.form = {
          Username: data.username || "",
          Email: data.email || "",
          FullName: data.fullName || "",
          MotherName: data.motherName || "",
          NationalId: data.nationalId || "",
          Phone1: data.phone1 || "",
          Phone2: data.phone2 || "",
          BirthDate: data.birthDate ? data.birthDate.split("T")[0] : "",
          Gender: data.gender || "ذكر",
          MaritalStatusId: data.maritalStatusId || 1,
          IsHR: !!data.isHR,
          IsSuperAdmin: !!data.isSuperAdmin
        };
      } catch (err) {
        this.triggerToast("خطأ في تحميل البيانات", "error");
      } finally { this.loading = false; }
    },

    allowDigits(e) { if (!/[0-9]/.test(e.key)) e.preventDefault(); },
    
    allowArabic(e, field) {
      if (!/[\u0621-\u064A\s]/.test(e.key)) {
        e.preventDefault();
        this.errors[field] = "يرجى الكتابة بالعربية";
      } else { this.errors[field] = ""; }
    },

    validateNationalId() {
      this.errors.NationalId = /^\d{12}$/.test(this.form.NationalId) ? "" : "الرقم الوطني 12 رقم";
    },

    validatePhone(field) {
      const val = this.form[field];
      this.errors[field] = val && !/^\d{10}$/.test(val) ? "رقم الهاتف 10 أرقام" : "";
    },

    validateEmail() {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      this.errors.Email = this.form.Email && !re.test(this.form.Email) ? "بريد غير صحيح" : "";
    },

    handleFile(e) {
      const f = e.target.files[0];
      if (f && ["image/png", "image/jpeg", "image/jpg"].includes(f.type)) {
        this.file = f;
        this.errors.Photo = "";
      } else {
        this.errors.Photo = "ملف غير مدعوم";
        this.file = null;
      }
    },

    async save() {
      // 1. التحقق من الحقول الإجبارية
      const required = ["Username", "Email", "FullName", "MotherName", "NationalId", "Phone1", "BirthDate"];
      for (let f of required) {
        if (!this.form[f]) {
          return this.triggerToast(`يرجى ملء كافة الحقول الإجبارية`, "error");
        }
      }

      // 2. التحقق من عدم وجود أخطاء validation
      if (Object.values(this.errors).some(e => e)) {
        return this.triggerToast("يرجى تصحيح الأخطاء أولاً", "error");
      }

      // 3. بناء الـ FormData مع التأكد من أنواع البيانات
      const formData = new FormData();
      Object.keys(this.form).forEach(key => {
        let value = this.form[key];
        // تحويل الـ Booleans إلى نصوص مفهومة للسيرفر (true/false)
        if (typeof value === "boolean") {
          formData.append(key, value ? "true" : "false");
        } else {
          formData.append(key, value ?? "");
        }
      });

      if (this.file) {
        formData.append("Photo", this.file);
      }

      const publicId = this.$route.params.publicId;

      try {
        this.loading = true;
        if (publicId) {
          // تعديل
          await api.put(`/Employee/update-full/${publicId}`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
          });
          this.triggerToast("تم تعديل بيانات الموظف بنجاح ✅", "success");
        } else {
          // جديد
          const res = await api.post("/Employee/create-account", formData, {
            headers: { "Content-Type": "multipart/form-data" }
          });
          this.triggerToast("تم الحفظ بنجاح، جاري النقل للصفحة الإدارية... 🔃", "success");
          
          setTimeout(() => {
            this.$router.push({ name: "AdminInfo", params: { publicId: res.data.publicId } });
          }, 1500);
        }
      } catch (err) {
        // عرض رسالة الخطأ القادمة من السيرفر بالتفصيل
        const msg = err.response?.data?.message || err.response?.data?.title || "حدث خطأ في البيانات المرسلة (400)";
        this.triggerToast(msg, "error");
        console.error("Server Error Details:", err.response?.data);
      } finally { 
        this.loading = false; 
      }
    }
  }
};
</script>

<style scoped>
.input { @apply w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-right bg-gray-50; }
.label { @apply text-sm font-bold text-gray-600 mb-2 block; }
.error-msg { @apply text-red-600 text-[11px] mt-1 absolute top-full right-0 font-bold; }
</style>