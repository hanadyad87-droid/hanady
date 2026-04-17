<template>
  <div class="flex min-h-screen bg-gray-100 font-cairo" dir="rtl">
    <!-- Sidebar -->
    <SidebarPage class="fixed top-0 right-0 h-screen w-24 md:w-64 z-50" />

    <!-- Main content -->
    <div class="flex-1 p-6 mr-24 md:mr-64">
      <Navbar />

      <!-- Card -->
      <div class="bg-white rounded-2xl shadow-lg p-6 mt-4">
        <!-- Header -->
        <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 class="text-xl font-bold text-gray-800">مهامي</h2>

        </div>

        <!-- Search Table -->
        <input
          v-model="searchTable"
          placeholder="بحث في المهام (عنوان المهمة، المدير)..."
          class="input w-full mb-4 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm"
        />

        <!-- Table -->
        <div class="overflow-x-auto rounded-lg border border-gray-200">
          <table class="min-w-full text-right divide-y divide-gray-200">
            <thead class="bg-navbar">
              <tr>
                <th class="p-3 text-sm font-semibold text-gray-600">المهمة</th>
                <th class="p-3 text-sm font-semibold text-gray-600">المدير</th>
                <th class="p-3 text-sm font-semibold text-gray-600">البداية</th>
                <th class="p-3 text-sm font-semibold text-gray-600">النهاية</th>
                <th class="p-3 text-sm font-semibold text-gray-600">الحالة</th>
                <th class="p-3 text-sm font-semibold text-gray-600">قرار المدير</th>
                <th class="p-3 text-sm font-semibold text-gray-600 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="task in filteredTasks" :key="task.id" class="hover:bg-gray-50 transition">
                <td class="p-3 text-sm font-medium">{{ task.title }}</td>
                <td class="p-3 text-sm text-gray-600">{{ task.manager }}</td>
                <td class="p-3 text-sm text-gray-500">{{ formatDate(task.startDate) }}</td>
                <td class="p-3 text-sm text-gray-500">{{ formatDate(task.endDate) }}</td>
                <td class="p-3 text-sm">
                  <select 
                    v-model="task.status" 
                    @change="updateStatus(task)" 
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-primary focus:border-primary block w-full p-1.5 outline-none"
                  >
                    <option value="جديدة">جديدة</option>
                    <option value="قيد التنفيذ">قيد التنفيذ</option>
                    <option value="مكتملة">مكتملة</option>
                  </select>
                </td>
                <td class="p-3 text-sm">
                  <span :class="decisionClass(task.managerDecision)" class="px-2 py-1 rounded-full text-xs font-bold">
                    {{ task.managerDecision || 'لم يقرر' }}
                  </span>
                </td>
                <td class="p-3 text-sm flex gap-3 justify-center">
                  <button @click="openDetails(task)" class="text-blue-600 hover:scale-110 transition" title="عرض التفاصيل">
                    <EyeIcon class="w-5 h-5" />
                  </button>
                  <button @click="openComments(task)" class="text-primary hover:scale-110 transition" title="التعليقات">
                    <ChatBubbleLeftRightIcon class="w-5 h-5" />
                  </button>
                </td>
              </tr>
              <tr v-if="!filteredTasks.length">
                <td colspan="7" class="text-center py-10 text-gray-400 italic">لا توجد مهام حالياً</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal: تفاصيل المهمة -->
    <div v-if="showModal && modalType === 'details'" class="fixed inset-0 bg-black/50 flex justify-center items-center z-[60] p-4">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
        <button @click="closeModal" class="absolute top-4 left-4 text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        <h3 class="font-bold text-xl mb-6 text-gray-800 border-b pb-2">تفاصيل المهمة</h3>
        
        <div class="space-y-4">
          <div>
            <label class="text-xs text-gray-500 block mb-1">عنوان المهمة</label>
            <p class="font-semibold text-gray-800">{{ selectedTask.title }}</p>
          </div>
          <div>
            <label class="text-xs text-gray-500 block mb-1">وصف المهمة</label>
            <div class="bg-gray-50 p-3 rounded-lg border text-sm leading-relaxed max-h-32 overflow-y-auto whitespace-pre-wrap">
              {{ selectedTask.description }}
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-xs text-gray-500 block mb-1">المدير المسند</label>
              <p class="text-sm font-medium">{{ selectedTask.manager }}</p>
            </div>
            <div>
              <label class="text-xs text-gray-500 block mb-1">القسم</label>
              <p class="text-sm font-medium">{{ selectedTask.section }}</p>
            </div>
          </div>
          <div v-if="selectedTask.attachmentPath">
            <label class="text-xs text-gray-500 block mb-1">المرفقات</label>
            <a :href="'http://localhost:5205/' + selectedTask.attachmentPath" target="_blank" class="text-blue-600 hover:underline text-sm flex items-center gap-1">
              📎 عرض الملف المرفق
            </a>
          </div>
        </div>
        <div class="mt-8 flex justify-end">
          <button @click="closeModal" class="bg-primary text-white px-8 py-2 rounded-xl font-bold hover:shadow-lg transition">إغلاق</button>
        </div>
      </div>
    </div>

    <!-- Modal: التعليقات -->
    <div v-if="showModal && modalType === 'comments'" class="fixed inset-0 bg-black/50 flex justify-center items-center z-[60] p-4">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative flex flex-col max-h-[90vh]">
        <button @click="closeModal" class="absolute top-4 left-4 text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        <h3 class="font-bold text-xl mb-4 text-gray-800">التعليقات</h3>
        
        <!-- Comments List -->
        <div class="flex-1 overflow-y-auto space-y-4 mb-4 p-2">
          <div v-for="c in comments" :key="c.id" class="bg-gray-50 p-3 rounded-xl border border-gray-100">
            <div class="flex justify-between items-center mb-1">
              <span class="text-xs font-bold text-primary">{{ c.employeeName || 'مجهول' }}</span>
            </div>
            <p class="text-sm text-gray-700 whitespace-pre-line">{{ c.comment }}</p>
            <a v-if="c.attachmentUrl" :href="c.attachmentUrl" target="_blank" class="text-blue-500 text-xs underline mt-2 inline-block">📎 مرفق</a>
          </div>
          <div v-if="!comments.length" class="text-center py-10 text-gray-400 text-sm">لا توجد تعليقات بعد</div>
        </div>

        <!-- Add Comment Form -->
        <div class="border-t pt-4 space-y-3">
          <textarea
            v-model="newComment"
            placeholder="اكتب تعليقك هنا..."
            class="w-full p-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary resize-none"
            rows="2"
          ></textarea>
          <div class="flex items-center justify-between gap-2">
            <input type="file" @change="onFileChange" class="text-xs w-full file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:bg-gray-100 file:text-gray-600 cursor-pointer" />
            <button @click="sendComment" class="bg-primary text-white px-6 py-1.5 rounded-lg text-sm font-bold hover:bg-green-700 transition">إرسال</button>
          </div>
        </div>
      </div>
    </div>

    <ToastPage v-if="showToast" :message="toastMessage" :type="toastType" />
  </div>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import axios from "axios";
