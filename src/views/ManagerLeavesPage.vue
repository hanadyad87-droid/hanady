<template>
  <div class="flex min-h-screen bg-gray-100 font-cairo" dir="rtl">
    <!-- Sidebar -->
    <Sidebar class="fixed top-0 right-0 h-screen w-24 md:w-64 z-50" />

    <!-- Main content -->
    <div class="flex-1 p-6 mr-24 md:mr-64">
      <Navbar />

      <!-- Card Container -->
      <div class="bg-white rounded-2xl shadow-lg p-6 mt-4">
        
        <!-- Header Section -->
        <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div>
            <h2 class="text-xl font-bold text-gray-800">طلبات الإجازة المعلقة</h2>
            <p class="text-sm text-gray-500 mt-1">مراجعة واتخاذ القرار في إجازات الموظفين</p>
          </div>
       
        </div>
        
        <!-- Search Table -->
        <input
          v-model="searchTable"
          placeholder="بحث في الاجازات (اسم الموظف، نوع الاجازة ,الحالة)..."
          class="input w-full mb-4 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
        />

        <!-- Table Section -->
        <div class="overflow-x-auto rounded-lg border border-gray-200">
          <table class="min-w-full text-right divide-y divide-gray-200">
            <thead class="bg-navbar">
              <tr>
                <th class="p-3 text-sm font-semibold text-gray-600">الموظف</th>
                <th class="p-3 text-sm font-semibold text-gray-600">نوع الإجازة</th>
                <th class="p-3 text-sm font-semibold text-gray-600 text-center">التاريخ (من - إلى)</th>
                <th class="p-3 text-sm font-semibold text-gray-600 text-center">الأيام</th>
                <th class="p-3 text-sm font-semibold text-gray-600 text-center">المرفق</th>
                <th class="p-3 text-sm font-semibold text-gray-600">الحالة</th>
                <th class="p-3 text-sm font-semibold text-gray-600 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr 
                v-for="leave in filteredLeaves" 
                :key="leave.id" 
                class="hover:bg-gray-50 transition"
              >
                <td class="p-3 text-sm font-medium text-gray-800">{{ leave.employeeName }}</td>
                <td class="p-3 text-sm text-gray-600">{{ leave.leaveType }}</td>
                <td class="p-3 text-sm text-gray-500 text-center">
                  {{ formatDate(leave.fromDate) }} <span class="mx-1">⬅️</span> {{ formatDate(leave.toDate) }}
                </td>
                <td class="p-3 text-sm text-center">
                  <span class="bg-blue-50 text-blue-700 px-2 py-1 rounded font-bold">{{ leave.totalDays }}</span>
                </td>
                <td class="p-3 text-sm text-center">
                  <a
                    v-if="leave.needsAttachment && leave.attachmentPath"
                    :href="`http://localhost:5205${leave.attachmentPath}`"
                    target="_blank"
                    class="text-blue-600 hover:scale-110 transition inline-block"
                    title="عرض المرفق"
                  >
                    <PaperClipIcon class="w-5 h-5" />
                  </a>
                  <span v-else-if="leave.needsAttachment" class="text-red-400 text-xs italic">غير متوفر</span>
                  <span v-else class="text-gray-300">-</span>
                </td>
                <td class="p-3 text-sm">
                  <span :class="getStatusClass(leave.status)" class="px-2 py-1 rounded-full text-xs font-bold shadow-sm">
                    {{ formatStatus(leave.status) }}
                  </span>
                </td>
                <td class="p-3 text-sm flex gap-4 justify-center">
                  <button 
                    @click="approveLeave(leave)" 
                    class="text-green-600 hover:scale-120 transition" 
                    title="موافقة"
                  >
                    <CheckCircleIcon class="w-6 h-6" />
                  </button>
                  <button 
                    @click="openRejectModal(leave)" 
                    class="text-red-600 hover:scale-120 transition" 
                    title="رفض"
                  >
                    <XCircleIcon class="w-6 h-6" />
                  </button>
                </td>
              </tr>
              <tr v-if="filteredLeaves.length === 0">
                <td colspan="7" class="text-center py-12 text-gray-400 italic">
                  لا توجد طلبات معلقة حالياً
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Reject Modal -->
    <div v-if="showRejectModal" class="fixed inset-0 bg-black/50 flex justify-center items-center z-[60] p-4">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative animate-fade-in">
        <button @click="closeRejectModal" class="absolute top-4 left-4 text-gray-400 hover:text-red-600 text-xl font-bold">
          &times;
        </button>
        
        <h3 class="font-bold text-xl mb-4 text-gray-800 border-b pb-2">رفض طلب الإجازة</h3>
        <p class="text-sm text-gray-600 mb-4 italic">الموظف: {{ selectedLeave?.employeeName }}</p>

        <div class="mb-4">
          <label class="block text-sm font-semibold text-gray-700 mb-2">سبب الرفض:</label>
          <textarea
            v-model="rejectReason"
            class="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-red-500 outline-none text-sm resize-none"
            rows="4"
            placeholder="يرجى توضيح سبب الرفض للموظف..."
          ></textarea>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <button @click="closeRejectModal" class="px-6 py-2 rounded-xl text-gray-600 bg-gray-100 hover:bg-gray-200 transition font-bold">
            إلغاء
          </button>
          <button @click="submitReject" class="px-6 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 shadow-md transition font-bold">
            تأكيد الرفض
          </button>
        </div>
      </div>
    </div>

    <!-- Notifications -->
    <Toast v-if="showToast" :message="toastMsg" :type="toastType" />
  </div>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import Sidebar from "../components/Sidebar.vue";
