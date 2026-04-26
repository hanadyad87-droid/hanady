<template>
  <div class="flex min-h-screen bg-gray-100 font-cairo" dir="rtl">
    <Sidebar />

    <div class="flex-1 w-full min-w-0 p-4 sm:p-6 mr-0 lg:mr-60">
      <Navbar />

      <div class="bg-white rounded-2xl shadow-lg p-6 mt-4">

        <div class="flex justify-between items-center mb-6">
          <div>
            <h2 class="text-xl font-bold text-gray-800">إدارة الإجازات</h2>
            <p class="text-sm text-gray-500">كل الطلبات</p>
          </div>
        </div>

        <input
          v-model="searchQuery"
          @input="onSearch"
          placeholder="بحث..."
          class="w-full mb-4 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
        />

        <div class="overflow-x-auto border border-gray-200 rounded-lg">
          <table class="min-w-full text-right divide-y divide-gray-200">
            <thead class="bg-navbar">
              <tr>
                <th class="p-3 text-sm font-semibold text-gray-600">الموظف</th>
                <th class="p-3 text-sm font-semibold text-gray-600">نوع الإجازة</th>
                <th class="p-3 text-sm font-semibold text-gray-600 text-center">من - إلى</th>
                <th class="p-3 text-sm font-semibold text-gray-600 text-center">الأيام</th>
                <th class="p-3 text-sm font-semibold text-gray-600 text-center">المرفق</th>
                <th class="p-3 text-sm font-semibold text-gray-600 text-center">الحالة</th>
                <th class="p-3 text-sm font-semibold text-gray-600 text-center">بانتظار</th>
                <th class="p-3 text-sm font-semibold text-gray-600 text-center">إجراءات</th>
              </tr>
            </thead>

            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="leave in leaves" :key="leave.id" class="hover:bg-gray-50 transition">

                <td class="p-3 text-sm font-medium">{{ leave.employeeName }}</td>
                <td class="p-3 text-sm text-gray-700">{{ leave.leaveType }}</td>

                <td class="p-3 text-sm text-center text-gray-700">
                  {{ formatDate(leave.fromDate) }} ← {{ formatDate(leave.toDate) }}
                </td>

                <td class="p-3 text-sm text-center font-bold">{{ leave.totalDays }}</td>

                <td class="p-3 text-sm text-center">
                  <a
                    v-if="leave.attachmentPath"
                    :href="`http://localhost:5205${leave.attachmentPath}`"
                    target="_blank"
                    class="text-blue-600 hover:underline"
                  >
                    عرض
                  </a>
                  <span v-else class="text-gray-400">لا يوجد</span>
                </td>

                <td class="p-3 text-sm text-center">
                  <span :class="getStatusClass(leave)" class="font-bold">
                    {{ leave.status }}
                  </span>
                </td>

                <td class="p-3 text-sm text-center text-gray-600">
                  {{ leave.waitingFor || "-" }}
                </td>

                <td class="p-3 text-sm text-center flex gap-4 justify-center">

                  <template v-if="pendingIds.has(leave.id)">
                    <button 
                      @click="approveLeave(leave)" 
                      class="text-green-600 hover:scale-110 transition-transform" 
                      title="موافقة"
                    >
                      <CheckCircleIcon class="w-6 h-6" />
                    </button>

                    <button 
                      @click="openRejectModal(leave)" 
                      class="text-red-600 hover:scale-110 transition-transform" 
                      title="رفض"
                    >
                      <XCircleIcon class="w-6 h-6" />
                    </button>
                  </template>

                  <span v-else class="text-gray-400">-</span>

                </td>

              </tr>

              <tr v-if="leaves.length === 0">
                <td colspan="8" class="text-center py-10 text-gray-400 italic">
                  لا توجد طلبات إجازة حالياً
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex justify-between items-center mt-6">
          <button
            class="px-4 py-2 border rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            :disabled="page === 1"
            @click="changePage(page - 1)"
          >
            السابق
          </button>

          <span class="text-sm font-medium text-gray-600">
            صفحة {{ page }} من {{ totalPages }}
          </span>

          <button
            class="px-4 py-2 border rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            :disabled="page === totalPages"
            @click="changePage(page + 1)"
          >
            التالي
          </button>
        </div>

      </div>
    </div>

    <div v-if="showRejectModal" class="fixed inset-0 bg-black/50 flex justify-center items-center z-[60] p-4">
      <div class="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl">
        <h3 class="font-bold text-xl mb-4 text-gray-800 border-b pb-2">رفض الطلب</h3>

        <textarea
          v-model="rejectReason"
          class="w-full border border-gray-300 p-3 rounded-xl mb-4 focus:ring-2 focus:ring-red-500 outline-none h-32"
          placeholder="يرجى كتابة سبب الرفض هنا..."
        ></textarea>

        <div class="flex justify-end gap-3">
          <button @click="closeRejectModal" class="px-5 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition">
            إلغاء
          </button>
          <button @click="submitReject" class="bg-red-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-red-700 transition">
            تأكيد الرفض
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import api from "../services/api";
import Sidebar from "../components/Sidebar.vue";
import Navbar from "../components/Navbar.vue";
// استيراد الأيقونات المطلوبة
import { CheckCircleIcon, XCircleIcon } from '@heroicons/vue/24/outline';

