<template>
  <div class="flex min-h-screen bg-gray-100" dir="rtl" style="font-family: 'Cairo', sans-serif;">

    <!-- Sidebar -->
    <SidebarPage class="fixed top-0 right-0 h-screen w-24 md:w-64 z-50"/>

    <div class="flex-1 p-6 mr-24 md:mr-64">

      <Navbar/>

      <div class="card p-6 bg-white rounded-xl shadow-lg mt-4">

        <h3 class="text-xl font-bold text-bg-primary mb-4 text-right">
          المهام الخاصة بي
        </h3>

        <!-- جدول المهام -->
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 text-right">
           <thead class="bg-navbar">
  <tr>
    <th class="px-4 py-2 text-sm font-medium">المهمة</th>
    <th class="px-4 py-2 text-sm font-medium">المدير</th>
    <th class="px-4 py-2 text-sm font-medium">البداية</th>
    <th class="px-4 py-2 text-sm font-medium">النهاية</th>
    <th class="px-4 py-2 text-sm font-medium">الحالة</th>
    <th class="px-4 py-2 text-sm font-medium">الإجراءات</th>
    <th class="px-4 py-2 text-sm font-medium">قرار المدير</th>
  </tr>
</thead>

<tbody class="divide-y divide-gray-200">
  <tr v-for="task in tasks" :key="task.id" class="hover:bg-gray-50">
    <td class="px-4 py-2 text-sm whitespace-pre-wrap">{{task.title}}</td>
    <td class="px-4 py-2 text-sm">{{task.manager}}</td>
    <td class="px-4 py-2 text-sm">{{ task.startDate.split('T')[0] }}</td>
    <td class="px-4 py-2 text-sm">{{ task.endDate.split('T')[0] }}</td>
    <td class="px-4 py-2">
      <select v-model="task.status" @change="updateStatus(task)" class="border rounded p-1 text-sm">
        <option value="جديدة">جديدة</option>
        <option value="قيد التنفيذ">قيد التنفيذ</option>
        <option value="مكتملة">مكتملة</option>
      </select>
    </td>
    <td class="px-4 py-2 flex gap-2 items-center text-sm">
      <button @click="showTaskDetails(task)" class="text-gray-600 hover:text-gray-900">
        <EyeIcon class="w-5 h-5"/>
      </button>
      <button @click="showComments(task)" class="text-gray-600 hover:text-gray-900">
        <ChatBubbleLeftRightIcon class="w-5 h-5"/>
      </button>
    </td>
    <td class="px-4 py-2 text-sm"
        :class="{
          'text-green-600': task.managerDecision==='موافق',
          'text-red-600': task.managerDecision==='مرفوض',
          'text-gray-500': task.managerDecision==='لم يقرر'
        }">
      {{ task.managerDecision || 'لم يقرر' }}
    </td>
  </tr>
</tbody>
          </table>
        </div>
      </div>
    </div>

 <!-- مودال تفاصيل المهمة -->
<div v-if="showDetailModal && showType==='details'"
     class="fixed inset-0 bg-black/40 flex items-start justify-center z-50 p-4 pt-10 overflow-y-auto">
  <div class="bg-white p-6 rounded-xl w-full max-w-md shadow-lg space-y-4 max-h-[85vh] overflow-y-auto">
    <h2 class="text-lg font-bold text-green-900 flex justify-between items-center">
      <span>تفاصيل المهمة</span>
      <button @click="closeModal" class="text-gray-600 hover:text-gray-900 font-bold text-xl">&times;</button>
    </h2>

    <div v-if="detailTask">
      <p><strong>المهمة:</strong> {{detailTask.title}}</p>

      <!-- الوصف القابل للتمدد -->
     <div class="whitespace-pre-wrap overflow-auto p-2 border rounded-lg bg-gray-50 text-base leading-relaxed">
  <strong>الوصف:</strong>
  <p>{{detailTask.description}}</p>
</div>

      <p><strong>المدير:</strong> {{detailTask.manager}}</p>
      <p><strong>القسم:</strong> {{detailTask.section}}</p>

      <p v-if="detailTask.attachmentPath">
        <strong>المرفق:</strong>
        <a :href="'http://localhost:5205/' + detailTask.attachmentPath" target="_blank" class="text-blue-600 underline">
          عرض الملف
        </a>
      </p>
    </div>
  </div>
</div>

    <!-- مودال التعليقات -->
   <!-- مودال التعليقات مصغر الخط -->
