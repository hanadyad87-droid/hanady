<template>
  <div class="flex min-h-screen bg-background" dir="rtl">
    <Sidebar class="fixed top-0 right-0 h-screen w-24 md:w-64 bg-primary text-white p-4 z-50" />
    <div class="flex-1 p-6 mr-24 md:mr-64">
      <Navbar />

      <!-- جدول الشكاوي -->
      <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h2 class="text-2xl font-bold mb-6 text-right text-primaryDark">إدارة الشكاوى</h2>

        <table class="min-w-full divide-y divide-gray-200 text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-3 py-2 text-right font-medium text-gray-700">الموظف</th>
              <th class="px-3 py-2 text-right font-medium text-gray-700">المحتوى</th>
              <th class="px-3 py-2 text-right font-medium text-gray-700">القسم</th>
               <th class="px-3 py-2 text-right font-medium text-gray-700">تاريخ الإنشاء</th>
              <th class="px-3 py-2 text-right font-medium text-gray-700">ملاحظات</th>
             
              <th class="px-3 py-2 text-right font-medium text-gray-700">النموذج</th>
              <th class="px-3 py-2 text-right font-medium text-gray-700">الحالة</th>
              <th class="px-3 py-2 text-right font-medium text-gray-700">إجراءات</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="c in complaints" :key="c.id" class="hover:bg-gray-50 transition">
              <td class="px-3 py-2">{{ c.employeeName }}</td>
              <td class="px-3 py-2 text-right">{{ c.content }}</td>
              <td class="px-3 py-2">{{ c.departmentName || 'كل الأقسام' }}</td>
              <td class="px-3 py-2">{{ formatDate(c.createdAt) }}</td>
             
              <td class="px-3 py-2">{{ c.notes || '-' }}</td>
             
              <td class="px-3 py-2">
                <a v-if="c.attachmentPath" :href="c.attachmentPath" target="_blank" class="text-blue-600 hover:underline">
                  تحميل النموذج
                </a>
                <span v-else>-</span>
              </td>
               <td class="px-3 py-2">
                 <span
      :class="statusClass(c.status)"
      class="status-badge"
    >
      {{ c.status }}
    </span>
              </td>
              <td class="px-3 py-2">
                <button
                  class="bg-primary hover:bg-primaryDark text-white px-2 py-1 rounded text-xs transition"
                  @click="openModal(c)"
                >
                  تحديث الحالة
                </button>
              </td>
            </tr>

            <tr v-if="complaints.length === 0">
              <td colspan="8" class="text-center text-gray-400 py-4">لا توجد شكاوى حالياً</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal تحديث الحالة -->
      <div v-if="selectedComplaint" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div class="bg-white p-6 rounded-xl shadow-lg w-96">
          <h3 class="font-bold mb-3 text-lg">تحديث حالة الشكوى</h3>
          <p class="text-gray-600 mb-3">{{ selectedComplaint.content }}</p>

          <select v-model="updateStatus.status" class="w-full border p-2 rounded mb-3">
            
            <option value="موافق">موافق</option>
            <option value="مرفوض">مرفوض</option>
            <option value="قيد التنفيذ">قيد التنفيذ</option>
          </select>

          <textarea v-model="updateStatus.notes" class="w-full border p-2 rounded mb-3" placeholder="الملاحظات"></textarea>

          <div class="flex justify-end gap-2">
            <button class="bg-gray-300 px-3 py-1 rounded" @click="closeModal">إلغاء</button>
            <button class="bg-primary text-white px-3 py-1 rounded" @click="saveStatus">حفظ</button>
          </div>
        </div>
      </div>

      <Toast v-if="toastMessage" :message="toastMessage" :type="toastType" />
    </div>
  </div>
</template>

<script>
import Sidebar from "@/components/Sidebar.vue";
import Navbar from "@/components/Navbar.vue";
import Toast from "@/components/Toast.vue";
import axios from "axios";

export default {
  components: { Sidebar, Navbar, Toast },
  data() {
    return {
      complaints: [],
      selectedComplaint: null,
      updateStatus: { status: "", notes: "" },
      toastMessage: "",
      toastType: "success"
    };
  },
  mounted() {
    this.fetchComplaints();
  },
  methods: {
    formatDate(dateStr) {
      if (!dateStr) return "-";
      const date = new Date(dateStr);
      return date.toLocaleString("en-GB", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: "Africa/Tripoli" });
    },
    statusClass(status) {
      switch (status) {
        case "موافق":
          return "bg-green-500";
        case "مرفوض":
          return "bg-red-500";
        case "قيد الانتظار":
          return "bg-yellow-500";
        case "قيد التنفيذ":
          return "bg-blue-500";
        default:
          return "bg-gray-400";
      }
    },
    async fetchComplaints() {
      try {
        const res = await axios.get("http://localhost:5205/api/Complaint/all", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        this.complaints = res.data;
      } catch (err) {
        console.error(err);
        this.toastMessage = "حدث خطأ في جلب الشكاوى";
        this.toastType = "error";
      }
    },
    openModal(c) {
      this.selectedComplaint = c;
      this.updateStatus = { status: c.status, notes: c.notes || "" };
    },
    closeModal() {
      this.selectedComplaint = null;
      this.updateStatus = { status: "", notes: "" };
    },
    async saveStatus() {
      if (!this.updateStatus.status) {
        this.toastMessage = "الرجاء اختيار الحالة";
        this.toastType = "error";
        return;
      }
      try {
        await axios.put(
          `http://localhost:5205/api/Complaint/${this.selectedComplaint.id}/update-status`,
          { status: this.updateStatus.status, notes: this.updateStatus.notes },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );

        this.toastMessage = "تم تحديث الحالة بنجاح ✅";
        this.toastType = "success";

        this.closeModal();
        await this.fetchComplaints();
      } catch (err) {
        console.error(err);
        this.toastMessage = "حدث خطأ أثناء تحديث الحالة ❌";
        this.toastType = "error";
      }
    }
  }
};
</script>
<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 90px;
  height: 28px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 9999px;
  color: white;
}
</style>
