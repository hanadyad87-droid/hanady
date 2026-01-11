<template>
  <div class="flex min-h-screen bg-background">

    <!-- Sidebar ثابتة على اليمين -->
    <Sidebar class="fixed top-0 right-0 h-screen w-24 md:w-64 bg-primary text-white p-4 z-50" />

    <!-- المحتوى الرئيسي -->
    <div class="flex-1 p-6 min-h-screen" :class="{'mr-24 md:mr-64': true}">

      <!-- العنوان -->
      <div class="bg-white rounded-xl shadow-lg p-6 mb-6 max-w-4xl mx-auto">
        <h2 class="text-2xl font-bold text-right">الإجازات</h2>
        <p class="text-gray-500 text-right mt-1">إدارة ومتابعة طلبات الإجازة</p>
      </div>

      <!-- كارد تقديم طلب إجازة -->
      <div class="bg-white rounded-xl shadow-lg p-6 mb-6 max-w-4xl mx-auto">
        <form class="grid grid-cols-1 md:grid-cols-2 gap-4" @submit.prevent="submitLeave">
          <div class="flex flex-col">
            <label class="mb-1 font-medium text-right text-sm">من تاريخ*</label>
            <input type="date" v-model="leaveForm.fromDate" @change="calculateDays" class="p-2 border rounded-lg text-right text-sm" />
          </div>

          <div class="flex flex-col">
            <label class="mb-1 font-medium text-right text-sm">نوع الإجازة</label>
            <select v-model="leaveForm.typeId" class="p-2 border rounded-lg text-right text-sm">
              <option disabled value="">اختر نوع الإجازة</option>
              <option v-for="type in leaveTypes" :key="type.Id" :value="Number(type.Id)">
                {{ type.Name }}
              </option>
            </select>
          </div>

          <div class="flex flex-col">
            <label class="mb-1 font-medium text-right text-sm">إلى تاريخ*</label>
            <input type="date" v-model="leaveForm.toDate" @change="calculateDays" class="p-2 border rounded-lg text-right text-sm" />
          </div>

          <div class="flex flex-col">
            <label class="mb-1 font-medium text-right text-sm">عدد أيام الإجازة*</label>
            <input type="number" v-model="leaveForm.days" readonly class="p-2 border rounded-lg text-right text-sm bg-gray-100" />
          </div>

          <div class="flex flex-col md:col-span-2">
            <label class="mb-1 font-medium text-right text-sm">ملاحظات (اختياري)</label>
            <textarea v-model="leaveForm.notes" placeholder="اكتب ملاحظاتك هنا..." class="p-2 border rounded-lg text-right bg-gray-50 text-sm min-h-[50px]"></textarea>
          </div>

          <div class="flex flex-col md:col-span-2 items-center gap-2">
            <button type="submit" class="bg-primary text-white py-2 px-6 rounded-lg hover:bg-blue-900 transition text-sm">
              إرسال الطلب 📤
            </button>
          </div>
        </form>
      </div>

      <!-- جدول الإجازات السابقة -->
      <div class="bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
        <h3 class="text-lg font-bold text-right mb-3">الإجازات السابقة</h3>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse text-sm text-center">
            <thead class="bg-gray-100">
              <tr>
                <th class="border px-2 py-1">نوع الإجازة</th>
                <th class="border px-2 py-1">من تاريخ</th>
                <th class="border px-2 py-1">إلى تاريخ</th>
                <th class="border px-2 py-1">عدد الأيام</th>
                <th class="border px-2 py-1">الحالة</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(leave, index) in previousLeaves" :key="index" class="odd:bg-gray-50">
                <td class="border px-2 py-1">{{ leave.leaveTypeName }}</td>
                <td class="border px-2 py-1">{{ leave.fromDate }}</td>
                <td class="border px-2 py-1">{{ leave.toDate }}</td>
                <td class="border px-2 py-1">{{ leave.totalDays }}</td>
                <td class="border px-2 py-1" :class="leave.status === 'قيد المراجعة' ? 'text-orange-500' : 'text-green-500'">
                  {{ leave.status }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <Toast v-if="toastMessage" :message="toastMessage" :type="toastType" />

    </div>
  </div>
</template>

<script>
import Sidebar from "../components/Sidebar.vue";
import Toast from "../components/Toast.vue";
import api from "../services/api"; // مثل LoginPage

export default {
  name: "LeavesPage",
  components: { Sidebar, Toast },

  data() {
    return {
      leaveForm: { typeId: "", fromDate: "", toDate: "", days: 0, notes: "" },
      leaveTypes: [],
      previousLeaves: [],
      toastMessage: "",
      toastType: "success",
      employeeId: localStorage.getItem("employeeId") || 1
    };
  },

  async mounted() {
    await this.fetchLeaveTypes();
    await this.fetchPreviousLeaves();
  },

  methods: {
    calculateDays() {
      if (this.leaveForm.fromDate && this.leaveForm.toDate) {
        const from = new Date(this.leaveForm.fromDate);
        const to = new Date(this.leaveForm.toDate);
        this.leaveForm.days = Math.ceil((to - from) / (1000*60*60*24)) + 1;
      }
    },

    async fetchLeaveTypes() {
      try {
        const response = await api.get("/LeaveTypes");
        this.leaveTypes = response.data;
      } catch (error) {
        console.error("Error fetching leave types:", error);
      }
    },

    async fetchPreviousLeaves() {
      try {
        const res = await api.get(`/LeaveRequests/${this.employeeId}`);
        this.previousLeaves = res.data.map(l => ({
          ...l,
          leaveTypeName: this.leaveTypes.find(t => t.Id === l.leaveTypeId)?.Name || "غير معروف"
        }));
      } catch (error) {
        console.error("Error fetching previous leaves:", error);
      }
    },

    async submitLeave() {
      if (!this.leaveForm.typeId || !this.leaveForm.fromDate || !this.leaveForm.toDate) {
        this.toastMessage = "الرجاء ملء جميع الحقول المطلوبة!";
        this.toastType = "error";
        return;
      }

      try {
        const payload = {
          employeeId: Number(this.employeeId),
          leaveTypeId: Number(this.leaveForm.typeId),
          fromDate: this.leaveForm.fromDate,
          toDate: this.leaveForm.toDate,
          totalDays: this.leaveForm.days,
          notes: this.leaveForm.notes,
          status: "قيد المراجعة"
        };

        await api.post("/LeaveRequests", payload);

        this.previousLeaves.unshift({
          ...payload,
          leaveTypeName: this.leaveTypes.find(t => t.Id === payload.leaveTypeId)?.Name || "غير معروف"
        });

        this.toastMessage = "تم إرسال طلب الإجازة ✅";
        this.toastType = "success";
        this.leaveForm = { typeId: "", fromDate: "", toDate: "", days: 0, notes: "" };
      } catch (error) {
        console.error(error);
        this.toastMessage = "حدث خطأ أثناء إرسال الطلب ❌";
        this.toastType = "error";
      }
    }
  }
};
</script>

<style scoped>
.bg-primary { @apply bg-blue-800; }
.bg-background { @apply bg-gray-100; }
</style>
