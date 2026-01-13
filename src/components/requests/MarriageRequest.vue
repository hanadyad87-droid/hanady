<template>
 <div class="flex flex-col gap-6" dir="rtl">

    <!-- الكارد الأبيض + الظل + padding مثل صفحة النقل -->
    <div class="bg-white shadow rounded-xl p-4">

      <!-- عنوان الصفحة -->
      <h2 class="text-2xl font-bold text-blue-800 mb-6">
        طلب إجازة زواج 
      </h2>

      <!-- بيانات الموظف -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-gray-700">
        <p><span class="font-semibold">الاسم الكامل:</span> {{ employee.FullName }}</p>
        <p><span class="font-semibold">رقم الهوية:</span> {{ employee.NationalId }}</p>
        <p><span class="font-semibold">الإدارة:</span> {{ employee.Department }}</p>
        <p><span class="font-semibold">المسمى الوظيفي:</span> {{ employee.JobTitle }}</p>
      </div>

      <!-- الفورم -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <!-- تاريخ الزواج -->
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">تاريخ الزواج</label>
          <input type="date" v-model="marriageDate" class="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <!-- عدد الأيام -->
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">عدد أيام الإجازة</label>
          <input type="number" min="1" v-model="days" class="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <!-- إرفاق النموذج -->
        <div class="lg:col-span-2">
          <label class="block mb-1 text-sm font-medium text-gray-700">إرفاق نموذج عقد الزواج</label>
          <input type="file" @change="handleFile" accept=".pdf,image/*" class="w-full p-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <p class="text-xs text-gray-500 mt-1">الصيغ المسموحة: PDF أو صورة</p>
          <p v-if="attachment" class="text-sm text-green-600 mt-1">📎 {{ attachment.name }}</p>
        </div>

        <!-- ملاحظات -->
        <div class="lg:col-span-2">
          <label class="block mb-1 text-sm font-medium text-gray-700">ملاحظات (اختياري)</label>
          <textarea v-model="note" rows="3" class="w-full p-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
        </div>

      </div>

      <!-- زر الإرسال -->
      <div class="flex justify-center mt-6">
        <button @click="submitRequest" class="bg-primary hover:bg-primaryDark text-white py-2 px-6 rounded-lg transition w-full max-w-xs">
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
  name: "MarriageLeave",
  components: { Toast },
  props: { employee: { type: Object, required: true } },
  data() {
    return {
      marriageDate: "",
      days: "",
      note: "",
      attachment: null,
      toastMessage: "",
      toastType: "success"
    };
  },
  methods: {
    handleFile(event) {
      this.attachment = event.target.files[0];
    },
    submitRequest() {
      if (!this.marriageDate) {
        this.toastMessage = "الرجاء اختيار تاريخ الزواج";
        this.toastType = "error";
        return;
      }
      if (!this.days || this.days <= 0) {
        this.toastMessage = "الرجاء إدخال عدد أيام الإجازة بشكل صحيح";
        this.toastType = "error";
        return;
      }
      if (!this.attachment) {
        this.toastMessage = "الرجاء إرفاق نموذج عقد الزواج";
        this.toastType = "error";
        return;
      }

      this.toastMessage = "تم إرسال طلب إجازة الزواج بنجاح 💍📎";
      this.toastType = "success";

      setTimeout(() => {
        this.toastMessage = "";
        this.marriageDate = "";
        this.days = "";
        this.note = "";
        this.attachment = null;
      }, 2000);
    }
  }
};
</script>
