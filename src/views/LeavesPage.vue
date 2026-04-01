<template>
  <div class="flex min-h-screen bg-white" dir="rtl">
    <!-- Sidebar -->
    <Sidebar class="fixed top-0 right-0 h-screen w-24 md:w-64 bg-primary text-white p-4 z-50" />

    <!-- المحتوى -->
    <div class="flex-1 p-4 md:p-6 mr-24 md:mr-64">
      <Navbar />

      <!-- رأس الصفحة -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
        <h3 class="text-lg font-bold">إجازاتي</h3>
        <button 
          @click="showLeaveModal = true"
          class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition"
        >
          طلب إجازة 📤
        </button>
      </div>

      <!-- جدول الإجازات -->
      <div class="card p-4 md:p-6 bg-white rounded-xl shadow-lg overflow-x-auto">
        <p class="text-right text-gray-600 mb-2">
          رصيد الإجازات المتبقي: {{ balance }} يوم
        </p>

        <table class="min-w-full divide-y divide-gray-200 text-right">
          <thead class="bg-navbar">
            <tr>
              <th class="border p-1">النوع</th>
              <th class="border p-1">من</th>
              <th class="border p-1">إلى</th>
              <th class="border p-1">الأيام</th>
              <th class="border p-1">الحالة</th>
              <th class="border p-1">رصيد بعد الطلب</th>
              <th class="border p-1">ملاحظات المدير</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="l in previousLeaves" :key="l.id">
              <td class="border p-1">{{ l.leaveTypeName }}</td>
              <td class="border p-1">{{ l.fromDate.slice(0,10) }}</td>
              <td class="border p-1">{{ l.toDate.slice(0,10) }}</td>
              <td class="border p-1">{{ l.totalDays }}</td>
              <td class="border p-1">{{ l.status.replace('_',' ') }}</td>
              <td class="border p-1">{{ l.remainingAfter }}</td>
              <td class="border p-1">{{ l.managerNote || "-" }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal طلب إجازة -->
      <div
        v-if="showLeaveModal"
        class="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4 overflow-y-auto"
      >
        <div class="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6 relative">
          <button 
            @click="showLeaveModal = false"
            class="absolute top-3 left-3 text-gray-500 hover:text-gray-700 text-lg"
          >
            ✖
          </button>

          <h3 class="text-lg font-bold text-right mb-4">طلب إجازة</h3>

          <form class="grid grid-cols-1 md:grid-cols-2 gap-3" @submit.prevent="submitLeave">
            <!-- من تاريخ -->
            <div>
              <label class="block text-right text-xs mb-1">من تاريخ*</label>
              <input 
                type="date" 
                v-model="leaveForm.fromDate" 
                @change="calculateDays"
                :min="currentYearStart"
                :max="currentYearEnd"
                class="w-full p-1.5 border rounded-lg text-right text-sm" 
              />
            </div>

            <!-- نوع الإجازة -->
            <div>
              <label class="block text-right text-xs mb-1">نوع الإجازة*</label>
              <select v-model="leaveForm.typeId"
                class="w-full p-1.5 border rounded-lg text-right text-sm">
                <option disabled value="">اختر نوع الإجازة</option>
                <option v-for="t in leaveTypes" :key="t.Id" :value="t.Id">
                  {{ t.Name }}
                </option>
              </select>
            </div>

            <!-- إلى تاريخ -->
            <div>
              <label class="block text-right text-xs mb-1">إلى تاريخ*</label>
              <input 
                type="date" 
                v-model="leaveForm.toDate" 
                @change="calculateDays"
                :min="leaveForm.fromDate || currentYearStart"
                :max="currentYearEnd"
                class="w-full p-1.5 border rounded-lg text-right text-sm" 
              />
            </div>

            <!-- عدد الأيام -->
            <div>
              <label class="block text-right text-xs mb-1">عدد الأيام</label>
              <input type="number" readonly v-model.number="leaveForm.days"
                class="w-full p-1.5 border rounded-lg bg-gray-100 text-right text-sm" />
            </div>

            <!-- إرفاق النموذج -->
            <div v-if="selectedLeaveType?.needsForm" class="md:col-span-2">
              <label class="block text-right text-xs mb-1">إرفاق النموذج*</label>
              <input type="file" @change="onFileChange"
                class="w-full p-1.5 border rounded-lg text-sm" />
            </div>

            <!-- ملاحظات -->
            <div class="md:col-span-2">
              <label class="block text-right text-xs mb-1">ملاحظات</label>
              <textarea v-model="leaveForm.notes"
                class="w-full p-1.5 border rounded-lg text-right text-sm"></textarea>
            </div>

            <div class="md:col-span-2 text-center">
              <button 
                :disabled="leaveForm.days > balance || !leaveForm.typeId || !leaveForm.fromDate || !leaveForm.toDate"
                class="bg-primary disabled:opacity-50 text-white px-6 py-2 rounded-xl font-semibold shadow-md transition"
              >
                إرسال الطلب
              </button>
            </div>
          </form>

          <p v-if="leaveForm.days > balance && leaveForm.days > 0"
            class="text-red-600 text-right mt-1 font-bold text-sm">
            عدد الأيام أكبر من الرصيد المتاح ({{ balance }} يوم متبقي)
          </p>
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
    const now = new Date();
    const year = now.getFullYear();
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
      currentYearEnd: `${year}-12-31`
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
    onFileChange(e) {
      const file = e.target.files[0];
      if (!file) return;
      const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "application/pdf"];
      if (!allowedTypes.includes(file.type)) {
        this.toastMessage = "نوع الملف غير مسموح. استخدم صورة أو PDF فقط.";
        this.toastType = "error";
        this.attachedFile = null;
        return;
      }
      this.attachedFile = file;
      this.toastMessage = "";
    },

    calculateDays() {
      if (this.leaveForm.fromDate && this.leaveForm.toDate) {
        const from = new Date(this.leaveForm.fromDate);
        const to = new Date(this.leaveForm.toDate);
        this.leaveForm.days = Math.ceil((to - from) / 86400000) + 1;
      } else {
        this.leaveForm.days = 0;
      }
    },

    async fetchLeaveTypes() {
      try {
        const res = await api.get("/LeaveType");
        this.leaveTypes = res.data.map(t => ({
          Id: Number(t.id),
          Name: t.اسم_الاجازة,
          needsForm: t.تحتاج_نموذج,
          deductFromBalance: t.مخصومة_من_الرصيد
        }));
      } catch (err) {
        this.toastMessage = "خطأ في جلب أنواع الإجازة";
        this.toastType = "error";
      }
    },

