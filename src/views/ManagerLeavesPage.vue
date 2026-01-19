<template>
  <div class="flex min-h-screen bg-background">
    <!-- Sidebar -->
    <Sidebar class="fixed top-0 right-0 h-screen w-24 md:w-64 bg-primary text-white p-4 z-50" />

    <!-- المحتوى -->
    <div class="flex-1 p-6 min-h-screen mr-24 md:mr-64">
      <Navbar />

      <div class="bg-white rounded-xl shadow-lg p-6 mb-6 max-w-6xl mx-auto">
        <h2 class="text-2xl font-bold text-right">طلبات الإجازة المعلقة</h2>
        <p class="text-gray-500 text-right mt-1">إدارة طلبات الإجازة للموظفين</p>
      </div>

      <div class="bg-white rounded-xl shadow-lg p-6 max-w-6xl mx-auto">
        <table class="w-full border text-sm text-center">
          <thead class="bg-gray-100">
            <tr>
              <th class="border p-1">الموظف</th>
              <th class="border p-1">نوع الإجازة</th>
              <th class="border p-1">من</th>
              <th class="border p-1">إلى</th>
              <th class="border p-1">الأيام</th>
              <th class="border p-1">رصيد الموظف</th>
              <th class="border p-1">إجراء</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="l in pendingLeaves" :key="l.id">
              <td class="border p-1">{{ l.employeeName }}</td>
              <td class="border p-1">{{ l.leaveTypeName || "غير معروف" }}</td>
              <td class="border p-1">{{ formatDate(l.fromDate) }}</td>
              <td class="border p-1">{{ formatDate(l.toDate) }}</td>
              <td class="border p-1">{{ l.totalDays }}</td>
              <td class="border p-1">{{ l.remainingBalance ?? "غير معروف" }}</td>
              <td class="border p-1 flex gap-2 justify-center">
                <button
                  @click="approveLeave(l)"
                  class="bg-green-500 text-white px-3 py-1 rounded"
                >
                  موافقة
                </button>
                <button
                  @click="rejectLeave(l)"
                  class="bg-red-500 text-white px-3 py-1 rounded"
                >
                  رفض
                </button>
              </td>
            </tr>
          </tbody>
        </table>
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
      leaveTypes: [],
      toastMessage: "",
      toastType: "success",
    };
  },

  async mounted() {
    await this.fetchLeaveTypes();
    await this.fetchPendingLeaves();
  },

  methods: {
    formatDate(dt) {
      if (!dt) return "";
      return dt.slice(0, 10);
    },

    async fetchLeaveTypes() {
      try {
        const res = await api.get("/LeaveType");
        this.leaveTypes = res.data.map(t => ({ Id: t.id, Name: t.اسم_الاجازة }));
      } catch (e) {
        this.toastMessage = "خطأ في جلب أنواع الإجازة";
        this.toastType = "error";
      }
    },

    async fetchPendingLeaves() {
      try {
        const res = await api.get("/LeaveRequest/manager/pending");
        this.pendingLeaves = res.data.map(l => ({
          ...l,
          leaveTypeName:
            this.leaveTypes.find(t => t.Id === l.leaveTypeId)?.Name || "غير معروف",
          remainingBalance: l.remainingBalance ?? null, // إذا جلبت الرصيد من السيرفر
        }));
      } catch (e) {
        this.toastMessage = "خطأ في جلب الطلبات المعلقة";
        this.toastType = "error";
      }
    },

    async approveLeave(leave) {
      try {
        await api.post(
          `/LeaveRequest/${leave.id}/manager-decision?approve=true&note=موافقة`
        );

        this.toastMessage = `تمت الموافقة على طلب ${leave.employeeName} ✅`;
        this.toastType = "success";

        // خصم الأيام من الرصيد محلياً (يعتمد إذا جلبت الرصيد)
        if (leave.remainingBalance != null) {
          leave.remainingBalance -= leave.totalDays;
        }

        this.pendingLeaves = this.pendingLeaves.filter(l => l.id !== leave.id);
      } catch (e) {
        console.error(e);
        this.toastMessage = "خطأ أثناء الموافقة ❌";
        this.toastType = "error";
      }
    },

    async rejectLeave(leave) {
      const reason = prompt(`سبب رفض طلب ${leave.employeeName}:`);
      if (!reason) return;

      try {
        await api.post(
          `/LeaveRequest/${leave.id}/manager-decision?approve=false&note=${encodeURIComponent(
            reason
          )}`
        );

        this.toastMessage = `تم رفض طلب ${leave.employeeName} ❌`;
        this.toastType = "success";

        this.pendingLeaves = this.pendingLeaves.filter(l => l.id !== leave.id);
      } catch (e) {
        console.error(e);
        this.toastMessage = "خطأ أثناء الرفض ❌";
        this.toastType = "error";
      }
    },
  },
};
</script>

<style scoped>
/* أي ستايل إضافي */
</style>
