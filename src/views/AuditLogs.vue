<template>
  <div class="flex min-h-screen bg-gray-100 font-cairo" dir="rtl">
    <SidebarPage class="fixed top-0 right-0 h-screen w-20 md:w-64 z-50 transition-all duration-300"/>

    <div class="flex-1 p-4 md:p-6 mr-20 md:mr-64 transition-all duration-300">
      <Navbar/>

      <div class="bg-white rounded-2xl shadow-lg p-4 md:p-6 mt-4">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 class="text-xl font-bold text-gray-800">سجلات التدقيق</h2>
          <button 
            @click="exportToExcel" 
            :disabled="!logs.length"
            class="w-full sm:w-auto bg-primary hover:bg-green-700 text-white px-4 py-2 rounded-xl shadow transition-all flex justify-center items-center gap-2">
            <span>📄 استخراج Excel</span>
          </button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <input
              v-model="searchTable"
              placeholder="بحث في (المستخدم، الجدول، الإجراء)..."
              class="input w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            />
            <div class="flex gap-2 lg:col-span-2">
                <input v-model="filters.fromDate" type="date" class="input flex-1 p-2 border rounded-lg text-sm" />
                <input v-model="filters.toDate" type="date" class="input flex-1 p-2 border rounded-lg text-sm" />
                
                <button @click="fetchLogs" class="bg-primary text-white px-5 rounded-lg hover:bg-green-700 transition shadow-sm">🔍</button>
                
                <button 
                  v-if="filters.fromDate || filters.toDate" 
                  @click="resetFilters" 
                  class="bg-red-50 text-red-600 px-4 rounded-lg hover:bg-red-100 transition border border-red-100 font-bold"
                  title="عرض الكل">
                  ✕
                </button>
            </div>
        </div>

        <div class="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
          <table class="hidden md:table min-w-full text-right divide-y divide-gray-200">
            <thead class="bg-navbar">
              <tr>
                <th class="p-4 text-sm font-bold text-gray-600">المستخدم</th>
                <th class="p-4 text-sm font-bold text-gray-600">الكيان (Entity)</th>
                <th class="p-4 text-sm font-bold text-gray-600">الإجراء</th>
                <th class="p-4 text-sm font-bold text-gray-600">التاريخ</th>
                <th class="p-4 text-sm font-bold text-gray-600 text-center">التفاصيل</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-100">
              <template v-for="log in filteredLogs" :key="log.id">
                <tr class="hover:bg-blue-50/30 transition">
                  <td class="p-4">
                    <div class="text-sm font-bold text-gray-800">{{ log.userName || 'غير معروف' }}</div>
                    <div class="text-[10px] text-gray-400 font-mono">{{ log.ipAddress }}</div>
                  </td>
                  <td class="p-4 text-sm font-mono text-blue-600">{{ log.entityName }}</td>
                  <td class="p-4 text-sm">
                    <span :class="getActionClass(log.action)" class="px-2 py-1 rounded-md text-xs font-bold">
                      {{ log.action }}
                    </span>
                  </td>
                  <td class="p-4 text-sm text-gray-500">{{ formatDate(log.createdAt) }}</td>
                  <td class="p-4 text-sm text-center">
                    <button @click="toggleDetails(log.id)" class="text-primary hover:text-blue-800 font-bold transition">
                      {{ opened.includes(log.id) ? '✖' : '👁 عرض' }}
                    </button>
                  </td>
                </tr>
                <tr v-if="opened.includes(log.id)" class="bg-gray-50/50">
                  <td colspan="5" class="p-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                      <div class="bg-white p-4 rounded-xl border border-red-100">
                        <h4 class="text-xs font-bold text-red-500 mb-3 border-b pb-1">القيم السابقة</h4>
                        <pre class="text-[11px] leading-relaxed text-gray-700">{{ parseJSON(log.oldValues) }}</pre>
                      </div>
                      <div class="bg-white p-4 rounded-xl border border-green-100">
                        <h4 class="text-xs font-bold text-green-500 mb-3 border-b pb-1">القيم الجديدة</h4>
                        <pre class="text-[11px] leading-relaxed text-gray-700">{{ parseJSON(log.newValues) }}</pre>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>

          <div class="md:hidden space-y-4 p-2 bg-gray-50">
            <div v-for="log in filteredLogs" :key="'mob-'+log.id" class="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div class="flex justify-between items-start mb-3">
                    <div>
                        <div class="font-bold text-gray-800">{{ log.userName || 'غير معروف' }}</div>
                        <div class="text-[10px] text-gray-400 font-mono">{{ log.ipAddress }}</div>
                    </div>
                    <span :class="getActionClass(log.action)" class="px-2 py-1 rounded-md text-[10px] font-bold">
                      {{ log.action }}
                    </span>
                </div>
                <div class="text-sm mb-2"><span class="text-gray-400">الجدول:</span> <span class="font-mono text-blue-600">{{ log.entityName }}</span></div>
                <div class="text-sm mb-4"><span class="text-gray-400">التاريخ:</span> {{ formatDate(log.createdAt) }}</div>
                
                <button @click="toggleDetails(log.id)" class="w-full py-2 bg-gray-100 rounded-lg text-xs font-bold text-gray-600">
                    {{ opened.includes(log.id) ? 'إخفاء التفاصيل' : 'عرض التفاصيل' }}
                </button>
            </div>
          </div>

          <div v-if="!filteredLogs.length" class="text-center py-12 bg-white rounded-xl">
            <div class="text-4xl mb-2">🔍</div>
            <p class="text-gray-400 italic">لا توجد سجلات مطابقة للبحث</p>
          </div>
        </div>

        <div class="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50 p-4 rounded-2xl">
          <div class="flex gap-2 w-full sm:w-auto">
            <button @click="changePage(page - 1)" :disabled="page === 1" class="pagination-btn flex-1 sm:flex-none">السابق</button>
            <button @click="changePage(page + 1)" :disabled="page >= totalPages" class="pagination-btn flex-1 sm:flex-none">التالي</button>
          </div>
          <div class="text-xs md:text-sm text-gray-600 font-medium">
            صفحة <span class="text-primary font-bold">{{ page }}</span> من {{ totalPages }} 
            <span class="mx-2 text-gray-300">|</span> 
            إجمالي السجلات: <span class="font-bold">{{ totalCount }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <ToastPage v-if="showToast" :message="toastMessage" :type="toastType" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import * as XLSX from "xlsx";
import SidebarPage from "@/components/Sidebar.vue";
import Navbar from "@/components/Navbar.vue";
import ToastPage from "@/components/Toast.vue";

const logs = ref([]);
const totalCount = ref(0);
const page = ref(1);
const pageSize = ref(20);
const opened = ref([]);
const searchTable = ref("");
const filters = ref({ fromDate: '', toDate: '' });

const showToast = ref(false);
const toastMessage = ref("");
const toastType = ref("success");

const toast = (msg, type = "success") => {
  toastMessage.value = msg;
  toastType.value = type;
  showToast.value = true;
  setTimeout(() => (showToast.value = false), 3000);
};

const fetchLogs = async () => {
  try {
    const normalizeDate = (d, end = false) => {
      if (!d) return null;
      // الحل هنا: نبعث التوقيت المحلي لليوم بالكامل للسيرفر
      // البداية تكون 00:00:00 والنهاية 23:59:59
      // سنستخدم التنسيق YYYY-MM-DDTHH:mm:ss ليفهمه الـ .NET كـ Local Time
      return end ? `${d}T23:59:59` : `${d}T00:00:00`;
    };

    const params = { 
      page: page.value, 
      pageSize: pageSize.value,
      fromDate: normalizeDate(filters.value.fromDate),
      toDate: normalizeDate(filters.value.toDate, true)
    };

    const response = await axios.get('http://localhost:5205/api/AuditLog', {
      params,
      headers: { Authorization: "Bearer " + localStorage.getItem("token") }
    });

    logs.value = response.data.data;
    totalCount.value = response.data.totalCount;
    opened.value = [];
  } catch (err) {
    toast("خطأ في جلب البيانات", "error");
  }
};

const resetFilters = () => {
  filters.value.fromDate = '';
  filters.value.toDate = '';
  page.value = 1;
  fetchLogs();
};

const filteredLogs = computed(() => {
  const s = searchTable.value.toLowerCase();
  return logs.value.filter(l => 
    (l.userName || "").toLowerCase().includes(s) ||
    (l.entityName || "").toLowerCase().includes(s) ||
    (l.action || "").toLowerCase().includes(s)
  );
});

const getActionClass = (action) => {
  const a = action?.toLowerCase() || '';
  if (a.includes('create') || a.includes('إضافة')) return 'bg-green-100 text-green-700';
  if (a.includes('update') || a.includes('تعديل')) return 'bg-blue-100 text-blue-700';
  if (a.includes('delete') || a.includes('حذف')) return 'bg-red-100 text-red-700';
  return 'bg-gray-100 text-gray-700';
};

const parseJSON = (val) => {
  if (!val) return "لا يوجد بيانات";
  try {
    const obj = typeof val === 'string' ? JSON.parse(val) : val;
    return JSON.stringify(obj, null, 2);
  } catch (e) { return val; }
};

const formatDate = (date) => {
  if(!date) return '---';
  // عرض الوقت بالتوقيت الليبي المحلي في المتصفح
  return new Date(date).toLocaleString('ar-LY', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: true
  });
};

const toggleDetails = (id) => {
  if (opened.value.includes(id)) opened.value = opened.value.filter(i => i !== id);
  else opened.value.push(id);
};

const exportToExcel = () => {
  const data = logs.value.map(l => ({
    "المستخدم": l.userName,
    "الجدول": l.entityName,
    "الإجراء": l.action,
    "التاريخ": formatDate(l.createdAt),
    "IP": l.ipAddress
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "AuditLogs");
  XLSX.writeFile(wb, `Audit_Logs_${new Date().toISOString().slice(0,10)}.xlsx`);
  toast("جاري تصدير الملف...");
};

const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value));
const changePage = (newPage) => {
  if (newPage < 1 || newPage > totalPages.value) return;
  page.value = newPage;
  fetchLogs();
};

onMounted(fetchLogs);
</script>

<style scoped>
/* التنسيقات كما هي */
.input { @apply bg-gray-50 transition-all focus:bg-white; }
.pagination-btn {
  @apply px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-primary hover:text-white disabled:opacity-40 transition-all text-sm font-bold shadow-sm;
}
pre { white-space: pre-wrap; word-break: break-all; font-family: 'Courier New', Courier, monospace; }
.animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
@keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
</style>