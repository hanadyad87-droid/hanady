<template>
  <div class="flex min-h-screen bg-white" dir="rtl">
    <Sidebar class="fixed top-0 right-0 h-screen w-24 md:w-64 bg-primary text-white p-4 z-50" />
    <div class="flex-1 p-6 mr-24 md:mr-64">
      <Navbar />

      <!-- جدول الأسئلة الشائعة -->
      <div class="bg-white rounded-xl shadow-lg p-6 mb-6 max-w-6xl mx-auto">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold text-right text-primaryDark">إدارة الأسئلة الشائعة</h2>
          <button
            @click="openModalFunc()"
            class=" bg-primary hover:bg-primaryDark text-white px-6 py-2 rounded-xl font-semibold shadow-md transition"
          >
            إضافة سؤال
          </button>
        </div>

     <table class="min-w-full divide-y divide-gray-200 text-right">
            <thead class="bg-navbar">
            <tr class="text-right">
              <th class="px-3 py-2 font-medium text-gray-700">السؤال</th>
              <th class="px-3 py-2 font-medium text-gray-700">الإجابة</th>
              <th class="px-3 py-2 font-medium text-gray-700">التصنيف</th>
              <th class="px-3 py-2 font-medium text-gray-700">نشط</th>
              <th class="px-3 py-2 font-medium text-gray-700">إجراءات</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="faq in faqs" :key="faq.id" class="hover:bg-gray-50 transition">
              <td class="px-3 py-2">{{ faq.question }}</td>
              <td class="px-3 py-2 text-right">{{ faq.answer }}</td>
              <td class="px-3 py-2">{{ faq.category }}</td>
              <td class="px-3 py-2">
                <span :class="faq.isActive ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'">
                  {{ faq.isActive ? 'نعم' : 'لا' }}
                </span>
              </td>
             <td class="px-3 py-2 text-right">
  <div class="inline-flex gap-2">
    <button @click="viewFAQ(faq)" class="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300 text-xs">عرض</button>
    <button @click="editFAQ(faq)" class="bg-yellow-400 px-2 py-1 rounded hover:bg-yellow-500 text-xs">تعديل</button>
    <button @click="deleteFAQ(faq.id)" class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-xs">حذف</button>
  </div>
</td>

            </tr>
            <tr v-if="faqs.length === 0">
              <td colspan="5" class="text-center text-gray-400 py-4">لا توجد أسئلة حالياً</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal الإضافة / التعديل -->
      <div v-if="openModal" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div class="bg-white p-6 rounded-xl shadow-lg w-full max-w-lg">
          <h3 class="font-bold mb-4 text-lg text-right">{{ editingFAQ ? "تعديل السؤال" : "إضافة سؤال جديد" }}</h3>

          <div class="space-y-4">
            <input v-model="faqForm.question" type="text" placeholder="السؤال" class="w-full border p-2 rounded text-right" />
            <textarea v-model="faqForm.answer" placeholder="الإجابة" class="w-full border p-2 rounded text-right" rows="3"></textarea>
            <input v-model="faqForm.category" type="text" placeholder="التصنيف" class="w-full border p-2 rounded text-right" />
            <div class="flex items-center gap-2">
              <input type="checkbox" v-model="faqForm.isActive" id="activeCheckbox" />
              <label for="activeCheckbox">نشط</label>
            </div>
          </div>

          <div class="mt-6 flex justify-end gap-2">
            <button @click="saveFAQ" class=" bg-primary hover:bg-primaryDark text-white px-6 py-2 rounded-xl font-semibold shadow-md transition">حفظ</button>
            <button @click="closeModal" class=" bg-gray-300 hover:bg-gray-400 text-white px-6 py-2 rounded-xl font-semibold shadow-md transition">إلغاء</button>
          </div>
        </div>
      </div>

      <Toast v-if="toastMessage" :message="toastMessage" :type="toastType" />
    </div>
  </div>
</template>

<script>
import Sidebar from "@/components/Sidebar.vue";
import Navbar from "@/components/Navbar.vue";
import Toast from "@/components/Toast.vue";
import axios from "axios";

export default {
  name: "FAQManagement",
  components: { Sidebar, Navbar, Toast },
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
        console.error(err);
        this.showToast("حدث خطأ في جلب الأسئلة", "error");
      }
    },

    viewFAQ(faq) {
      this.showToast(`السؤال: ${faq.question}\nالإجابة: ${faq.answer}`, "info");
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
      // التحقق من أن الحقول ممتلئة
      if (!this.faqForm.question || !this.faqForm.answer || !this.faqForm.category) {
        this.showToast("يرجى تعبئة جميع الحقول قبل الحفظ ❌", "error");
        return;
      }

      try {
        if (this.editingFAQ) {
          // تعديل
          const res = await axios.put(
            `http://localhost:5205/api/FAQ/${this.editingFAQ.id}`,
            this.faqForm,
            { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
          );
          const index = this.faqs.findIndex(f => f.id === this.editingFAQ.id);
          this.faqs[index] = res.data.data;
          this.showToast("تم تعديل السؤال بنجاح ✅", "success");
        } else {
          // إضافة السؤال الجديد في البداية
          const res = await axios.post(
            "http://localhost:5205/api/FAQ",
            this.faqForm,
            { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
          );
          this.faqs.unshift(res.data.data); // أضف في بداية الجدول
          this.showToast("تم إضافة السؤال بنجاح ✅", "success");
        }
        this.closeModal();
      } catch (err) {
        console.error(err);
        this.showToast("حدث خطأ أثناء الحفظ ❌", "error");
      }
    },

    async deleteFAQ(id) {
      try {
        await axios.delete(`http://localhost:5205/api/FAQ/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        this.faqs = this.faqs.filter(f => f.id !== id);
        this.showToast("تم حذف السؤال بنجاح ✅", "success");
      } catch (err) {
        console.error(err);
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
.bg-background {
  background-color: #f3f4f6;
}
</style>