<div v-if="showDetailModal && showType==='comments'"
     class="fixed inset-0 bg-black/40 flex items-start justify-center z-50 p-4 pt-10 overflow-y-auto">
  <div class="bg-white p-4 rounded-xl w-full max-w-md shadow-lg space-y-3 max-h-[85vh] overflow-y-auto">

    <h2 class="text-base font-bold text-green-900 flex justify-between items-center">
      <span>التعليقات</span>
      <button @click="closeModal" class="text-gray-600 hover:text-gray-900 font-bold text-lg">&times;</button>
    </h2>

    <ul>
      <li v-for="c in comments" :key="c.id" class="mb-1 p-1.5 rounded-lg bg-gray-100 break-words text-sm">
        <strong>{{ c.employeeName || 'مجهول' }}:</strong>
        <span>{{ c.comment }}</span>
        <a v-if="c.attachmentUrl" :href="c.attachmentUrl" target="_blank" class="text-blue-500 underline ml-1 text-sm">
          مرفق
        </a>
      </li>
    </ul>

    <div class="mt-2 flex flex-col gap-1.5">
      <textarea
        v-model="newComment"
        placeholder="اكتب تعليقك هنا..."
        class="input w-full resize-none overflow-hidden min-h-[50px] text-sm"
        rows="2"
        @input="autoResize($event)"
      ></textarea>
      <div class="flex gap-1.5">
        <input type="file" @change="onCommentFileChange" class="h-8 text-sm"/>
        <button @click="sendComment" class="bg-primary text-white px-3 py-1.5 rounded-lg text-sm">
          إرسال
        </button>
      </div>
    </div>
  </div>
</div>

    <!-- Toast -->
    <transition name="fade">
      <div v-if="toastMessage"
           class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                  px-6 py-3 rounded-lg shadow-lg text-white text-center z-[999]"
           :class="toastType==='success'?'bg-green-600':'bg-red-600'">
        {{toastMessage}}
      </div>
    </transition>
  </div>
</template>

<script>
import {ref,onMounted} from "vue"
import axios from "axios"
import SidebarPage from "../components/Sidebar.vue"
import Navbar from "../components/Navbar.vue"
import { EyeIcon, ChatBubbleLeftRightIcon } from "@heroicons/vue/24/outline"

export default {
components:{SidebarPage,Navbar,EyeIcon,ChatBubbleLeftRightIcon},
setup(){
  const tasks = ref([])
  const comments = ref([])
  const showDetailModal = ref(false)
  const detailTask = ref(null)
  const newComment = ref("")
  const attachment = ref(null)
  const toastMessage = ref("")
  const toastType = ref("success")
  const showType = ref('details') // "details" أو "comments"

  axios.defaults.baseURL = "http://localhost:5205/api"
  axios.defaults.headers.common["Authorization"] = `Bearer ${localStorage.getItem("token")}`

  const showToast = (msg,type="success")=>{
    toastMessage.value = msg
    toastType.value = type
    setTimeout(()=>toastMessage.value="",3000)
  }

  const fetchTasks = async () => {
    try {
      const res = await axios.get("/Task/my-tasks")
      tasks.value = res.data.map(t => ({
        ...t,
        status: t.status==='New'?'جديدة': t.status==='InProgress'?'قيد التنفيذ':'مكتملة',
        managerDecision: t.managerDecision === 'Approved' ? 'موافق' :
                         t.managerDecision === 'Rejected' ? 'مرفوض' : 'لم يقرر',
        commentsCount: t.commentsCount || 0
      }))
    } catch {
      showToast("فشل تحميل المهام","error")
    }
  }

  const updateStatus = async(task)=>{
    try{
      const backendStatus = task.status==='جديدة'?'New': task.status==='قيد التنفيذ'?'InProgress':'Completed'
      await axios.put(`/Task/update-status/${task.id}?status=${backendStatus}`)
      showToast("تم تحديث الحالة")
    }catch{
      showToast("فشل تحديث الحالة","error")
    }
  }

  const showTaskDetails = (task)=>{
    detailTask.value = task
    showType.value = 'details'
    showDetailModal.value = true
  }

  const showComments = async(task)=>{
    detailTask.value = task
    showType.value = 'comments'
    showDetailModal.value = true
    try{
      const res = await axios.get(`/Task/${task.id}/comments`)
      comments.value = res.data
    }catch{
      showToast("فشل تحميل التعليقات","error")
    }
  }

  const sendComment = async()=>{
    try{
      const data = new FormData()
      data.append("Comment",newComment.value)
      if(attachment.value) data.append("Attachment",attachment.value)
      await axios.post(`/Task/${detailTask.value.id}/comment`,data)
      newComment.value=""
      attachment.value=null
      showComments(detailTask.value)
      showToast("تم إضافة التعليق")
    }catch{
      showToast("فشل إضافة التعليق","error")
    }
  }

  const onCommentFileChange = (e)=>{
    attachment.value = e.target.files[0]
  }

  const autoResize = (e)=>{
    e.target.style.height = "auto"
    e.target.style.height = e.target.scrollHeight + "px"
  }

  const closeModal = ()=>{
    showDetailModal.value = false
    detailTask.value = null
    comments.value = []
  }

  onMounted(()=>{ fetchTasks() })

  return {
    tasks, showDetailModal, detailTask, comments, newComment,
    showTaskDetails, updateStatus, showComments, sendComment,
    onCommentFileChange, autoResize, toastMessage, toastType, showType, closeModal
  }
}
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap');

/* تطبيق خط Cairo وحجم خط أصغر على كل الصفحة */
body, input, textarea, select, button {
  font-family: 'Cairo', sans-serif;
  font-size: 12px; /* حجم الخط المصغر */
}

/* ستايل موحد لكل input */
.input {
  @apply p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right;
  font-size: 14px; /* نفس الحجم المصغر */
}

/* تأثيرات fade */
.fade-enter-active,
.fade-leave-active { transition: opacity .3s }
.fade-enter-from,
.fade-leave-to { opacity: 0 }
</style>