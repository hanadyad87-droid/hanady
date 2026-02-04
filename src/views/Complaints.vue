<template>
  <div class="flex min-h-screen bg-background">

    <!-- Sidebar ثابت -->
    <Sidebar class="fixed top-0 right-0 h-screen w-24 md:w-64 bg-primary text-white p-4 z-50" />

    <!-- المحتوى الرئيسي -->
    <div class="flex-1 p-6 min-h-screen mr-24 md:mr-64">
      <Navbar />

      <!-- نموذج إرسال شكوى -->
      <div class="bg-white rounded-xl shadow-md p-6 mb-6" dir="rtl">
        <h2 class="text-2xl font-bold text-right mb-6 text-primaryDark">إرسال شكوى جديدة</h2>

        <form @submit.prevent="submitComplaint" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- المحتوى -->
          <div class="md:col-span-2">
            <label class="block text-right text-sm font-medium mb-1">المحتوى*</label>
            <textarea v-model="newComplaint.content" required
                      class="w-full p-3 border rounded-lg text-right text-sm focus:ring-2 focus:ring-primaryDark focus:border-primaryDark"
                      rows="2" placeholder="اكتب محتوى الشكوى هنا..."></textarea>
          </div>

          <!-- القسم -->
          <div>
            <label class="block text-right text-sm font-medium mb-1">القسم</label>
            <select v-model="newComplaint.departmentId"
                    :disabled="newComplaint.isForAllDepartments"
                    class="w-full p-2 border rounded-lg text-right text-sm focus:ring-2 focus:ring-primaryDark focus:border-primaryDark">
              <option value="0">اختر القسم</option>
              <option v-for="dept in departments" :key="dept.id" :value="dept.id">{{ dept.name }}</option>
            </select>
          </div>

          <!-- كل الأقسام -->
          <div class="flex items-center gap-2 mt-5">
            <input type="checkbox" v-model="newComplaint.isForAllDepartments" class="accent-primary" />
            <label>لكل الأقسام</label>
          </div>

          <!-- رفع الملف -->
          <div class="md:col-span-2">
            <label class="block text-right text-sm font-medium mb-1">مرفق (اختياري)</label>
            <input type="file" @change="handleFileUpload" class="w-full p-2 border rounded-lg text-sm" />
            <p v-if="attachedFile" class="text-xs mt-1 text-gray-500">ملف محدد: {{ attachedFile.name }}</p>
          </div>

          <!-- زر الإرسال -->
          <div class="md:col-span-2 text-center mt-2">
            <button type="submit"
                    class="bg-primary hover:bg-primaryDark text-white px-6 py-2 rounded-lg font-semibold transition w-full md:w-auto">
              إرسال الشكوى 📤
            </button>
          </div>
        </form>
      </div>

      <!-- جدول الشكاوى -->
      <div class="bg-white rounded-xl shadow-md p-6" dir="rtl">
        <h3 class="text-xl font-bold text-right mb-4 text-primaryDark">شكاويك</h3>

        <table class="min-w-full divide-y divide-gray-200 text-sm">
         <thead class="bg-gray-50">
  <tr>
    <th class="px-3 py-2 text-right font-medium text-gray-700">المحتوى</th>
    <th class="px-3 py-2 text-right font-medium text-gray-700">القسم</th>
    <th class="px-3 py-2 text-right font-medium text-gray-700">تاريخ الإنشاء</th>
    <th class="px-3 py-2 text-right font-medium text-gray-700">ملاحظات</th>

    <th class="px-3 py-2 text-right font-medium text-gray-700">الحالة</th>
  </tr>
</thead>

          <tbody class="divide-y divide-gray-100">
           <tr v-for="c in complaints" :key="c.id" class="hover:bg-gray-50 transition">
  <td class="px-3 py-2 text-right">{{ c.content }}</td>
  <td class="px-3 py-2">{{ c.departmentName }}</td>
 
  <td class="px-3 py-2">{{ formatDate(c.createdAt) }}</td>
<td class="px-3 py-2 text-gray-600">{{ c.notes || '-' }}</td>
  <!-- الحالة آخر حاجة -->
  <td class="px-3 py-2">
    <span
      :class="statusClass(c.status)"
      class="status-badge"
    >
      {{ c.status }}
    </span>
  </td>
</tr>

            <tr v-if="complaints.length === 0">
              <td colspan="5" class="text-center text-gray-400 py-4">لا توجد شكاوى حالياً</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  </div>
</template>

<script>
import Sidebar from "@/components/Sidebar.vue";
import Navbar from "@/components/Navbar.vue";
import axios from "axios";

export default {
  name: "ComplaintsPage",
  components: { Sidebar, Navbar },
  data() {
    return {
      complaints: [],
      departments: [],
      newComplaint: {
        content: "",
        departmentId: 0,
        isForAllDepartments: false,
        attachmentPath: null
      },
      attachedFile: null,
      toastMessage: "",
      toastType: "success"
    };
  },
  mounted() {
    this.fetchDepartments();
    this.fetchComplaints();
  },
  methods: {
    formatDate(dateStr) {
      if (!dateStr) return "-";
      const date = new Date(dateStr);
      return date.toLocaleString("ar-LY", { year: "numeric", month: "2-digit", day: "2-digit" });
    },
    statusClass(status) {
      switch (status) {
        case "موافق": return "bg-green-500";
        case "مرفوض": return "bg-red-500";
        case "قيد الانتظار": return "bg-yellow-500";
        case "قيد التنفيذ": return "bg-blue-500";
        default: return "bg-gray-400";
      }
    },
    handleFileUpload(e) {
      const file = e.target.files[0];
      this.attachedFile = file || null;
      this.newComplaint.attachmentPath = file ? file.name : null;
    },
    async fetchDepartments() {
      try {
        const res = await axios.get("http://localhost:5205/api/Department", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        this.departments = res.data;
      } catch (err) {
        console.error(err);
      }
    },
    async fetchComplaints() {
      try {
        const res = await axios.get("http://localhost:5205/api/Complaint/my", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        this.complaints = res.data.map(c => ({
          ...c,
          departmentName: c.departmentName || (c.isForAllDepartments ? "كل الأقسام" : "-")
        }));

        this.$nextTick(() => {
          const highlightId = this.$route.query.highlightId;
          if (highlightId) {
            const row = this.$refs['complaint-' + highlightId]?.[0];
            if (row) {
              row.scrollIntoView({ behavior: 'smooth', block: 'center' });
              row.classList.add('bg-yellow-200');
              setTimeout(() => row.classList.remove('bg-yellow-200'), 3000);
            }
          }
        });

      } catch (err) {
        console.error(err);
      }
    },
   async submitComplaint() {
  if (!this.newComplaint.content) return;

  const formData = new FormData();
  formData.append("content", this.newComplaint.content);
  formData.append(
    "departmentId",
    this.newComplaint.isForAllDepartments ? "" : this.newComplaint.departmentId
  );
  formData.append("isForAllDepartments", this.newComplaint.isForAllDepartments);

  if (this.attachedFile) {
    formData.append("file", this.attachedFile);
  }

  try {
    await axios.post(
      "http://localhost:5205/api/Complaint/create",
      formData,
      {
         headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        'Content-Type': undefined // مهم جدًا
      }
      }
    );

    this.newComplaint = {
      content: "",
      departmentId: 0,
      isForAllDepartments: false
    };
    this.attachedFile = null;

    await this.fetchComplaints();
  } catch (err) {
    console.error(err);
  }
}

  }
};
</script>
<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 110px;
  height: 28px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 9999px;
  color: white;
}
</style>
