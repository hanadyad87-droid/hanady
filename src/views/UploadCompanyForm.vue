<template>
  <div class="flex min-h-screen bg-gray-100 font-cairo" dir="rtl">
    <SidebarPage />

    <div class="flex-1 w-full min-w-0 p-4 sm:p-6 mr-0 lg:mr-60">
      <Navbar />

      <div class="bg-white rounded-2xl shadow-lg p-6 mt-4">
        <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 class="text-xl font-bold text-gray-800">إدارة النماذج</h2>
          <button
            @click="openUploadModal"
            class="bg-primary hover:bg-green-700 text-white px-4 py-2 rounded-xl shadow transition-all flex items-center gap-2"
          >
            <PlusIcon class="w-5 h-5 text-white" />
            <span>رفع نموذج جديد</span>
          </button>
        </div>

        <div class="mb-4 relative">
          <input
            v-model="searchQuery"
            placeholder="بحث عن نموذج (العنوان، الموظف)..."
            class="input w-full p-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-right"
          />
          <MagnifyingGlassIcon class="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
        </div>

        <div class="overflow-x-auto rounded-lg border border-gray-200">
          <table class="min-w-full text-right divide-y divide-gray-200">
            <thead class="bg-navbar">
              <tr>
                <th class="p-3 text-sm font-semibold text-gray-600">العنوان</th>
                <th class="p-3 text-sm font-semibold text-gray-600">رفع بواسطة</th>
                <th class="p-3 text-sm font-semibold text-gray-600 text-center">تاريخ الرفع</th>
                <th class="p-3 text-sm font-semibold text-gray-600 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="formItem in paginatedForms" :key="formItem.id" class="hover:bg-gray-50 transition">
                <td class="p-3 text-sm font-medium text-gray-700">{{ formItem.title }}</td>
                <td class="p-3 text-sm text-gray-600 font-semibold">{{ formItem.uploadedBy }}</td>
                <td class="p-3 text-sm text-gray-500 text-center">{{ formatDate(formItem.uploadedAt) }}</td>
                <td class="p-3 text-sm flex justify-center gap-3">
                 
                  <a :href="formItem.fileUrl" target="_blank" class="text-green-600 hover:scale-110 transition" title="تحميل">
                    <ArrowDownTrayIcon class="w-5 h-5"/>
                  </a>
                  <button @click="askDelete(formItem.id)" class="text-red-600 hover:scale-110 transition" title="حذف">
                    <TrashIcon class="w-5 h-5"/>
                  </button>
                </td>
              </tr>
              <tr v-if="!filteredForms.length">
                <td colspan="4" class="text-center py-10 text-gray-400 italic">لا توجد نماذج متاحة</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4" v-if="totalPages > 1">
          <div class="text-sm text-gray-500">
            عرض <span class="font-bold text-gray-800">{{ paginatedForms.length }}</span> من إجمالي <span class="font-bold text-gray-800">{{ filteredForms.length }}</span> نموذج
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="flex items-center gap-1 px-4 py-2 border rounded-xl disabled:opacity-30 hover:bg-gray-50 transition text-sm font-semibold"
            >
              <ChevronRightIcon class="w-4 h-4" /> السابق
            </button>
            
            <div class="flex gap-1">
              <button 
                v-for="page in totalPages" 
                :key="page"
                @click="currentPage = page"
                :class="['px-3 py-1 rounded-lg text-sm font-bold transition-all', currentPage === page ? 'bg-primary text-white shadow-md' : 'hover:bg-gray-100 text-gray-600']"
              >
                {{ page }}
              </button>
            </div>

            <button
              @click="currentPage++"
              :disabled="currentPage >= totalPages"
              class="flex items-center gap-1 px-4 py-2 border rounded-xl disabled:opacity-30 hover:bg-gray-50 transition text-sm font-semibold"
            >
              التالي <ChevronLeftIcon class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showUploadModal"  class="fixed inset-0 bg-black/50 flex justify-center items-center z-[60] p-4 backdrop-blur-sm">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative border-t-8 border-navbar">
        <h3 class="font-bold text-xl mb-6 text-gray-800 border-b pb-2 text-right text-primary">رفع نموذج جديد</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1 text-gray-700 text-right">عنوان النموذج</label>
            <input v-model="form.title" type="text" class="input w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="مثلاً: نموذج طلب إجازة"/>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1 text-gray-700 text-right">الوصف</label>
            <textarea v-model="form.description" rows="3" class="input w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="اكتب تفاصيل عن النموذج..."></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1 text-gray-700 text-right">ملف النموذج</label>
            <input type="file" @change="onFileChange" class="w-full text-sm text-gray-500 file:ml-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-primary file:text-white cursor-pointer"/>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-8">
          <button @click="closeUploadModal" class="bg-gray-200 px-5 py-2 rounded-lg font-medium hover:bg-gray-300 transition">إلغاء</button>
          <button @click="uploadForm" class="bg-primary text-white px-8 py-2 rounded-lg font-bold hover:shadow-lg transition">
            رفع النموذج
          </button>
        </div>
      </div>
    </div>

    <div v-if="confirmDeleteId !== null" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
      <div class="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm text-center">
        <div class="text-red-600 mb-4 flex justify-center">
          <ExclamationTriangleIcon class="w-12 h-12"/>
        </div>
        <p class="mb-6 text-gray-700 font-bold">هل أنت متأكد من حذف هذا النموذج نهائياً؟</p>
        <div class="flex justify-center gap-4">
          <button @click="confirmDeleteId = null" class="px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-50">تراجع</button>
          <button @click="deleteForm(confirmDeleteId)" class="px-6 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition">حذف</button>
        </div>
      </div>
    </div>

    <ToastPage v-if="showToast" :message="toastMessage" :type="toastType" />
  </div>
