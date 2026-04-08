<template>
  <div class="flex min-h-screen bg-gray-100 font-cairo" dir="rtl">
    <!-- Sidebar -->
    <SidebarPage class="fixed top-0 right-0 h-screen w-24 md:w-64 z-50" />

    <!-- المحتوى الرئيسي -->
    <div class="flex-1 p-6 mr-24 md:mr-64">
      <Navbar />

      <!-- Card Container -->
      <div class="bg-white rounded-2xl shadow-lg p-6 mt-4">
        <!-- Header -->
        <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 class="text-xl font-bold text-gray-800">إدارة الشكاوى</h2>
          <button
            @click="openAddModal"
            class="bg-primary hover:bg-green-700 text-white px-6 py-2 rounded-xl shadow transition-all flex items-center gap-2"
          >
            <span>+</span> إرسال شكوى جديدة
          </button>
        </div>

        <!-- Search Table -->
        <input
          v-model="searchQuery"
          placeholder="بحث في الشكاوى (المحتوى، القسم، الموظف)..."
          class="input w-full mb-4 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
        />

        <!-- Table -->
        <div class="overflow-x-auto rounded-lg border border-gray-200">
          <table class="min-w-full text-right divide-y divide-gray-200">
            <thead class="bg-navbar">
              <tr>
                <th class="p-3 text-sm font-semibold text-gray-600">الموظف</th>
                <th class="p-3 text-sm font-semibold text-gray-600">المحتوى</th>
                <th class="p-3 text-sm font-semibold text-gray-600">القسم</th>
                <th class="p-3 text-sm font-semibold text-gray-600">التاريخ</th>
                <th class="p-3 text-sm font-semibold text-gray-600">الحالة</th>
                <th class="p-3 text-sm font-semibold text-gray-600">الإجراءات</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="c in filteredComplaints" :key="c.id" class="hover:bg-gray-50 transition">
                <td class="p-3 text-sm">
                  {{ c.isAnonymous ? "مجهول" : (c.employeeName || "-") }}
                </td>
                <td class="p-3 text-sm max-w-[200px] truncate" :title="c.content">
                  {{ c.content }}
                </td>
                <td class="p-3 text-sm">
                  {{ c.isForAllDepartments ? "كل الأقسام" : (c.departmentName || "-") }}
                </td>
                <td class="p-3 text-sm text-gray-500">{{ formatDate(c.createdAt) }}</td>
                <td class="p-3 text-sm">
                  <span :class="['status-badge', statusClass(c.status)]">
                    {{ statusText(c.status) }}
                  </span>
                </td>
                <td class="p-3 text-sm flex gap-3">
                  <button @click="viewComplaint(c)" class="text-blue-600 hover:scale-110 transition" title="عرض">
                    👁️
                  </button>
                  <button 
                    v-if="c.status === 0" 
                    @click="askDelete(c.id)" 
                    class="text-red-600 hover:scale-110 transition" 
                    title="حذف"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
              <tr v-if="!filteredComplaints.length">
                <td colspan="6" class="text-center py-10 text-gray-400 italic">لا توجد شكاوى متاحة</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal إضافة شكوى جديدة -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex justify-center items-center z-[60] p-4">
      <div class="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
        <h3 class="font-bold text-xl mb-4 text-gray-800">إرسال شكوى جديدة</h3>

        <div class="space-y-4">
          <!-- المحتوى -->
          <div>
            <label class="block text-sm font-medium mb-1">محتوى الشكوى*</label>
            <textarea 
              v-model="form.content" 
              rows="3"
              class="input w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
              placeholder="اكتب تفاصيل الشكوى..."
            ></textarea>
          </div>

          <!-- خيارات القسم -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">القسم</label>
              <select 
                v-model="form.departmentId" 
                :disabled="form.isForAllDepartments"
                class="input w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-200"
              >
                <option :value="0">اختر القسم</option>
                <option v-for="dept in departments" :key="dept.id" :value="dept.id">{{ dept.name }}</option>
              </select>
            </div>
            <div class="flex items-center gap-2 mt-6">
              <input type="checkbox" v-model="form.isForAllDepartments" class="w-4 h-4 accent-primary" />
              <label class="text-sm">لكل الأقسام</label>
            </div>
          </div>

          <!-- خيار مجهول -->
          <div class="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            <input type="checkbox" v-model="form.isAnonymous" class="w-4 h-4 accent-primary" />
            <label class="text-sm font-medium text-gray-700">إرسال الشكوى كـ "مجهول"</label>
          </div>

          <!-- المرفقات -->
          <div>
            <label class="block text-sm font-medium mb-1">إرفاق ملف (اختياري)</label>
            <input type="file" @change="handleFileUpload" class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-primary file:text-white cursor-pointer"/>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-8">
          <button @click="closeModal" class="bg-gray-200 px-5 py-2 rounded-lg font-medium hover:bg-gray-300 transition">إلغاء</button>
          <button @click="submitComplaint" class="bg-primary text-white px-8 py-2 rounded-lg font-bold hover:shadow-lg transition">
            إرسال 📤
          </button>
        </div>
      </div>
    </div>

    <!-- Modal عرض التفاصيل -->
    <div v-if="showDetailModal" class="fixed inset-0 bg-black/50 flex justify-center items-center z-[60] p-4">
      <div class="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl relative">
        <h3 class="font-bold text-xl mb-4 text-gray-800">تفاصيل الشكوى</h3>
        <div class="space-y-4 text-right">
          <div class="grid grid-cols-2 gap-4 border-b pb-4">
            <p><span class="font-semibold text-gray-600">الموظف:</span> {{ selectedComplaint.isAnonymous ? "مجهول" : selectedComplaint.employeeName }}</p>
            <p><span class="font-semibold text-gray-600">القسم:</span> {{ selectedComplaint.isForAllDepartments ? "كل الأقسام" : selectedComplaint.departmentName }}</p>
            <p><span class="font-semibold text-gray-600">التاريخ:</span> {{ formatDate(selectedComplaint.createdAt) }}</p>
            <p><span class="font-semibold text-gray-600">الحالة:</span> {{ statusText(selectedComplaint.status) }}</p>
          </div>
          <div>
            <span class="font-semibold text-gray-600">المحتوى:</span>
            <div class="mt-2 p-4 bg-gray-50 rounded-xl border whitespace-pre-wrap text-gray-800">
              {{ selectedComplaint.content }}
            </div>
          </div>
          <div v-if="selectedComplaint.attachmentPath" class="pt-2">
            <a :href="selectedComplaint.attachmentPath" target="_blank" class="text-blue-600 underline flex items-center gap-2">
              📎 عرض الملف المرفق
            </a>
          </div>
        </div>
        <div class="flex justify-center mt-6">
          <button @click="showDetailModal = false" class="bg-primary text-white px-10 py-2 rounded-lg">إغلاق</button>
        </div>
      </div>
    </div>

    <!-- Confirm Delete -->
    <div v-if="confirmDeleteId !== null" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
      <div class="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm text-center">
        <p class="mb-6 text-gray-700 font-bold">هل أنت متأكد من حذف هذه الشكوى؟</p>
        <div class="flex justify-center gap-4">
          <button @click="confirmDeleteId = null" class="px-6 py-2 rounded-lg border border-gray-300">تراجع</button>
          <button @click="deleteComplaint(confirmDeleteId)" class="px-6 py-2 bg-red-600 text-white rounded-lg">حذف</button>
        </div>
      </div>
    </div>

    <ToastPage v-if="showToast" :message="toastMessage" :type="toastType" />
  </div>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import SidebarPage from "@/components/Sidebar.vue";
