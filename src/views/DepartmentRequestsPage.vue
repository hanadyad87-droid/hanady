<template>
  <div class="flex min-h-screen bg-gray-100 font-cairo" dir="rtl">
    <Sidebar />

    <div class="flex-1 w-full min-w-0 p-4 sm:p-6 mr-0 lg:mr-60">
      <Navbar />

      <div class="bg-white rounded-2xl shadow-lg p-6 mt-4">
        <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 class="text-xl font-bold text-gray-800">طلبات الادارة</h2>
        </div>

        <input
          v-model="searchTable"
          placeholder="بحث في الطلبات (اسم الموظف، نوع الطلب)..."
          class="input w-full mb-4 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
        />

        <div class="overflow-x-auto rounded-lg border border-gray-200">
          <table class="min-w-full text-right divide-y divide-gray-200">
            <thead class="bg-navbar">
              <tr>
                <th class="p-3 text-sm font-semibold text-gray-600">نوع الطلب</th>
                <th class="p-3 text-sm font-semibold text-gray-600">الموظف</th>
                <th class="p-3 text-sm font-semibold text-gray-600">الحالة</th>
                <th class="p-3 text-sm font-semibold text-gray-600 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr 
                v-for="req in paginatedRequests" 
                :key="req.id + '-' + req.type" 
                class="hover:bg-gray-50 transition"
              >
                <td class="p-3 text-sm font-medium">{{ req.typeName }}</td>
                <td class="p-3 text-sm text-gray-700">{{ req.employee?.fullName || "—" }}</td>
                <td class="p-3 text-sm">
                  <span :class="statusClass(req.status)" class="font-bold">
                    {{ req.status }}
                  </span>
                </td>
                <td class="p-3 text-sm flex gap-4 justify-center">
                  <button @click="openDetails(req)" class="text-blue-600 hover:scale-110 transition" title="عرض التفاصيل">
                    <EyeIcon class="w-6 h-6" />
                  </button>
                  <button @click="takeDecision(req, true)" class="text-green-600 hover:scale-110 transition" title="موافقة">
                    <CheckCircleIcon class="w-6 h-6" />
                  </button>
                  <button @click="takeDecision(req, false)" class="text-red-600 hover:scale-110 transition" title="رفض">
                    <XCircleIcon class="w-6 h-6" />
                  </button>
                </td>
              </tr>
              <tr v-if="filteredRequests.length === 0">
                <td colspan="4" class="text-center py-10 text-gray-400 italic">لا توجد طلبات معلقة حالياً</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="filteredRequests.length > itemsPerPage" class="flex justify-between items-center mt-6 flex-wrap gap-4">
          <button 
            @click="currentPage--" 
            :disabled="currentPage === 1"
            class="px-4 py-2 bg-white border rounded-lg text-sm font-bold disabled:opacity-50 hover:bg-gray-50 transition shadow-sm"
          >
            السابق
          </button>
          
          <span class="text-sm text-gray-600 font-bold">
            الصفحة {{ currentPage }} من {{ totalPages }}
          </span>

          <button 
            @click="currentPage++" 
            :disabled="currentPage === totalPages"
            class="px-4 py-2 bg-white border rounded-lg text-sm font-bold disabled:opacity-50 hover:bg-gray-50 transition shadow-sm"
          >
            التالي
          </button>
        </div>
      </div>
    </div>

    <div v-if="selectedRequest" class="fixed inset-0 bg-black/50 flex justify-center items-center z-[60] p-4">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
        <button @click="selectedRequest = null" class="absolute top-4 left-4 text-gray-400 hover:text-red-600 text-xl font-bold">
          &times;
        </button>
        
        <h3 class="font-bold text-xl mb-6 text-gray-800 border-b pb-2">
          تفاصيل {{ selectedRequest.typeName }}
        </h3>

        <div class="space-y-4 text-sm text-gray-700">
          <template v-if="selectedRequest.type === 'ExitPermit'">
            <div class="bg-gray-50 p-3 rounded-lg border">
              <p class="mb-2"><strong>نوع الإذن:</strong> {{ selectedRequest.permitType }}</p>
              <p class="mb-2"><strong>التاريخ:</strong> {{ selectedRequest.permitDate }}</p>
              <p class="mb-2"><strong>الوقت:</strong> {{ selectedRequest.permitTime }}</p>
              <p><strong>السبب:</strong> {{ selectedRequest.reason }}</p>
            </div>
          </template>

          <template v-else-if="selectedRequest.type === 'DataUpdate'">
            <div class="bg-gray-50 p-3 rounded-lg border">
              <p class="mb-2"><strong>نوع التعديل:</strong> {{ selectedRequest.updateType }}</p>
              <p class="mb-2"><strong>القيمة الجديدة:</strong> {{ selectedRequest.newValue }}</p>
              <p><strong>السبب:</strong> {{ selectedRequest.reason }}</p>
            </div>
          </template>

          <template v-else-if="selectedRequest.type === 'Maintenance'">
            <div class="bg-gray-50 p-3 rounded-lg border">
              <p class="mb-2"><strong>الجهاز:</strong> {{ selectedRequest.equipmentName }}</p>
              <p class="mb-2"><strong>المشكلة:</strong> {{ selectedRequest.problemDescription }}</p>
              <div v-if="selectedRequest.imagePath" class="mt-3">
                <img :src="baseURL + selectedRequest.imagePath" class="w-full rounded-lg shadow-sm border" />
              </div>
            </div>
          </template>

          <template v-else-if="selectedRequest.type === 'SalaryCertificate'">
             <div class="bg-gray-50 p-3 rounded-lg border">
               <p><strong>الغرض:</strong> {{ selectedRequest.purpose }}</p>
             </div>
          </template>
        </div>

        <div class="flex justify-end mt-8">
          <button @click="selectedRequest = null" class="bg-primary text-white px-8 py-2 rounded-xl font-bold hover:shadow-lg transition">
            إغلاق
          </button>
        </div>
      </div>
    </div>

    <ToastPage v-if="showToast" :message="toastMessage" :type="toastType" />
  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from "vue";
