<template>
  <div class="flex min-h-screen bg-background">

    <!-- Sidebar ثابت -->
    <Sidebar class="fixed top-0 right-0 h-screen w-24 md:w-64 bg-primary text-white p-4 z-50" />

    <!-- المحتوى الرئيسي -->
    <div class="flex-1 p-6 min-h-screen mr-24 md:mr-64">
      <Navbar />

      <!-- زر إرسال شكوى -->
      <div class="mb-6 text-left">
        <button @click="showNewComplaintModal = true"
                class="bg-primary hover:bg-primaryDark text-white px-6 py-2 rounded-lg font-semibold transition shadow-md">
          إرسال شكوى جديدة
        </button>
      </div>

      <!-- جدول الشكاوى -->
      <div class="bg-white rounded-xl shadow-md p-6" dir="rtl">
        <h3 class="text-xl font-bold text-right mb-4 text-primaryDark">شكاويك</h3>

        <table class="min-w-full divide-y divide-gray-200 text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-3 py-2 text-right font-medium text-gray-700">المحتوى</th>
              <th class="px-3 py-2 text-right font-medium text-gray-700">القسم</th>
              <th class="px-3 py-2 text-right font-medium text-gray-700">تاريخ الإنشاء</th>
              <th class="px-3 py-2 text-right font-medium text-gray-700">المرفق</th>
              <th class="px-3 py-2 text-right font-medium text-gray-700">الحالة</th>
              <th class="px-3 py-2 text-right font-medium text-gray-700">الإجراءات</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="c in complaints" :key="c.id" class="hover:bg-gray-50 transition">
              <td class="px-3 py-2 text-right">{{ c.content }}</td>
              <td class="px-3 py-2">{{ c.departmentName || (c.isForAllDepartments ? "كل الأقسام" : "-") }}</td>
              <td class="px-3 py-2">{{ formatDate(c.createdAt) }}</td>
              <td class="px-3 py-2 text-gray-600">
                <a v-if="c.attachmentPath" :href="c.attachmentPath" target="_blank" class="hover:underline text-blue-600">عرض الملف</a>
                <span v-else>-</span>
              </td>
              <td class="px-3 py-2">
                <span :class="['status-badge', statusClass(c.status)]">{{ c.status }}</span>
              </td>
              <td class="px-3 py-2 flex justify-center gap-2">
                <!-- عرض التفاصيل -->
                <svg @click="viewComplaint(c)" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                     stroke="currentColor" class="w-5 h-5 text-gray-600 hover:text-gray-800 cursor-pointer" title="عرض التفاصيل">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.065 7-9.542 7s-8.268-2.943-9.542-7z"/>
                </svg>

                <!-- حذف مع توست تأكيد -->
                <svg v-if="c.status === 'قيد الانتظار'" @click="confirmDelete(c.id)"
                     xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                     stroke="currentColor" class="w-5 h-5 text-gray-600 hover:text-gray-800 cursor-pointer" title="حذف الشكوى">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-4 0a1 1 0 00-1 1v0a1 1 0 001 1h4a1 1 0 001-1v0a1 1 0 00-1-1m-4 0h4"/>
                </svg>
              </td>
            </tr>

            <tr v-if="complaints.length === 0">
              <td colspan="6" class="text-center text-gray-400 py-4">لا توجد شكاوى حالياً</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- مودال تفاصيل الشكوى -->
    <div v-if="showDetailModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div class="bg-white rounded-xl shadow-lg w-full max-w-xl p-6 relative">
        <button @click="showDetailModal = false"
                class="absolute top-4 left-4 text-gray-500 hover:text-gray-700 text-xl">&times;</button>
        <h2 class="text-2xl font-bold text-primaryDark mb-4 text-right">تفاصيل الشكوى</h2>
        <div class="text-right space-y-2">
          <p><span class="font-semibold">المحتوى:</span> {{ selectedComplaint.content }}</p>
          <p><span class="font-semibold">القسم:</span> {{ selectedComplaint.departmentName || (selectedComplaint.isForAllDepartments ? "كل الأقسام" : "-") }}</p>
          <p><span class="font-semibold">تاريخ الإنشاء:</span> {{ formatDate(selectedComplaint.createdAt) }}</p>
          <p><span class="font-semibold">الحالة:</span> {{ selectedComplaint.status }}</p>
          <p><span class="font-semibold">ملاحظات:</span> {{ selectedComplaint.notes || '-' }}</p>
          <p v-if="selectedComplaint.attachmentPath">
            <span class="font-semibold">المرفق:</span>
            <a :href="selectedComplaint.attachmentPath" target="_blank" class="text-blue-600 hover:underline">فتح الملف</a>
          </p>
        </div>
        <div class="mt-4 flex justify-end gap-2">
          <button @click="showDetailModal = false" class="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg">إغلاق</button>
        </div>
      </div>
    </div>

    <!-- مودال إرسال شكوى جديدة -->
    <div v-if="showNewComplaintModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div class="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6 relative">
        <button @click="showNewComplaintModal = false"
                class="absolute top-4 left-4 text-gray-500 hover:text-gray-700 text-xl">&times;</button>
        <h2 class="text-2xl font-bold text-primaryDark mb-4 text-right">إرسال شكوى جديدة</h2>

        <form @submit.prevent="submitComplaint" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="md:col-span-2">
            <label class="block text-right text-sm font-medium mb-1">المحتوى*</label>
            <textarea v-model="newComplaint.content" required
                      class="w-full p-3 border rounded-lg text-right text-sm focus:ring-2 focus:ring-primaryDark focus:border-primaryDark"
                      rows="2" placeholder="اكتب محتوى الشكوى هنا..."></textarea>
          </div>

          <div>
            <label class="block text-right text-sm font-medium mb-1">القسم</label>
            <select v-model="newComplaint.departmentId" :disabled="newComplaint.isForAllDepartments"
                    class="w-full p-2 border rounded-lg text-right text-sm focus:ring-2 focus:ring-primaryDark focus:border-primaryDark">
              <option value="0">اختر القسم</option>
              <option v-for="dept in departments" :key="dept.id" :value="dept.id">{{ dept.name }}</option>
            </select>
          </div>

          <div class="flex items-center gap-2 mt-5 md:col-span-2">
            <input type="checkbox" v-model="newComplaint.isForAllDepartments" class="accent-primary" />
            <label>لكل الأقسام</label>
          </div>

          <div class="md:col-span-2">
            <label class="block text-right text-sm font-medium mb-1">مرفق (اختياري)</label>
            <input type="file" @change="handleFileUpload" class="w-full p-2 border rounded-lg text-sm" />
            <p v-if="attachedFile" class="text-xs mt-1 text-gray-500">ملف محدد: {{ attachedFile.name }}</p>
          </div>

          <div class="md:col-span-2 text-center mt-2">
            <button type="submit" class="bg-primary hover:bg-primaryDark text-whitepx-6 py-2 rounded-xl font-semibold shadow-md transition">
              إرسال الشكوى 📤
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Toast -->
    <ToastPage v-if="toastMessage" :message="toastMessage" :type="toastType" :onConfirm="toastOnConfirm" />

  </div>