import Navbar from "@/components/Navbar.vue";
import ToastPage from "@/components/Toast.vue";
import api from "@/services/api";

export default {
  name: 'ComplaintsView',
  components: { SidebarPage, Navbar, ToastPage },

  setup() {
    const complaints = ref([]);
    const departments = ref([]);
    const showModal = ref(false);
    const showDetailModal = ref(false);
    const selectedComplaint = ref(null);
    const searchQuery = ref("");
    const confirmDeleteId = ref(null);

    const form = ref({
      content: "",
      departmentId: 0,
      isForAllDepartments: false,
      isAnonymous: false,
      file: null
    });

    const showToast = ref(false);
    const toastMessage = ref("");
    const toastType = ref("success");

    const toast = (msg, type = "success") => {
      toastMessage.value = msg;
      toastType.value = type;
      showToast.value = true;
      setTimeout(() => (showToast.value = false), 3000);
    };

    const fetchData = async () => {
      try {
        const [compRes, deptRes] = await Promise.all([
          api.get("/complaints/my"),
          api.get("/Organization/Departments")
        ]);
        complaints.value = compRes.data;
        departments.value = deptRes.data;
      } catch (e) {
        toast("خطأ في تحميل البيانات", "error");
      }
    };

    const filteredComplaints = computed(() => {
      const q = searchQuery.value.toLowerCase();
      return complaints.value.filter(c => 
        (c.content || "").toLowerCase().includes(q) ||
        (c.employeeName || "").toLowerCase().includes(q) ||
        (c.departmentName || "").toLowerCase().includes(q)
      );
    });

    const handleFileUpload = (e) => {
      form.value.file = e.target.files[0];
    };

    const openAddModal = () => {
      resetForm();
      showModal.value = true;
    };

    const closeModal = () => {
      showModal.value = false;
      resetForm();
    };

    const resetForm = () => {
      form.value = { content: "", departmentId: 0, isForAllDepartments: false, isAnonymous: false, file: null };
    };

    const viewComplaint = (complaint) => {
      selectedComplaint.value = complaint;
      showDetailModal.value = true;
    };

    const submitComplaint = async () => {
      if (!form.value.content) return toast("يرجى كتابة محتوى الشكوى", "error");

      try {
        const formData = new FormData();
        formData.append("Content", form.value.content);
        formData.append("IsForAllDepartments", form.value.isForAllDepartments);
        formData.append("IsAnonymous", form.value.isAnonymous);

        if (!form.value.isForAllDepartments && form.value.departmentId > 0) {
          formData.append("DepartmentId", form.value.departmentId);
        }

        if (form.value.file) {
          formData.append("File", form.value.file);
        }

        await api.post("/complaints/create", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });

        toast("تم إرسال الشكوى بنجاح");
        closeModal();
        fetchData();
      } catch (err) {
        toast("حدث خطأ أثناء الإرسال", "error");
      }
    };

    const askDelete = (id) => (confirmDeleteId.value = id);

    const deleteComplaint = async (id) => {
      try {
        await api.delete(`/complaints/${id}`);
        toast("تم حذف الشكوى");
        confirmDeleteId.value = null;
        fetchData();
      } catch (err) {
        toast("فشل الحذف", "error");
      }
    };

    const formatDate = (dateStr) => {
      if (!dateStr) return "---";
      return new Date(dateStr).toLocaleDateString("ar-LY");
    };

    const statusText = (status) => {
      const map = { 0: "تحت المراجعة", 1: "تم التحويل", 2: "قيد التحقيق", 3: "تم الرد", 4: "معلقة" };
      return map[status] || "غير معروف";
    };

    const statusClass = (status) => {
      const map = { 0: "bg-gray-400", 1: "bg-purple-500", 2: "bg-yellow-500", 3: "bg-green-500", 4: "bg-red-500" };
      return map[status] || "bg-gray-400";
    };

    onMounted(fetchData);

    return {
      complaints, departments, form, searchQuery, filteredComplaints,
      showModal, showDetailModal, selectedComplaint, confirmDeleteId,
      openAddModal, closeModal, submitComplaint, viewComplaint,
      askDelete, deleteComplaint, handleFileUpload, formatDate,
      statusText, statusClass, showToast, toastMessage, toastType
    };
  }
};
</script>

<style scoped>
.input { @apply bg-gray-50; }
.status-badge {
  @apply px-3 py-1 rounded-full text-white text-[11px] font-bold inline-block text-center min-w-[80px];
}
</style>