async fetchPreviousLeaves() {
  try {
    const res = await api.get("/leave-requests/my-requests");
    const requests = res.data.requests;

    // ترتيب حسب ID من الأكبر (آخر طلب) إلى الأصغر
    const sortedRequests = requests.sort((a, b) => b.id - a.id);

    this.previousLeaves = sortedRequests.map(l => ({
      id: l.id,
      leaveTypeName: l.leaveType || "غير محدد",
      fromDate: l.fromDate,
      toDate: l.toDate,
      totalDays: l.totalDays ?? 0, // حتى لو صفر
      status: l.status,
      managerNote: l.managerNote || "-",
      // الرصيد الحالي يظهر كما هو من الباكند
      remainingAfter: res.data.balance
    }));

    this.balance = res.data.balance;
  } catch (err) {
    this.toastMessage = "خطأ في جلب الإجازات السابقة";
    this.toastType = "error";
  }
},

    async submitLeave() {
      const type = this.selectedLeaveType;
      if (!type || !this.leaveForm.fromDate || !this.leaveForm.toDate) {
        this.toastMessage = "الرجاء إكمال جميع الحقول المطلوبة";
        this.toastType = "error";
        return;
      }
      if (type.needsForm && !this.attachedFile) {
        this.toastMessage = "هذا النوع يتطلب إرفاق نموذج";
        this.toastType = "error";
        return;
      }

      try {
        const formData = new FormData();
        formData.append("LeaveTypeId", type.Id);
        formData.append("FromDate", this.leaveForm.fromDate);
        formData.append("ToDate", this.leaveForm.toDate);
        formData.append("Notes", this.leaveForm.notes || "");
        if (this.attachedFile) formData.append("Attachment", this.attachedFile);

        await api.post("/leave-requests/create", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });

        this.toastMessage = "تم إرسال الطلب بنجاح ✅";
        this.toastType = "success";
        this.showLeaveModal = false;
        this.leaveForm = { typeId: "", fromDate: "", toDate: "", days: 0, notes: "" };
        this.attachedFile = null;

        await this.fetchPreviousLeaves();
      } catch (err) {
        console.error(err);
        this.toastMessage = err.response?.data || "حدث خطأ أثناء الإرسال ❌";
        this.toastType = "error";
      }
    }
  }
};
</script>