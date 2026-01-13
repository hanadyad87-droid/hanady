<template>
  <div dir="rtl" class="w-full">

    <!-- العنوان -->
    <h3 class="text-xl font-bold mb-4 text-right text-blue-800">
      البيانات الإدارية
    </h3>

    <!-- الفورم -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

      <div class="flex flex-col">
        <label class="text-sm text-gray-600 mb-1">رقم الموظف</label>
        <input
          type="text"
          v-model="form.EmployeeNumber"
          class="input"
          placeholder="رقم الموظف"
        />
      </div>

      <div class="flex flex-col">
        <label class="text-sm text-gray-600 mb-1">الإدارة</label>
        <select v-model="form.DepartmentId" class="input text-left pr-2">
          <option :value="null">اختر الإدارة</option>
          <option :value="1">إدارة الموارد البشرية</option>
          <option :value="2">إدارة تقنية المعلومات</option>
        </select>
      </div>

      <div class="flex flex-col">
        <label class="text-sm text-gray-600 mb-1">المسمى الوظيفي</label>
        <select v-model="form.JobTitleId" class="input text-left pr-2">
          <option :value="null">اختر</option>
          <option :value="1">موظف</option>
          <option :value="2">مشرف</option>
        </select>
      </div>

      <div class="flex flex-col">
        <label class="text-sm text-gray-600 mb-1">الدرجة الوظيفية</label>
        <select v-model="form.JobGradeId" class="input text-left pr-2">
          <option :value="null">اختر</option>
          <option :value="1">الأولى</option>
          <option :value="2">الثانية</option>
        </select>
      </div>

      <div class="flex flex-col">
        <label class="text-sm text-gray-600 mb-1">حالة التوظيف</label>
        <select v-model="form.EmploymentStatusId" class="input text-left pr-2">
          <option :value="null">اختر</option>
          <option :value="1">مثبت</option>
          <option :value="2">متعاقد</option>
        </select>
      </div>

      <div class="flex flex-col">
        <label class="text-sm text-gray-600 mb-1">تاريخ التعيين</label>
        <input
          type="date"
          v-model="form.HireDate"
          class="input"
        />
      </div>

    </div>

    <!-- زر الحفظ -->
    <div class="flex justify-center mt-8">
      <button
        @click="save"
        class="bg-primary hover:bg-primaryDark text-white py-2 px-6 rounded-lg transition w-full max-w-xs"
      >
        حفظ البيانات الإدارية
      </button>
    </div>

    <!-- Toast -->
    <Toast v-if="toastMessage" :message="toastMessage" :type="toastType" />

  </div>
</template>

<script>
import Toast from '../Toast.vue';

export default {
  name: "AdminInfo",
  props: {
    employee: Object
  },
  emits: ["update-employee"],
  components: { Toast },
  data() {
    return {
      form: {
        EmployeeNumber: "",
        DepartmentId: null,
        JobTitleId: null,
        JobGradeId: null,
        EmploymentStatusId: null,
        HireDate: ""
      },
      toastMessage: "",
      toastType: "success"
    };
  },
  methods: {
    save() {
      this.$emit("update-employee", { ...this.form });

      this.toastMessage = "تم حفظ البيانات الإدارية ✅";
      this.toastType = "success";

      // إعادة تعيين الرسالة بعد 3 ثواني
      setTimeout(() => {
        this.toastMessage = "";
      }, 3000);
    }
  }
}
</script>

<style scoped>
.input {
  @apply p-2 border rounded-lg;
}
</style>
