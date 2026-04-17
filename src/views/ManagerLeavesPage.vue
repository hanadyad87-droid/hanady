<template>
  <div class="flex min-h-screen bg-gray-100 font-cairo" dir="rtl">
    <Sidebar class="fixed top-0 right-0 h-screen w-24 md:w-64 z-50" />

    <div class="flex-1 p-6 mr-24 md:mr-64">
      <Navbar />

      <div class="bg-white rounded-2xl shadow-lg p-6 mt-4">
        
        <div class="flex justify-between items-center mb-6">
          <div>
            <h2 class="text-xl font-bold text-gray-800">  إدارة الاجازات</h2>
            <p class="text-sm text-gray-500">مراجعة طلبات الموظفين</p>
          </div>
        </div>

        <!-- Search -->
        <input
          v-model="searchQuery"
          placeholder="بحث (اسم الموظف / نوع الإجازة)..."
          class="w-full mb-4 p-2 border rounded-lg"
        />

        <!-- Table -->
        <div class="overflow-x-auto border rounded-lg">
          <table class="min-w-full text-right">
            <thead class="bg-navbar">
              <tr>
                <th class="p-3">الموظف</th>
                <th class="p-3">نوع الإجازة</th>
                <th class="p-3 text-center">من - إلى</th>
                <th class="p-3 text-center">الأيام</th>
                <th class="p-3 text-center">المرفق</th>
                <th class="p-3 text-center">الحالة</th>
                <th class="p-3 text-center">إجراءات</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="leave in filteredLeaves" :key="leave.id" class="border-t">
                
                <td class="p-3">{{ leave.employeeName }}</td>

                <td class="p-3">{{ leave.leaveType }}</td>

                <td class="p-3 text-center">
                  {{ formatDate(leave.fromDate) }} ← {{ formatDate(leave.toDate) }}
                </td>

                <td class="p-3 text-center">{{ leave.totalDays }}</td>

                <td class="p-3 text-center">
                 <a
  v-if="leave.attachmentPath"
  :href="`http://localhost:5205${leave.attachmentPath}`"
  target="_blank"
  class="text-blue-600"
>
  عرض المرفق
</a>
                  <span v-else>-</span>
                </td>

                <td class="p-3 text-center">
                  <span :class="getStatusClass(leave)">
                    {{ formatStatus(leave) }}
                  </span>
                </td>

                <td class="p-3 text-center flex gap-2 justify-center">
                  <button @click="approveLeave(leave)" class="text-green-600">✔</button>
                  <button @click="openRejectModal(leave)" class="text-red-600">✖</button>
                </td>

              </tr>

              <tr v-if="filteredLeaves.length === 0">
                <td colspan="7" class="text-center p-6 text-gray-400">
                  لا توجد بيانات
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Reject Modal -->
    <div v-if="showRejectModal" class="fixed inset-0 bg-black/50 flex justify-center items-center">
      <div class="bg-white p-6 rounded-xl w-full max-w-md">
        <h3 class="font-bold mb-4">رفض الطلب</h3>

        <p class="mb-2">الموظف: {{ selectedLeave?.employeeName }}</p>

        <textarea
          v-model="rejectReason"
          class="w-full border p-2 rounded mb-4"
          placeholder="سبب الرفض"
        ></textarea>

        <div class="flex justify-end gap-2">
          <button @click="closeRejectModal">إلغاء</button>
          <button @click="submitReject" class="bg-red-600 text-white px-4 py-1 rounded">
            تأكيد
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import Sidebar from "../components/Sidebar.vue";
import Navbar from "../components/Navbar.vue";
import api from "../services/api";

export default {
  components: {
    Sidebar,
    Navbar
  },

  setup() {
    const pendingLeaves = ref([]);
    const searchQuery = ref("");

    const showRejectModal = ref(false);
    const rejectReason = ref("");
    const selectedLeave = ref(null);

    // =========================
    // FETCH PENDING LEAVES
    // =========================
    const fetchPendingLeaves = async () => {
  try {
    const res = await api.get("/leave-requests/manager/pending?verbose=true");

    console.log("API RESPONSE:", res.data);

    const data = Array.isArray(res.data) ? res.data : [];

    pendingLeaves.value = data
      .slice()
      .sort((a, b) => b.id - a.id) // 🔥 الأحدث أولاً
      .map(item => {
        return {
          id: item.id,

          employeeName: item.employeeName,
          leaveType: item.leaveType,

          fromDate: item.fromDate,
          toDate: item.toDate,
          totalDays: item.totalDays,

          partialApproval: item.partialApproval,
          finalApproval: item.finalApproval,

          partialNote: item.partialNote,
          finalNote: item.finalNote,

          rejectionReason: item.rejectionReason,
          notes: item.notes,

          attachmentPath: item.attachmentPath || null,

          waitingFor: item.waitingFor || "قيد الانتظار",

          needsAttachment: false
        };
      });

    console.log("MAPPED:", pendingLeaves.value);

  } catch (err) {
    console.error("ERROR:", err);
  }
};

    // =========================
    // FILTER
    // =========================
    const filteredLeaves = computed(() => {
      return pendingLeaves.value.filter(l =>
        (l.employeeName || "").toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        (l.leaveType || "").toLowerCase().includes(searchQuery.value.toLowerCase())
      );
    });

    // =========================
    // APPROVE
    // =========================
    const approveLeave = async (leave) => {
      await api.post(
        `/leave-requests/${leave.id}/manager-decision`,
        null,
        {
          params: {
            approve: true,
            note: "تمت الموافقة"
          }
        }
      );

      fetchPendingLeaves();
    };

    // =========================
    // REJECT
    // =========================
    const submitReject = async () => {
      await api.post(
        `/leave-requests/${selectedLeave.value.id}/manager-decision`,
        null,
        {
          params: {
            approve: false,
            note: rejectReason.value
          }
        }
      );

      closeRejectModal();
      fetchPendingLeaves();
    };

    const openRejectModal = (leave) => {
      selectedLeave.value = leave;
      showRejectModal.value = true;
    };

    const closeRejectModal = () => {
      showRejectModal.value = false;
      rejectReason.value = "";
    };

    // =========================
    // HELPERS
    // =========================
    const formatDate = (d) => d ? d.slice(0, 10) : "";

    const getStatusClass = (item) => {
      if (item.finalApproval === true) return "text-green-600";
      if (item.finalApproval === false) return "text-red-600";
      return "text-yellow-600";
    };

    const formatStatus = (item) => {
      return item.waitingFor || "قيد الانتظار";
    };

    onMounted(fetchPendingLeaves);

    return {
      pendingLeaves,
      searchQuery,
      filteredLeaves,

      showRejectModal,
      rejectReason,
      selectedLeave,

      fetchPendingLeaves,
      approveLeave,
      submitReject,
      openRejectModal,
      closeRejectModal,

      formatDate,
      getStatusClass,
      formatStatus
    };
  }
};
</script>