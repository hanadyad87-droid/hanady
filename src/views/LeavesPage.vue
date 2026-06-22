<template>
  <div class="flex min-h-screen bg-gray-100 font-cairo" dir="rtl">
    <Sidebar />

    <div class="flex-1 w-full min-w-0 p-4 sm:p-6 mr-0 lg:mr-60">
      <Navbar />

      <div class="bg-white rounded-2xl shadow-lg p-6 mt-4">

        <!-- HEADER -->
        <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div>
            <h2 class="text-xl font-bold text-gray-800">الإجازات</h2>
            <p class="text-sm text-gray-500 mt-1">
            رصيد الاجازات بعد الخصم :
              <span class="font-bold text-green-600">{{ balance }} يوم</span>
            </p>
          </div>

          <button
            @click="openAddModal"
            class="bg-primary hover:bg-green-700 text-white px-5 py-2 rounded-xl"
          >
            طلب إجازة
          </button>
        </div>

        <!-- TABLE -->
        <div class="overflow-x-auto border rounded-lg">
          <table class="min-w-full text-right">

            <thead class="bg-navbar">
              <tr>
                <th class="p-3 text-sm font-semibold text-gray-600">النوع</th>
                <th class="p-3 text-sm font-semibold text-gray-600">من</th>
                <th class="p-3 text-sm font-semibold text-gray-600">إلى</th>
                <th class="p-3 text-sm font-semibold text-gray-600">الحالة</th>
                <th class="p-3 text-sm font-semibold text-gray-600">المخزون بعد الخصم</th>
                
              </tr>
            </thead>

            <tbody>
              <tr v-for="l in paginatedLeaves" :key="l.id" class="border-t">
                <td class="p-3">{{ l.leaveType }}</td>
                <td class="p-3">{{ formatDate(l.fromDate) }}</td>
                <td class="p-3">{{ formatDate(l.toDate) }}</td>

                <td class="p-3">
                  <span :class="statusClass(l.status)">
                    {{ l.status }}
                  </span>
                </td>

                <td class="p-3 font-bold text-gray-700">
                  {{ l.balanceAfterDeduction ?? "-" }}
                </td>
                
              </tr>

              <tr v-if="!paginatedLeaves.length">
                <td colspan="5" class="text-center p-6 text-gray-400">
                  لا توجد طلبات
                </td>
              </tr>
            </tbody>

          </table>
        </div>

        <!-- PAGINATION -->
        <div class="flex justify-between items-center mt-4">

          <button
            class="px-3 py-1 border rounded"
            :disabled="currentPage === 1"
            @click="currentPage--"
          >
            السابق
          </button>

          <span>
            صفحة {{ currentPage }} من {{ totalPages }}
          </span>

          <button
            class="px-3 py-1 border rounded"
            :disabled="currentPage === totalPages"
            @click="currentPage++"
          >
            التالي
          </button>

        </div>

      </div>
    </div>

    <!-- Add Leave Modal -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black/50 flex justify-center items-center z-[60] p-4">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
        <button @click="closeAddModal" class="absolute top-4 left-4 text-gray-400 hover:text-red-600 text-xl font-bold">
          &times;
        </button>
        <h3 class="font-bold text-xl mb-4 text-gray-800 border-b pb-2">طلب إجازة</h3>

        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium mb-1">نوع الإجازة</label>
            <select v-model="form.leaveTypeId" class="input w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary">
              <option :value="null">اختر...</option>
              <option v-for="t in leaveTypes" :key="t.id" :value="t.id">
                {{ t.اسم_الاجازة }}
              </option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-sm font-medium mb-1">من</label>
              <input v-model="form.fromDate" type="date" class="input w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">إلى</label>
              <input v-model="form.toDate" type="date" class="input w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">ملاحظات (اختياري)</label>
            <textarea v-model="form.notes" rows="2" class="input w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary" />
          </div>

         <div v-if="requiresAttachment">
  <label class="block text-sm font-medium mb-1">
    المرفق مطلوب لهذا النوع من الإجازات
  </label>

  <input
    type="file"
    @change="onFileChange"
    class="w-full text-xs text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:bg-primary file:text-white"
  />
</div>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <button @click="closeAddModal" class="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition">إلغاء</button>
          <button @click="submitLeave" class="px-6 py-2 bg-primary text-white rounded-lg hover:bg-green-700 transition font-bold">إرسال</button>
        </div>
      </div>
    </div>

    <Toast v-if="toastMessage" :message="toastMessage" :type="toastType" />
  </div>
</template>

<script>
import Sidebar from "../components/Sidebar.vue";
import Navbar from "../components/Navbar.vue";
import api from "../services/api";
import Toast from "../components/Toast.vue";

