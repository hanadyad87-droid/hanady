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
      <select v-model="leaveForm.typeId" class="w-full p-1.5 border rounded-lg text-right text-sm">
        <option disabled value="">اختر نوع الإجازة</option>
        <option v-for="t in leaveTypes" :key="t.Id" :value="Number(t.Id)">
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
      <div v-if="leaveTypes.length > 0"  class="card p-6 bg-white rounded-xl shadow-lg" dir="rtl">
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
              <td class="border p-1" :class="{
                'text-orange-500': l.status === 'قيد_الانتظار',
                'text-green-500': l.status !== 'قيد_الانتظار'
              }">{{ l.status.replace('_', ' ') }}</td>
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
      employeeId: Number(localStorage.getItem("employeeId")),
      leaveTypes: [],
      previousLeaves: [],
      leaveForm: { typeId: "", fromDate: "", toDate: "", days: 0, notes: "" },
      balance: 0,
      toastMessage: "",
      toastType: "success"
    };
  },

  async mounted() {
    await this.fetchLeaveTypes();        // أولًا جلب أنواع الإجازة
    await this.fetchPreviousLeaves();    // بعد ذلك جلب الإجازات وربط الأسماء
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
        const res = await api.get("/LeaveType");
        // تحويل كل شيء إلى Number و Name عربي
        this.leaveTypes = res.data.map(t => ({ Id: Number(t.id), Name: t.اسم_الاجازة }));
      } catch (e) {
        this.toastMessage = "خطأ في جلب أنواع الإجازة";
        this.toastType = "error";
      }
    },

async fetchPreviousLeaves() {
  try {
    const res = await api.get("/LeaveRequest/my-requests");

    this.previousLeaves = res.data.requests.map(l => {
      return {
        ...l,
        leaveTypeName: l.leaveTypeName?.اسم_الاجازة || "غير معروف"
      };
    });

    this.balance = res.data.balance;
  } catch (e) {
    this.toastMessage = "خطأ في جلب الإجازات السابقة";
    this.toastType = "error";
  }
}
,

    async submitLeave() {
      if (!this.leaveForm.typeId || !this.leaveForm.fromDate || !this.leaveForm.toDate) {
        this.toastMessage = "الرجاء ملء جميع الحقول المطلوبة";
        this.toastType = "error";
        return;
      }

      if (this.leaveForm.days > this.balance) {
        this.toastMessage = `رصيد الإجازات غير كافي (${this.balance} يوم متبقي)`;
        this.toastType = "error";
        return;
      }

      try {
        const type = this.leaveTypes.find(t => t.Id === Number(this.leaveForm.typeId));
        const payload = {
          leaveTypeId: Number(this.leaveForm.typeId),
          leaveTypeName: type?.Name || "غير معروف",
          fromDate: this.leaveForm.fromDate,
          toDate: this.leaveForm.toDate,
          notes: this.leaveForm.notes
        };

        await api.post("/LeaveRequest/create", payload);

        this.toastMessage = "تم إرسال الطلب ✅";
        this.toastType = "success";

        this.leaveForm = { typeId: "", fromDate: "", toDate: "", days: 0, notes: "" };
        await this.fetchPreviousLeaves();  // تحديث الجدول بعد الإرسال
      } catch (e) {
        console.error(e);
        this.toastMessage = e.response?.data || "خطأ أثناء إرسال الطلب ❌";
        this.toastType = "error";
      }
    }
  }
};
</script>
