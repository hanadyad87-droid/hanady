<template>
  <div class="flex min-h-screen bg-gray-100 font-cairo" dir="rtl">
    <!-- Sidebar -->
    <SidebarPage />

    <div class="flex-1 w-full min-w-0 p-4 sm:p-6 mr-0 lg:mr-60">
      <Navbar />

      <!-- البطاقة الرئيسية -->
      <div class="bg-white rounded-2xl shadow-lg p-8 mt-4 max-w-5xl mx-auto">
        
        <!-- رأس الصفحة -->
        <div class="mb-8 border-b pb-4">
          <h2 class="text-2xl font-bold text-gray-800">الأسئلة الشائعة</h2>
          <p class="text-gray-500 mt-2">كل ما تحتاج لمعرفته حول النظام والإجراءات في مكان واحد.</p>
        </div>

        <!-- قائمة FAQ (نمط الأكورديون المطور) -->
        <div v-if="faqs.length" class="space-y-4">
          <div
            v-for="faq in faqs"
            :key="faq.id"
            class="group border border-gray-100 rounded-2xl overflow-hidden transition-all duration-300"
            :class="opened.includes(faq.id) ? 'bg-gray-50 shadow-md ring-1 ring-primary/10' : 'bg-white hover:bg-gray-50 shadow-sm'"
          >
            <!-- رأس السؤال -->
            <button
              @click="toggle(faq.id)"
              class="flex justify-between items-center w-full p-5 text-right focus:outline-none"
            >
              <div class="flex items-center gap-4">
                <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm">
                  Q
                </span>
                <span class="font-bold text-gray-700 md:text-lg group-hover:text-primary transition-colors">
                  {{ faq.question }}
                </span>
              </div>
              
              <span class="bg-white p-1 rounded-full shadow-sm border border-gray-100">
                <svg
                  :class="{'rotate-180 text-primary': opened.includes(faq.id)}"
                  class="w-5 h-5 transform transition-transform duration-300 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"></path>
                </svg>
              </span>
            </button>

            <!-- محتوى الإجابة -->
            <transition name="fade">
              <div v-if="opened.includes(faq.id)" class="px-5 pb-5 mr-12">
                <div class="bg-white p-4 rounded-xl border border-gray-100 text-gray-600 leading-relaxed text-right">
                  <div class="flex items-start gap-3 mb-2">
                    <span class="text-green-500 font-bold italic">A:</span>
                    <p>{{ faq.answer }}</p>
                  </div>
                  
                  <div class="flex items-center gap-2 mt-4 pt-3 border-t border-gray-50">
                    <span class="text-xs font-medium text-gray-400">التصنيف:</span>
                    <span class="bg-blue-50 text-blue-600 px-3 py-0.5 rounded-full text-xs font-bold">
                      {{ faq.category }}
                    </span>
                  </div>
                </div>
              </div>
            </transition>
          </div>
        </div>

        <!-- حالة عدم وجود بيانات -->
        <div v-else class="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <div class="text-gray-300 mb-4">
            <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <p class="text-gray-500 font-medium">لا توجد أسئلة شائعة متاحة حالياً.</p>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import SidebarPage from "@/components/Sidebar.vue";
import Navbar from "@/components/Navbar.vue";
import axios from "axios";

export default {
  name: "KnowledgePage",
  components: { SidebarPage, Navbar },
  data() {
    return {
      faqs: [],
      opened: [] 
    };
  },
  methods: {
    toggle(id) {
      if (this.opened.includes(id)) {
        this.opened = this.opened.filter(i => i !== id);
      } else {
        this.opened = [id]; // جعل سؤال واحد فقط يفتح في المرة الواحدة (اختياري)
        // إذا أردت فتح أكثر من سؤال استبدلها بـ: this.opened.push(id);
      }
    },
    async fetchFAQs() {
      try {
        const res = await axios.get("http://localhost:5205/api/FAQ", {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token")
          }
        });
        this.faqs = res.data;
      } catch (err) {
        console.error("خطأ عند جلب الأسئلة:", err);
      }
    }
  },
  mounted() {
    this.fetchFAQs();
  }
};
</script>

<style scoped>
/* انيميشن بسيط لظهور الإجابة */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>