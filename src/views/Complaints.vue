<template>
  <div class="flex min-h-screen bg-white" dir="rtl">

    <!-- Sidebar ثابت -->
    <Sidebar class="fixed top-0 right-0 h-screen w-24 md:w-64 bg-primary text-white p-4 z-50" />

    <!-- المحتوى الرئيسي -->
    <div class="flex-1 p-6 min-h-screen mr-24 md:mr-64">
      <Navbar />

      <!-- زر إرسال شكوى جديدة -->
      <div class="mb-6 text-left">
        <button @click="showNewComplaintModal = true"
                class="bg-primary hover:bg-primaryDark text-white px-6 py-2 rounded-lg font-semibold transition shadow-md">
          إرسال شكوى جديدة
        </button>
      </div>

      <!-- جدول الشكاوى -->
      <div class="bg-white rounded-xl shadow-md p-6" dir="rtl">
        <h3 class="text-xl font-bold text-right mb-4 text-primaryDark">شكاويك</h3>

       <table class="min-w-full divide-y divide-gray-200 text-right">
            <thead class="bg-navbar">
            <tr>
              <th class="px-3 py-2 text-right font-medium text-gray-700">الموظف</th>
              <th class="px-3 py-2 text-right font-medium text-gray-700">المحتوى</th>
              <th class="px-3 py-2 text-right font-medium text-gray-700">القسم</th>
              <th class="px-3 py-2 text-right font-medium text-gray-700">تاريخ الإنشاء</th>
              <th class="px-3 py-2 text-right font-medium text-gray-700">المرفق</th>
              <th class="px-3 py-2 text-right font-medium text-gray-700">الحالة</th>
              <th class="px-3 py-2 text-right font-medium text-gray-700">إجراءات</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="c in complaints" :key="c.id" class="hover:bg-gray-50 transition">
              <td class="px-3 py-2 whitespace-nowrap">{{ c.isAnonymous ? "مجهول" : (c.employeeName || "-") }}</td>
              <td class="px-3 py-2 text-right max-w-[250px] truncate" :title="c.content">{{ c.content }}</td>
              <td class="px-3 py-2 whitespace-nowrap">{{ c.isForAllDepartments ? "كل الأقسام" : (c.departmentName || "-") }}</td>
              <td class="px-3 py-2 whitespace-nowrap">{{ formatDate(c.createdAt) }}</td>
              <td class="px-3 py-2 text-gray-600 whitespace-nowrap">
                <a v-if="c.attachmentPath" :href="c.attachmentPath" target="_blank" class="hover:underline text-blue-600">عرض الملف</a>
                <span v-else>-</span>
              </td>
              <td class="px-3 py-2 whitespace-nowrap">
                <span :class="['status-badge', statusClass(c.status)]">{{ statusText(c.status) }}</span>
              </td>
              <td class="px-3 py-2 flex justify-center gap-2 whitespace-nowrap">
                <svg @click="viewComplaint(c)" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                     stroke="currentColor" class="w-5 h-5 text-gray-600 hover:text-gray-800 cursor-pointer" title="عرض الشكوى">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.065 7-9.542 7s-8.268-2.943-9.542-7z"/>
                </svg>

                <svg v-if="statusText(c.status) === 'تحت المراجعة'" @click="confirmDelete(c.id)"
                     xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                     stroke="currentColor" class="w-5 h-5 text-gray-600 hover:text-gray-800 cursor-pointer" title="حذف الشكوى">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-4 0a1 1 0 00-1 1v0a1 1 0 001 1h4a1 1 0 001-1v0a1 1 0 00-1-1m-4 0h4"/>
                </svg>
              </td>
            </tr>

            <tr v-if="complaints.length === 0">
              <td colspan="7" class="text-center text-gray-400 py-4">لا توجد شكاوى حالياً</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- مودال إرسال شكوى جديدة -->
    <div v-if="showNewComplaintModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div class="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6 relative">
        <button @click="showNewComplaintModal = false"
                class="absolute top-4 left-4 text-gray-500 hover:text-gray-700 text-xl">&times;</button>
        <h2 class="text-2xl font-bold text-primaryDark mb-4 text-right">إرسال شكوى جديدة</h2>

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
            <select v-model="newComplaint.departmentId" :disabled="newComplaint.isForAllDepartments"
                    class="w-full p-2 border rounded-lg text-right text-sm focus:ring-2 focus:ring-primaryDark focus:border-primaryDark">
              <option value="0">اختر القسم</option>
              <option v-for="dept in departments" :key="dept.id" :value="dept.id">{{ dept.name }}</option>
            </select>
          </div>

          <!-- لكل الأقسام -->
          <div class="flex items-center gap-2 mt-5">
            <input type="checkbox" v-model="newComplaint.isForAllDepartments" class="accent-primary" />
            <label>لكل الأقسام</label>
          </div>

          <!-- شكوى مجهولة -->
          <div class="flex items-center gap-2 mt-2">
            <input type="checkbox" v-model="newComplaint.isAnonymous" class="accent-primary" />
            <label>إرسال الشكوى مجهولة</label>
          </div>

          <!-- المرفقات -->
          <div class="md:col-span-2">
            <label class="block text-right text-sm font-medium mb-1">مرفق (اختياري)</label>
            <input type="file" @change="handleFileUpload" class="w-full p-2 border rounded-lg text-sm" />
            <p v-if="attachedFile" class="text-xs mt-1 text-gray-500">ملف محدد: {{ attachedFile.name }}</p>
          </div>

          <div class="md:col-span-2 text-center mt-2">
            <button type="submit" class="bg-primary hover:bg-primaryDark text-white px-6 py-2 rounded-lg font-semibold transition shadow-md">
              إرسال الشكوى 📤
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- مودال عرض الشكوى -->
    <div v-if="showDetailModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6 relative">
        <button @click="showDetailModal = false" class="absolute top-4 left-4 text-gray-500 hover:text-gray-700 text-xl">&times;</button>
        <h2 class="text-2xl font-bold text-primaryDark mb-4 text-right">تفاصيل الشكوى</h2>
        <div class="space-y-4 text-right">
          <p><span class="font-semibold">الموظف:</span> {{ selectedComplaint.isAnonymous ? "مجهول" : (selectedComplaint.employeeName || "-") }}</p>
          <p><span class="font-semibold">القسم:</span> {{ selectedComplaint.isForAllDepartments ? "كل الأقسام" : (selectedComplaint.departmentName || "-") }}</p>
          <p><span class="font-semibold">تاريخ الإنشاء:</span> {{ formatDate(selectedComplaint.createdAt) }}</p>
          <p><span class="font-semibold">الحالة:</span> {{ statusText(selectedComplaint.status) }}</p>
          <p><span class="font-semibold">المحتوى:</span></p>
          <div class="p-3 border rounded-lg bg-gray-50 whitespace-pre-wrap break-words">
            {{ selectedComplaint.content }}
          </div>
          <p v-if="selectedComplaint.attachmentPath">
            <span class="font-semibold">المرفق:</span>
            <a :href="selectedComplaint.attachmentPath" target="_blank" class="text-blue-600 hover:underline">عرض الملف</a>
          </p>
        </div>
        <div class="mt-6 text-center">
          <button @click="showDetailModal = false"
                  class="bg-primary hover:bg-primaryDark text-white px-6 py-2 rounded-lg font-semibold transition shadow-md">
            إغلاق
          </button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <ToastPage 
      v-if="toastMessage" 
      :message="toastMessage" 
      :type="toastType" 
      :onConfirm="toastOnConfirm" 
    />
  </div>
