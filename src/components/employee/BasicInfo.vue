<template>
  <div class="basic-info p-4" dir="rtl">

    <h3 class="text-xl font-bold mb-4 text-right text-blue-800">
      البيانات الأساسية
    </h3>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

      <div class="flex flex-col">
        <label class="text-sm text-gray-600 mb-1">رقم الموظف</label>
        <input v-model="localEmployee.EmployeeNumber" class="input" />
      </div>

      <div class="flex flex-col">
        <label class="text-sm text-gray-600 mb-1">الاسم الكامل</label>
        <input v-model="localEmployee.FullName" class="input" />
      </div>

      <div class="flex flex-col">
        <label class="text-sm text-gray-600 mb-1">اسم الأم</label>
        <input v-model="localEmployee.MotherName" class="input" />
      </div>

      <div class="flex flex-col">
        <label class="text-sm text-gray-600 mb-1">رقم الهوية</label>
        <input v-model="localEmployee.NationalId" class="input" />
      </div>

      <div class="flex flex-col">
        <label class="text-sm text-gray-600 mb-1">تاريخ الميلاد</label>
        <input type="date" v-model="localEmployee.BirthDate" class="input" />
      </div>

      <div class="flex flex-col">
        <label class="text-sm text-gray-600 mb-1">الجنس</label>
        <select v-model="localEmployee.Gender" class="input text-right pr-2">
          <option value="">اختر</option>
          <option value="ذكر">ذكر</option>
          <option value="أنثى">أنثى</option>
        </select>
      </div>

      <div class="flex flex-col">
        <label class="text-sm text-gray-600 mb-1">الجنسية</label>
        <input v-model="localEmployee.Nationality" class="input" />
      </div>

      <div class="flex flex-col">
        <label class="text-sm text-gray-600 mb-1">تاريخ التعيين</label>
        <input type="date" v-model="localEmployee.HireDate" class="input" />
      </div>

      <div class="flex flex-col">
        <label class="text-sm text-gray-600 mb-1">الحالة الاجتماعية</label>
        <select v-model="localEmployee.MaritalStatusId" class="input text-right pr-2">
          <option value="">اختر</option>
          <option value="1">أعزب</option>
          <option value="2">متزوج</option>
          <option value="3">مطلق</option>
          <option value="4">أرمل</option>
        </select>
      </div>

      <div class="flex flex-col">
        <label class="text-sm text-gray-600 mb-1">المسمى الوظيفي</label>
        <select v-model="localEmployee.JobTitleId" class="input text-right pr-2">
          <option value="">اختر</option>
          <option value="1">موظف</option>
          <option value="2">فني</option>
        </select>
      </div>

      <div class="flex flex-col">
        <label class="text-sm text-gray-600 mb-1">حالة التوظيف</label>
        <select v-model="localEmployee.EmploymentStatusId" class="input text-right pr-2">
          <option value="">اختر</option>
          <option value="1">مثبت</option>
          <option value="2">متعاقد</option>
        </select>
      </div>

      <div class="flex flex-col">
        <label class="text-sm text-gray-600 mb-1">الإدارة</label>
        <select v-model="localEmployee.DepartmentId" class="input text-right pr-2">
          <option value="">اختر</option>
          <option value="1">الموارد البشرية</option>
          <option value="2">تقنية المعلومات</option>
        </select>
      </div>

      <div class="flex flex-col">
        <label class="text-sm text-gray-600 mb-1">موقع العمل</label>
        <select v-model="localEmployee.WorkLocationId" class="input text-right pr-2">
          <option value="">اختر</option>
          <option value="1">طرابلس</option>
          <option value="2">بنغازي</option>
        </select>
      </div>

      <div class="flex flex-col">
        <label class="text-sm text-gray-600 mb-1">الدرجة الوظيفية</label>
        <select v-model="localEmployee.JobGradeId" class="input text-right pr-2">
          <option value="">اختر</option>
          <option value="1">الأولى</option>
          <option value="2">الثانية</option>
        </select>
      </div>

    </div>

    <!-- زر الحفظ -->
    <div class="flex justify-center mt-8">
      <button
        @click="save"
        class="bg-blue-800 hover:bg-blue-900 text-white px-8 py-2 rounded-lg transition w-full max-w-xs"
      >
        حفظ البيانات الأساسية
      </button>
    </div>

    <!-- Toast (نفس المالية 100%) -->
    <Toast v-if="toastMessage" :message="toastMessage" :type="toastType" />

  </div>
</template>

<script>
import api from "../../services/api";
import Toast from "../Toast.vue";

export default {
  name: "BasicInfo",
  props: {
    employee: { type: Object, required: true }
  },
  components: { Toast },
  data() {
    return {
      localEmployee: { ...this.employee },
      toastMessage: "",
      toastType: "success"
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
    async save() {
      if (!this.localEmployee.EmployeeNumber || !this.localEmployee.FullName) {
        this.toastMessage = "الرجاء ملء الحقول المطلوبة ❌";
        this.toastType = "error";
        setTimeout(() => (this.toastMessage = ""), 3000);
        return;
      }

      try {
        await api.post("/Employee/create", this.localEmployee);
        this.toastMessage = "تم حفظ البيانات الأساسية ✅";
        this.toastType = "success";
        setTimeout(() => (this.toastMessage = ""), 3000);
      } catch (err) {
        console.error(err);
        this.toastMessage = "حدث خطأ أثناء الحفظ ❌";
        this.toastType = "error";
        setTimeout(() => (this.toastMessage = ""), 3000);
      }
    }
  }
};
</script>

<style scoped>
.input {
  @apply p-2 border rounded-lg text-right;
}
</style>
