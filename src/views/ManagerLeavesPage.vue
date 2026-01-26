<template>
  <div class="flex min-h-screen bg-background">
    <Sidebar class="fixed top-0 right-0 h-screen w-24 md:w-64 bg-primary text-white p-4 z-50" />

    <div class="flex-1 p-6 min-h-screen mr-24 md:mr-64">
      <Navbar />

      <div class="bg-white rounded-xl shadow-lg p-6 mb-6 max-w-6xl mx-auto">
        <h2 class="text-2xl font-bold text-right">طلبات الإجازة المعلقة</h2>
        <p class="text-gray-500 text-right mt-1">إدارة طلبات الإجازة للموظفين</p>
      </div>

      <div class="bg-white rounded-xl shadow-lg p-6 max-w-6xl mx-auto overflow-x-auto">
        <table class="w-full border text-sm text-center">
          <thead class="bg-gray-100">
            <tr>
              <th class="border p-1">الموظف</th>
              <th class="border p-1">نوع الإجازة</th>
              <th class="border p-1">من</th>
              <th class="border p-1">إلى</th>
              <th class="border p-1">الأيام</th>
              <th class="border p-1">إجراء</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="l in pendingLeaves" :key="l.id">
              <td class="border p-1">{{ l.employeeName }}</td>
              <td class="border p-1">{{ l.leaveTypeName }}</td>
              <td class="border p-1">{{ formatDate(l.fromDate) }}</td>
              <td class="border p-1">{{ formatDate(l.toDate) }}</td>
              <td class="border p-1">{{ l.totalDays }}</td>
              <td class="border p-1 flex gap-2 justify-center">
                <button
                  @click="approveLeave(l)"
                  class="bg-green-500 text-white px-3 py-1 rounded"
                >
                  موافقة
                </button>
                <button
                  @click="openRejectModal(l)"
                  class="bg-red-500 text-white px-3 py-1 rounded"
                >
                  رفض
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- مودال الرفض -->
      <div
        v-if="showRejectModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <div class="bg-white p-6 rounded-xl w-96 shadow-lg">
          <h3 class="text-lg font-bold mb-4">
            سبب رفض الإجازة لـ {{ selectedLeave.employeeName }}
          </h3>

          <textarea
            v-model="rejectReason"
            class="w-full border p-2 rounded mb-4"
            rows="4"
            placeholder="اكتب سبب الرفض هنا"
          />

          <div class="flex justify-end gap-2">
            <button @click="closeRejectModal" class="px-4 py-2 bg-gray-300 rounded">
              إلغاء
            </button>
            <button @click="submitReject" class="px-4 py-2 bg-red-500 text-white rounded">
              رفض
            </button>
          </div>
        </div>
      </div>

      <Toast v-if="toastMessage" :message="toastMessage" :type="toastType" />
    </div>
  </div>
</template>
<script>
import Sidebar from "../components/Sidebar.vue";
import Navbar from "../components/Navbar.vue";
import Toast from "../components/Toast.vue";
import api from "../services/api";

export default {
  components: { Sidebar, Navbar, Toast },

  data() {
    return {
      pendingLeaves: [],
      toastMessage: "",
      toastType: "success",
      showRejectModal: false,
      rejectReason: "",
      selectedLeave: null
    };
  },

  mounted() {
    this.fetchPendingLeaves();
  },

  methods: {
    formatDate(dt) {
      return dt ? dt.slice(0, 10) : "";
    },

    async fetchPendingLeaves() {
      try {
        const res = await api.get("/LeaveRequest/manager/pending");
        this.pendingLeaves = res.data;
      } catch {
        this.toastMessage = "خطأ في جلب الطلبات المعلقة";
        this.toastType = "error";
      }
    },

    openRejectModal(leave) {
      this.selectedLeave = leave;
      this.rejectReason = "";
      this.showRejectModal = true;
    },

    closeRejectModal() {
      this.showRejectModal = false;
      this.selectedLeave = null;
    },

 async approveLeave(leave) {
  try {
    await api.post(
      `/LeaveRequest/${leave.id}/manager-decision`,
      null,
      {
        params: {
          approve: true,
          note: "موافقة"
        }
      }
    );

    this.toastMessage = "تمت الموافقة على الطلب ✅";
    this.toastType = "success";
    this.pendingLeaves = this.pendingLeaves.filter(
      l => l.id !== leave.id
    );
  } catch (e) {
    console.error(e.response?.data);

    // 👇 نعرض رسالة الباكند نفسها
    this.toastMessage =
      e.response?.data || "تعذر الموافقة على الطلب";
    this.toastType = "error";
  }
}

,

  async submitReject() {
  if (!this.rejectReason.trim()) {
    this.toastMessage = "يرجى كتابة سبب الرفض";
    this.toastType = "error";
    return;
  }

  try {
    await api.post(
      `/LeaveRequest/${this.selectedLeave.id}/manager-decision`,
      null,
      {
        params: {
          approve: false, // رفض الطلب
          note: this.rejectReason
        }
      }
    );

    this.toastMessage = "تم رفض الطلب ❌";
    this.toastType = "error";

    // إزالة الطلب من القائمة
    this.pendingLeaves = this.pendingLeaves.filter(
      l => l.id !== this.selectedLeave.id
    );

    this.closeRejectModal();
  } catch (e) {
    console.error(e.response?.data);
    this.toastMessage = e.response?.data || "تعذر رفض الطلب";
    this.toastType = "error";
  }
}


  }
};
</script>
