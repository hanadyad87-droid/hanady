<template>
  <div class="flex min-h-screen bg-gray-100 font-cairo" dir="rtl">

    <!-- Sidebar -->
    <SidebarPage class="fixed top-0 right-0 h-screen w-24 md:w-64 z-50"/>

    <!-- المحتوى -->
    <div class="flex-1 p-6 mr-24 md:mr-64">

      <Navbar/>

      <div class="card p-6 bg-white rounded-xl shadow-lg mt-4">

        <h3 class="text-xl font-bold text-bg-primary mb-4 text-right">
          التكليفات الخاصة بي
        </h3>

        <!-- زر إنشاء تكليف -->
        <div class="flex justify-end mb-4">
          <button
            @click="showAssignModal=true"
            class="bg-primary hover:bg-green-700 text-white px-4 py-2 rounded-xl font-semibold shadow-md">
            تعيين تكليف جديد
          </button>
        </div>

        <!-- جدول التكليفات -->
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 text-right">
            <thead class="bg-navbar">
              <tr>
                <th class="px-4 py-2 text-sm">الموظف</th>
                <th class="px-4 py-2 text-sm">المهمة</th>
                <th class="px-4 py-2 text-sm">البداية</th>
                <th class="px-4 py-2 text-sm">النهاية</th>
                <th class="px-4 py-2 text-sm">الحالة</th>
                <th class="px-4 py-2 text-sm">الإجراءات</th>
              </tr>
            </thead>

            <tbody class="divide-y divide-gray-200">
              <tr v-for="task in tasks" :key="task.id" class="hover:bg-gray-50">
                <td class="px-4 py-2">{{task.employee}}</td>
                <td class="px-4 py-2">{{task.title}}</td>
              <td class="px-4 py-2">{{ formatDate(task.startDate) }}</td>
<td class="px-4 py-2">{{ formatDate(task.endDate) }}</td>

                <td class="px-4 py-2"
                    :class="{
                      'text-red-600': task.color==='red',
                      'text-orange-500': task.color==='orange',
                      'text-green-600': task.color==='green'
                    }">
                  {{ statusArabic(task.status) }}
                </td>

                <td class="px-4 py-2 flex gap-2">
                  <button
                    @click="openDetails(task)"
                      class="text-gray-600 hover:text-gray-900">
                    <EyeIcon class="w-6 h-6"/>
                  </button>
                  <button
                    @click="openComments(task)"
                    class="text-gray-600 hover:text-gray-900">
                    <ChatBubbleLeftRightIcon class="w-6 h-6"/>
                  </button>
                </td>
              </tr>
            </tbody>

          </table>
        </div>

      </div>

    </div>

    <!-- ================= Modal إنشاء تكليف ================= -->
    <!-- ================= Modal إنشاء تكليف ================= -->
<div v-if="showAssignModal"
     class="fixed inset-0 bg-black/40 flex items-start justify-center z-50 p-2 pt-6 overflow-y-auto">

  <div class="bg-white p-4 rounded-lg w-full max-w-lg shadow-lg space-y-3 
              max-h-[85vh] overflow-y-auto">

    <h2 class="text-base font-bold text-green-900 flex justify-between items-center">
      <span>تعيين تكليف جديد</span>
      <button @click="showAssignModal=false" class="text-gray-600 hover:text-gray-900 font-bold text-lg">&times;</button>
    </h2>

    <div class="flex flex-col">
      <label class="text-xs mb-1">الموظف</label>
      <select v-model="form.employeeId" class="input text-sm">
        <option v-for="emp in employees" :key="emp.id" :value="emp.id">
          {{emp.fullName}}
        </option>
      </select>
    </div>

    <div>
      <label class="text-xs">عنوان المهمة</label>
      <input v-model="form.title" type="text" class="input text-sm"/>
    </div>

    <div>
      <label class="text-xs">الوصف</label>
      <textarea v-model="form.description" rows="2" class="input text-sm"></textarea>
    </div>

   <div class="flex gap-2">
  <div class="flex-1">
    <label class="text-xs">تاريخ البداية</label>
    <input v-model="form.startDate" type="date" class="input text-sm"/>
  </div>
  <div class="flex-1">
    <label class="text-xs">تاريخ النهاية</label>
    <input v-model="form.endDate" type="date" class="input text-sm"/>
  </div>
