<template>
  <div dir="rtl" class="w-full">

    <!-- العنوان -->
    <h3 class="text-xl font-bold mb-4 text-right text-blue-800">
      البيانات المالية
    </h3>

    <!-- الفورم -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

      <div class="flex flex-col">
        <label class="text-sm text-gray-600 mb-1">المرتب الأساسي</label>
        <input
          type="number"
          v-model.number="form.Salary"
          placeholder="المرتب الأساسي"
          class="input"
        />
      </div>

      <div class="flex flex-col">
        <label class="text-sm text-gray-600 mb-1">المصرف</label>
        <select
  v-model.number="form.BankId"
  class="input select-rtl"
>

          <option :value="null">اختر المصرف</option>
          <option :value="1">مصرف الجمهورية</option>
          <option :value="2">مصرف الصحاري</option>
        </select>
      </div>

      <div class="flex flex-col sm:col-span-2">
        <label class="text-sm text-gray-600 mb-1">فرع المصرف</label>
        <select v-model.number="form.BankBranchId" class="input select-rtl">
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
        class="bg-primary hover:bg-primaryDark text-white py-2 px-6 rounded-lg transition w-full max-w-xs"
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
  name: "FinancialInfo",
  props: {
    employeeId: {
      type: Number,
      required: true
    }
  },
  components: { Toast },
  data() {
    return {
      form: {
        EmployeeId: this.employeeId,
        Salary: null,
        BankId: null,
        BankBranchId: null
      },
      toastMessage: "",
      toastType: "success"
    };
  },
  methods: {
    async save() {
      if (!this.form.Salary || !this.form.BankId || !this.form.BankBranchId) {
        this.toastMessage = "الرجاء ملء جميع الحقول المطلوبة ❌";
        this.toastType = "error";
        setTimeout(() => this.toastMessage = "", 3000);
        return;
      }

      try {
        const res = await api.post(
          "/EmployeeFinancialDatas/create",
          this.form
        );
        this.toastMessage = "تم حفظ البيانات المالية ✅";
        this.toastType = "success";
        setTimeout(() => this.toastMessage = "", 3000);
        console.log(res.data);
      } catch (err) {
        console.error(err);
        this.toastMessage = "حدث خطأ أثناء الحفظ ❌";
        this.toastType = "error";
        setTimeout(() => this.toastMessage = "", 3000);
      }
    }
  }
};
</script>

<style scoped>
.input {
  @apply p-2 border rounded-lg;
}
</style>