</template>

<script>
import Sidebar from "@/components/Sidebar.vue";
import Navbar from "@/components/Navbar.vue";
import ToastPage from "@/components/Toast.vue";
import axios from "axios";

export default {
  name: "ComplaintsPage",
  components: { Sidebar, Navbar, ToastPage },
  data() {
    return {
      complaints: [],
      departments: [],
      newComplaint: { content: "", departmentId: 0, isForAllDepartments: false },
      attachedFile: null,
      selectedComplaint: null,
      showDetailModal: false,
      showNewComplaintModal: false,
      toastMessage: "",
      toastType: "success",
      toastOnConfirm: null // دالة التأكيد عند التوست
    };
  },
  mounted() {
    this.fetchDepartments();
    this.fetchComplaints();
  },
  methods: {
    // Toast
    showToast(message, type="success", onConfirm=null) {
      this.toastMessage = message;
      this.toastType = type;
      this.toastOnConfirm = onConfirm;
      setTimeout(() => {
        this.toastMessage = "";
        this.toastOnConfirm = null;
      }, 5000);
    },

    // تنسيق التاريخ
    formatDate(dateStr) {
      if (!dateStr) return "-";
      const date = new Date(dateStr);
      return date.toLocaleString("ar-LY", { year: "numeric", month: "2-digit", day: "2-digit" });
    },

    // فئة الحالة
    statusClass(status) {
      switch (status) {
        case "موافق": return "bg-green-500";
        case "مرفوض": return "bg-red-500";
        case "قيد الانتظار": return "bg-yellow-500";
        case "قيد التنفيذ": return "bg-blue-500";
        default: return "bg-gray-400";
      }
    },

    handleFileUpload(e) {
      this.attachedFile = e.target.files[0] || null;
    },

    // جلب الأقسام
    async fetchDepartments() {
      try {
        const res = await axios.get("http://localhost:5205/api/Department", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        this.departments = res.data;
      } catch (err) { console.error(err); }
    },

    // جلب الشكاوى
    async fetchComplaints() {
      try {
        const res = await axios.get("http://localhost:5205/api/Complaint/my", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        this.complaints = res.data;
      } catch (err) { console.error(err); }
    },

    // عرض التفاصيل
    viewComplaint(complaint) {
      this.selectedComplaint = complaint;
      this.showDetailModal = true;
    },

    // طلب تأكيد الحذف مع توست تفاعلي
    confirmDelete(complaintId) {
      this.showToast(
        "⚠️ هل تريد حقاً حذف الشكوى؟",
        "info",
        async () => { await this.deleteComplaint(complaintId); }
      );
    },

    // الحذف الفعلي
    async deleteComplaint(id) {
      try {
        await axios.delete(`http://localhost:5205/api/Complaint/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        this.showToast("✅ تم حذف الشكوى بنجاح", "success");
        await this.fetchComplaints();
      } catch (err) {
        console.error(err);
        this.showToast("❌ حدث خطأ أثناء الحذف", "error");
      }
    },

    // إرسال شكوى جديدة
    async submitComplaint() {
      if (!this.newComplaint.content) return this.showToast("يرجى كتابة محتوى الشكوى", "info");

      const formData = new FormData();
      formData.append("content", this.newComplaint.content);
      formData.append("departmentId", this.newComplaint.isForAllDepartments ? "" : this.newComplaint.departmentId);
      formData.append("isForAllDepartments", this.newComplaint.isForAllDepartments);
      if (this.attachedFile) formData.append("file", this.attachedFile);

      try {
        await axios.post("http://localhost:5205/api/Complaint/create", formData, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}`, 'Content-Type': undefined }
        });
        this.newComplaint = { content: "", departmentId: 0, isForAllDepartments: false };
        this.attachedFile = null;
        this.showNewComplaintModal = false;
        this.showToast("✅ تم إرسال الشكوى بنجاح", "success");
        await this.fetchComplaints();
      } catch (err) {
        console.error(err);
        this.showToast("❌ حدث خطأ أثناء إرسال الشكوى", "error");
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