</div>

    <div>
      <label class="text-xs">مرفق</label>
      <input type="file" @change="onFileChange" class="input text-sm"/>
    </div>

    <div class="flex justify-end gap-1">
      <button @click="assignTask" class="bg-primary text-white px-3 py-1.5 rounded-lg text-sm">
        إرسال
      </button>
      <button @click="showAssignModal=false" class="bg-gray-300 px-3 py-1.5 rounded-lg text-sm">
        إلغاء
      </button>
    </div>

  </div>
</div>

    <!-- ================= Modal تفاصيل المهمة ================= -->
    <div v-if="showDetailModal"
         class="fixed inset-0 bg-black/40 flex items-start justify-center z-50 p-4 pt-10">

      <div class="bg-white p-6 rounded-xl w-full max-w-lg shadow-lg space-y-4">

        <h2 class="text-lg font-bold text-green-900 flex justify-between items-center">
          <span>تفاصيل المهمة</span>
          <button @click="showDetailModal=false" class="text-gray-600 hover:text-gray-900 font-bold text-xl">&times;</button>
        </h2>

        <div v-if="detailTask">
          <p><strong>الموظف:</strong> {{detailTask.employee}}</p>
          <p><strong>المهمة:</strong> {{detailTask.title}}</p>
   <p><strong>البداية:</strong> {{ formatDate(detailTask.startDate) }}</p>
<p><strong>النهاية:</strong> {{ formatDate(detailTask.endDate) }}</p>
          <p><strong>الحالة:</strong> {{ statusArabic(detailTask.status) }}</p>
        </div>

        <div class="flex justify-end gap-2 mt-4">
          <button @click="managerDecision('Approved')"
                  class="bg-green-600 text-white px-4 py-2 rounded-xl">
            قبول
          </button>

          <button @click="managerDecision('Rejected')"
                  class="bg-red-600 text-white px-4 py-2 rounded-xl">
            رفض
          </button>
        </div>

      </div>
    </div>

    <!-- ================= Modal التعليقات ================= -->
    <div v-if="showCommentModal"
         class="fixed inset-0 bg-black/40 flex items-start justify-center z-50 p-4 pt-10">

      <div class="bg-white p-6 rounded-xl w-full max-w-md shadow-lg space-y-4 max-h-[85vh] overflow-y-auto">

        <h2 class="text-lg font-bold text-green-900 flex justify-between items-center">
          <span>التعليقات</span>
          <button @click="showCommentModal=false" class="text-gray-600 hover:text-gray-900 font-bold text-xl">&times;</button>
        </h2>

       <ul>
  <li v-for="c in comments" :key="c.id" class="mb-2 p-2 rounded-lg bg-gray-100 break-words">
    <strong>{{ c.userName }}:</strong>
    <span>{{ c.comment }}</span>
    <a v-if="c.attachmentUrl" :href="c.attachmentUrl" target="_blank" class="text-blue-500 underline ml-2">
      مرفق
    </a>
  </li>
</ul>
<!-- إضافة تعليق جديد -->
<div class="mt-2 flex flex-col gap-2">
  <textarea
    v-model="newComment"
    placeholder="اكتب تعليقك هنا..."
    class="input w-full resize-none overflow-hidden min-h-[60px]"
    rows="2"
    @input="autoResize($event)"
  ></textarea>
  
  <div class="flex gap-2">
    <input type="file" @change="onCommentFileChange" class="h-10"/>
    <button @click="sendComment" class="bg-primary text-white px-4 py-2 rounded-xl">
      إرسال
    </button>
  </div>
</div>

      </div>
    </div>

  </div>
</template>

<script>
import axios from "axios"
import { ref, onMounted } from "vue"
import SidebarPage from "../components/Sidebar.vue"
import Navbar from "../components/Navbar.vue"
import { EyeIcon, ChatBubbleLeftRightIcon } from "@heroicons/vue/24/outline"

