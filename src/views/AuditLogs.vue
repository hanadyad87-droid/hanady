<template>
  <div class="flex min-h-screen bg-white" dir="rtl">
    <Sidebar class="fixed top-0 right-0 h-screen w-24 md:w-64 bg-primary text-white p-4 z-50" />
    
    <div class="flex-1 p-6 mr-24 md:mr-64">
      <Navbar />

      <div class="bg-white rounded-xl shadow p-6 max-w-6xl mx-auto">
        <h2 class="text-2xl font-bold mb-6 text-right">سجلات التدقيق</h2>

        <!-- فلترة البحث -->
        <div class="flex flex-col md:flex-row gap-3 mb-5 items-end">
          <input v-model="filters.userName" type="text" placeholder=" User Name" class="input flex-1" />
          <input v-model="filters.userId" type="number" placeholder=" User ID" class="input flex-1" />
          <div class="flex gap-2 flex-1">
            <input v-model="filters.fromDate" type="date" class="input flex-1" />
            <input v-model="filters.toDate" type="date" class="input flex-1" />
          </div>
          <button @click="fetchLogs()" class="btn btn-primary">🔍 بحث</button>
        </div>

        <!-- الجدول -->
        <div class="overflow-x-auto rounded-lg border border-gray-200">
          <table class="table-auto w-full text-right">
            <thead class="bg-navbar">
              <tr>
                <th class="px-4 py-2">ID</th>
                <th class="px-4 py-2">المستخدم</th>
                <th class="px-4 py-2">الإجراء</th>

                <th class="px-4 py-2">التاريخ</th>
                <th class="px-4 py-2">IP</th>
                <th class="px-4 py-2">العمليات</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="log in displayedLogs" :key="log.id">
                <tr class="border-t hover:bg-gray-50">
                  <td class="px-4 py-2">{{ log.id }}</td>
                  <td class="px-4 py-2">{{ log.userName || 'Unknown' }}</td>
                  <td class="px-4 py-2">{{ log.action }}</td>

                  <td class="px-4 py-2">{{ formatDate(log.createdAt) }}</td>
                  <td class="px-4 py-2">{{ log.ipAddress }}</td>
                  <td class="px-4 py-2 flex gap-2">
                    <XCircleIcon @click="confirmDelete(log.id)" class="w-6 h-6 text-red-500 cursor-pointer hover:opacity-80" />
                    <EyeIcon @click="toggleDetails(log.id)" class="w-6 h-6 text-gray-700 cursor-pointer hover:opacity-80" />
                  </td>
                </tr>

                <tr v-if="log.isOpened">
                  <td colspan="7" class="bg-gray-50 p-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 class="font-semibold mb-1">Old Values</h3>
                        <pre class="bg-white p-2 rounded border text-sm overflow-x-auto">{{ JSON.stringify(log.oldValues, null, 2) }}</pre>
                      </div>
                      <div>
                        <h3 class="font-semibold mb-1">New Values</h3>
                        <pre class="bg-white p-2 rounded border text-sm overflow-x-auto">{{ JSON.stringify(log.newValues, null, 2) }}</pre>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="mt-5 flex flex-wrap justify-between items-center gap-2">
          <div class="flex gap-2">
            <button @click="changePage(page - 1)" :disabled="page === 1" class="btn">السابق</button>
            <button @click="changePage(page + 1)" :disabled="page === totalPages" class="btn">التالي</button>
          </div>
          <span>صفحة {{ page }} من {{ totalPages }} | مجموع السجلات: {{ totalCount }}</span>
        </div>
      </div>
    </div>

    <!-- مودال تأكيد الحذف -->
    <div v-if="confirmDeleteId !== null" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm text-center">
        <p class="mb-4 text-gray-800">هل أنت متأكد من حذف هذا السجل؟</p>
        <div class="flex justify-center gap-4">
          <button @click="confirmDeleteId = null" class="px-4 py-2 rounded border border-gray-300">إلغاء</button>
          <button @click="deleteLog(confirmDeleteId)" class="px-4 py-2 bg-red-600 text-white rounded">حذف</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import Sidebar from "@/components/Sidebar.vue";
import Navbar from "@/components/Navbar.vue";
import { EyeIcon, XCircleIcon } from '@heroicons/vue/24/outline';

const logs = ref([]);
const totalCount = ref(0);
const page = ref(1);
const pageSize = ref(20);
const opened = ref([]);
const confirmDeleteId = ref(null);

const filters = ref({
  userName: '',
  userId: '',
  fromDate: '',
  toDate: ''
});

const displayedLogs = computed(() => logs.value.map(log => ({
  ...log,
  isOpened: opened.value.includes(log.id)
})));

const fetchLogs = async () => {
  try {
    const params = { ...filters.value, page: page.value, pageSize: pageSize.value };
    const response = await axios.get('http://localhost:5205/api/AuditLog', {
      params,
      headers: { Authorization: "Bearer " + localStorage.getItem("token") }
    });
    logs.value = response.data.data;
    totalCount.value = response.data.totalCount;
    opened.value = [];
  } catch (err) {
    console.error(err);
    alert('حدث خطأ أثناء جلب السجلات');
  }
};

const confirmDelete = (id) => { confirmDeleteId.value = id; }

const deleteLog = async (id) => {
  try {
    await axios.delete(`http://localhost:5205/api/AuditLog/${id}`, {
      headers: { Authorization: "Bearer " + localStorage.getItem("token") }
    });
    confirmDeleteId.value = null;
    fetchLogs();
  } catch (err) {
    console.error(err);
    alert('حدث خطأ أثناء الحذف');
  }
};

const changePage = (newPage) => {
  if (newPage < 1 || newPage > totalPages.value) return;
  page.value = newPage;
  fetchLogs();
};

const toggleDetails = (id) => {
  if (opened.value.includes(id)) opened.value = opened.value.filter(i => i !== id);
  else opened.value.push(id);
};

const formatDate = (date) => new Date(date).toLocaleString();
const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value));

onMounted(fetchLogs);
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap');

body, input, select, textarea, button { font-family: 'Cairo', sans-serif; }
body { direction: rtl; text-align: right; }

.bg-background { background-color: #f5f5f5; }

.input { @apply border rounded-lg text-right w-full bg-white px-3 py-2 text-sm; border-color: #d1d5db; }
.input:focus { border-color: #2563eb; box-shadow: 0 0 0 2px rgb(37 99 235 / 20%); }

.btn { @apply px-4 py-2 rounded-lg text-white bg-primary transition hover:opacity-90 disabled:opacity-50; cursor: pointer; }
.btn-primary { background-color: #1D4736; }

pre { white-space: pre-wrap; word-break: break-word; }
</style>