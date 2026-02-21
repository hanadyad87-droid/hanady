<template>
  <div class="basic-info p-4" dir="rtl">
    <h3 class="text-xl font-bold mb-4 text-right text-black-800">
      البيانات الأساسية
    </h3>

    <div class="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4">

      <!-- رقم الموظف (قراءة فقط) -->
      <div class="flex flex-col relative">
        <label class="text-sm text-gray-600 mb-1">رقم الموظف</label>
        <input 
          v-model="localEmployee.EmployeeNumber" 
          class="input" 
          readonly 
          placeholder="سيتم توليده تلقائيًا"
        />
      </div>

      <!-- الاسم الكامل -->
      <div class="flex flex-col relative">
        <label class="text-sm text-gray-600 mb-1">الاسم الكامل</label>
        <input
          v-model="localEmployee.FullName"
          @keypress="allowArabic($event, 'FullName')"
          class="input"
          placeholder="اكتب بالعربية فقط"
        />
        <span v-if="errors.FullName" class="text-red-600 text-xs mt-1 absolute top-full right-0">
          {{ errors.FullName }}
        </span>
      </div>

      <!-- اسم الأم -->
      <div class="flex flex-col relative">
        <label class="text-sm text-gray-600 mb-1">اسم الأم</label>
        <input
          v-model="localEmployee.MotherName"
          @keypress="allowArabic($event, 'MotherName')"
          class="input"
          placeholder="اكتب بالعربية فقط"
        />
        <span v-if="errors.MotherName" class="text-red-600 text-xs mt-1 absolute top-full right-0">
          {{ errors.MotherName }}
        </span>
      </div>

      <!-- الرقم الوطني -->
      <div class="flex flex-col relative">
        <label class="text-sm text-gray-600 mb-1">الرقم الوطني</label>
        <input
          v-model="localEmployee.NationalId"
          @input="validateNationalId"
          @keypress="allowDigits($event)"
          class="input"
        />
        <span v-if="errors.NationalId" class="text-red-600 text-xs mt-1 absolute top-full right-0">
          {{ errors.NationalId }}
        </span>
      </div>

      <!-- الهاتف الأول -->
      <div class="flex flex-col relative">
        <label class="text-sm text-gray-600 mb-1">رقم الهاتف 1</label>
        <input
          v-model="localEmployee.Phone1"
          @input="validatePhone('Phone1')"
          @keypress="allowDigits($event)"
          class="input"
          placeholder="091xxxxxxx"
        />
        <span v-if="errors.Phone1" class="text-red-600 text-xs mt-1 absolute top-full right-0">
          {{ errors.Phone1 }}
        </span>
      </div>

      <!-- الهاتف الثاني -->
      <div class="flex flex-col relative">
        <label class="text-sm text-gray-600 mb-1">رقم الهاتف 2 (اختياري)</label>
        <input
          v-model="localEmployee.Phone2"
          @input="validatePhone('Phone2')"
          @keypress="allowDigits($event)"
          class="input"
          placeholder="092xxxxxxx"
        />
        <span v-if="errors.Phone2" class="text-red-600 text-xs mt-1 absolute top-full right-0">
          {{ errors.Phone2 }}
        </span>
      </div>

      <!-- تاريخ الميلاد -->
      <div class="flex flex-col">
        <label class="text-sm text-gray-600 mb-1">تاريخ الميلاد</label>
        <input type="date" v-model="localEmployee.BirthDate" class="input" />
      </div>

      <!-- الجنس -->
      <div class="flex flex-col">
        <label class="text-sm text-gray-600 mb-1">الجنس</label>
        <div class="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <label>
            <input type="radio" value="ذكر" v-model="localEmployee.Gender" /> ذكر
          </label>
          <label>
            <input type="radio" value="أنثى" v-model="localEmployee.Gender" /> أنثى
          </label>
        </div>
      </div>

      <!-- الحالة الاجتماعية -->
      <div class="flex flex-col relative">
        <label class="text-sm text-gray-600 mb-1">الحالة الاجتماعية</label>
        <select v-model.number="localEmployee.MaritalStatusId" class="input">
          <option value="1">أعزب</option>
          <option value="2">متزوج</option>
          <option value="3">مطلق</option>
          <option value="4">أرمل</option>
        </select>
      </div>

      <!-- رفع صورة الموظف -->
      <div class="flex flex-col relative">
        <label class="text-sm text-gray-600 mb-1">رفع صورة الموظف (PDF/PNG/JPEG)</label>
        <input type="file" @change="handleFile" accept=".pdf,.png,.jpeg,.jpg" class="input" />
        <span v-if="errors.Photo" class="text-red-600 text-xs mt-1 absolute top-full right-0">
          {{ errors.Photo }}
        </span>
      </div>

      <!-- بيانات حساب المستخدم (SuperAdmin فقط) -->
      <div v-if="currentUserRole === 'SuperAdmin'" class="col-span-1 md:col-span-2 border p-4 rounded-lg">
        <h4 class="font-bold text-bg-primary mb-3">بيانات حساب المستخدم</h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label class="text-sm">اسم المستخدم</label>
            <input v-model="localEmployee.username" class="input" placeholder="فارغ بشكل افتراضي" />
          </div>

          <div>
            <label class="text-sm">كلمة المرور</label>
            <input type="password" v-model="localEmployee.password" class="input" placeholder="فارغ بشكل افتراضي" />
          </div>

          <div class="flex flex-col">
            <label class="inline-flex items-center gap-2">
              <input type="checkbox" v-model="localEmployee.IsSuperAdmin" /> SuperAdmin
            </label>
            <label class="inline-flex items-center gap-2">
              <input type="checkbox" v-model="localEmployee.IsHR" /> HR
            </label>
          </div>
        </div>
      </div>

    </div>

    <!-- زر الحفظ -->
    <div class="flex justify-center mt-8">
      <button
        @click="save"
        class="bg-primary hover:bg-primaryDark text-white py-2 px-6 rounded-lg transition w-full max-w-xs"
      >
        حفظ البيانات الأساسية
      </button>
    </div>

    <Toast v-if="toastMessage" :message="toastMessage" :type="toastType" />
  </div>
