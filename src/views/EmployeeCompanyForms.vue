<template>
  <div class="flex min-h-screen bg-gray-100 font-cairo" dir="rtl">
    <!-- Sidebar -->
    <SidebarPage />

    <!-- المحتوى الرئيسي -->
    <div class="flex-1 w-full min-w-0 p-4 sm:p-6 mr-0 lg:mr-60">
      <Navbar/>

      <!-- البطاقة الرئيسية -->
      <div class="bg-white rounded-2xl shadow-lg p-6 mt-4">
        
        <!-- الرأس (العنوان) -->
        <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 class="text-xl font-bold text-gray-800">النماذج </h2>
          <!-- يمكن إضافة زر هنا إذا كان هناك رفع نماذج مستقبلاً -->
        </div>

      
        <div class="mb-4">
          <input
            v-model="search"
            @input="searchForms"
            placeholder="ابحث عن نموذج (بالاسم أو المحتوى)..."
            class="input w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
          />
        </div>

        <!-- الجدول -->
        <div class="overflow-x-auto rounded-lg border border-gray-200">
          <table class="min-w-full text-right divide-y divide-gray-200">
            <thead class="bg-navbar">
              <tr>
                <th class="p-4 text-sm font-semibold text-gray-600">العنوان</th>
                <th class="p-4 text-sm font-semibold text-gray-600">تاريخ الرفع</th>
                <th class="p-4 text-sm font-semibold text-gray-600">رفع بواسطة</th>
                <th class="p-4 text-sm font-semibold text-gray-600">إجراءات</th>
              </tr>
            </thead>

            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="form in forms" :key="form.id" class="hover:bg-gray-50 transition">
                <td class="p-4 text-sm font-bold text-gray-700">{{ form.title }}</td>
                <td class="p-4 text-sm text-gray-500">{{ formatDate(form.uploadedAt) }}</td>
                <td class="p-4 text-sm">
                  <span class="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs">
                    {{ form.uploadedBy }}
                  </span>
                </td>

                <!-- عمود الإجراءات -->
                <td class="p-4 text-sm flex gap-4">
                  <!-- عرض الوصف -->
                 

                  <!-- تحميل الملف -->
                  <a
                    :href="form.fileUrl"
                    target="_blank"
                    title="تحميل الملف"
                    class="text-green-600 hover:scale-110 transition-transform">
                    <ArrowDownTrayIcon class="w-5 h-5"/>
                  </a>
                </td>
              </tr>

              <!-- حالة عدم وجود بيانات -->
              <tr v-if="forms.length === 0">
                <td colspan="4" class="text-center py-10 text-gray-400 italic">
                  لا توجد نماذج متاحة حالياً
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

  

    <!-- التنبيهات -->
    <ToastPage
      v-if="showToast"
      :message="toastMessage"
      :type="toastType"
    />
  </div>
</template>

<script>
import axios from "axios"
import { ref, onMounted } from "vue"
import SidebarPage from "../components/Sidebar.vue"
import Navbar from "../components/Navbar.vue"
import ToastPage from "@/components/Toast.vue"
import {  ArrowDownTrayIcon } from "@heroicons/vue/24/outline"

export default {
  components: { SidebarPage, Navbar, ToastPage,  ArrowDownTrayIcon },

  setup() {
    const forms = ref([])
    const search = ref("")
    const showModal = ref(false)
    const selectedForm = ref({ title: '', description: '' })

    const toastMessage = ref("")
    const toastType = ref("success")
    const showToast = ref(false)

    // إعدادات Axios
    axios.defaults.baseURL = "http://localhost:5205/api"
    axios.defaults.headers.common["Authorization"] = `Bearer ${localStorage.getItem("token")}`

    const triggerToast = (msg, type = "success") => {
      toastMessage.value = msg
      toastType.value = type
      showToast.value = true
      setTimeout(() => { showToast.value = false }, 3000)
    }

    const fetchForms = async () => {
      try {
        const res = await axios.get("/company-forms/all")
        forms.value = res.data
      } catch {
        triggerToast("فشل تحميل النماذج", "error")
      }
    }

    const searchForms = async () => {
      try {
        const res = await axios.get("/company-forms/all", { params: { searchTerm: search.value } })
        forms.value = res.data
      } catch {
        triggerToast("خطأ في البحث", "error")
      }
    }

    const formatDate = (dateStr) => { 
      if (!dateStr) return '---'; 
      return dateStr.split("T")[0] 
    }

    const viewForm = (form) => {
      selectedForm.value = form
      showModal.value = true
    }

    onMounted(() => { fetchForms() })

    return { 
      forms, search, searchForms, formatDate, 
      showModal, selectedForm, viewForm, 
      toastMessage, toastType, showToast 
    }
  }
}
</script>

<style scoped>
/* نفس لمسة التصميم في صفحة المؤهلات */
.input { @apply bg-gray-50; }
</style>