import Navbar from "../components/Navbar.vue";
import Toast from "../components/Toast.vue";
import api from "../services/api";
import { CheckCircleIcon, XCircleIcon, PaperClipIcon } from "@heroicons/vue/24/outline";

export default {
  name: "PendingLeavesPage",
  components: { Sidebar, Navbar, Toast, CheckCircleIcon, XCircleIcon, PaperClipIcon },

  setup() {
    const pendingLeaves = ref([]);
    const searchQuery = ref("");
    const showRejectModal = ref(false);
    const rejectReason = ref("");
    const selectedLeave = ref(null);

    // Toast logic
    const showToast = ref(false);
    const toastMsg = ref("");
    const toastType = ref("success");

    const triggerToast = (msg, type = "success") => {
      toastMsg.value = msg;
      toastType.value = type;
      showToast.value = true;
      setTimeout(() => (showToast.value = false), 3000);
    };

    const fetchPendingLeaves = async () => {
      try {
        const res = await api.get("/leave-requests/manager/pending");
        pendingLeaves.value = res.data;
      } catch (err) {
        triggerToast("فشل في تحميل البيانات", "error");
      }
    };

    const filteredLeaves = computed(() => {
      return pendingLeaves.value.filter(l =>
        l.employeeName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        l.leaveType.toLowerCase().includes(searchQuery.value.toLowerCase())
      );
    });

    const approveLeave = async (leave) => {
      try {
        await api.post(`/leave-requests/${leave.id}/manager-decision`, null, {
          params: { approve: true, note: "موافقة المدير" }
        });
        triggerToast("تمت الموافقة بنجاح ✅");
        fetchPendingLeaves();
      } catch (err) {
        triggerToast(err.response?.data || "فشل تنفيذ الإجراء", "error");
      }
    };

    const submitReject = async () => {
      if (!rejectReason.value.trim()) {
        triggerToast("يرجى كتابة سبب الرفض", "error");
        return;
      }
      try {
        await api.post(`/leave-requests/${selectedLeave.value.id}/manager-decision`, null, {
          params: { approve: false, note: rejectReason.value }
        });
        triggerToast("تم رفض الطلب ❌", "error");
        closeRejectModal();
        fetchPendingLeaves();
      } catch (err) {
        triggerToast("فشل في رفض الطلب", "error");
      }
    };

    const openRejectModal = (leave) => {
      selectedLeave.value = leave;
      rejectReason.value = "";
      showRejectModal.value = true;
    };

    const closeRejectModal = () => {
      showRejectModal.value = false;
      selectedLeave.value = null;
    };

    const formatDate = (date) => (date ? date.slice(0, 10) : "");

    const getStatusClass = (status) => {
      if (status === "قيد_الانتظار") return "bg-gray-100 text-gray-600";
      if (status === "موافق_المدير") return "bg-blue-100 text-blue-700";
      if (status === "موافقة_نهائية") return "bg-green-100 text-green-700";
      if (status === "مرفوض") return "bg-red-100 text-red-700";
      return "bg-gray-100";
    };

    const formatStatus = (status) => {
      return status.replace("_", " ");
    };

    onMounted(fetchPendingLeaves);

    return {
      pendingLeaves, searchQuery, filteredLeaves,
      showRejectModal, rejectReason, selectedLeave,
      showToast, toastMsg, toastType,
      approveLeave, openRejectModal, closeRejectModal, submitReject,
      formatDate, getStatusClass, formatStatus
    };
  }
};
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>