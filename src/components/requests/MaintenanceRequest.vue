<template>
  <div class="flex flex-col gap-6" dir="rtl">

    <!-- عنوان الصفحة -->
    <h2 class="text-2xl font-bold text-blue-800">طلب صيانة</h2>

    <!-- الفورم + الجدول جنب بعض -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

      <!-- الفورم -->
      <div class="bg-white shadow rounded-xl p-4 flex flex-col gap-4">
        <h3 class="font-bold text-lg mb-2">إرسال طلب الصيانة</h3>

        <input v-model="device" type="text" placeholder="الجهاز / المعدات" 
               class="border rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-3/4" />

        <textarea v-model="issue" placeholder="وصف المشكلة" 
                  class="border rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none w-full sm:w-3/4"></textarea>

        <input v-model="location" type="text" placeholder="المكان / المكتب" 
               class="border rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-3/4" />

        <div class="flex justify-center mt-2">
          <button @click="submitRequest" class="bg-blue-800 text-white rounded-xl py-2 px-6 hover:bg-blue-900 transition w-40 text-center">
            إرسال الطلب
          </button>
        </div>
      </div>

      <!-- جدول الطلبات السابقة -->
      <div class="bg-white shadow rounded-xl p-4 overflow-x-auto">
        <h3 class="font-bold text-lg mb-4">طلبات الصيانة السابقة</h3>

        <table class="min-w-full divide-y divide-gray-200 text-right">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-2 text-sm font-medium text-gray-700">رقم الطلب</th>
              <th class="px-4 py-2 text-sm font-medium text-gray-700">التاريخ</th>
              <th class="px-4 py-2 text-sm font-medium text-gray-700">الجهاز / المعدات</th>
              <th class="px-4 py-2 text-sm font-medium text-gray-700">الوصف</th>
              <th class="px-4 py-2 text-sm font-medium text-gray-700">المكان</th>
              <th class="px-4 py-2 text-sm font-medium text-gray-700">الحالة</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="req in requests" :key="req.id" class="hover:bg-gray-50">
              <td class="px-4 py-2 text-sm text-gray-700">{{ req.id }}</td>
              <td class="px-4 py-2 text-sm text-gray-700">{{ req.date }}</td>
              <td class="px-4 py-2 text-sm text-gray-700">{{ req.device }}</td>
              <td class="px-4 py-2 text-sm text-gray-700">{{ req.issue }}</td>
              <td class="px-4 py-2 text-sm text-gray-700">{{ req.location }}</td>
              <td class="px-4 py-2 text-sm" 
                  :class="{
                    'text-green-600': req.status==='مقبول',
                    'text-red-600': req.status==='مرفوض',
                    'text-yellow-600': req.status==='تحت المراجعة'
                  }">
                {{ req.status }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>

    <!-- Toast للإشعارات -->
    <Toast v-if="toastMessage" :message="toastMessage" :type="toastType" />

  </div>
</template>

<script>
import Toast from '../Toast.vue';

export default {
  name: "MaintenanceRequest",
  components: { Toast },
  data() {
    return {
      device: "",
      issue: "",
      location: "",
      requests: [
        { id: 1, date: "2026-01-05", device: "حاسوب", issue: "لا يعمل", location: "المكتب 101", status: "مقبول" },
        { id: 2, date: "2026-01-06", device: "طابعة", issue: "تعطل الورق", location: "المكتب 102", status: "تحت المراجعة" }
      ],
      toastMessage: "",
      toastType: "success"
    };
  },
  methods: {
    submitRequest() {
      if (!this.device || !this.issue || !this.location) {
        this.toastMessage = "الرجاء تعبئة جميع الحقول";
        this.toastType = "error";
        return;
      }

      const newRequest = {
        id: this.requests.length + 1,
        date: new Date().toISOString().split("T")[0],
        device: this.device,
        issue: this.issue,
        location: this.location,
        status: "تحت المراجعة"
      };

      this.requests.unshift(newRequest);

      this.device = "";
      this.issue = "";
      this.location = "";

      this.toastMessage = "تم إرسال طلب الصيانة ✅";
      this.toastType = "success";
    }
  }
};
</script>

<style scoped>
/* Responsive adjustments */
@media (max-width: 1024px) {
  .grid-cols-1 {
    grid-template-columns: 1fr !important;
  }
}
</style>
