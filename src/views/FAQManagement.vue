<template>
  <div class="flex min-h-screen bg-gray-100 font-cairo" dir="rtl">
    <SidebarPage />

    <div class="flex-1 w-full min-w-0 p-4 sm:p-6 mr-0 lg:mr-60">
      <Navbar />

      <div class="bg-white rounded-2xl shadow-lg p-6 mt-4">
        
        <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 class="text-xl font-bold text-gray-800">إدارة الأسئلة الشائعة</h2>
          <button
            @click="openModalFunc()"
            class="bg-primary hover:bg-green-700 text-white px-6 py-2 rounded-xl shadow transition-all flex items-center gap-2 font-bold"
          >
            <PlusIcon class="w-5 h-5" />
            إضافة سؤال جديد
          </button>
        </div>

        <div class="overflow-x-auto rounded-lg border border-gray-200">
          <table class="min-w-full text-right divide-y divide-gray-200">
            <thead class="bg-navbar">
              <tr>
                <th class="p-4 text-sm font-semibold text-gray-600">السؤال</th>
                <th class="p-4 text-sm font-semibold text-gray-600">الإجابة</th>
                <th class="p-4 text-sm font-semibold text-gray-600 text-center">التصنيف</th>
                <th class="p-4 text-sm font-semibold text-gray-600 text-center">الحالة</th>
                <th class="p-4 text-sm font-semibold text-gray-600 text-center">إجراءات</th>
              </tr>
            </thead>

            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="faq in paginatedData" :key="faq.id" class="hover:bg-gray-50 transition">
                <td class="p-4 text-sm font-bold text-gray-700 max-w-xs truncate" :title="faq.question">{{ faq.question }}</td>
                <td class="p-4 text-sm text-gray-500 max-w-xs truncate" :title="faq.answer">{{ faq.answer }}</td>
                <td class="p-4 text-sm text-center">
                  <span class="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[11px] font-bold">
                    {{ faq.category }}
                  </span>
                </td>
                <td class="p-4 text-sm text-center">
                  <span :class="faq.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'" 
                        class="px-3 py-1 rounded-full text-[11px] font-bold">
                    {{ faq.isActive ? 'نشط' : 'متوقف' }}
                  </span>
                </td>
                <td class="p-4 text-sm">
                  <div class="flex justify-center gap-3">
                    <button @click="editFAQ(faq)" title="تعديل" class="text-blue-600 hover:scale-110 transition">
                      <PencilSquareIcon class="w-5 h-5" />
                    </button>
                    <button @click="confirmDelete(faq.id)" title="حذف" class="text-red-600 hover:scale-110 transition">
                      <TrashIcon class="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="faqs.length === 0">
                <td colspan="5" class="text-center py-10 text-gray-400 italic">لا توجد أسئلة حالياً</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex justify-between items-center mt-6" v-if="totalPages > 1">
          <button
            @click="currentPage--"
            :disabled="currentPage === 1"
            class="flex items-center gap-1 px-4 py-2 border rounded-xl disabled:opacity-30 hover:bg-gray-50 transition text-sm font-bold"
          >
            <ChevronRightIcon class="w-4 h-4" /> السابق
          </button>
          
          <div class="flex gap-1">
            <button 
              v-for="page in totalPages" :key="page"
              @click="currentPage = page"
              :class="['px-3 py-1 rounded-lg text-sm transition-all', currentPage === page ? 'bg-primary text-white shadow-md' : 'hover:bg-gray-100']"
            >
              {{ page }}
            </button>
          </div>

          <button
            @click="currentPage++"
            :disabled="currentPage >= totalPages"
            class="flex items-center gap-1 px-4 py-2 border rounded-xl disabled:opacity-30 hover:bg-gray-50 transition text-sm font-bold"
          >
            التالي <ChevronLeftIcon class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <div v-if="openModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div class="flex justify-between items-center mb-4 border-b pb-2">
          <h3 class="font-bold text-xl text-gray-800">
            {{ editingFAQ ? "تعديل السؤال" : "إضافة سؤال جديد" }}
          </h3>
          <button @click="closeModal" class="text-gray-400 hover:text-red-500 transition">
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1 text-gray-700">السؤال <span class="text-red-500">*</span></label>
            <input 
              v-model="faqForm.question" 
              type="text" 
              :class="{'border-red-500 ring-red-100': errors.question}"
              class="input w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" 
            />
            <p v-if="errors.question" class="text-red-500 text-xs mt-1">{{ errors.question }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1 text-gray-700">الإجابة <span class="text-red-500">*</span></label>
            <textarea 
              v-model="faqForm.answer" 
              :class="{'border-red-500 ring-red-100': errors.answer}"
              class="input w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" rows="3"
            ></textarea>
            <p v-if="errors.answer" class="text-red-500 text-xs mt-1">{{ errors.answer }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1 text-gray-700">التصنيف <span class="text-red-500">*</span></label>
            <input 
              v-model="faqForm.category" 
              type="text" 
              :class="{'border-red-500 ring-red-100': errors.category}"
              class="input w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" 
            />
            <p v-if="errors.category" class="text-red-500 text-xs mt-1">{{ errors.category }}</p>
          </div>

          <div class="flex items-center gap-3 bg-gray-50 p-2 rounded-lg border border-dashed border-gray-300">
            <input type="checkbox" v-model="faqForm.isActive" id="activeCheckbox" class="w-4 h-4 accent-primary rounded" />
            <label for="activeCheckbox" class="text-sm font-bold text-gray-700 cursor-pointer">تفعيل السؤال (يظهر للموظفين)</label>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-8">
          <button @click="closeModal" class="px-5 py-2 text-gray-500 font-medium hover:text-gray-700 transition">إلغاء</button>
          <button @click="saveFAQ" class="bg-primary text-white px-8 py-2 rounded-lg font-bold shadow hover:bg-green-700 transition flex items-center gap-2">
            <CheckCircleIcon class="w-5 h-5" />
            {{ editingFAQ ? 'تحديث البيانات' : 'حفظ السؤال' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="idToDelete" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
        <div class="bg-white p-6 rounded-2xl max-w-sm w-full text-center shadow-2xl">
            <ExclamationTriangleIcon class="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 class="font-bold text-xl mb-2">تأكيد الحذف</h3>
            <p class="text-gray-500 text-sm mb-6">هل أنت متأكد من حذف هذا السؤال؟ لا يمكن التراجع عن هذا الإجراء.</p>
            <div class="flex gap-3">
                <button @click="idToDelete = null" class="flex-1 py-2 bg-gray-100 rounded-xl font-bold">إلغاء</button>
                <button @click="deleteFAQ" class="flex-1 py-2 bg-red-600 text-white rounded-xl font-bold">حذف نهائي</button>
            </div>
        </div>
    </div>

    <Toast v-if="toastMessage" :message="toastMessage" :type="toastType" />
  </div>
</template>

<script>
import SidebarPage from "@/components/Sidebar.vue";
import Navbar from "@/components/Navbar.vue";
import Toast from "@/components/Toast.vue";
import axios from "axios";
import { 
  PlusIcon, PencilSquareIcon, TrashIcon, 
  XMarkIcon, CheckCircleIcon, ChevronRightIcon, 
  ChevronLeftIcon, ExclamationTriangleIcon 
} from "@heroicons/vue/24/outline";

export default {
  name: "FAQManagement",
  components: { 
    SidebarPage, Navbar, Toast, PlusIcon, 
    PencilSquareIcon, TrashIcon, XMarkIcon, 
    CheckCircleIcon, ChevronRightIcon, ChevronLeftIcon,
    ExclamationTriangleIcon
  },
  data() {
    return {
      faqs: [],
      openModal: false,
      editingFAQ: null,
      idToDelete: null,
      faqForm: { question: "", answer: "", category: "", isActive: true },
      errors: { question: "", answer: "", category: "" },
      
      // Pagination
      currentPage: 1,
      pageSize: 7,

      toastMessage: "",
      toastType: "success",
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.faqs.length / this.pageSize);
    },
    paginatedData() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.faqs.slice(start, end);
    }
  },
  methods: {
    validate() {
      this.errors = { question: "", answer: "", category: "" };
      let isValid = true;
      if (!this.faqForm.question.trim()) { this.errors.question = "السؤال مطلوب"; isValid = false; }
      if (!this.faqForm.answer.trim()) { this.errors.answer = "الإجابة مطلوبة"; isValid = false; }
      if (!this.faqForm.category.trim()) { this.errors.category = "التصنيف مطلوب"; isValid = false; }
      return isValid;
    },

    async fetchFAQs() {
      try {
        const res = await axios.get("http://localhost:5205/api/FAQ", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        this.faqs = res.data;
      } catch (err) {
        this.showToast("حدث خطأ في جلب الأسئلة", "error");
      }
    },

    openModalFunc() {
      this.editingFAQ = null;
      this.faqForm = { question: "", answer: "", category: "", isActive: true };
      this.errors = { question: "", answer: "", category: "" };
      this.openModal = true;
    },

    editFAQ(faq) {
      this.editingFAQ = faq;
      this.faqForm = { ...faq };
      this.errors = { question: "", answer: "", category: "" };
      this.openModal = true;
    },

    async saveFAQ() {
      if (!this.validate()) return;

      try {
        const config = { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } };
        
        if (this.editingFAQ) {
          await axios.put(`http://localhost:5205/api/FAQ/${this.editingFAQ.id}`, this.faqForm, config);
          this.showToast("تم تحديث السؤال بنجاح ✅");
        } else {
          await axios.post("http://localhost:5205/api/FAQ", this.faqForm, config);
          this.showToast("تم إضافة السؤال بنجاح ✅");
          this.currentPage = 1; // العودة للصفحة الأولى لمشاهدة الجديد
        }
        this.closeModal();
        this.fetchFAQs();
      } catch (err) {
        this.showToast("حدث خطأ أثناء الحفظ ❌", "error");
      }
    },

    confirmDelete(id) {
      this.idToDelete = id;
    },

    async deleteFAQ() {
      try {
        await axios.delete(`http://localhost:5205/api/FAQ/${this.idToDelete}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        this.faqs = this.faqs.filter(f => f.id !== this.idToDelete);
        this.idToDelete = null;
        this.showToast("تم الحذف بنجاح ✅");
        
        // تعديل الصفحة الحالية إذا أصبحت فارغة
        if (this.paginatedData.length === 0 && this.currentPage > 1) this.currentPage--;
      } catch (err) {
        this.showToast("حدث خطأ أثناء الحذف ❌", "error");
      }
    },

    closeModal() {
      this.openModal = false;
    },

    showToast(message, type = "success") {
      this.toastMessage = message;
      this.toastType = type;
      setTimeout(() => { this.toastMessage = ""; }, 3000);
    }
  },
  mounted() {
    this.fetchFAQs();
  },
};
</script>

<style scoped>
.input { @apply bg-gray-50 transition-all duration-200 border-gray-300; }
.truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>