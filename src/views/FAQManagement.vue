<template>
  <div class="flex min-h-screen bg-gray-100 font-cairo" dir="rtl">
    <!-- Sidebar -->
    <SidebarPage class="fixed top-0 right-0 h-screen w-24 md:w-64 z-50" />

    <!-- المحتوى الرئيسي -->
    <div class="flex-1 p-6 mr-24 md:mr-64">
      <Navbar />

      <!-- البطاقة الرئيسية -->
      <div class="bg-white rounded-2xl shadow-lg p-6 mt-4">
        
        <!-- الرأس (العنوان والزر) -->
        <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 class="text-xl font-bold text-gray-800">إدارة الأسئلة الشائعة</h2>
          <button
            @click="openModalFunc()"
            class="bg-primary hover:bg-green-700 text-white px-6 py-2 rounded-xl shadow transition-all font-bold"
          >
            + إضافة سؤال جديد
          </button>
        </div>

        <!-- الجدول بنمط احترافي -->
        <div class="overflow-x-auto rounded-lg border border-gray-200">
          <table class="min-w-full text-right divide-y divide-gray-200">
            <thead class="bg-navbar">
              <tr>
                <th class="p-4 text-sm font-semibold text-gray-600">السؤال</th>
                <th class="p-4 text-sm font-semibold text-gray-600">الإجابة</th>
                <th class="p-4 text-sm font-semibold text-gray-600">التصنيف</th>
                <th class="p-4 text-sm font-semibold text-gray-600">الحالة</th>
                <th class="p-4 text-sm font-semibold text-gray-600">إجراءات</th>
              </tr>
            </thead>

            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="faq in faqs" :key="faq.id" class="hover:bg-gray-50 transition">
                <td class="p-4 text-sm font-bold text-gray-700 truncate max-w-xs">{{ faq.question }}</td>
                <td class="p-4 text-sm text-gray-500 truncate max-w-xs">{{ faq.answer }}</td>
                <td class="p-4 text-sm">
                  <span class="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs">
                    {{ faq.category }}
                  </span>
                </td>
                <td class="p-4 text-sm">
                  <span :class="faq.isActive ? 'text-green-600' : 'text-red-600'" class="font-bold">
                    {{ faq.isActive ? 'نشط' : 'غير نشط' }}
                  </span>
                </td>

                <!-- عمود الإجراءات -->
                <td class="p-4 text-sm">
                  <div class="flex gap-3">
                    <button @click="editFAQ(faq)" title="تعديل" class="text-blue-600 hover:scale-110 transition">✏️</button>
                    <button @click="deleteFAQ(faq.id)" title="حذف" class="text-red-600 hover:scale-110 transition">🗑️</button>
                  </div>
                </td>
              </tr>

              <!-- حالة عدم وجود بيانات -->
              <tr v-if="faqs.length === 0">
                <td colspan="5" class="text-center py-10 text-gray-400 italic">
                  لا توجد أسئلة حالياً
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- مودال الإضافة والتعديل -->
    <div v-if="openModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div class="flex justify-between items-center mb-4 border-b pb-2">
          <h3 class="font-bold text-xl text-gray-800">
            {{ editingFAQ ? "تعديل السؤال" : "إضافة سؤال جديد" }}
          </h3>
          <button @click="closeModal" class="text-gray-400 hover:text-red-500 transition text-2xl">&times;</button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1 text-gray-700">السؤال</label>
            <input v-model="faqForm.question" type="text" class="input w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1 text-gray-700">الإجابة</label>
            <textarea v-model="faqForm.answer" class="input w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" rows="3"></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1 text-gray-700">التصنيف</label>
            <input v-model="faqForm.category" type="text" class="input w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
          </div>

          <div class="flex items-center gap-3 bg-gray-50 p-2 rounded-lg">
            <input type="checkbox" v-model="faqForm.isActive" id="activeCheckbox" class="w-4 h-4 accent-primary" />
            <label for="activeCheckbox" class="text-sm font-medium text-gray-700 cursor-pointer">تفعيل السؤال (نشط)</label>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-8">
          <button @click="closeModal" class="bg-gray-200 px-5 py-2 rounded-lg font-medium hover:bg-gray-300 transition">إلغاء</button>
          <button @click="saveFAQ" class="bg-primary text-white px-8 py-2 rounded-lg font-bold hover:shadow-lg transition">
            {{ editingFAQ ? 'تحديث' : 'حفظ' }}
          </button>
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

export default {
  name: "FAQManagement",
  components: { SidebarPage, Navbar, Toast },
  data() {
    return {
      faqs: [],
      openModal: false,
      editingFAQ: null,
      faqForm: { question: "", answer: "", category: "", isActive: true },
      toastMessage: "",
      toastType: "success",
    };
  },
  methods: {
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
      this.openModal = true;
    },

    editFAQ(faq) {
      this.editingFAQ = faq;
      this.faqForm = { ...faq };
      this.openModal = true;
    },

    async saveFAQ() {
      if (!this.faqForm.question || !this.faqForm.answer || !this.faqForm.category) {
        this.showToast("يرجى تعبئة جميع الحقول ❌", "error");
        return;
      }

      try {
        if (this.editingFAQ) {
          const res = await axios.put(
            `http://localhost:5205/api/FAQ/${this.editingFAQ.id}`,
            this.faqForm,
            { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
          );
          // تحديث القائمة محلياً
          const index = this.faqs.findIndex(f => f.id === this.editingFAQ.id);
          this.faqs[index] = res.data.data || res.data; // تعديل حسب بنية الـ API لديك
          this.showToast("تم تعديل السؤال بنجاح ✅");
        } else {
          const res = await axios.post(
            "http://localhost:5205/api/FAQ",
            this.faqForm,
            { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
          );
          this.faqs.unshift(res.data.data || res.data);
          this.showToast("تم إضافة السؤال بنجاح ✅");
        }
        this.closeModal();
        this.fetchFAQs(); // لضمان مزامنة البيانات
      } catch (err) {
        this.showToast("حدث خطأ أثناء الحفظ ❌", "error");
      }
    },

    async deleteFAQ(id) {
      if (!confirm("هل أنت متأكد من حذف هذا السؤال؟")) return;
      try {
        await axios.delete(`http://localhost:5205/api/FAQ/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        this.faqs = this.faqs.filter(f => f.id !== id);
        this.showToast("تم حذف السؤال بنجاح ✅");
      } catch (err) {
        this.showToast("حدث خطأ أثناء الحذف ❌", "error");
      }
    },

    closeModal() {
      this.openModal = false;
      this.editingFAQ = null;
      this.faqForm = { question: "", answer: "", category: "", isActive: true };
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
.input { @apply bg-gray-50; }
/* تحسين شكل النصوص الطويلة في الجدول */
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>