</template>

<script>
import Sidebar from "@/components/Sidebar.vue";
import Navbar from "@/components/Navbar.vue";
import ToastPage from "@/components/Toast.vue";
import api from "@/services/api";

export default {
  name: "ManagerComplaints",
  components: { Sidebar, Navbar, ToastPage },
  data() {
    return {
      complaints: [],
      departments: [],
      newComplaint: { content: "", departmentId: 0, isForAllDepartments: false, isAnonymous: false },
      attachedFile: null,
      showNewComplaintModal: false,
      toastMessage: "",
      toastType: "success",
      toastOnConfirm: null,
      selectedComplaint: null,
      showDetailModal: false
    };
  },
  mounted() {
    this.fetchDepartments();
    this.fetchComplaints();
  },
  methods: {
    viewComplaint(complaint) {
      this.selectedComplaint = complaint;
      this.showDetailModal = true;
    },
    showToast(message, type="success", onConfirm=null) {
      this.toastMessage = message;
      this.toastType = type;
      this.toastOnConfirm = onConfirm;
      setTimeout(() => { this.toastMessage = ""; this.toastOnConfirm = null; }, 5000);
    },
    formatDate(dateStr) {
      if (!dateStr) return "-";
      const date = new Date(dateStr);
      return date.toLocaleString("ar-LY", { year: "numeric", month: "2-digit", day: "2-digit" });
    },
    statusText(status) {
      const map = {0:"تحت المراجعة",1:"تم التحويل للقسم",2:"قيد التحقيق",3:"تم الرد",4:"معلقة"};
      return map[status] || "غير معروف";
    },
    statusClass(status) {
      const map = {0:"bg-gray-400",1:"bg-purple-500",2:"bg-yellow-500",3:"bg-green-500",4:"bg-red-500"};
      return map[status] || "bg-gray-400";
    },
    handleFileUpload(e) { this.attachedFile = e.target.files[0] || null; },
   async fetchDepartments() { 
  try { 
    const response = await api.get("/Organization/Departments");
    console.log("Departments API Response:", response.data); // ← راقب في Console
    this.departments = response.data;
  } catch(err){ 
    console.error("Error fetching departments:", err); 
  } 
},
    async fetchComplaints() {
      try {
        const data = (await api.get("/complaints/my")).data;
        this.complaints = data;
      } catch(err){ console.error(err); }
    },
    confirmDelete(complaintId) {
      this.showToast("⚠️ هل تريد حقاً حذف الشكوى؟", "info", async () => { await this.deleteComplaint(complaintId); });
    },
    async deleteComplaint(id) {
      try {
        await api.delete(`/complaints/${id}`);
        this.showToast("✅ تم حذف الشكوى بنجاح");
        await this.fetchComplaints();
      } catch(err){ console.error(err); this.showToast("❌ حدث خطأ أثناء الحذف","error"); }
    },
    async submitComplaint() {
      if(!this.newComplaint.content) return this.showToast("يرجى كتابة محتوى الشكوى","info");

      const formData = new FormData();
      formData.append("Content", this.newComplaint.content);
      formData.append("IsForAllDepartments", this.newComplaint.isForAllDepartments);
      formData.append("IsAnonymous", this.newComplaint.isAnonymous);

      const deptId = (!this.newComplaint.isForAllDepartments && this.newComplaint.departmentId > 0) 
                     ? this.newComplaint.departmentId 
                     : null;
      if(deptId !== null) formData.append("DepartmentId", deptId);

      if(this.attachedFile){ formData.append("File", this.attachedFile); }

      try {
        await api.post("/complaints/create", formData, { headers: { "Content-Type": "multipart/form-data" } });
        this.newComplaint = { content:"", departmentId:0, isForAllDepartments:false, isAnonymous:false };
        this.attachedFile = null;
        this.showNewComplaintModal = false;
        this.showToast("✅ تم إرسال الشكوى بنجاح","success");
        await this.fetchComplaints();
      } catch(err){
        console.error(err);
        this.showToast("❌ حدث خطأ أثناء إرسال الشكوى","error");
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
  min-width: 90px;
  height: 28px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 9999px;
  color: white;
}
td.truncate, div.whitespace-pre-wrap {
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 250px;
  word-break: break-word;
}
div.whitespace-pre-wrap {
  white-space: pre-wrap;
}
</style>
