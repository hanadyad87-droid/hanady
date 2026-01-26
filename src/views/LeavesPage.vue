<template>
  <div class="flex min-h-screen bg-background">
    <Sidebar class="fixed top-0 right-0 h-screen w-24 md:w-64 bg-primary text-white p-4 z-50" />
    <div class="flex-1 p-6 min-h-screen mr-24 md:mr-64">
      <Navbar />

      <!-- نموذج تقديم الإجازة -->
      <div class="card p-6 bg-white rounded-xl shadow-lg mb-6" dir="rtl">
        <form class="grid grid-cols-1 md:grid-cols-2 gap-3" @submit.prevent="submitLeave">

          <div>
            <label class="block text-right text-xs mb-1">من تاريخ*</label>
            <input type="date" v-model="leaveForm.fromDate" @change="calculateDays"
              class="w-full p-1.5 border rounded-lg text-right text-sm" />
          </div>

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

          <div>
            <label class="block text-right text-xs mb-1">إلى تاريخ*</label>
            <input type="date" v-model="leaveForm.toDate" @change="calculateDays"
              class="w-full p-1.5 border rounded-lg text-right text-sm" />
          </div>

          <div>
            <label class="block text-right text-xs mb-1">عدد الأيام</label>
            <input type="number" readonly v-model="leaveForm.days"
              class="w-full p-1.5 border rounded-lg bg-gray-100 text-right text-sm" />
          </div>

          <!-- رفع نموذج (لو مطلوب) -->
          <div v-if="selectedLeaveType?.needsForm" class="md:col-span-2">
            <label class="block text-right text-xs mb-1">إرفاق النموذج*</label>
            <input type="file" @change="onFileChange"
              class="w-full p-1.5 border rounded-lg text-sm" />
          </div>

          <div class="md:col-span-2">
            <label class="block text-right text-xs mb-1">ملاحظات</label>
            <textarea v-model="leaveForm.notes"
              class="w-full p-1.5 border rounded-lg text-right text-sm"></textarea>
          </div>

          <div class="md:col-span-2 text-center">
            <button class="bg-primary text-white px-4 py-1.5 rounded-lg text-sm">
              إرسال الطلب 📤
            </button>
          </div>

        </form>

        <p v-if="leaveForm.days > balance && leaveForm.days > 0"
          class="text-red-600 text-right mt-1 font-bold text-sm">
          عدد الأيام أكبر من الرصيد المتاح ({{ balance }} يوم متبقي)
        </p>
      </div>

      <!-- جدول الإجازات -->
      <div v-if="leaveTypes.length > 0" class="card p-6 bg-white rounded-xl shadow-lg" dir="rtl">
        <h3 class="font-bold text-right mb-3">إجازاتي</h3>
        <p class="text-right text-gray-600 mb-2">رصيد الإجازات المتبقي: {{ balance }} يوم</p>

        <table class="w-full border text-sm text-center">
          <thead class="bg-gray-100">
            <tr>
              <th class="border p-1">النوع</th>
              <th class="border p-1">من</th>
              <th class="border p-1">إلى</th>
              <th class="border p-1">الأيام</th>
              <th class="border p-1">الحالة</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="l in previousLeaves" :key="l.id">
              <td class="border p-1">{{ l.leaveTypeName }}</td>
              <td class="border p-1">{{ l.fromDate.slice(0,10) }}</td>
              <td class="border p-1">{{ l.toDate.slice(0,10) }}</td>
              <td class="border p-1">{{ l.totalDays }}</td>
              <td class="border p-1">{{ l.status.replace('_',' ') }}</td>
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
      leaveTypes: [],
      previousLeaves: [],
      leaveForm: {
        typeId: "",
        fromDate: "",
        toDate: "",
        days: 0,
        notes: ""
      },
      attachedFile: null,
      balance: 0,
      toastMessage: "",
      toastType: "success"
    };
  },

  computed: {
    selectedLeaveType() {
      return this.leaveTypes.find(t => Number(t.Id) === Number(this.leaveForm.typeId));
    }
  },

  async mounted() {
    // استدعاء الدوال الصحيحة داخل this
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
        this.toastMessage = "خطأ في جلب أنواع الإجازة";
        this.toastType = "error";
      }
    },

    async fetchPreviousLeaves() {
      try {
        const res = await api.get("/LeaveRequest/my-requests");
        this.previousLeaves = res.data.requests.map(l => ({
          ...l,
          leaveTypeName: l.leaveTypeName?.اسم_الاجازة || l.leaveTypeName
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

      if (this.leaveForm.days > this.balance) {
        this.toastMessage = `رصيد الإجازات غير كافي (${this.balance} يوم)`;
        this.toastType = "error";
        return;
      }

      if (type.needsForm && !this.attachedFile) {
        this.toastMessage = "هذا النوع يتطلب إرفاق نموذج";
        this.toastType = "error";
        return;
      }

      try {
        // إنشاء الطلب
        await api.post("/LeaveRequest/create", {
          leaveTypeId: type.Id,
          leaveTypeName: type.Name,
          fromDate: this.leaveForm.fromDate,
          toDate: this.leaveForm.toDate,
          notes: this.leaveForm.notes || ""
        });

        // جلب آخر طلب
        const res = await api.get("/LeaveRequest/my-requests");
        const lastRequest = [...res.data.requests].sort((a, b) => b.id - a.id)[0];

if (this.attachedFile) {
  const formData = new FormData();
  formData.append("file", this.attachedFile);

  await api.post(
    `/LeaveRequest/${lastRequest.id}/upload-attachment`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        'Content-Type': undefined // مهم جدًا
      }
    }
  );
}

console.log("attachedFile:", this.attachedFile);
console.log("type:", this.attachedFile?.type);
console.log("size:", this.attachedFile?.size);
console.log("name:", this.attachedFile?.name);



        // نجاح
        this.toastMessage = "تم إرسال الطلب بنجاح ✅";
        this.toastType = "success";

        // إعادة ضبط الفورم
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