import Sidebar from "@/components/Sidebar.vue";
import Navbar from "@/components/Navbar.vue";
import ToastPage from "@/components/Toast.vue";
import axios from "axios";
import { EyeIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/vue/24/outline';

export default {
  name: "DepartmentRequestsPage",
  components: { Sidebar, Navbar, ToastPage, EyeIcon, CheckCircleIcon, XCircleIcon },

  setup() {
    const displayedRequests = ref([]);
    const searchTable = ref("");
    const selectedRequest = ref(null);
    const showToast = ref(false);
    const toastMessage = ref("");
    const toastType = ref("success");

    const currentPage = ref(1);
    const itemsPerPage = ref(10);

    axios.defaults.baseURL = "http://localhost:5205";
    const baseURL = axios.defaults.baseURL;

    const token = localStorage.getItem("token");
    if (token) axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    const triggerToast = (msg, type = "success") => {
      toastMessage.value = msg;
      toastType.value = type;
      showToast.value = true;
      setTimeout(() => (showToast.value = false), 3000);
    };

    const fetchPendingRequests = async () => {
      try {
        const requests = [];

        const endpoints = [
          { url: "/api/ExitPermit/pending-for-manager", name: "إذن خروج", type: "ExitPermit" },
          { url: "/api/ExitPermit/hr-view", name: "إذن خروج", type: "ExitPermit" },
          { url: "/api/DataUpdate/pending-for-my-dept", name: "تعديل بيانات", type: "DataUpdate" },
          { url: "/api/SalaryCertificate/pending-for-my-dept", name: "شهادة راتب", type: "SalaryCertificate" },
          { url: "/api/Maintenance/pending-for-my-dept", name: "صيانة", type: "Maintenance" }
        ];

        for (const endpoint of endpoints) {
          try {
            const res = await axios.get(endpoint.url);

            requests.push(
              ...res.data.map(r => ({
                ...r,
                typeName: endpoint.name,
                type: endpoint.type
              }))
            );

          } catch (err) {
            if (err.response?.status !== 403) console.error(err);
          }
        }

        // 🔥 أهم تعديل: ترتيب من الأحدث للأقدم
        displayedRequests.value = requests.sort((a, b) => b.id - a.id);

      } catch (err) {
        triggerToast("تعذر تحميل الطلبات", "error");
      }
    };

    const filteredRequests = computed(() => {
      const s = searchTable.value.toLowerCase();

      return displayedRequests.value.filter(r =>
        (r.employee?.fullName || "").toLowerCase().includes(s) ||
        (r.typeName || "").toLowerCase().includes(s)
      );
    });

    const totalPages = computed(() =>
      Math.ceil(filteredRequests.value.length / itemsPerPage.value) || 1
    );

    const paginatedRequests = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value;
      return filteredRequests.value.slice(start, start + itemsPerPage.value);
    });

    watch(searchTable, () => {
      currentPage.value = 1;
    });

    const statusClass = (status) => {
      const success = ["مقبول", "جاهزة", "تمت_الموافقة", "تم_الإصلاح"];
      if (success.includes(status)) return "text-green-600";
      if (status === "مرفوض") return "text-red-600";
      return "text-yellow-600";
    };

    // 🔥 أهم تعديل: ما نحذفوش الطلب بعد القرار
    const takeDecision = async (req, approve) => {
      try {
        let url = "";

        switch (req.type) {
          case "ExitPermit":
            url = `/api/ExitPermit/manager-decision/${req.id}?approve=${approve}`;
            break;

          case "DataUpdate":
            url = `/api/DataUpdate/decision/${req.id}?approve=${approve}`;
            break;

          case "SalaryCertificate":
            url = `/api/SalaryCertificate/decision/${req.id}?isReady=${approve}`;
            break;

          case "Maintenance":
            url = `/api/Maintenance/decision/${req.id}?fixedStatus=${approve}`;
            break;
        }

        await axios.post(url);

        // 🔥 بدل الحذف → نحدّث الحالة فقط
        const target = displayedRequests.value.find(r => r.id === req.id && r.type === req.type);
        if (target) {
          target.status = approve ? "مقبول" : "مرفوض";
        }

        triggerToast("تم تنفيذ القرار بنجاح");

      } catch (err) {
        triggerToast("فشل في تنفيذ القرار", "error");
      }
    };

    const openDetails = (req) => {
      selectedRequest.value = req;
    };

    onMounted(fetchPendingRequests);

    return {
      displayedRequests,
      filteredRequests,
      searchTable,
      statusClass,
      takeDecision,
      showToast,
      toastMessage,
      toastType,
      selectedRequest,
      openDetails,
      baseURL,
      currentPage,
      totalPages,
      paginatedRequests,
      itemsPerPage
    };
  }
};
</script>