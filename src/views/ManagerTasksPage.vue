<template>
  <div class="flex min-h-screen bg-gray-100 font-cairo" dir="rtl">

    <SidebarPage />

    <div class="flex-1 w-full min-w-0 p-4 sm:p-6 mr-0 lg:mr-60">

      <Navbar/>

      <div class="bg-white rounded-2xl shadow-lg p-6 mt-4">

        <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div>
            <h2 class="text-xl font-bold text-gray-800">التكليفات الخاصة بي</h2>
            <p class="text-sm text-gray-500 mt-1">متابعة وإدارة المهام والتكليفات المسندة للموظفين</p>
          </div>
          <button
            @click="showAssignModal=true"
            class="bg-primary hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-bold shadow transition-all flex items-center gap-2">
            تعيين تكليف جديد
          </button>
        </div>

        <div class="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table class="min-w-full divide-y divide-gray-200 text-right">
            <thead class="bg-navbar">
              <tr>
                <th class="p-4 text-sm font-bold text-gray-700">الموظف</th>
                <th class="p-4 text-sm font-bold text-gray-700">المهمة</th>
                <th class="p-4 text-sm font-bold text-gray-700 text-center">البداية</th>
                <th class="p-4 text-sm font-bold text-gray-700 text-center">النهاية</th>
                <th class="p-4 text-sm font-bold text-gray-700 text-center">الحالة</th>
                <th class="p-4 text-sm font-bold text-gray-700 text-center">قرار المدير</th>
                <th class="p-4 text-sm font-bold text-gray-700 text-center">الإجراءات</th>
              </tr>
            </thead>

            <tbody class="bg-white divide-y divide-gray-100">
              <tr v-for="task in tasks" :key="task.id" class="hover:bg-gray-50 transition-colors text-sm">
                <td class="p-4 font-semibold text-gray-800">{{task.employee}}</td>
                <td class="p-4 text-gray-600">{{task.title}}</td>
                <td class="p-4 text-center">
                  <span class="bg-green-50 text-green-700 px-2 py-1 rounded border border-green-100 font-mono text-xs">
                    {{ formatDate(task.startDate) }}
                  </span>
                </td>
                <td class="p-4 text-center">
                  <span class="bg-red-50 text-red-700 px-2 py-1 rounded border border-red-100 font-mono text-xs">
                    {{ formatDate(task.endDate) }}
                  </span>
                </td>

                <td class="p-4 text-center font-medium"
                    :class="{
                      'text-red-600': task.status === 'Rejected' || task.status === 'Cancelled',
                      'text-orange-500': task.status === 'Pending' || task.status === 'InProgress',
                      'text-green-600': task.status === 'Completed' || task.status === 'Approved'
                    }">
                  {{ statusArabic(task.status) }}
                </td>

                <td class="p-4 text-center font-medium"
                    :class="{
                      'text-green-600': task.managerDecision === 'Approved',
                      'text-red-600': task.managerDecision === 'Rejected',
                      'text-gray-500': task.managerDecision === 'Pending'
                    }">
                  {{
                    task.managerDecision === 'Approved'
                      ? 'موافق'
                      : task.managerDecision === 'Rejected'
                      ? 'مرفوض'
                      : 'لم يقرر'
                  }}
                </td>

                <td class="p-4 text-center">
                  <div class="flex items-center justify-center gap-1">
                    <button
                      @click="openDetails(task)"
                      class="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all"
                      title="التفاصيل">
                      <EyeIcon class="w-5 h-5"/>
                    </button>

                    <button
                      @click="openComments(task)"
                      class="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all"
                      title="التعليقات">
                      <ChatBubbleLeftRightIcon class="w-5 h-5"/>
                    </button>

                    <button
                      @click="managerDecision('Approved',task)"
                      class="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-all"
                      title="موافق">
                      <CheckCircleIcon class="w-5 h-5"/>
                    </button>

                    <button
                      @click="managerDecision('Rejected',task)"
                      class="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all"
                      title="مرفوض">
                      <XCircleIcon class="w-5 h-5"/>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>

          </table>
        </div>

      </div>

    </div>

    <div v-if="showAssignModal"
         class="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">

      <div class="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-fade-in">

        <h3 class="font-bold text-xl text-gray-800 flex justify-between items-center border-b border-gray-100 pb-3">
          <span>تعيين تكليف جديد</span>
          <button @click="showAssignModal=false" class="text-gray-400 hover:text-gray-600 font-bold text-2xl">&times;</button>
        </h3>

        <div class="space-y-4">
          <div class="flex flex-col">
            <label class="text-sm font-bold text-gray-600 mb-1">الموظف</label>
            <select v-model="form.employeeId" class="w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-primary bg-gray-50 text-sm">
              <option v-for="emp in employees" :key="emp.id" :value="emp.id">
                {{emp.fullName}}
              </option>
            </select>
          </div>

          <div>
            <label class="text-sm font-bold text-gray-600 mb-1">عنوان المهمة</label>
            <input v-model="form.title" type="text" class="w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-primary bg-gray-50 text-sm"/>
          </div>

          <div>
            <label class="text-sm font-bold text-gray-600 mb-1">الوصف</label>
            <textarea v-model="form.description" rows="2" class="w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-primary bg-gray-50 text-sm resize-none"></textarea>
          </div>

          <div class="flex gap-3">
            <div class="flex-1">
              <label class="text-sm font-bold text-gray-600 mb-1">تاريخ البداية</label>
              <input v-model="form.startDate" type="date" class="w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-primary bg-gray-50 text-sm"/>
            </div>
            <div class="flex-1">
              <label class="text-sm font-bold text-gray-600 mb-1">تاريخ النهاية</label>
              <input v-model="form.endDate" type="date" class="w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-primary bg-gray-50 text-sm"/>
            </div>
          </div>

          <div>
            <label class="text-sm font-bold text-gray-600 mb-1">مرفق</label>
            <input type="file" @change="onFileChange" class="w-full p-2 border rounded-xl outline-none focus:ring-2 focus:ring-primary bg-gray-50 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6 border-t border-gray-100 pt-3">
          <button @click="showAssignModal=false" class="flex-1 bg-gray-100 px-5 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-200 transition text-sm">
            إلغاء
          </button>
          <button @click="assignTask" class="flex-1 bg-primary text-white px-5 py-2.5 rounded-xl font-bold hover:shadow-lg transition text-sm">
            إرسال
          </button>
        </div>

      </div>
    </div>

    <div v-if="showDetailModal"
         class="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">

      <div class="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl animate-fade-in space-y-4">

        <h3 class="font-bold text-xl text-gray-800 flex justify-between items-center border-b border-gray-100 pb-3">
          <span>تفاصيل المهمة</span>
          <button @click="showDetailModal=false" class="text-gray-400 hover:text-gray-600 font-bold text-2xl">&times;</button>
        </h3>

        <div v-if="detailTask" class="space-y-3 text-sm pt-2">
          <div class="flex justify-between py-1 border-b border-gray-50"><span class="font-bold text-gray-600">الموظف:</span> <span class="text-gray-800 font-semibold">{{detailTask.employee}}</span></div>
          <div class="flex justify-between py-1 border-b border-gray-50"><span class="font-bold text-gray-600">المهمة:</span> <span class="text-gray-800">{{detailTask.title}}</span></div>
          <div class="flex justify-between py-1 border-b border-gray-50">
            <span class="font-bold text-gray-600">البداية:</span> 
            <span class="font-mono bg-green-50 text-green-700 px-1.5 py-0.5 rounded text-xs border border-green-100">{{ formatDate(detailTask.startDate) }}</span>
          </div>
          <div class="flex justify-between py-1 border-b border-gray-50">
            <span class="font-bold text-gray-600">النهاية:</span> 
            <span class="font-mono bg-red-50 text-red-700 px-1.5 py-0.5 rounded text-xs border border-red-100">{{ formatDate(detailTask.endDate) }}</span>
          </div>
          <div class="flex justify-between py-1">
            <span class="font-bold text-gray-600">الحالة:</span> 
            <span class="font-bold" :class="{'text-green-600': detailTask.status === 'Completed' || detailTask.status === 'Approved','text-orange-500': detailTask.status === 'Pending' || detailTask.status === 'InProgress'}">{{ statusArabic(detailTask.status) }}</span>
          </div>
        </div>

      </div>
    </div>

    <div v-if="showCommentModal"
         class="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">

      <div class="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl animate-fade-in space-y-4 max-h-[85vh] flex flex-col">

        <h3 class="font-bold text-xl text-gray-800 flex justify-between items-center border-b border-gray-100 pb-3">
          <span>التعليقات</span>
          <button @click="showCommentModal=false" class="text-gray-400 hover:text-gray-600 font-bold text-2xl">&times;</button>
        </h3>

        <div class="flex-1 overflow-y-auto space-y-3 pr-1 py-2 border-b border-gray-50">
          <ul>
            <li v-for="c in comments" :key="c.id" class="mb-3">
              <div class="text-xs font-bold text-gray-500 mr-1 mb-1">
                {{ c.userName || 'مجهول' }}
              </div>

              <div 
                class="bg-gray-50 border border-gray-100 p-3 rounded-xl break-words text-sm text-gray-700 shadow-sm whitespace-pre-line"
                style="max-height: 5rem; overflow-y: auto;"
              >
                {{ c.comment }}
              </div>

              <a v-if="c.attachmentUrl" :href="c.attachmentUrl" target="_blank" 
                 class="text-xs text-blue-600 hover:underline mr-2 inline-flex items-center gap-1 mt-1">
                📎 عرض المرفق
              </a>
            </li>
          </ul>
        </div>

        <div class="space-y-3 pt-2">
          <textarea
            v-model="newComment"
            placeholder="اكتب تعليقك هنا..."
            class="w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-primary bg-gray-50 text-sm resize-none overflow-hidden min-h-[60px]"
            rows="2"
            @input="autoResize($event)"
          ></textarea>
          
          <div class="flex items-center justify-between gap-2">
            <input type="file" @change="onCommentFileChange" class="text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200" />
            <button @click="sendComment" class="bg-primary text-white px-5 py-2 rounded-xl text-sm font-bold shadow hover:bg-green-700 transition">
              إرسال
            </button>
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
import { ref, onMounted } from "vue"
import SidebarPage from "../components/Sidebar.vue"
import Navbar from "../components/Navbar.vue"
import api from "@/services/api";
import { 
EyeIcon, 
ChatBubbleLeftRightIcon,
CheckCircleIcon,
XCircleIcon
} from "@heroicons/vue/24/outline"
import ToastPage from "@/components/Toast.vue";

