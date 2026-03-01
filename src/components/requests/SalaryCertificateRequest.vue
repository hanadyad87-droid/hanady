<template>
  <div class="flex flex-col gap-6" dir="rtl">

    <!-- عنوان الصفحة -->
    <h2 class="text-2xl font-bold text-blue-800">طلب شهادة راتب</h2>

    <!-- الفورم -->
    <div class="bg-white shadow-xl rounded-xl p-6 max-w-lg mx-auto flex flex-col gap-4">
      <h3 class="font-bold text-lg text-gray-800 mb-2">إرسال طلب شهادة راتب</h3>

      <textarea v-model="note" placeholder="الغرض من الشهادة" 
                class="border rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none w-full h-28"></textarea>

      <button @click="submitRequest" 
              class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition w-full">
        إرسال الطلب
      </button>
    </div>

    <!-- Toast للإشعارات -->
    <Toast v-if="toastMessage" :message="toastMessage" :type="toastType" />
    
  </div>
</template>

<script>
import axios from "axios";
import Toast from '../Toast.vue';

export default {
  name: "SalaryCertificateRequest",
  components: { Toast },
  props: { employee: { type: Object, required: true } },
  data() {
    return {
      note: "",
      toastMessage: "",
      toastType: "success"
    };
  },
  methods: {
    async submitRequest() {
      if (!this.note.trim()) {
        this.toastMessage = "الرجاء إدخال الغرض من الشهادة";
        this.toastType = "error";
        setTimeout(() => this.toastMessage = "", 3000);
        return;
      }

      try {
        const payload = { purpose: this.note };

        const res = await axios.post("/api/SalaryCertificate/submit", payload);

        this.toastMessage = res.data?.Message || "تم إرسال الطلب بنجاح ✅";
        this.toastType = "success";

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