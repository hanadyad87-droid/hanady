<template>
  <div class="flex min-h-screen bg-gray-100 font-cairo" dir="rtl">
    <!-- Sidebar -->
    <Sidebar class="fixed top-0 right-0 h-screen w-24 md:w-64 z-50" />

    <!-- Main Content -->
    <div class="flex-1 p-6 mr-24 md:mr-64">
      <Navbar />

      <!-- Card -->
      <div class="bg-white rounded-2xl shadow-lg p-6 mt-4">
        <!-- Header -->
        <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div>
            <h2 class="text-xl font-bold text-gray-800">الإجازات</h2>
            <p class="text-sm text-gray-500 mt-1">
              رصيد الإجازات المتبقي: 
              <span class="font-bold text-primary">{{ balance }} يوم</span>
            </p>
          </div>
          <button
            @click="openAddModal"
            class="bg-primary hover:bg-green-700 text-white px-5 py-2 rounded-xl shadow transition-all flex items-center gap-2"
          >
            <span>+</span> طلب إجازة جديد
          </button>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto rounded-lg border border-gray-200">
          <table class="min-w-full text-right divide-y divide-gray-200">
            <thead class="bg-navbar">
              <tr>
                <th class="p-3 text-sm font-semibold text-gray-600">النوع</th>
                <th class="p-3 text-sm font-semibold text-gray-600">من</th>
                <th class="p-3 text-sm font-semibold text-gray-600">إلى</th>
                <th class="p-3 text-sm font-semibold text-gray-600">الأيام</th>
                <th class="p-3 text-sm font-semibold text-gray-600">الحالة</th>
                <th class="p-3 text-sm font-semibold text-gray-600">الرصيد المتبقي</th>
                <th class="p-3 text-sm font-semibold text-gray-600">ملاحظات المدير</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="l in previousLeaves" :key="l.id" class="hover:bg-gray-50 transition">
                <td class="p-3 text-sm font-medium text-gray-700">{{ l.leaveType }}</td>
                <td class="p-3 text-sm text-gray-600">{{ formatDate(l.fromDate) }}</td>
                <td class="p-3 text-sm text-gray-600">{{ formatDate(l.toDate) }}</td>
                <td class="p-3 text-sm font-bold text-primary">{{ l.totalDays }}</td>
                <td class="p-3 text-sm">
                  <span 
                    :class="statusClass(l.status)"
                    class="px-2 py-1 rounded-md text-xs font-bold"
                  >
                    {{ formatStatus(l.status) }}
                  </span>
                </td>
                <td class="p-3 text-sm text-gray-500">{{ l.remainingAfter }}</td>
                <td class="p-3 text-sm text-gray-400 italic">{{ l.managerNote || "-" }}</td>
              </tr>
              <tr v-if="!previousLeaves.length">
                <td colspan="7" class="text-center py-10 text-gray-400 italic">لا توجد طلبات سابقة</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal طلب إجازة -->
    <div v-if="showLeaveModal" class="fixed inset-0 bg-black/50 flex justify-center items-center z-[60] p-4">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
        <h3 class="font-bold text-xl mb-6 text-gray-800 border-b pb-2">تقديم طلب إجازة</h3>

        <form @submit.prevent="submitLeave" class="space-y-4">
          <!-- نوع الإجازة -->
          <div>
            <label class="block text-sm font-medium mb-1 text-gray-700">نوع الإجازة*</label>
            <select 
              v-model="leaveForm.typeId"
              class="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary bg-gray-50"
              required
            >
              <option disabled value="">اختر النوع...</option>
              <option v-for="t in leaveTypes" :key="t.Id" :value="t.Id">{{ t.Name }}</option>
            </select>
          </div>

          <!-- التواريخ -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1 text-gray-700">من تاريخ*</label>
              <input 
                type="date" 
                v-model="leaveForm.fromDate" 
                @change="calculateDays"
                :min="currentYearStart"
                class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-gray-50"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1 text-gray-700">إلى تاريخ*</label>
              <input 
                type="date" 
                v-model="leaveForm.toDate" 
                @change="calculateDays"
                :min="leaveForm.fromDate || currentYearStart"
                class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-gray-50"
                required
              />
            </div>
          </div>

          <!-- عدد الأيام (عرض فقط) -->
          <div class="bg-blue-50 p-3 rounded-lg flex justify-between items-center">
            <span class="text-sm text-blue-700 font-medium">إجمالي الأيام المحسوبة:</span>
            <span class="text-lg font-bold text-blue-800">{{ leaveForm.days }} يوم</span>
          </div>

          <!-- إرفاق ملف -->
          <div v-if="selectedLeaveType?.needsForm">
            <label class="block text-sm font-medium mb-1 text-gray-700">إرفاق الشهادة/النموذج*</label>
            <input 
              type="file" 
              @change="onFileChange"
              class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-primary file:text-white cursor-pointer"
              required
            />
          </div>

          <!-- ملاحظات -->
          <div>
            <label class="block text-sm font-medium mb-1 text-gray-700">ملاحظات إضافية</label>
            <textarea 
              v-model="leaveForm.notes"
              rows="2"
              class="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary bg-gray-50"
            ></textarea>
          </div>

          <!-- تنبيه الرصيد -->
          <p v-if="leaveForm.days > balance" class="text-red-500 text-xs font-bold bg-red-50 p-2 rounded border border-red-100">
             ⚠️ الرصيد غير كافٍ (المتاح: {{ balance }} يوم)
          </p>

          <!-- الأزرار -->
          <div class="flex justify-end gap-3 mt-6">
            <button 
              type="button" 
              @click="closeModal" 
              class="bg-gray-200 px-5 py-2 rounded-lg font-medium hover:bg-gray-300 transition"
            >
              إلغاء
            </button>
            <button 
              type="submit"
              :disabled="leaveForm.days > balance || !leaveForm.typeId || leaveForm.days <= 0"
              class="bg-primary text-white px-8 py-2 rounded-lg font-bold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              إرسال الطلب
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Toast -->
    <Toast v-if="toastMessage" :message="toastMessage" :type="toastType" />
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
    const year = new Date().getFullYear();
    return {
      leaveTypes: [],
      previousLeaves: [],
      leaveForm: { typeId: "", fromDate: "", toDate: "", days: 0, notes: "" },
      attachedFile: null,
      balance: 0,
      toastMessage: "",
      toastType: "success",
      showLeaveModal: false,
      currentYearStart: `${year}-01-01`,
    };
  },

  computed: {
    selectedLeaveType() {
      return this.leaveTypes.find(t => Number(t.Id) === Number(this.leaveForm.typeId));
    }
  },

  async mounted() {
    await this.fetchLeaveTypes();
    await this.fetchPreviousLeaves();
  },

  methods: {
    formatDate(d) {
      return d ? d.slice(0, 10) : "---";
    },

    formatStatus(status) {
      return status ? status.replace(/_/g, " ") : "قيد الانتظار";
    },

    statusClass(status) {
      switch (status) {
        case "Approved": return "bg-green-100 text-green-700";
        case "Rejected": return "bg-red-100 text-red-700";
        case "Pending": return "bg-yellow-100 text-yellow-700";
        default: return "bg-gray-100 text-gray-700";
      }
    },

    openAddModal() {
      this.showLeaveModal = true;
    },

    closeModal() {
      this.showLeaveModal = false;
      this.resetForm();
    },

    resetForm() {
      this.leaveForm = { typeId: "", fromDate: "", toDate: "", days: 0, notes: "" };
      this.attachedFile = null;
    },

    onFileChange(e) {
      const file = e.target.files[0];
      if (file) this.attachedFile = file;
    },

    calculateDays() {
      if (this.leaveForm.fromDate && this.leaveForm.toDate) {
        const from = new Date(this.leaveForm.fromDate);
        const to = new Date(this.leaveForm.toDate);
        const diff = Math.ceil((to - from) / 86400000) + 1;
        this.leaveForm.days = diff > 0 ? diff : 0;
      }
    },

    async fetchLeaveTypes() {
      try {
        const res = await api.get("/LeaveType");
        this.leaveTypes = res.data.map(t => ({
          Id: Number(t.id),
          Name: t.اسم_الاجازة,
          needsForm: t.تحتاج_نموذج
        }));
      } catch (err) {
        this.showToast("خطأ في تحميل أنواع الإجازات", "error");
      }
    },

    async fetchPreviousLeaves() {
      try {
        const res = await api.get("/leave-requests/my-requests");
        this.previousLeaves = res.data.requests.sort((a, b) => b.id - a.id);
        this.balance = res.data.balance;
      } catch (err) {
        this.showToast("فشل في تحديث قائمة الطلبات", "error");
      }
    },

    async submitLeave() {
      try {
        const formData = new FormData();
        formData.append("LeaveTypeId", this.leaveForm.typeId);
        formData.append("FromDate", this.leaveForm.fromDate);
        formData.append("ToDate", this.leaveForm.toDate);
        formData.append("Notes", this.leaveForm.notes || "");
        if (this.attachedFile) formData.append("Attachment", this.attachedFile);

        await api.post("/leave-requests/create", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });

        this.showToast("تم إرسال طلبك بنجاح");
        this.closeModal();
        await this.fetchPreviousLeaves();
      } catch (err) {
        this.showToast(err.response?.data || "حدث خطأ أثناء الإرسال", "error");
      }
    },

    showToast(msg, type = "success") {
      this.toastMessage = msg;
      this.toastType = type;
      setTimeout(() => (this.toastMessage = ""), 3000);
    }
  }
};
</script>

<style scoped>
.font-cairo { font-family: 'Cairo', sans-serif; }
</style>