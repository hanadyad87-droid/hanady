<template>
  <div class="flex flex-col gap-6" dir="rtl">

    <!-- عنوان الصفحة -->
    <h2 class="text-2xl font-bold text-blue-800">طلب تعديل البيانات</h2>

    <!-- بيانات الموظف الحالية -->
    <div class="bg-white shadow rounded-xl p-4">
      <h3 class="font-bold text-lg mb-2">بياناتك الحالية</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700">
        <p><span class="font-semibold">الاسم الكامل:</span> {{ employee?.FullName || '-' }}</p>
        <p><span class="font-semibold">رقم الهوية:</span> {{ employee?.NationalId || '-' }}</p>
        <p><span class="font-semibold">تاريخ الميلاد:</span> {{ employee?.BirthDate || '-' }}</p>
        <p><span class="font-semibold">الجنس:</span> {{ employee?.Gender || '-' }}</p>
        <p><span class="font-semibold">الإدارة:</span> {{ employee?.Department || '-' }}</p>
        <p><span class="font-semibold">المسمى الوظيفي:</span> {{ employee?.JobTitle || '-' }}</p>
      </div>
    </div>

    <!-- فورم طلب التعديل + جدول سابق -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

      <!-- الفورم -->
      <div class="bg-white shadow rounded-xl p-4 flex flex-col gap-4">
        <h3 class="font-bold text-lg mb-2">إرسال طلب تعديل</h3>

        <select v-model="fieldToUpdate" class="border rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-3/4">
          <option disabled value="">اختر الحقل</option>
          <option value="FullName">الاسم الكامل</option>
          <option value="NationalId">رقم الهوية</option>
          <option value="Department">الإدارة</option>
          <option value="JobTitle">المسمى الوظيفي</option>
        </select>

        <input v-model="newValue" type="text" placeholder="القيمة الجديدة" class="border rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-3/4" />

        <textarea v-model="note" placeholder="سبب التعديل" class="border rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none w-full sm:w-3/4"></textarea>

        <!-- الزر في الوسط -->
        <div class="flex justify-center mt-2">
          <button @click="submitRequest" class="bg-blue-800 text-white rounded-xl py-2 px-6 hover:bg-blue-900 transition w-40 text-center">
            إرسال الطلب
          </button>
        </div>
      </div>

      <!-- جدول الطلبات السابقة -->
      <div class="bg-white shadow rounded-xl p-4 overflow-x-auto">
        <h3 class="font-bold text-lg mb-4">طلباتك السابقة</h3>

        <table class="min-w-full divide-y divide-gray-200 text-right">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-2 text-sm font-medium text-gray-700">رقم الطلب</th>
              <th class="px-4 py-2 text-sm font-medium text-gray-700">التاريخ</th>
              <th class="px-4 py-2 text-sm font-medium text-gray-700">الحقل</th>
              <th class="px-4 py-2 text-sm font-medium text-gray-700">القيمة الجديدة</th>
              <th class="px-4 py-2 text-sm font-medium text-gray-700">الحالة</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="req in requests" :key="req.id" class="hover:bg-gray-50">
              <td class="px-4 py-2 text-sm text-gray-700">{{ req.id }}</td>
              <td class="px-4 py-2 text-sm text-gray-700">{{ req.date }}</td>
              <td class="px-4 py-2 text-sm text-gray-700">{{ req.field }}</td>
              <td class="px-4 py-2 text-sm text-gray-700">{{ req.newValue }}</td>
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
  name: "UpdateInfo",
  components: { Toast },
  props: { employee: { type: Object, required: true } },
  data() {
    return {
      fieldToUpdate: "",
      newValue: "",
      note: "",
      requests: [
        { id: 1, date: "2026-01-05", field: "FullName", newValue: "هند عبدالله", status: "مقبول" },
        { id: 2, date: "2026-01-06", field: "Department", newValue: "الموارد البشرية", status: "تحت المراجعة" }
      ],
      toastMessage: "",
      toastType: "success"
    };
  },
  methods: {
    submitRequest() {
      if (!this.fieldToUpdate || !this.newValue) {
        this.toastMessage = "الرجاء اختيار الحقل وإدخال القيمة الجديدة";
        this.toastType = "error";

        // تختفي بعد ثانيتين
        setTimeout(() => this.toastMessage = "", 2000);
        return;
      }

      const newRequest = {
        id: this.requests.length + 1,
        date: new Date().toISOString().split("T")[0],
        field: this.fieldToUpdate,
        newValue: this.newValue,
        status: "تحت المراجعة"
      };
      this.requests.unshift(newRequest);
      this.fieldToUpdate = "";
      this.newValue = "";
      this.note = "";

      this.toastMessage = "تم إرسال طلب التعديل ✅";
      this.toastType = "success";

      // تختفي بعد ثانيتين
      setTimeout(() => this.toastMessage = "", 2000);
    }
  }
};
</script>
