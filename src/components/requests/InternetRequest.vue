<template>
  <div class="flex flex-col gap-6" dir="rtl">

    <!-- عنوان الصفحة -->
    <h2 class="text-2xl font-bold text-blue-800">طلب إنترنت</h2>

    <!-- الفورم + جدول الطلبات السابقة -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

      <!-- الفورم -->
      <div class="bg-white shadow rounded-xl p-4 flex flex-col gap-4">
        <h3 class="font-bold text-lg mb-2">إرسال طلب إنترنت</h3>

        <select v-model="internetType" class="border rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-3/4">
          <option disabled value="">اختر نوع الجهاز / الخدمة</option>
  <option value="جهاز مكتبي">جهاز مكتبي</option>
  <option value="لابتوب">لابتوب</option>
  <option value="راوتر">راوتر / مودم</option>
  <option value="صيانة">صيانة / تركيب</option>
</select>
        <textarea v-model="reason" placeholder="سبب الطلب" class="border rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none w-full sm:w-3/4"></textarea>

        <!-- الزر في الوسط -->
        <div class="flex justify-center mt-2">
          <button @click="submitRequest" class="bg-blue-800 text-white rounded-xl py-2 px-6 hover:bg-blue-900 transition w-40 text-center">
            إرسال الطلب
          </button>
        </div>
      </div>

      <!-- جدول الطلبات السابقة -->
      <div class="bg-white shadow rounded-xl p-4 overflow-x-auto">
        <h3 class="font-bold text-lg mb-4">طلبات الإنترنت السابقة</h3>

        <table class="min-w-full divide-y divide-gray-200 text-right">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-2 text-sm font-medium text-gray-700">رقم الطلب</th>
              <th class="px-4 py-2 text-sm font-medium text-gray-700">التاريخ</th>
              <th class="px-4 py-2 text-sm font-medium text-gray-700">نوع الطلب</th>
              <th class="px-4 py-2 text-sm font-medium text-gray-700">سبب الطلب</th>
              <th class="px-4 py-2 text-sm font-medium text-gray-700">الحالة</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="req in requests" :key="req.id" class="hover:bg-gray-50">
              <td class="px-4 py-2 text-sm text-gray-700">{{ req.id }}</td>
              <td class="px-4 py-2 text-sm text-gray-700">{{ req.date }}</td>
              <td class="px-4 py-2 text-sm text-gray-700">{{ req.type }}</td>
              <td class="px-4 py-2 text-sm text-gray-700">{{ req.reason }}</td>
              <td class="px-4 py-2 text-sm" 
                  :class="{'text-green-600': req.status==='مقبول', 'text-red-600': req.status==='مرفوض', 'text-yellow-600': req.status==='تحت المراجعة'}">
                {{ req.status }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>

    <!-- Toast -->
    <Toast v-if="toastMessage" :message="toastMessage" :type="toastType" />

  </div>
</template>

<script>
import Toast from '../Toast.vue';

export default {
  name: "InternetRequest",
  components: { Toast },
  data() {
    return {
      internetType: "",
      reason: "",
      requests: [
        { id: 1, date: "2026-01-05", type: "مؤسسي", reason: "تفعيل الإنترنت للقسم الجديد", status: "مقبول" },
        { id: 2, date: "2026-01-06", type: "صيانة", reason: "تركيب راوتر جديد", status: "تحت المراجعة" }
      ],
      toastMessage: "",
      toastType: "success"
    };
  },
  methods: {
    submitRequest() {
      if (!this.internetType || !this.reason) {
        this.toastMessage = "الرجاء اختيار النوع وكتابة سبب الطلب";
        this.toastType = "error";
        return;
      }

      const newRequest = {
        id: this.requests.length + 1,
        date: new Date().toISOString().split("T")[0],
        type: this.internetType,
        reason: this.reason,
        status: "تحت المراجعة"
      };

      this.requests.unshift(newRequest);
      this.internetType = "";
      this.reason = "";

      this.toastMessage = "تم إرسال طلب الإنترنت ✅";
      this.toastType = "success";
    }
  }
};
</script>
