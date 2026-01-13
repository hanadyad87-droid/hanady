<template>
  <div class="flex min-h-screen bg-gray-100">

    <!-- Sidebar -->
    <Sidebar class="fixed top-0 right-0 h-screen w-24 md:w-64 z-50" />

    <!-- المحتوى -->
    <div class="flex-1 p-6 mr-24 md:mr-64" dir="rtl">

      <!-- Navbar -->
      <Navbar />

      <!-- الكارد الرئيسي -->
      <div class="bg-white rounded-xl shadow-lg p-6 max-w-5xl mx-auto flex flex-col gap-6">

        <!-- عنوان الصفحة -->
        <h2 class="text-2xl font-bold text-primary text-right">
          طلب تعديل البيانات
        </h2>

        <!-- بيانات الموظف -->
        <div class="bg-gray-50 rounded-xl p-4">
          <h3 class="font-bold text-lg mb-2">بياناتك الحالية</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700">
            <p><span class="font-semibold">الاسم الكامل:</span> {{ employee.FullName }}</p>
            <p><span class="font-semibold">رقم الهوية:</span> {{ employee.NationalId }}</p>
            <p><span class="font-semibold">تاريخ الميلاد:</span> {{ employee.BirthDate }}</p>
            <p><span class="font-semibold">الجنس:</span> {{ employee.Gender }}</p>
            <p><span class="font-semibold">الإدارة:</span> {{ employee.Department }}</p>
            <p><span class="font-semibold">المسمى الوظيفي:</span> {{ employee.JobTitle }}</p>
          </div>
        </div>

        <!-- الفورم + الجدول -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <!-- الفورم -->
          <div class="border rounded-xl p-4 flex flex-col gap-4">
            <h3 class="font-bold text-lg">إرسال طلب تعديل</h3>

        <select
  v-model="fieldToUpdate"
  class="border rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-3/4"
>
  <option disabled value="">اختر الحقل</option>
  <option value="FullName">الاسم الكامل</option>
  <option value="NationalId">رقم الهوية</option>
  <option value="PhoneNumber">رقم الهاتف</option>
  <option value="Email">البريد الإلكتروني</option>
</select>

            <input v-model="newValue" type="text" placeholder="القيمة الجديدة" class="input" />

            <textarea v-model="note" placeholder="سبب التعديل" class="input resize-none"></textarea>

            <div class="flex justify-center">
              <button
                @click="submitRequest"
                class="bg-primary hover:bg-primaryDark text-white py-2 px-6 rounded-lg transition w-full max-w-xs"
              >
                إرسال الطلب
              </button>
            </div>
          </div>

          <!-- جدول الطلبات -->
          <div class="border rounded-xl p-4 overflow-x-auto">
            <h3 class="font-bold text-lg mb-3">طلباتك السابقة</h3>

            <table class="min-w-full text-sm text-right">
              <thead class="bg-gray-100">
                <tr>
                  <th class="px-3 py-2">رقم</th>
                  <th class="px-3 py-2">التاريخ</th>
                  <th class="px-3 py-2">الحقل</th>
                  <th class="px-3 py-2">القيمة</th>
                  <th class="px-3 py-2">الحالة</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="req in requests"
                  :key="req.id"
                  class="odd:bg-gray-50"
                >
                  <td class="px-3 py-2">{{ req.id }}</td>
                  <td class="px-3 py-2">{{ req.date }}</td>
                  <td class="px-3 py-2">{{ req.field }}</td>
                  <td class="px-3 py-2">{{ req.newValue }}</td>
                  <td
                    class="px-3 py-2 font-semibold"
                    :class="{
                      'text-green-600': req.status === 'مقبول',
                      'text-red-600': req.status === 'مرفوض',
                      'text-yellow-600': req.status === 'تحت المراجعة'
                    }"
                  >
                    {{ req.status }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </div>

      <!-- Toast -->
      <Toast v-if="toastMessage" :message="toastMessage" :type="toastType" />

    </div>
  </div>
</template>
<script>
import Sidebar from "../components/Sidebar.vue";
import Navbar from "../components/Navbar.vue";
import Toast from "../components/Toast.vue";

export default {
  name: "UpdateInfoPage",
  components: { Sidebar, Navbar, Toast },

  data() {
    return {
      employee: {
        FullName: "هند عبدالله",
        NationalId: "12345678",
        BirthDate: "1995-01-01",
        Gender: "أنثى",
        Department: "الموارد البشرية",
        JobTitle: "موظف"
      },
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
        this.toastMessage = "الرجاء تعبئة جميع الحقول ❌";
        this.toastType = "error";
        setTimeout(() => (this.toastMessage = ""), 2000);
        return;
      }

      this.requests.unshift({
        id: this.requests.length + 1,
        date: new Date().toISOString().split("T")[0],
        field: this.fieldToUpdate,
        newValue: this.newValue,
        status: "تحت المراجعة"
      });

      this.fieldToUpdate = "";
      this.newValue = "";
      this.note = "";

      this.toastMessage = "تم إرسال الطلب ✅";
      this.toastType = "success";
      setTimeout(() => (this.toastMessage = ""), 2000);
    }
  }
};
</script>
<style scoped>
.input {
  @apply border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary;
}
</style>
