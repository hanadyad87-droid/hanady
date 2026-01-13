<template>
  <div class="flex flex-col gap-6" dir="rtl">

    <!-- الكارد -->
    <div class="bg-white shadow rounded-xl p-4 flex flex-col gap-4">

      <!-- عنوان الصفحة -->
      <h2 class="text-2xl font-bold text-blue-800 mb-6">
        طلب إنترنت
      </h2>

      <!-- بيانات الموظف -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-gray-700">
        <p><span class="font-semibold">الاسم الكامل:</span> {{ employee.FullName }}</p>
        <p><span class="font-semibold">رقم الهوية:</span> {{ employee.NationalId }}</p>
        <p><span class="font-semibold">الإدارة:</span> {{ employee.Department }}</p>
        <p><span class="font-semibold">المسمى الوظيفي:</span> {{ employee.JobTitle }}</p>
      </div>

      <!-- الفورم -->
      <div class="grid grid-cols-1 gap-4">

        <!-- سبب الطلب -->
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">سبب طلب الإنترنت</label>
          <textarea 
            v-model="reason" 
            rows="4" 
            class="w-full p-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500">
          </textarea>
        </div>

      </div>

      <!-- زر الإرسال -->
      <div class="flex justify-center mt-6">
        <button 
          @click="submitRequest" 
          class="bg-primary hover:bg-primaryDark text-white py-2 px-6 rounded-lg transition w-full max-w-xs">
          إرسال الطلب
        </button>
      </div>

      <!-- Toast -->
      <Toast v-if="toastMessage" :message="toastMessage" :type="toastType" />
    </div>

  </div>
</template>

<script>
import Toast from "../Toast.vue";

export default {
  name: "InternetRequest",
  components: { Toast },
  props: { employee: { type: Object, required: true } },
  data() {
    return {
      reason: "",
      toastMessage: "",
      toastType: "success"
    };
  },
  methods: {
    submitRequest() {
      // فلديشن
      if (!this.reason.trim()) {
        this.toastMessage = "الرجاء كتابة سبب طلب الإنترنت";
        this.toastType = "error";
        return;
      }

      // إظهار رسالة النجاح
      this.toastMessage = "تم إرسال طلب الإنترنت ✅";
      this.toastType = "success";

      // تفريغ الحقل بعد ثانيتين
      setTimeout(() => {
        this.toastMessage = "";
        this.reason = "";
      }, 2000);
    }
  }
};
</script>
