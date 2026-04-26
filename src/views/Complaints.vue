<template>
  <div class="flex min-h-screen bg-gray-100 font-cairo" dir="rtl">
    <SidebarPage />

    <div class="flex-1 w-full min-w-0 p-4 sm:p-6 mr-0 lg:mr-60">
      <Navbar />

      <div class="bg-white rounded-2xl shadow-lg p-6 mt-4">
        <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 class="text-xl font-bold text-gray-800">الشكاوى الخاصة بي</h2>
          <button
            @click="openAddModal"
            class="bg-primary hover:bg-green-700 text-white px-6 py-2 rounded-xl shadow transition-all flex items-center gap-2"
          >
            <PlusIcon class="w-5 h-5" />
            إرسال شكوى جديدة
          </button>
        </div>

        <div class="relative mb-4">
          <span class="absolute inset-y-0 left-0 flex items-center pr-3 pointer-events-none">
            <MagnifyingGlassIcon class="w-5 h-5 text-gray-400" />
          </span>
          <input
            v-model="searchQuery"
            placeholder="بحث في محتوى الشكوى..."
            class="input w-full p-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
          />
        </div>

        <div class="overflow-x-auto rounded-lg border border-gray-200">
          <table class="min-w-full text-right divide-y divide-gray-200">
            <thead class="bg-navbar">
              <tr>
                <th class="p-3 text-sm font-semibold text-gray-600">المحتوى</th>
                <th class="p-3 text-sm font-semibold text-gray-600">القسم</th>
                <th class="p-3 text-sm font-semibold text-gray-600">التاريخ</th>
                <th class="p-3 text-sm font-semibold text-gray-600">الحالة</th>
                <th class="p-3 text-sm font-semibold text-gray-600 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="c in paginatedComplaints" :key="c.id" class="hover:bg-gray-50 transition">
                <td class="p-3 text-sm max-w-[250px] truncate" :title="c.content">{{ c.content }}</td>
                <td class="p-3 text-sm">{{ c.departmentName || "كل الأقسام" }}</td>
                <td class="p-3 text-sm text-gray-500">{{ formatDate(c.createdAt) }}</td>
                <td class="p-3 text-sm">
                  <span :class="['status-badge', statusClass(c.status)]">
                    {{ c.status }}
                  </span>
                </td>
                <td class="p-3 text-sm flex justify-center gap-3">
                  <button @click="viewComplaint(c)" class="text-blue-600 hover:text-blue-800 transition" title="عرض">
                    <EyeIcon class="w-5 h-5" />
                  </button>
                  <button 
                    v-if="c.status === 'تحت_المراجعة'" 
                    @click="askDelete(c.id)" 
                    class="text-red-500 hover:text-red-700 transition" 
                    title="حذف"
                  >
                    <TrashIcon class="w-5 h-5" />
                  </button>
                </td>
              </tr>
              <tr v-if="!paginatedComplaints.length">
                <td colspan="5" class="text-center py-10 text-gray-400 italic">لا توجد شكاوى متاحة</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex justify-between items-center mt-6" v-if="totalPages > 1">
          <button
            @click="currentPage--"
            :disabled="currentPage === 1"
            class="flex items-center gap-1 px-4 py-2 border rounded-xl disabled:opacity-50 hover:bg-gray-50 transition text-sm"
          >
            <ChevronRightIcon class="w-4 h-4" /> السابق
          </button>
          <span class="text-sm font-medium">صفحة {{ currentPage }} من {{ totalPages }}</span>
          <button
            @click="currentPage++"
            :disabled="currentPage >= totalPages"
            class="flex items-center gap-1 px-4 py-2 border rounded-xl disabled:opacity-50 hover:bg-gray-50 transition text-sm"
          >
            التالي <ChevronLeftIcon class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex justify-center items-center z-[60] p-4">
      <div class="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-bold text-xl text-gray-800">إرسال شكوى جديدة</h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">محتوى الشكوى*</label>
            <textarea v-model="form.content" rows="4" class="input w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">القسم</label>
              <select v-model="form.departmentId" :disabled="form.isForAllDepartments" class="input w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-200">
                <option :value="null">اختر القسم</option>
                <option v-for="dept in departments" :key="dept.id" :value="dept.id">{{ dept.name }}</option>
              </select>
            </div>
            <div class="flex items-center gap-2 mt-6">
              <input type="checkbox" v-model="form.isForAllDepartments" class="w-4 h-4 accent-primary rounded" />
              <label class="text-sm">عام</label>
            </div>
          </div>

          <div class="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <input type="checkbox" v-model="form.isAnonymous" class="w-4 h-4 accent-primary rounded" />
            <label class="text-sm font-semibold text-gray-700">إرسال كمجهول</label>
            <ShieldCheckIcon class="w-5 h-5 text-green-600 mr-auto" />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">إرفاق مستند</label>
            <div class="flex items-center justify-center w-full">
              <label class="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                <div class="flex flex-col items-center justify-center pt-5 pb-6">
                  <CloudArrowUpIcon class="w-8 h-8 text-gray-400 mb-2" />
                  <p class="text-xs text-gray-500">انقر لرفع ملف</p>
                </div>
                <input type="file" class="hidden" @change="handleFileUpload" />
              </label>
            </div>
            <p v-if="form.file" class="text-xs text-primary mt-1 font-bold">تم اختيار: {{ form.file.name }}</p>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-8">
          <button @click="closeModal" class="px-5 py-2 text-gray-600 font-medium">إلغاء</button>
          <button @click="submitComplaint" class="bg-primary text-white px-8 py-2 rounded-lg font-bold flex items-center gap-2">
            <PaperAirplaneIcon class="w-5 h-5 -rotate-45" /> إرسال
          </button>
        </div>
      </div>
    </div>

    <div v-if="confirmDeleteId !== null" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
      <div class="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm text-center">
        <div class="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <ExclamationTriangleIcon class="w-10 h-10 text-red-600" />
        </div>
        <h3 class="text-xl font-bold text-gray-800 mb-2">تأكيد الحذف</h3>
        <p class="text-gray-500 mb-6 text-sm">هذا الإجراء لا يمكن التراجع عنه. هل أنت متأكد من حذف هذه الشكوى؟</p>
        <div class="flex gap-4">
          <button @click="confirmDeleteId = null" class="flex-1 py-2 rounded-lg border border-gray-300 font-medium text-gray-600">تراجع</button>
          <button @click="deleteComplaint(confirmDeleteId)" class="flex-1 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition">نعم، احذف</button>
        </div>
      </div>
    </div>

    <ToastPage v-if="showToast" :message="toastMessage" :type="toastType" />
  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from "vue";