export default {
  components: { SidebarPage, Navbar, EyeIcon, ChatBubbleLeftRightIcon },

  setup() {

    const tasks = ref([])
    const employees = ref([])
    const showAssignModal = ref(false)
    const showDetailModal = ref(false)
    const showCommentModal = ref(false)

    const detailTask = ref(null)
    const comments = ref([])
    const newComment = ref("")
    const commentAttachment = ref(null)

    const form = ref({
      employeeId: "",
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      attachment: null
    })

    axios.defaults.baseURL = "http://localhost:5205/api"
    axios.defaults.headers.common["Authorization"] = `Bearer ${localStorage.getItem("token")}`

    const fetchTasks = async () => {
      const res = await axios.get("/Task/manager-tasks")
      tasks.value = res.data
    }
const autoResize = (e) => {
  e.target.style.height = 'auto';
  e.target.style.height = e.target.scrollHeight + 'px';
}
    const fetchEmployees = async () => {
      const res = await axios.get("/Task/section-employees")
      employees.value = res.data
    }

    const assignTask = async () => {
      const data = new FormData()
      data.append("EmployeeId", form.value.employeeId)
      data.append("Title", form.value.title)
      data.append("Description", form.value.description)
      data.append("StartDate", form.value.startDate)
      data.append("EndDate", form.value.endDate)
      if (form.value.attachment) data.append("Attachment", form.value.attachment)

      await axios.post("/Task/assign", data)
      showAssignModal.value = false
      fetchTasks()
    }
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return dateStr.split('T')[0]  // تاخذ فقط الجزء قبل "T"
}
    const managerDecision = async (decision) => {
      await axios.put(`/Task/manager-decision/${detailTask.value.id}?decision=${decision}`)
      showDetailModal.value = false
      fetchTasks()
    }

    const fetchComments = async (taskId) => {
      try {
        const res = await axios.get(`/Task/${taskId}/comments`)
        comments.value = res.data.map(c => ({
          id: c.id,
          userName: c.userName || c.employeeName || c.managerName || "مجهول",
          comment: c.comment || c.content || "",
          attachmentUrl: c.attachmentUrl || null,
          createdAt: c.createdAt
        }))
      } catch (error) {
        console.error("خطأ عند جلب التعليقات:", error.response?.data || error.message)
      }
    }

    const openDetails = (task) => {
      detailTask.value = task
      showDetailModal.value = true
    }

    const openComments = (task) => {
      detailTask.value = task
      showCommentModal.value = true
      fetchComments(task.id)
    }

    const onFileChange = (e) => { form.value.attachment = e.target.files[0] }
    const onCommentFileChange = (e) => { commentAttachment.value = e.target.files[0] }

    const sendComment = async () => {
      if (!newComment.value && !commentAttachment.value) return
      const data = new FormData()
      data.append("comment", newComment.value)
      if (commentAttachment.value) data.append("attachment", commentAttachment.value)

      try {
        await axios.post(`/Task/${detailTask.value.id}/comment`, data, {
          headers: { "Content-Type": "multipart/form-data" }
        })
        newComment.value = ""
        commentAttachment.value = null
        fetchComments(detailTask.value.id)
      } catch (error) {
        console.error("خطأ عند إرسال التعليق:", error.response?.data || error.message)
        alert("حدث خطأ أثناء إرسال التعليق، تأكد من البيانات.")
      }
    }

    onMounted(() => {
      fetchTasks()
      fetchEmployees()
    })

    const statusArabic = (status) => {
      switch(status) {
        case 'Pending': return 'قيد الانتظار'
        case 'Approved': return 'موافق'
        case 'Rejected': return 'مرفوض'
        case 'New': return 'جديد'
        case 'InProgress': return 'قيد العمل'
        case 'Completed': return 'مكتمل'
        case 'Cancelled': return 'ملغى'
        default: return status
      }
    }

    return {
      tasks, employees, showAssignModal, showDetailModal, showCommentModal,
      form, assignTask, openDetails, openComments, detailTask,
      managerDecision, onFileChange, comments, newComment,  formatDate,
      sendComment, onCommentFileChange, statusArabic,autoResize
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');

.font-cairo { font-family: 'Cairo', sans-serif; }

.input {
  @apply p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right;
}
</style>