</template>

<script>
import api from "../../services/api";
import Toast from "../Toast.vue";

export default {
  name: "BasicInfo",
  props: { employee: { type: Object, required: true } },
  components: { Toast },
  data() {
    return {
      localEmployee: {
        ...this.employee,
        username: "",
        password: "",
        IsSuperAdmin: false,
        IsHR: false,
      },
      file: null,
      toastMessage: "",
      toastType: "success",
      currentUserRole: "SuperAdmin",
      errors: { NationalId: "", Phone1: "", Phone2: "", FullName: "", MotherName: "", Photo: "" }
    };
  },
  watch: {
    employee: {
      deep: true,
      handler(val) {
        this.localEmployee = { ...val };
      }
    }
  },
  methods: {
    allowDigits(event) {
      if (!/[0-9]/.test(event.key)) event.preventDefault();
    },
    allowArabic(event, field) {
      if (!/[\u0621-\u064A\s]/.test(event.key)) {
        event.preventDefault();
        this.errors[field] = "يجب أن يكون بالعربية فقط";
      } else {
        this.errors[field] = "";
      }
    },
    validateNationalId() {
      const id = this.localEmployee.NationalId;
      this.errors.NationalId = /^\d{12}$/.test(id) ? "" : "الرقم الوطني يجب أن يكون 12 رقماً";
    },
    validatePhone(field) {
      const phone = this.localEmployee[field];
      this.errors[field] = /^\d{10}$/.test(phone) ? "" : "رقم الهاتف يجب أن يكون 10 أرقام";
    },
    formatDate(dateStr) {
      if (!dateStr) return null;
      const d = new Date(dateStr);
      return d.toISOString();
    },
    handleFile(event) {
      const file = event.target.files[0];
      if (!file) return;

      const allowedTypes = ["application/pdf", "image/png", "image/jpeg"];
      if (!allowedTypes.includes(file.type)) {
        this.errors.Photo = "الملف غير مدعوم";
        this.file = null;
        return;
      }
      this.errors.Photo = "";
      this.file = file;
    },
    async save() {
      this.toastMessage = "";

      const requiredFields = ['FullName','MotherName','NationalId','Phone1','BirthDate','Gender'];
      for (let field of requiredFields) {
        if (!this.localEmployee[field]) {
          this.toastMessage = `يرجى ملء الحقل: ${field}`;
          this.toastType = "error";
          return;
        }
      }

      if (Object.values(this.errors).some(e => e)) {
        this.toastMessage = "يرجى تصحيح الحقول قبل الحفظ";
        this.toastType = "error";
        return;
      }

      try {
        const formData = new FormData();
        formData.append("Username", this.localEmployee.username || "");
        formData.append("Password", this.localEmployee.password || "");
        formData.append("FullName", this.localEmployee.FullName);
        formData.append("MotherName", this.localEmployee.MotherName);
        formData.append("NationalId", this.localEmployee.NationalId);
        formData.append("Phone1", this.localEmployee.Phone1);
        formData.append("Phone2", this.localEmployee.Phone2 || "");
        formData.append("BirthDate", this.formatDate(this.localEmployee.BirthDate));
        formData.append("Gender", this.localEmployee.Gender);
        formData.append("MaritalStatusId", Number(this.localEmployee.MaritalStatusId));
        formData.append("IsHR", this.localEmployee.IsHR);
        formData.append("IsSuperAdmin", this.localEmployee.IsSuperAdmin);

        if (this.file) formData.append("Photo", this.file);

        await api.post("/Employee/create-account", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });

        this.toastMessage = "تم إنشاء الموظف بنجاح ✅";
        this.toastType = "success";
        this.resetForm();
      } catch (err) {
        this.toastMessage = err.response?.data || err.message || "خطأ في الحفظ ❌";
        this.toastType = "error";
      }
    },
    resetForm() {
      this.localEmployee = {
        EmployeeNumber: "",
        FullName: "",
        MotherName: "",
        NationalId: "",
        Phone1: "",
        Phone2: "",
        BirthDate: "",
        Gender: "",
        MaritalStatusId: 1,
        username: "",
        password: "",
        IsSuperAdmin: false,
        IsHR: false
      };
      this.errors = { NationalId: "", Phone1: "", Phone2: "", FullName: "", MotherName: "", Photo: "" };
      this.file = null;
    }
  }
};
</script>

<style scoped>
.input {
  @apply p-2 border rounded-lg text-right;
}
</style>
