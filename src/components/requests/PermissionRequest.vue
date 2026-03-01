<template>
  <div class="flex flex-col gap-6" dir="rtl">

    <!-- عنوان الصفحة -->
    <h2 class="text-2xl font-bold text-blue-800">طلب إذن خروج</h2>

 

    <!-- الفورم -->
    <div class="bg-white shadow-xl rounded-xl p-6 max-w-lg mx-auto flex flex-col gap-4">
      <h3 class="font-bold text-lg mb-2">إرسال طلب إذن خروج</h3>

      <select v-model="leaveType" class="border rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full">
        <option disabled value="">اختر نوع الإذن</option>
        <option value="خروج عاجل">خروج عاجل</option>
        <option value="خروج شخصي">خروج شخصي</option>
        <option value="خروج طبي">خروج طبي</option>
      </select>

      <input v-model="date" type="date" 
             class="border rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" />

      <input v-model="time" type="time" 
             class="border rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" />

      <textarea v-model="note" placeholder="سبب الإذن" 
                class="border rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none w-full h-24"></textarea>

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
  name: "LeaveRequest",
  components: { Toast },
  props: { employee: { type: Object, required: true } },
  data() {
    return {
      leaveType: "",
      date: "",
      time: "",
      note: "",
      requests: [],
      toastMessage: "",
      toastType: "success"
    };
  },
  created() {
    this.fetchRequests();
  },
  methods: {
    async fetchRequests() {
      try {
        const res = await axios.get("/api/ExitPermit/my-requests");
        this.requests = res.data.map(r => ({
          id: r.id,
          date: r.permitDate,
          time: r.permitTime,
          type: r.permitType,
          status: r.status
        }));
      } catch (error) {
        console.error("خطأ في جلب الطلبات:", error);
      }
    },
    async submitRequest() {
      if (!this.leaveType || !this.date || !this.time) {
        this.toastMessage = "الرجاء تعبئة جميع الحقول";
        this.toastType = "error";
        setTimeout(() => this.toastMessage = "", 3000);
        return;
      }

      try {
        const payload = {
          permitType: this.leaveType,
          permitDate: this.date,
          permitTime: this.time,
          reason: this.note
        };

        const res = await axios.post("/api/ExitPermit/create", payload);

        this.toastMessage = res.data?.Message || "تم إرسال الطلب بنجاح ✅";
        this.toastType = "success";

        // إعادة تحميل الطلبات
        this.fetchRequests();

        // إعادة تهيئة الفورم
        this.leaveType = "";
        this.date = "";
        this.time = "";
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