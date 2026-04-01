<template>
  <div class="flex min-h-screen bg-white font-cairo" dir="rtl">

    <!-- Sidebar -->
    <SidebarPage class="fixed top-0 right-0 h-screen w-24 md:w-64 z-50"/>

    <!-- المحتوى -->
    <div class="flex-1 p-6 mr-24 md:mr-64">

      <Navbar/>

      <div class="card p-6 bg-white rounded-xl shadow-lg mt-4">

        <h3 class="text-xl font-bold text-bg-primary mb-4 text-right">
          النماذج
        </h3>

        <!-- البحث -->
        <div class="flex justify-between items-center mb-4 flex-wrap gap-2">
          <input
            v-model="search"
            @input="searchForms"
            placeholder="ابحث عن نموذج..."
            class="input w-full md:w-72 text-sm"/>
        </div>

        <!-- جدول النماذج -->
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 text-right">
            <thead class="bg-navbar">
              <tr>
                <th class="px-4 py-2 text-sm">العنوان</th>
                <th class="px-4 py-2 text-sm">تاريخ الرفع</th>
                <th class="px-4 py-2 text-sm">رفع بواسطة</th>
                <th class="px-4 py-2 text-sm">إجراءات</th>
              </tr>
            </thead>

            <tbody class="divide-y divide-gray-200">
              <tr v-for="form in forms" :key="form.id" class="hover:bg-gray-50">

                <td class="px-4 py-2 font-semibold">{{form.title}}</td>
                <td class="px-4 py-2">{{formatDate(form.uploadedAt)}}</td>
                <td class="px-4 py-2">{{form.uploadedBy}}</td>

                <!-- عمود الإجراءات -->
                <td class="px-4 py-2 flex gap-2">
                  <!-- أيقونة عرض الوصف -->
                 <button
    @click="viewForm(form)"
    class="text-blue-600 hover:text-blue-800">

    <EyeIcon class="w-5 h-5"/>

  </button>

                  <!-- أيقونة تحميل -->
                  <!-- Download -->
  <a
    :href="form.fileUrl"
    target="_blank"
    class="text-green-600 hover:text-green-800">

    <ArrowDownTrayIcon class="w-5 h-5"/>

  </a>
                </td>

              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="forms.length === 0"
             class="text-center text-gray-500 mt-6">
          لا توجد نماذج متاحة حالياً
        </div>
      </div>

      <!-- مودال عرض وصف النموذج -->
    <div v-if="showModal"
     class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
  <div class="bg-white rounded-xl shadow-lg max-w-md w-full p-4 max-h-[80vh] overflow-auto">
    
    <!-- رأس المودال -->
    <div class="flex justify-between items-center mb-2">
      <h2 class="font-bold text-lg">{{ selectedForm.title }}</h2>
      <button @click="showModal=false" class="text-gray-600 hover:text-gray-900 text-xl">&times;</button>
    </div>

   <!-- الوصف -->
<div class="bg-gray-100 p-2 rounded-lg text-sm overflow-y-auto break-words whitespace-pre-wrap"
     style="max-height: calc(1.25rem * 3 + 0.5rem); line-height: 1.25rem;">
  {{ selectedForm.description }}
</div>

  </div>
</div>

    </div>

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
import { EyeIcon, ArrowDownTrayIcon,  } from "@heroicons/vue/24/outline"
export default {
  components:{ SidebarPage, Navbar, ToastPage,EyeIcon, ArrowDownTrayIcon},

  setup(){

    const forms = ref([])
    const search = ref("")
    const showModal = ref(false)
    const selectedForm = ref({ title: '', description: '' })

    const toastMessage = ref("")
    const toastType = ref("success")
    const showToast = ref(false)

    axios.defaults.baseURL = "http://localhost:5205/api"
    axios.defaults.headers.common["Authorization"] =
      `Bearer ${localStorage.getItem("token")}`

    const triggerToast = (msg,type="success")=>{
      toastMessage.value=msg
      toastType.value=type
      showToast.value=true
      setTimeout(()=>{ showToast.value=false },3000)
    }

    const fetchForms = async () => {
      try{
        const res = await axios.get("/company-forms/all")
        forms.value = res.data
      }catch{
        triggerToast("فشل تحميل النماذج","error")
      }
    }

    const searchForms = async () => {
      try{
        const res = await axios.get("/company-forms/all",{ params:{ searchTerm: search.value } })
        forms.value = res.data
      }catch{
        triggerToast("خطأ في البحث","error")
      }
    }

    const formatDate = (dateStr) => { if(!dateStr) return ''; return dateStr.split("T")[0] }

    const viewForm = (form) => {
      selectedForm.value = form
      showModal.value = true
    }

    onMounted(()=>{ fetchForms() })

    return { forms, search, searchForms, formatDate, showModal, selectedForm, viewForm, toastMessage, toastType, showToast }
  }
}
</script>