export default {
  components: { Sidebar, Navbar, Toast },

  data() {
    return {
      previousLeaves: [],
      balance: 0,
      leaveTypes: [],
      showAddModal: false,
      form: {
        leaveTypeId: null,
        fromDate: "",
        toDate: "",
        notes: "",
        attachment: null,
      },
      toastMessage: "",
      toastType: "success",

      currentPage: 1,
      pageSize: 5,
    };
  },

  computed: {
    totalPages() {
      return Math.ceil(this.previousLeaves.length / this.pageSize) || 1;
    },

    paginatedLeaves() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.previousLeaves.slice(start, start + this.pageSize);
    },
    selectedLeaveType() {
    return this.leaveTypes.find(
      x => x.id === this.form.leaveTypeId
    );
  },

  requiresAttachment() {
    return this.selectedLeaveType?.تحتاج_نموذج === true;
  }
  },

  async mounted() {
    await this.fetchPreviousLeaves();
    await this.fetchLeaveTypes();
  },

  methods: {

    // =========================
    // LOAD DATA
    // =========================
    async fetchPreviousLeaves() {
      const res = await api.get("/leave-requests/my-requests");

      const raw = res.data.requests || [];
      this.balance = res.data.balance || 0;

      // حساب "المخزون بعد الخصم" للطلبات المقبولة والمخصومة من الرصيد
      // نشتغل من الأحدث للأقدم: الرصيد الحالي = بعد آخر خصم.
      let running = this.balance;
      const computed = raw.map((x) => ({
        ...x,
        balanceAfterDeduction: null,
      }));

      for (const item of computed) {
        const isApproved = item.isFinalApproved === true || (item.status || "").includes("مقبولة");
        if (isApproved && item.deductsBalance && Number.isFinite(item.totalDays)) {
          item.balanceAfterDeduction = running;
          running += item.totalDays;
        }
      }

      this.previousLeaves = computed;
      this.currentPage = 1; // reset pagination
    },

    async fetchLeaveTypes() {
      try {
        const res = await api.get("/LeaveType");
        this.leaveTypes = res.data || [];
      } catch {
        // ignore
      }
    },

    showToast(msg, type = "success") {
      this.toastMessage = msg;
      this.toastType = type;
      setTimeout(() => (this.toastMessage = ""), 3000);
    },

    openAddModal() {
      this.form = { leaveTypeId: null, fromDate: "", toDate: "", notes: "", attachment: null };
      this.showAddModal = true;
    },

    closeAddModal() {
      this.showAddModal = false;
    },

    onFileChange(e) {
      this.form.attachment = e.target.files?.[0] || null;
    },

    async submitLeave() {
      const lt = this.leaveTypes.find((x) => x.id === this.form.leaveTypeId);
      if (!this.form.leaveTypeId) return this.showToast("اختر نوع الإجازة", "error");
      if (!this.form.fromDate || !this.form.toDate) return this.showToast("حدد المدة", "error");

      const from = new Date(this.form.fromDate);
      const to = new Date(this.form.toDate);
      if (to < from) return this.showToast("التاريخ غير صحيح", "error");

      // تحذير مبكر فقط (الحساب النهائي في الباكند)
      const approxDays = Math.floor((to - from) / (24 * 60 * 60 * 1000)) + 1;
      if (lt?.مخصومة_من_الرصيد && approxDays > this.balance) {
        return this.showToast("طلب الإجازة أكبر من الرصيد المتبقي", "warning");
      }
if (this.requiresAttachment && !this.form.attachment) {
  return this.showToast(
    "يجب إرفاق النموذج لهذا النوع من الإجازات",
    "error"
  );
}
      try {
        const data = new FormData();
        data.append("LeaveTypeId", String(this.form.leaveTypeId));
        data.append("FromDate", this.form.fromDate);
        data.append("ToDate", this.form.toDate);
        if (this.form.notes) data.append("Notes", this.form.notes);
        if (this.form.attachment) data.append("Attachment", this.form.attachment);

        await api.post("/leave-requests/create", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        this.showToast("تم إرسال طلب الإجازة");
        this.closeAddModal();
        await this.fetchPreviousLeaves();
      } catch (err) {
        const msg = err?.response?.data || "فشل إرسال الطلب";
        if (typeof msg === "string" && msg.includes("الرصيد غير كافي")) {
          this.showToast("طلب الإجازة أكبر من الرصيد المتبقي", "error");
        } else {
          this.showToast(typeof msg === "string" ? msg : "فشل إرسال الطلب", "error");
        }
      }
    },

    // =========================
    // FORMAT
    // =========================
    formatDate(d) {
      return d ? d.slice(0, 10) : "-";
    },

    statusClass(status) {
      if (status?.includes("مقبولة")) {
        return "text-green-600 font-bold";
      }
      if (status?.includes("مرفوض")) {
        return "text-red-600 font-bold";
      }
      if (status?.includes("بانتظار")) {
        return "text-yellow-600 font-bold";
      }
      return "text-gray-600";
    },

    // =========================
    // MODAL (لو تحتاجه لاحقاً)
    // =========================
    // openAddModal موجود فوق بالفعل
  }
};
</script>