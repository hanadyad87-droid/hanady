<template>
  <div class="flex flex-col gap-6" dir="rtl">

    <!-- عنوان الصفحة -->
    <h2 class="text-2xl font-bold text-blue-800">طلب صيانة</h2>

    <!-- الفورم -->
    <div class="bg-white shadow-xl rounded-xl p-6 max-w-lg mx-auto flex flex-col gap-4">
      <h3 class="font-bold text-lg text-gray-800 mb-2">إرسال طلب الصيانة</h3>

      <input v-model="device" type="text" placeholder="الجهاز / المعدات" 
             class="border rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" />

      <textarea v-model="issue" placeholder="وصف المشكلة" 
                class="border rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none w-full h-32"></textarea>

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
  name: "MaintenanceRequest",
  components: { Toast },
  data() {
    return {
      device: "",
      issue: "",
      toastMessage: "",
      toastType: "success"
    };
  },
  methods: {
    async submitRequest() {
      if (!this.device || !this.issue) {
        this.toastMessage = "الرجاء تعبئة جميع الحقول";
        this.toastType = "error";
        return;
      }

      try {
        const formData = new FormData();
        formData.append("EquipmentName", this.device);
        formData.append("ProblemDescription", this.issue);

        const res = await axios.post("/api/Maintenance/submit", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });

        this.toastMessage = res.data.Message || "تم إرسال الطلب بنجاح ✅";
        this.toastType = "success";

        this.device = "";
        this.issue = "";

      } catch (error) {
        console.error("خطأ في إرسال الطلب:", error);
        this.toastMessage = "فشل إرسال الطلب";
        this.toastType = "error";
      }
    }
  }
};
</script>

<style scoped>
/* تحسينات التصميم */
input, textarea {
  transition: all 0.2s ease-in-out;
}

button {
  transition: background-color 0.2s ease-in-out, transform 0.2s ease-in-out;
}

button:hover {
  transform: translateY(-2px);
}
</style>