export default {
  // إضافة الأيقونات للمكونات
  components: { Sidebar, Navbar, CheckCircleIcon, XCircleIcon },

  setup() {
    const leaves = ref([]);
    const pendingIds = ref(new Set());
    const searchQuery = ref("");
    const page = ref(1);
    const pageSize = 10;
    const totalPages = ref(1);
    const totalCount = ref(0);
    const showRejectModal = ref(false);
    const rejectReason = ref("");
    const selectedLeave = ref(null);

    const fetchLeaves = async () => {
      const res = await api.get("/leave-requests/manager/all", {
        params: { verbose: true, page: page.value, pageSize }
      });
      leaves.value = res.data.data;
      totalCount.value = res.data.totalCount;
      totalPages.value = Math.ceil(res.data.totalCount / pageSize);
    };

    const fetchPending = async () => {
      const res = await api.get("/leave-requests/manager/pending", {
        params: { verbose: true }
      });
      pendingIds.value = new Set(res.data.map(x => x.id));
    };

    const changePage = async (newPage) => {
      page.value = newPage;
      await fetchLeaves();
    };

    const onSearch = () => {};

    const approveLeave = async (leave) => {
      await api.post(`/leave-requests/${leave.id}/manager-decision`, null, {
        params: { approve: true, note: "تمت الموافقة" }
      });
      await refresh();
    };

    const submitReject = async () => {
      await api.post(`/leave-requests/${selectedLeave.value.id}/manager-decision`, null, {
        params: { approve: false, note: rejectReason.value }
      });
      closeRejectModal();
      await refresh();
    };

    const openRejectModal = (leave) => {
      selectedLeave.value = leave;
      showRejectModal.value = true;
    };

    const closeRejectModal = () => {
      showRejectModal.value = false;
      rejectReason.value = "";
    };

    const refresh = async () => {
      await fetchLeaves();
      await fetchPending();
    };

    const formatDate = (d) => d ? d.slice(0, 10) : "";

    const getStatusClass = (item) => {
      if (item.status?.includes("مقبول")) return "text-green-600";
      if (item.status?.includes("مرفوض")) return "text-red-600";
      return "text-yellow-600";
    };

    onMounted(refresh);

    return {
      leaves, pendingIds, searchQuery, page, totalPages,
      changePage, onSearch, showRejectModal, rejectReason,
      selectedLeave, approveLeave, submitReject, openRejectModal,
      closeRejectModal, formatDate, getStatusClass
    };
  }
};
</script>