import SidebarPage from "@/components/Sidebar.vue";
import Navbar from "@/components/Navbar.vue";
import ToastPage from "@/components/Toast.vue";
import api from "@/services/api";

// استيراد الأيقونات من Heroicons
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  EyeIcon, 
  TrashIcon, 
  ChevronRightIcon, 
  ChevronLeftIcon,
  XMarkIcon,
  CloudArrowUpIcon,
  PaperAirplaneIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon
} from "@heroicons/vue/24/outline";

export default {
  name: 'ComplaintsView',
  components: { 
    SidebarPage, Navbar, ToastPage,
    PlusIcon, MagnifyingGlassIcon, EyeIcon, TrashIcon, 
    ChevronRightIcon, ChevronLeftIcon, XMarkIcon, 
    CloudArrowUpIcon, PaperAirplaneIcon, ShieldCheckIcon,
    ExclamationTriangleIcon
  },

  setup() {
    const complaints = ref([]);
    const departments = ref([]);
    const showModal = ref(false);
    const showDetailModal = ref(false);
    const selectedComplaint = ref(null);
    const searchQuery = ref("");
    const confirmDeleteId = ref(null);
    const currentPage = ref(1);
    const pageSize = 8;

    const form = ref({
      content: "",
      departmentId: null,
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
        complaints.value = compRes.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        departments.value = deptRes.data;
      } catch (e) {
        toast("فشل تحميل البيانات", "error");
      }
    };

    const filteredComplaints = computed(() => {
      return complaints.value.filter(c => (c.content || "").toLowerCase().includes(searchQuery.value.toLowerCase()));
    });

    const totalPages = computed(() => Math.ceil(filteredComplaints.value.length / pageSize));
    const paginatedComplaints = computed(() => {
      const start = (currentPage.value - 1) * pageSize;
      return filteredComplaints.value.slice(start, start + pageSize);
    });

    watch(searchQuery, () => currentPage.value = 1);

    const handleFileUpload = (e) => {
      form.value.file = e.target.files[0];
    };

    const openAddModal = () => { resetForm(); showModal.value = true; };
    const closeModal = () => { showModal.value = false; resetForm(); };
    const resetForm = () => { form.value = { content: "", departmentId: null, isForAllDepartments: false, isAnonymous: false, file: null }; };

    const viewComplaint = (complaint) => {
      selectedComplaint.value = complaint;
      showDetailModal.value = true;
    };

    const submitComplaint = async () => {
      if (!form.value.content.trim()) return toast("محتوى الشكوى مطلوب", "error");
      try {
        const formData = new FormData();
        formData.append("content", form.value.content);
        formData.append("isAnonymous", form.value.isAnonymous);
        formData.append("isForAllDepartments", form.value.isForAllDepartments);
        if (!form.value.isForAllDepartments && form.value.departmentId) formData.append("departmentId", form.value.departmentId);
        if (form.value.file) formData.append("file", form.value.file);

        await api.post("/complaints/create", formData, { headers: { "Content-Type": "multipart/form-data" } });
        toast("تم الإرسال بنجاح");
        closeModal();
        fetchData();
      } catch (err) { toast("فشل الإرسال", "error"); }
    };

    const askDelete = (id) => (confirmDeleteId.value = id);
    const deleteComplaint = async (id) => {
      try {
        await api.delete(`/complaints/${id}`);
        toast("تم الحذف");
        confirmDeleteId.value = null;
        fetchData();
      } catch (err) { toast("فشل الحذف", "error"); }
    };

    const formatDate = (dateStr) => {
      if (!dateStr) return "---";
      return new Date(dateStr).toLocaleDateString("ar-LY");
    };

    const statusClass = (status) => {
      const map = { "تحت_المراجعة": "bg-gray-500", "تم_التحويل": "bg-blue-500", "قيد_التحقيق": "bg-orange-500", "تم_الرد": "bg-green-600", "مرفوضة": "bg-red-600" };
      return map[status] || "bg-gray-400";
    };

    onMounted(fetchData);

    return {
      complaints, departments, form, searchQuery, paginatedComplaints,
      showModal, showDetailModal, selectedComplaint, confirmDeleteId,
      currentPage, totalPages,
      openAddModal, closeModal, submitComplaint, viewComplaint,
      askDelete, deleteComplaint, handleFileUpload, formatDate,
      statusClass, showToast, toastMessage, toastType
    };
  }
};
</script>

<style scoped>
.input { @apply bg-gray-50 transition-all; }
.status-badge {
  @apply px-3 py-1 rounded-full text-white text-[10px] font-bold inline-block text-center min-w-[90px];
}
</style>