export default {
  components: { SidebarPage, Navbar, EyeIcon, ChatBubbleLeftRightIcon ,  ToastPage, CheckCircleIcon, XCircleIcon },

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
const toastMessage = ref("")
const toastType = ref("success")
const showToast = ref(false)
    const form = ref({
      employeeId: "",
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      attachment: null
    })

    const fetchTasks = async () => {
      const res = await api.get("/Task/manager-tasks")
      tasks.value = res.data
      .reverse()
    }
const autoResize = (e) => {
  e.target.style.height = 'auto';
  e.target.style.height = e.target.scrollHeight + 'px';
}
    const fetchEmployees = async () => {
      const res = await api.get("/Task/section-employees")
      employees.value = res.data
    }
const triggerToast = (msg, type="success") => {
  toastMessage.value = msg
  toastType.value = type
  showToast.value = true

  setTimeout(()=>{
    showToast.value = false
  },3000)
}
  const assignTask = async () => {
  try {
    const data = new FormData()
    data.append("EmployeeId", form.value.employeeId)
    data.append("Title", form.value.title)
    data.append("Description", form.value.description)
    data.append("StartDate", form.value.startDate)
    data.append("EndDate", form.value.endDate)

    if (form.value.attachment)
      data.append("Attachment", form.value.attachment)

    await api.post("/Task/assign", data, {
      headers: { "Content-Type": "multipart/form-data" }
    })

    showAssignModal.value = false
    fetchTasks()

    triggerToast("تم إرسال التكليف بنجاح")

  } catch {
    triggerToast("فشل إرسال التكليف", "error")
  }
}
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return dateStr.split('T')[0]  // تاخذ فقط الجزء قبل "T"
}
    const managerDecision = async (decision,task) => {

  try {

    await api.put(`/Task/manager-decision/${task.id}?decision=${decision}`)

    fetchTasks()

    if(decision === "Approved")
      triggerToast("تم قبول المهمة")
    else
      triggerToast("تم رفض المهمة","error")

  } catch {

    triggerToast("فشل تحديث القرار","error")

  }

}

    const fetchComments = async (taskId) => {
      try {
        const res = await api.get(`/Task/${taskId}/comments`)
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
      data.append("Comment", newComment.value)
      if (commentAttachment.value) data.append("Attachment", commentAttachment.value)

      try {
        await api.post(`/Task/${detailTask.value.id}/comment`, data, {
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
      sendComment, onCommentFileChange, statusArabic,autoResize,toastMessage,
toastType,
showToast
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