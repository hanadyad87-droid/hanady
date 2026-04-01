<template>
  <div class="flex min-h-screen bg-white font-cairo" dir="rtl">

    <SidebarPage class="fixed top-0 right-0 h-screen w-24 md:w-64 z-50"/>

    <div class="flex-1 p-6 mr-24 md:mr-64">

      <Navbar/>

      <div class="card p-6 bg-white rounded-xl shadow-lg mt-4">

        <h3 class="text-xl font-bold text-bg-primary mb-4 text-right">
        النماذج
        </h3>

        <div class="flex justify-end mb-4">
          <button
            @click="showUploadModal=true"
            class="bg-primary hover:bg-green-700 text-white px-4 py-2 rounded-xl font-semibold shadow-md">
            رفع نموذج جديد
          </button>
        </div>

        <!-- الجدول -->
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 text-right">

            <thead class="bg-navbar">
              <tr>
                <th class="px-4 py-2 text-sm">العنوان</th>
                <th class="px-4 py-2 text-sm">التاريخ</th>
                <th class="px-4 py-2 text-sm">رفع بواسطة</th>
                <th class="px-4 py-2 text-sm">الإجراءات</th>
              </tr>
            </thead>

            <tbody class="divide-y divide-gray-200">

              <tr v-for="form in forms" :key="form.id" class="hover:bg-gray-50">

                <td class="px-4 py-2">{{form.title}}</td>

                <td class="px-4 py-2">
                  {{formatDate(form.uploadedAt)}}
                </td>

                <td class="px-4 py-2">
                  {{form.uploadedBy}}
                </td>

                <!-- الاجراءات -->
               <td class="px-4 py-2 flex gap-3 justify-start">

  <!-- View -->
  <button
    @click="viewForm(form)"
    class="text-blue-600 hover:text-blue-800">

    <EyeIcon class="w-5 h-5"/>

  </button>

  <!-- Download -->
  <a
    :href="form.fileUrl"
    target="_blank"
    class="text-green-600 hover:text-green-800">

    <ArrowDownTrayIcon class="w-5 h-5"/>

  </a>

  <!-- Delete -->
  <button
    @click="askDelete(form.id)"
    class="text-red-600 hover:text-red-800">

    <TrashIcon class="w-5 h-5"/>

  </button>

</td>

              </tr>

            </tbody>
          </table>
        </div>

      </div>

    </div>

    <!-- ================= modal view ================= -->

    <div v-if="showViewModal"
         class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div class="bg-white rounded-xl p-6 w-full max-w-lg shadow-lg space-y-4">

        <h3 class="font-bold text-lg">وصف النموذج</h3>

       <div class="bg-gray-100 p-3 rounded-lg max-h-60 overflow-y-auto break-words whitespace-pre-line text-right leading-relaxed">
  {{ selectedDescription }}
</div>

        <div class="flex justify-end">
          <button
            @click="showViewModal=false"
            class="bg-gray-300 px-4 py-2 rounded-lg">
            إغلاق
          </button>
        </div>

      </div>

    </div>

    <!-- ================= Modal رفع نموذج ================= -->

    <div v-if="showUploadModal"
         class="fixed inset-0 bg-black/40 flex items-start justify-center z-50 p-2 pt-6 overflow-y-auto">

      <div class="bg-white p-4 rounded-lg w-full max-w-lg shadow-lg space-y-3">

        <h2 class="text-base font-bold text-green-900 flex justify-between items-center">
          <span>رفع نموذج جديد</span>

          <button
            @click="showUploadModal=false"
            class="text-gray-600 hover:text-gray-900 font-bold text-lg">
            &times;
          </button>
        </h2>

        <div>
          <label class="text-xs">عنوان النموذج</label>
          <input v-model="form.title" type="text" class="input text-sm"/>
        </div>

        <div>
          <label class="text-xs">الوصف</label>
          <textarea v-model="form.description"
                    rows="3"
                    class="input text-sm"></textarea>
        </div>

        <div>
          <label class="text-xs">ملف النموذج</label>
          <input type="file" @change="onFileChange" class="input text-sm"/>
        </div>

        <div class="flex justify-end gap-2">

          <button
            @click="uploadForm"
            class="bg-primary text-white px-4 py-2 rounded-lg text-sm">
            رفع
          </button>

          <button
            @click="showUploadModal=false"
            class="bg-gray-300 px-4 py-2 rounded-lg text-sm">
            إلغاء
          </button>

        </div>

      </div>

    </div>

    <!-- toast -->

    <ToastPage
      v-if="showToast"
      :message="toastMessage"
      :type="toastType"
      :onConfirm="toastConfirm"
    />

  </div>
</template>

<script>

import axios from "axios"
import { ref, onMounted } from "vue"
import SidebarPage from "../components/Sidebar.vue"
import Navbar from "../components/Navbar.vue"
import ToastPage from "@/components/Toast.vue"
import { EyeIcon, ArrowDownTrayIcon, TrashIcon } from "@heroicons/vue/24/outline"
export default {

components:{
  SidebarPage,
  Navbar,
  ToastPage,
  EyeIcon,
  ArrowDownTrayIcon,
  TrashIcon
},

setup(){

const forms = ref([])
const showUploadModal = ref(false)

const showViewModal = ref(false)
const selectedDescription = ref("")

const toastMessage = ref("")
const toastType = ref("success")
const showToast = ref(false)
const toastConfirm = ref(null)

const form = ref({
title:"",
description:"",
file:null
})

axios.defaults.baseURL="http://localhost:5205/api"
axios.defaults.headers.common["Authorization"]=`Bearer ${localStorage.getItem("token")}`

const triggerToast=(msg,type="success",confirm=null)=>{
toastMessage.value=msg
toastType.value=type
toastConfirm.value=confirm
showToast.value=true
}

const fetchForms=async()=>{
const res=await axios.get("/company-forms/all")
forms.value=res.data
}

const viewForm=(formData)=>{
selectedDescription.value=formData.description || "لا يوجد وصف"
showViewModal.value=true
}

const onFileChange=(e)=>{
form.value.file=e.target.files[0]
}

const uploadForm=async()=>{

try{

const data=new FormData()

data.append("Title",form.value.title)
data.append("Description",form.value.description)

if(form.value.file)
data.append("Attachment",form.value.file)

await axios.post("/company-forms/upload",data)

triggerToast("تم رفع النموذج بنجاح")

showUploadModal.value=false
fetchForms()

form.value.title=""
form.value.description=""
form.value.file=null

}catch{

triggerToast("فشل رفع النموذج","error")

}

}

const askDelete=(id)=>{
triggerToast("هل تريد حذف النموذج؟","info",()=>deleteForm(id))
}

const deleteForm=async(id)=>{

try{

await axios.delete(`/company-forms/${id}`)

triggerToast("تم حذف النموذج")

fetchForms()

}catch{

triggerToast("فشل حذف النموذج","error")

}

}

const formatDate=(dateStr)=>{
if(!dateStr) return ''
return dateStr.split("T")[0]
}

onMounted(()=>{
fetchForms()
})

return{
forms,
form,
showUploadModal,
showViewModal,
selectedDescription,
viewForm,
uploadForm,
deleteForm,
askDelete,
onFileChange,
formatDate,
toastMessage,
toastType,
showToast,
toastConfirm
}

}

}
</script>

<style scoped>

@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');

.font-cairo{
font-family:'Cairo',sans-serif;
}

.input{
@apply p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right;
}

</style>