</template>

<script>
import axios from "axios"
import { ref, onMounted, computed, watch } from "vue"
import SidebarPage from "../components/Sidebar.vue"
import Navbar from "../components/Navbar.vue"
import ToastPage from "@/components/Toast.vue"

// Heroicons
import { 
  PlusIcon,
  MagnifyingGlassIcon,

  ArrowDownTrayIcon, 
  TrashIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  ExclamationTriangleIcon
} from "@heroicons/vue/24/outline"

export default {
  components: {
    SidebarPage, Navbar, ToastPage,
    PlusIcon, MagnifyingGlassIcon,  
    ArrowDownTrayIcon, TrashIcon,
    ChevronRightIcon, ChevronLeftIcon, ExclamationTriangleIcon
  },
  setup() {
    const forms = ref([])
    const searchQuery = ref("")
    const showUploadModal = ref(false)
    const showViewModal = ref(false)
    const selectedDescription = ref("")
    const confirmDeleteId = ref(null)

    // Pagination State
    const currentPage = ref(1)
    const pageSize = 8

    const showToast = ref(false)
    const toastMessage = ref("")
    const toastType = ref("success")

    const form = ref({
      title: "",
      description: "",
      file: null
    })

    axios.defaults.baseURL = "http://localhost:5205/api"
    axios.defaults.headers.common["Authorization"] = `Bearer ${localStorage.getItem("token")}`

    const toast = (msg, type = "success") => {
      toastMessage.value = msg;
      toastType.value = type;
      showToast.value = true;
      setTimeout(() => (showToast.value = false), 3000);
    };

    const fetchForms = async () => {
      try {
        const res = await axios.get("/company-forms/all")
        forms.value = (res.data || []).sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
      } catch (e) {
        toast("خطأ في تحميل النماذج", "error")
      }
    }

    const filteredForms = computed(() => {
      const q = searchQuery.value.toLowerCase();
      return forms.value.filter(f => 
        (f.title || "").toLowerCase().includes(q) || 
        (f.uploadedBy || "").toLowerCase().includes(q)
      );
    });

    // Pagination Logic
    const totalPages = computed(() => Math.ceil(filteredForms.value.length / pageSize));
    
    const paginatedForms = computed(() => {
      const start = (currentPage.value - 1) * pageSize;
      return filteredForms.value.slice(start, start + pageSize);
    });

    // Reset to page 1 when searching
    watch(searchQuery, () => {
      currentPage.value = 1;
    });

    const openUploadModal = () => { resetForm(); showUploadModal.value = true; }
    const closeUploadModal = () => { showUploadModal.value = false; resetForm(); }

    const viewForm = (formData) => {
      // يمكنك استخدام Modal مخصص هنا لعرض الوصف أو استخدام Alert بسيط
      alert(formData.description || "لا يوجد وصف متوفر.");
    }

    const onFileChange = (e) => { form.value.file = e.target.files[0]; }

    const uploadForm = async () => {
      if (!form.value.title || !form.value.file) {
        return toast("يرجى إدخال العنوان واختيار ملف", "error");
      }
      try {
        const data = new FormData();
        data.append("Title", form.value.title);
        data.append("Description", form.value.description);
        if (form.value.file) data.append("Attachment", form.value.file);

        await axios.post("/company-forms/upload", data);
        toast("تم رفع النموذج بنجاح ✨");
        closeUploadModal();
        fetchForms();
      } catch (err) {
        toast("فشل في رفع النموذج", "error");
      }
    }

    const askDelete = (id) => { confirmDeleteId.value = id; }

    const deleteForm = async (id) => {
      try {
        await axios.delete(`/company-forms/${id}`);
        toast("تم الحذف بنجاح");
        confirmDeleteId.value = null;
        fetchForms();
      } catch {
        toast("خطأ أثناء عملية الحذف", "error");
      }
    }

    const formatDate = (dateStr) => {
      if (!dateStr) return '---';
      return new Date(dateStr).toLocaleDateString('en-GB');
    }

    const resetForm = () => {
      form.value = { title: "", description: "", file: null };
    }

    onMounted(fetchForms);

    return {
      forms, searchQuery, form, showUploadModal, showViewModal,
      selectedDescription, filteredForms, paginatedForms, confirmDeleteId,
      currentPage, totalPages,
      showToast, toastMessage, toastType,
      openUploadModal, closeUploadModal, viewForm, uploadForm,
      askDelete, deleteForm, onFileChange, formatDate
    }
  }
}
</script>

<style scoped>
.input { @apply bg-gray-50; }
</style>