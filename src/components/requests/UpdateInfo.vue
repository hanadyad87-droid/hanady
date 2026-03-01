<template>
  <div class="flex flex-col gap-6" dir="rtl">

    <!-- عنوان الصفحة -->
    <h2 class="text-2xl font-bold text-blue-800 text-center">طلب تعديل البيانات</h2>

    <!-- الفورم -->
    <div class="bg-white shadow-xl rounded-xl p-6 max-w-lg mx-auto flex flex-col gap-4">
      <h3 class="font-bold text-lg mb-2">إرسال طلب تعديل</h3>

      <select v-model="fieldToUpdate" class="border rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full">
        <option disabled value="">اختر الحقل</option>
        <option value="FullName">الاسم الكامل</option>
        <option value="NationalId">رقم الهوية</option>
        <option value="Department">الإدارة</option>
        <option value="JobTitle">المسمى الوظيفي</option>
      </select>

      <input v-model="newValue" type="text" placeholder="القيمة الجديدة"
             class="border rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" />

      <textarea v-model="note" placeholder="سبب التعديل"
                class="border rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none w-full h-24"></textarea>

      <button @click="submitRequest"
              class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition w-full">
        إرسال الطلب
      </button>
    </div>

    <!-- Toast -->
    <Toast v-if="toastMessage" :message="toastMessage" :type="toastType" />

  </div>
</template>

<script>
import axios from "axios";
import Toast from '../Toast.vue';

export default {
  name: "UpdateInfo",
  components: { Toast },
  props: { employee: { type: Object, required: true } },
  data() {
    return {
      fieldToUpdate: "",
      newValue: "",
      note: "",
      toastMessage: "",
      toastType: "success"
    };
  },
  methods: {
    async submitRequest() {
      if (!this.fieldToUpdate || !this.newValue) {
        this.toastMessage = "الرجاء اختيار الحقل وإدخال القيمة الجديدة";
        this.toastType = "error";
        setTimeout(() => this.toastMessage = "", 3000);
        return;
      }

      try {
        const payload = {
          fieldName: this.fieldToUpdate,
          newValue: this.newValue,
          reason: this.note
        };

        await axios.post("/api/EmployeeUpdate/submit", payload);

        this.toastMessage = "تم إرسال طلب التعديل بنجاح ✅";
        this.toastType = "success";

        // إعادة تهيئة الفورم
        this.fieldToUpdate = "";
        this.newValue = "";
        this.note = "";

      } catch (error) {
        console.error("خطأ في إرسال الطلب:", error);
        this.toastMessage = "فشل إرسال الطلب";
        this.toastType = "error";
        setTimeout(() => this.toastMessage = "", 3000);
      }
    }
  }
};
</script>

<style scoped>
textarea {
  transition: all 0.2s ease-in-out;
}

button {
  transition: background-color 0.2s ease-in-out, transform 0.2s ease-in-out;
}

button:hover {
  transform: translateY(-2px);
}
</style>