<template>
  <div class="flex min-h-screen bg-background" dir="rtl">
    <Sidebar class="fixed top-0 right-0 h-screen w-24 md:w-64 bg-primary text-white p-4 z-50" />
    <div class="flex-1 p-6 mr-24 md:mr-64">
      <Navbar />

      <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h2 class="text-2xl font-bold mb-6 text-right text-primaryDark">إدارة الشكاوى</h2>

        <table class="min-w-full divide-y divide-gray-200 text-sm table-fixed">
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
              <td class="px-3 py-2 truncate">{{ c.employeeName }}</td>
              <td class="px-3 py-2 truncate" :title="c.content">{{ c.content }}</td>
              <td class="px-3 py-2 truncate">{{ c.departmentName }}</td>
              <td class="px-3 py-2">{{ formatDate(c.createdAt) }}</td>
              <td class="px-3 py-2 truncate" :title="c.notes">{{ c.notes || '-' }}</td>
              <td class="px-3 py-2">
                <a v-if="c.attachmentPath" :href="c.attachmentPath" target="_blank" class="text-blue-600 hover:underline">
                  تحميل النموذج
                </a>
                <span v-else>-</span>
              </td>
              <td class="px-3 py-2">
                <span :class="statusClass(c.status)" class="status-badge">
                  {{ statusText(c.status) }}
                </span>
              </td>
              <td class="px-3 py-2 flex gap-2 justify-center">
                <svg @click="viewComplaint(c)" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                     stroke="currentColor" class="w-5 h-5 text-gray-600 hover:text-gray-800 cursor-pointer" title="عرض الشكوى">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.065 7-9.542 7s-8.268-2.943-9.542-7z"/>
                </svg>
                <button
                  class="bg-primary hover:bg-primaryDark text-white px-2 py-1 rounded text-xs"
                  @click="openModal(c)">
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

      <!-- مودال عرض الشكوى -->
      <div v-if="showDetailModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
        <div class="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6 relative">
          <button @click="closeDetailModal"
                  class="absolute top-4 left-4 text-gray-500 hover:text-gray-700 text-xl">&times;</button>
          <h2 class="text-2xl font-bold text-primaryDark mb-4 text-right">تفاصيل الشكوى</h2>
          <div class="space-y-3 text-right">
            <p><span class="font-semibold">الموظف:</span> {{ selectedComplaint.employeeName }}</p>
            <p><span class="font-semibold">القسم:</span> {{ selectedComplaint.departmentName }}</p>
            <p><span class="font-semibold">تاريخ الإنشاء:</span> {{ formatDate(selectedComplaint.createdAt) }}</p>
            <p><span class="font-semibold">الحالة:</span> {{ statusText(selectedComplaint.status) }}</p>
            <p><span class="font-semibold">المحتوى:</span></p>
            <div class="p-3 border rounded-lg bg-gray-50 whitespace-pre-wrap break-words">
              {{ selectedComplaint.content }}
            </div>
            <p v-if="selectedComplaint.notes"><span class="font-semibold">الملاحظات:</span> {{ selectedComplaint.notes }}</p>
            <p v-if="selectedComplaint.attachmentPath">
              <span class="font-semibold">المرفق:</span>
              <a :href="selectedComplaint.attachmentPath" target="_blank" class="text-blue-600 hover:underline">عرض الملف</a>
            </p>
          </div>
          <div class="mt-4 text-center">
            <button @click="closeDetailModal"
                    class="bg-primary hover:bg-primaryDark text-white px-6 py-2 rounded-lg font-semibold transition shadow-md">
              إغلاق
            </button>
          </div>
        </div>
      </div>

      <!-- مودال تحديث الحالة -->
      <div v-if="selectedComplaintUpdate" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div class="bg-white p-6 rounded-xl shadow-lg w-96">
          <h3 class="font-bold mb-3 text-lg">تحديث حالة الشكوى</h3>

          <select v-model="updateStatus.status" class="w-full border p-2 rounded mb-3">
            <option value="0">تحت المراجعة</option>
            <option value="1">تم التحويل للقسم</option>
            <option value="2">قيد التحقيق</option>
            <option value="3">تم الرد</option>
            <option value="4">معلقة</option>
          </select>

          <textarea v-model="updateStatus.notes" class="w-full border p-2 rounded mb-3" placeholder="الملاحظات"></textarea>

          <div class="flex justify-end gap-2">
            <button class="bg-gray-300 px-3 py-1 rounded" @click="closeUpdateModal">إلغاء</button>
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
      showDetailModal: false,
      selectedComplaintUpdate: null,
      updateStatus: { status: "", notes: "" },
      toastMessage: "",
      toastType: "success",
      userId: null
    };
  },
  mounted() {
    this.userId = parseInt(localStorage.getItem("employeeId"));
    this.fetchComplaints();
  },
  methods: {
    formatDate(dateStr) {
      if (!dateStr) return "-";
      const date = new Date(dateStr);
      return date.toLocaleString("en-GB", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: "Africa/Tripoli" });
    },
    statusText(status) {
      const map = {0:"تحت المراجعة",1:"تم التحويل للقسم",2:"قيد التحقيق",3:"تم الرد",4:"معلقة"};
      return map[status] ?? "-";
    },
    statusClass(status) {
      const map = {0:"bg-gray-400",1:"bg-purple-500",2:"bg-yellow-500",3:"bg-green-500",4:"bg-red-500"};
      return map[status] || "bg-gray-400";
    },
    async fetchComplaints() {
      try {
        const res = await axios.get("http://localhost:5205/api/complaints/all", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        this.complaints = res.data;
      } catch (err) {
        console.error(err);
        this.toastMessage = "حدث خطأ في جلب الشكاوى";
        this.toastType = "error";
      }
    },
    viewComplaint(complaint) {
      this.selectedComplaint = complaint;
      this.showDetailModal = true;
    },
    closeDetailModal() {
      this.selectedComplaint = null;
      this.showDetailModal = false;
    },
    openModal(complaint) {
      this.selectedComplaintUpdate = complaint;
      this.updateStatus = { status: complaint.status, notes: complaint.notes || "" };
    },
    closeUpdateModal() {
      this.selectedComplaintUpdate = null;
      this.updateStatus = { status: "", notes: "" };
    },
    async saveStatus() {
      if (this.updateStatus.status === "") {
        this.toastMessage = "الرجاء اختيار الحالة";
        this.toastType = "error";
        return;
      }

      try {

const numericStatus = parseInt(this.updateStatus.status); // فعلياً هنا صار redundant لو select يرسل number
await axios.post(
  `http://localhost:5205/api/complaints/${this.selectedComplaintUpdate.id}/manager-decision`,
  { status: numericStatus, notes: this.updateStatus.notes || "" },
  { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
);

        this.toastMessage = "تم تحديث الحالة بنجاح ✅";
        this.toastType = "success";
        this.closeUpdateModal();
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
