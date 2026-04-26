<template>
  <div class="flex min-h-screen bg-gray-100 font-cairo" dir="rtl">
    <!-- Sidebar -->
    <SidebarPage />

    <!-- Main content -->
    <div class="flex-1 w-full min-w-0 p-4 sm:p-6 mr-0 lg:mr-60">
      <Navbar />

      <!-- Card -->
      <div class="bg-white rounded-2xl shadow-lg p-6 mt-4">
        <!-- Header -->
        <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 class="text-xl font-bold text-gray-800">إدارة الشكاوى</h2>
        
        </div>

        <!-- Search Table -->
        <input
          v-model="searchTable"
          placeholder="بحث في الشكاوى (اسم الموظف، القسم، المحتوى)..."
          class="input w-full mb-4 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
        />

        <!-- Table -->
        <div class="overflow-x-auto rounded-lg border border-gray-200">
          <table class="min-w-full text-right divide-y divide-gray-200">
            <thead class="bg-navbar">
              <tr>
                <th class="p-3 text-sm font-semibold text-gray-600">الموظف</th>
                <th class="p-3 text-sm font-semibold text-gray-600">القسم</th>
                <th class="p-3 text-sm font-semibold text-gray-600">المحتوى</th>
                <th class="p-3 text-sm font-semibold text-gray-600">التاريخ</th>
                <th class="p-3 text-sm font-semibold text-gray-600">الحالة</th>
                <th class="p-3 text-sm font-semibold text-gray-600 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="c in filteredComplaints" :key="c.id" class="hover:bg-gray-50 transition">
                <td class="p-3 text-sm font-medium">{{ c.employeeName }}</td>
                <td class="p-3 text-sm text-gray-600">{{ c.departmentName }}</td>
                <td class="p-3 text-sm truncate max-w-[200px]" :title="c.content">{{ c.content }}</td>
                <td class="p-3 text-sm text-gray-500">{{ formatDate(c.createdAt) }}</td>
                <td class="p-3 text-sm">
                  <span :class="statusClass(c.status)" class="px-3 py-1 rounded-full text-white text-xs shadow-sm">
                    {{ statusText(c.status) }}
                  </span>
                </td>
                <td class="p-3 text-sm flex gap-3 justify-center">
                  <!-- View Icon -->
                  <button @click="viewComplaint(c)" class="text-blue-600 hover:scale-110 transition" title="عرض التفاصيل">
                    <EyeIcon class="w-5 h-5" />
                  </button>
                  <!-- Update Icon -->
                  <button @click="openUpdateModal(c)" class="text-primary hover:scale-110 transition" title="تحديث الحالة">
                    <PencilSquareIcon class="w-5 h-5" />
                  </button>
                  <!-- Download Icon -->
                  <a v-if="c.attachmentPath" :href="attachmentUrl(c.attachmentPath)" target="_blank" 
                     class="text-green-600 hover:scale-110 transition" title="تحميل المرفق">
                    <ArrowDownTrayIcon class="w-5 h-5" />
                  </a>
                </td>
              </tr>
              <tr v-if="!filteredComplaints.length">
                <td colspan="6" class="text-center py-10 text-gray-400 italic">لا توجد شكاوى مطابقة للبحث</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal: تفاصيل الشكوى -->
    <div v-if="showDetailModal" class="fixed inset-0 bg-black/50 flex justify-center items-center z-[60] p-4">
      <div class="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl relative">
        <button @click="closeDetailModal" class="absolute top-4 left-4 text-gray-400 hover:text-gray-600">&times;</button>
        <h3 class="font-bold text-xl mb-6 text-gray-800 border-b pb-2">تفاصيل الشكوى</h3>
        
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-xs text-gray-500">الموظف</p>
              <p class="font-semibold">{{ selectedComplaint.employeeName }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500">القسم</p>
              <p class="font-semibold">{{ selectedComplaint.departmentName }}</p>
            </div>
          </div>
          
          <div>
            <p class="text-xs text-gray-500 mb-1">المحتوى</p>
            <div class="bg-gray-50 p-3 rounded-lg border text-sm leading-relaxed whitespace-pre-wrap">
              {{ selectedComplaint.content }}
            </div>
          </div>

          <div v-if="selectedComplaint.notes">
            <p class="text-xs text-gray-500">ملاحظات المدير</p>
            <p class="text-sm bg-blue-50 p-2 rounded border border-blue-100 italic">{{ selectedComplaint.notes }}</p>
          </div>
        </div>

        <div class="flex justify-end mt-8">
          <button @click="closeDetailModal" class="bg-primary text-white px-8 py-2 rounded-xl hover:shadow-lg transition">إغلاق</button>
        </div>
      </div>
    </div>

    <!-- Modal: تحديث الحالة -->
    <div v-if="selectedUpdate" class="fixed inset-0 bg-black/50 flex justify-center items-center z-[60] p-4">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h3 class="font-bold text-xl mb-4 text-gray-800">تحديث حالة الشكوى</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">الحالة الجديدة</label>
            <select v-model="updateForm.status" class="input w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary">
              <option value="0">تحت المراجعة</option>
              <option value="1">تم التحويل للقسم</option>
              <option value="2">قيد التحقيق</option>
              <option value="3">تم الرد</option>
              <option value="4">معلقة</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">إضافة ملاحظات</label>
            <textarea v-model="updateForm.notes" rows="4" class="input w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary" placeholder="اكتب ملاحظاتك هنا..."></textarea>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-8">
          <button @click="closeUpdateModal" class="bg-gray-200 px-5 py-2 rounded-lg font-medium hover:bg-gray-300 transition">إلغاء</button>
          <button @click="saveStatus" class="bg-primary text-white px-8 py-2 rounded-lg font-bold hover:shadow-lg transition">حفظ التغييرات</button>
        </div>
      </div>
    </div>

    <ToastPage v-if="showToast" :message="toastMessage" :type="toastType" />
  </div>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import SidebarPage from "@/components/Sidebar.vue";
import Navbar from "@/components/Navbar.vue";
import ToastPage from "@/components/Toast.vue";
import axios from "axios";
import { 
  PencilSquareIcon, 
  EyeIcon, 
  ArrowDownTrayIcon 
} from '@heroicons/vue/24/outline';

export default {
  components: { 
    SidebarPage, Navbar, ToastPage, 
    PencilSquareIcon, EyeIcon, ArrowDownTrayIcon 
  },

  setup() {
    const complaints = ref([]);
    const searchTable = ref("");
    const showDetailModal = ref(false);
    const selectedComplaint = ref(null);
    const selectedUpdate = ref(null);
    
    const updateForm = ref({
      status: "0",
      notes: ""
    });

    const showToast = ref(false);
    const toastMessage = ref("");
    const toastType = ref("success");

    const toast = (msg, type = "success") => {
      toastMessage.value = msg;
      toastType.value = type;
      showToast.value = true;
      setTimeout(() => (showToast.value = false), 3000);
    };

    const fetchComplaints = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5205"}/api/complaints/all`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        complaints.value = res.data;
      } catch (err) {
        toast("حدث خطأ في جلب البيانات", "error");
      }
    };

    const filteredComplaints = computed(() => {
      const s = searchTable.value.toLowerCase();
      return complaints.value.filter(c => 
        (c.employeeName || "").toLowerCase().includes(s) ||
        (c.departmentName || "").toLowerCase().includes(s) ||
        (c.content || "").toLowerCase().includes(s)
      );
    });

    const formatDate = (dateStr) => {
      if (!dateStr) return "-";
      return new Date(dateStr).toLocaleDateString("en-GB");
    };

    const attachmentUrl = (path) => {
      if (!path) return "#";
      return `${import.meta.env.VITE_API_URL || "http://localhost:5205"}${path}`;
    };

    const statusText = (status) => {
      const map = {
        "تحت_المراجعة": "تحت المراجعة",
        "تم_التحويل_للقسم": "تم التحويل للقسم",
        "قيد_التحقيق": "قيد التحقيق",
        "تم_الرد": "تم الرد",
        "معلقة": "معلقة"
      };
      return map[status] ?? status;
    };

    const statusClass = (status) => {
      const map = {
        "تحت_المراجعة": "bg-gray-400",
        "تم_التحويل_للقسم": "bg-purple-500",
        "قيد_التحقيق": "bg-yellow-500",
        "تم_الرد": "bg-green-500",
        "معلقة": "bg-red-500"
      };
      return map[status] || "bg-gray-400";
    };

    const viewComplaint = (c) => {
      selectedComplaint.value = c;
      showDetailModal.value = true;
    };

    const closeDetailModal = () => {
      showDetailModal.value = false;
      selectedComplaint.value = null;
    };

    const openUpdateModal = (c) => {
      selectedUpdate.value = c;
      // تحويل النص إلى القيمة الرقمية المقابلة للـ Select
      const statusMap = { "تحت_المراجعة": "0", "تم_التحويل_للقسم": "1", "قيد_التحقيق": "2", "تم_الرد": "3", "معلقة": "4" };
      updateForm.value = {
        status: statusMap[c.status] || "0",
        notes: c.notes || ""
      };
    };

    const closeUpdateModal = () => {
      selectedUpdate.value = null;
    };

    const saveStatus = async () => {
      try {
        await axios.post(
          `${import.meta.env.VITE_API_URL || "http://localhost:5205"}/api/complaints/${selectedUpdate.value.id}/manager-decision`,
          { 
            status: parseInt(updateForm.value.status), 
            notes: updateForm.value.notes 
          },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );

        toast("تم تحديث حالة الشكوى بنجاح");
        closeUpdateModal();
        fetchComplaints();
      } catch (err) {
        toast("فشل تحديث الحالة", "error");
      }
    };

    onMounted(fetchComplaints);

    return {
      complaints, searchTable, filteredComplaints,
      showDetailModal, selectedComplaint, selectedUpdate,
      updateForm, showToast, toastMessage, toastType,
      formatDate, attachmentUrl, statusText, statusClass,
      viewComplaint, closeDetailModal, openUpdateModal, 
      closeUpdateModal, saveStatus
    };
  }
};
</script>

<style scoped>
.input { @apply bg-gray-50; }
</style>