import SidebarPage from "@/components/Sidebar.vue";
import Navbar from "@/components/Navbar.vue";
import ToastPage from "@/components/Toast.vue";
import { EyeIcon, ChatBubbleLeftRightIcon } from "@heroicons/vue/24/outline";

export default {
  components: { SidebarPage, Navbar, ToastPage, EyeIcon, ChatBubbleLeftRightIcon },
  setup() {
    const tasks = ref([]);
    const searchTable = ref("");
    const showModal = ref(false);
    const modalType = ref("details"); // 'details' or 'comments'
    const selectedTask = ref(null);
    const comments = ref([]);
    const newComment = ref("");
    const attachment = ref(null);

    const showToast = ref(false);
    const toastMessage = ref("");
    const toastType = ref("success");

    axios.defaults.baseURL = "http://localhost:5205/api";
    axios.defaults.headers.common["Authorization"] = `Bearer ${localStorage.getItem("token")}`;

    const triggerToast = (msg, type = "success") => {
      toastMessage.value = msg;
      toastType.value = type;
      showToast.value = true;
      setTimeout(() => (showToast.value = false), 3000);
    };

    const fetchTasks = async () => {
      try {
        const res = await axios.get("/Task/my-tasks");
        tasks.value = res.data.reverse().map(t => ({
          ...t,
          status: t.status === 'New' ? 'جديدة' : t.status === 'InProgress' ? 'قيد التنفيذ' : 'مكتملة',
          managerDecision: t.managerDecision === 'Approved' ? 'موافق' :
                           t.managerDecision === 'Rejected' ? 'مرفوض' : 'لم يقرر'
        }));
      } catch {
        triggerToast("فشل تحميل المهام", "error");
      }
    };

    const filteredTasks = computed(() => {
      const s = searchTable.value.toLowerCase();
      return tasks.value.filter(t => 
        (t.title || "").toLowerCase().includes(s) ||
        (t.manager || "").toLowerCase().includes(s)
      );
    });

    const updateStatus = async (task) => {
      try {
        const backendStatus = task.status === 'جديدة' ? 'New' : task.status === 'قيد التنفيذ' ? 'InProgress' : 'Completed';
        await axios.put(`/Task/update-status/${task.id}?status=${backendStatus}`);
        triggerToast("تم تحديث الحالة بنجاح");
      } catch {
        triggerToast("فشل تحديث الحالة", "error");
      }
    };

    const openDetails = (task) => {
      selectedTask.value = task;
      modalType.value = "details";
      showModal.value = true;
    };

    const openComments = async (task) => {
      selectedTask.value = task;
      modalType.value = "comments";
      showModal.value = true;
      try {
        const res = await axios.get(`/Task/${task.id}/comments`);
        comments.value = res.data;
      } catch {
        triggerToast("فشل تحميل التعليقات", "error");
      }
    };

    const sendComment = async () => {
      if (!newComment.value.trim() && !attachment.value) return;
      try {
        const data = new FormData();
        data.append("Comment", newComment.value);
        if (attachment.value) data.append("Attachment", attachment.value);
        await axios.post(`/Task/${selectedTask.value.id}/comment`, data);
        newComment.value = "";
        attachment.value = null;
        const res = await axios.get(`/Task/${selectedTask.value.id}/comments`);
        comments.value = res.data;
        triggerToast("تمت إضافة التعليق");
      } catch {
        triggerToast("فشل إضافة التعليق", "error");
      }
    };

    const onFileChange = (e) => { attachment.value = e.target.files[0]; };
    const closeModal = () => { showModal.value = false; selectedTask.value = null; };
    const formatDate = (date) => date ? date.split('T')[0] : "---";
    
    const decisionClass = (decision) => {
      if (decision === 'موافق') return 'bg-green-100 text-green-700';
      if (decision === 'مرفوض') return 'bg-red-100 text-red-700';
      return 'bg-gray-100 text-gray-600';
    };

    onMounted(fetchTasks);

    return {
      tasks, filteredTasks, searchTable, showModal, modalType, selectedTask, comments, 
      newComment, showToast, toastMessage, toastType, openDetails, openComments, 
      updateStatus, sendComment, onFileChange, closeModal, formatDate, decisionClass
    };
  }
};
</script>

<style scoped>
/* تحسين شكل التمرير داخل المودال */
::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-track { background: #f1f1f1; }
::-webkit-scrollbar-thumb { background: #ccc; border-radius: 10px; }
::-webkit-scrollbar-thumb:hover { background: #aaa; }
</style>