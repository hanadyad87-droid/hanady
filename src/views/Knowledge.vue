<template>
  <div class="flex min-h-screen bg-white" dir="rtl">
    <!-- الشريط الجانبي -->
    <Sidebar class="fixed top-0 right-0 h-screen w-24 md:w-64 bg-primary text-white p-4 z-50" />

    <div class="flex-1 p-6 mr-24 md:mr-64">
      <Navbar />

      <!-- محتوى المعرفة -->
      <div class="bg-white rounded-xl shadow p-6 max-w-4xl mx-auto">
        <h2 class="text-2xl font-bold mb-2 text-right">الاسئلة الشائعة </h2>
       

        <!-- قائمة FAQ -->
        <div v-if="faqs.length" class="space-y-4">
          <div
            v-for="faq in faqs"
            :key="faq.id"
            class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
          >
            <button
              @click="toggle(faq.id)"
              class="flex justify-between w-full text-right font-semibold text-lg focus:outline-none"
            >
              {{ faq.question }}
              <span>
                <svg
                  :class="{'rotate-180': opened.includes(faq.id)}"
                  class="w-5 h-5 transform transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 9l-7 7-7-7"></path>
                </svg>
              </span>
            </button>
            <div v-if="opened.includes(faq.id)" class="mt-2 text-gray-700 text-right">
              {{ faq.answer }}
              <p class="mt-1 text-sm text-gray-400">التصنيف: {{ faq.category }}</p>
            </div>
          </div>
        </div>

        <p v-else class="text-gray-500 text-center mt-6">لا توجد أسئلة حالياً.</p>
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from "@/components/Sidebar.vue";
import Navbar from "@/components/Navbar.vue";
import axios from "axios";

export default {
  name: "KnowledgePage",
  components: { Sidebar, Navbar },
  data() {
    return {
      faqs: [],
      opened: [] // لتتبع الأسئلة المفتوحة
    };
  },
  methods: {
    toggle(id) {
      if (this.opened.includes(id)) {
        this.opened = this.opened.filter(i => i !== id);
      } else {
        this.opened.push(id);
      }
    },
    async fetchFAQs() {
      try {
        const res = await axios.get("http://localhost:5205/api/FAQ", {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token") // أو حسب طريقة حفظك للتوكن
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
.bg-background {
  background-color: #f3f4f6;
}
</style>
