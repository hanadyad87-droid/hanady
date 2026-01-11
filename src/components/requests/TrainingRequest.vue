<template>
  <div class="flex flex-col gap-6" dir="rtl">

    <!-- عنوان الصفحة -->
    <h2 class="text-2xl font-bold text-blue-800">طلب دورة تدريبية</h2>

    <!-- الفورم + جدول الطلبات السابقة -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

      <!-- الفورم -->
      <div class="bg-white shadow rounded-xl p-4 flex flex-col gap-4">
        <h3 class="font-bold text-lg mb-2">إرسال طلب دورة تدريبية</h3>

        <input v-model="courseName" type="text" placeholder="اسم الدورة *" class="border rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-3/4" />

        <input v-model="startDate" type="date" placeholder="تاريخ البدء *" class="border rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-3/4" />

        <input v-model="duration" type="text" placeholder="مدة الدورة (أيام) *" class="border rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-3/4" />

        <input v-model="organization" type="text" placeholder="الجهة المنظمة" class="border rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-3/4" />

        <textarea v-model="note" placeholder="سبب/هدف الدورة" class="border rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none w-full sm:w-3/4"></textarea>

        <!-- الزر في الوسط -->
        <div class="flex justify-center mt-2">
          <button @click="submitRequest" class="bg-blue-800 text-white rounded-xl py-2 px-6 hover:bg-blue-900 transition w-40 text-center">
            إرسال الطلب
          </button>
        </div>
      </div>

      <!-- جدول الطلبات السابقة -->
      <div class="bg-white shadow rounded-xl p-4 overflow-x-auto">
        <h3 class="font-bold text-lg mb-4">طلبات الدورات السابقة</h3>

        <table class="min-w-full divide-y divide-gray-200 text-right">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-2 text-sm font-medium text-gray-700">رقم الطلب</th>
              <th class="px-4 py-2 text-sm font-medium text-gray-700">اسم الدورة</th>
              <th class="px-4 py-2 text-sm font-medium text-gray-700">تاريخ البدء</th>
              <th class="px-4 py-2 text-sm font-medium text-gray-700">مدة الدورة</th>
              <th class="px-4 py-2 text-sm font-medium text-gray-700">الحالة</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="req in requests" :key="req.id" class="hover:bg-gray-50">
              <td class="px-4 py-2 text-sm text-gray-700">{{ req.id }}</td>
              <td class="px-4 py-2 text-sm text-gray-700">{{ req.courseName }}</td>
              <td class="px-4 py-2 text-sm text-gray-700">{{ req.startDate }}</td>
              <td class="px-4 py-2 text-sm text-gray-700">{{ req.duration }}</td>
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
  name: "TrainingRequest",
  components: { Toast },
  data() {
    return {
      courseName: "",
      startDate: "",
      duration: "",
      organization: "",
      note: "",
      requests: [
        { id: 1, courseName: "تطوير مهارات الموارد البشرية", startDate: "2026-01-05", duration: "3", status: "مقبول" },
        { id: 2, courseName: "أساسيات المحاسبة", startDate: "2026-01-10", duration: "5", status: "تحت المراجعة" }
      ],
      toastMessage: "",
      toastType: "success"
    };
  },
  methods: {
    submitRequest() {
      // تحقق من الحقول الإلزامية
      if (!this.courseName || !this.startDate || !this.duration) {
        this.toastMessage = "الرجاء ملء جميع الحقول الإلزامية (*)";
        this.toastType = "error";
        return;
      }

      const newRequest = {
        id: this.requests.length + 1,
        courseName: this.courseName,
        startDate: this.startDate,
        duration: this.duration,
        status: "تحت المراجعة"
      };
      this.requests.unshift(newRequest);

      // تفريغ الحقول
      this.courseName = "";
      this.startDate = "";
      this.duration = "";
      this.organization = "";
      this.note = "";

      // إشعار النجاح
      this.toastMessage = "تم إرسال طلب الدورة ✅";
      this.toastType = "success";
    }
  }
};
</script>
