<template>
  <div class="flex flex-col gap-6" dir="rtl">

    <!-- عنوان الصفحة -->
    <h2 class="text-2xl font-bold text-blue-800">طلب إذن خروج</h2>

    <!-- بيانات الموظف الحالية -->
    <div class="bg-white shadow rounded-xl p-4">
      <h3 class="font-bold text-lg mb-2">بياناتك الحالية</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700">
        <p><span class="font-semibold">الاسم الكامل:</span> {{ employee?.FullName || '-' }}</p>
        <p><span class="font-semibold">الإدارة:</span> {{ employee?.Department || '-' }}</p>
        <p><span class="font-semibold">المسمى الوظيفي:</span> {{ employee?.JobTitle || '-' }}</p>
      </div>
    </div>

    <!-- الفورم + الجدول السابق -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

      <!-- الفورم -->
      <div class="bg-white shadow rounded-xl p-4 flex flex-col gap-4">
        <h3 class="font-bold text-lg mb-2">إرسال طلب إذن خروج</h3>

        <select v-model="leaveType" class="border rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-3/4">
          <option disabled value="">اختر نوع الإذن</option>
          <option value="خروج عاجل">خروج عاجل</option>
          <option value="خروج شخصي">خروج شخصي</option>
          <option value="خروج طبي">خروج طبي</option>
        </select>

        <input v-model="date" type="date" class="border rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-3/4" />

        <input v-model="time" type="time" class="border rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-3/4" />

        <textarea v-model="note" placeholder="سبب الإذن" class="border rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none w-full sm:w-3/4"></textarea>

        <div class="flex justify-center mt-2">
          <button @click="submitRequest" class="bg-blue-800 text-white rounded-xl py-2 px-6 hover:bg-blue-900 transition w-40 text-center">
            إرسال الطلب
          </button>
        </div>
      </div>

      <!-- جدول الطلبات السابقة -->
      <div class="bg-white shadow rounded-xl p-4 overflow-x-auto">
        <h3 class="font-bold text-lg mb-4">طلبات الإذن السابقة</h3>

        <table class="min-w-full divide-y divide-gray-200 text-right">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-2 text-sm font-medium text-gray-700">رقم الطلب</th>
              <th class="px-4 py-2 text-sm font-medium text-gray-700">التاريخ</th>
              <th class="px-4 py-2 text-sm font-medium text-gray-700">الوقت</th>
              <th class="px-4 py-2 text-sm font-medium text-gray-700">نوع الإذن</th>
              <th class="px-4 py-2 text-sm font-medium text-gray-700">الحالة</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="req in requests" :key="req.id" class="hover:bg-gray-50">
              <td class="px-4 py-2 text-sm text-gray-700">{{ req.id }}</td>
              <td class="px-4 py-2 text-sm text-gray-700">{{ req.date }}</td>
              <td class="px-4 py-2 text-sm text-gray-700">{{ req.time }}</td>
              <td class="px-4 py-2 text-sm text-gray-700">{{ req.type }}</td>
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

    <!-- Toast -->
    <Toast v-if="toastMessage" :message="toastMessage" :type="toastType" />

  </div>
</template>

<script>
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
      requests: [
        { id: 1, date: "2026-01-05", time: "10:00", type: "خروج عاجل", status: "مقبول" },
        { id: 2, date: "2026-01-06", time: "14:00", type: "خروج شخصي", status: "تحت المراجعة" }
      ],
      toastMessage: "",
      toastType: "success"
    };
  },
  methods: {
    submitRequest() {
      if (!this.leaveType || !this.date || !this.time) {
        this.toastMessage = "الرجاء تعبئة جميع الحقول";
        this.toastType = "error";
        setTimeout(() => this.toastMessage = "", 2000);
        return;
      }

      const newRequest = {
        id: this.requests.length + 1,
        date: this.date,
        time: this.time,
        type: this.leaveType,
        status: "تحت المراجعة"
      };
      this.requests.unshift(newRequest);
      this.leaveType = "";
      this.date = "";
      this.time = "";
      this.note = "";

      this.toastMessage = "تم إرسال طلب الإذن ✅";
      this.toastType = "success";
      setTimeout(() => this.toastMessage = "", 2000);
    }
  }
};
</script>
