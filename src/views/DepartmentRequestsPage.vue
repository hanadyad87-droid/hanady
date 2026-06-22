<template>
  <div class="flex min-h-screen bg-gray-100 font-cairo" dir="rtl">
    <Sidebar />

    <div class="flex-1 w-full min-w-0 p-4 sm:p-6 mr-0 lg:mr-60">
      <Navbar />

      <div class="bg-white rounded-2xl shadow-lg p-6 mt-4">
        <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 class="text-xl font-bold text-gray-800">طلبات الادارة</h2>
          <div class="text-xs text-gray-500">
            ملاحظة: الطلبات المصادَق عليها تبقى ظاهرة (تمت_العملية).
          </div>
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
                <th class="p-3 text-sm font-semibold text-gray-600">مستلم من</th>
                <th
  v-if="!paginatedRequests.every(r => r.type === 'ExitPermit')"
  class="p-3 text-sm font-semibold text-gray-600"
>
  مُكلَّف لـ
</th>
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
                <td class="p-3 text-sm text-gray-700">{{ req.employee?.fullName || req.employeeName || "—" }}</td>
                <td class="p-3 text-sm">
                  <span :class="statusClass(req.status)" class="font-bold">
                    {{ req.status }}
                  </span>
                </td>
                <td class="p-3 text-sm text-gray-600">{{ req.claimedByName || "—" }}</td>
              <td
  v-if="req.type !== 'ExitPermit'"
  class="p-3 text-sm text-gray-600"
>
  {{ req.assignedToName || "—" }}
</td>
                <td class="p-3 text-sm flex gap-2 justify-center flex-wrap">
                  <!-- عرض التفاصيل -->
                  <button @click="openDetails(req)" class="text-blue-600 hover:scale-110 transition" title="عرض التفاصيل">
                    <EyeIcon class="w-5 h-5" />
                  </button>
                  
                  <!-- استلام الطلب (للطلبات في الانتظار فقط) -->
                  <button 
                    v-if="req.canClaim && req.type !== 'ExitPermit'" 
                    @click="claimRequest(req)" 
                    class="text-purple-600 hover:scale-110 transition" 
                    title="استلام الطلب"
                  >
                    <HandRaisedIcon class="w-5 h-5" />
                  </button>
                  
                  <!-- تكليف موظف (للطلبات قيد التنفيذ) -->
                  <button 
                    v-if="req.status === 'قيد_التنفيذ' && req.isClaimedByMe && req.type !== 'ExitPermit'" 
                    @click="openAssignModal(req)" 
                    class="text-indigo-600 hover:scale-110 transition" 
                    title="تكليف موظف"
                  >
                    <UserPlusIcon class="w-5 h-5" />
                  </button>
                  
                  <!-- إعلان تمام (للطلبات قيد التنفيذ) -->
                  <button 
                    v-if="req.status === 'قيد_التنفيذ' && req.type !== 'ExitPermit'" 
                    @click="openCompleteModal(req)" 
                    class="text-teal-600 hover:scale-110 transition" 
                    title="إعلان تمام التنفيذ"
                  >
                    <CheckIcon class="w-5 h-5" />
                  </button>
                  
                  <!-- موافقة ExitPermit -->
                  <button 
                    v-if="req.type === 'ExitPermit' && req.status === 'قيد_الانتظار'" 
                    @click="claimRequest(req)" 
                    class="text-green-600 hover:scale-110 transition" 
                    title="موافقة"
                  >
                    <CheckCircleIcon class="w-5 h-5" />
                  </button>
                  
                  <!-- رفض -->
                  <button 
                    v-if="req.isClaimedByMe && req.status !== 'مرفوض' && req.status !== 'في_انتظار_المصادقة' && req.status !== 'تمت_العملية'" 
                    @click="rejectRequest(req)" 
                    class="text-red-600 hover:scale-110 transition" 
                    title="رفض"
                  >
                    <XCircleIcon class="w-5 h-5" />
                  </button>
                </td>
              </tr>
              <tr v-if="filteredRequests.length === 0">
                <td colspan="6" class="text-center py-10 text-gray-400 italic">لا توجد طلبات معلقة حالياً</td>
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

    <!-- نافذة تكليف موظف -->
    <div v-if="showAssignModal" class="fixed inset-0 bg-black/50 flex justify-center items-center z-[60] p-4">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
        <button @click="showAssignModal = false" class="absolute top-4 left-4 text-gray-400 hover:text-red-600 text-xl font-bold">
          &times;
        </button>
        <h3 class="font-bold text-xl mb-6 text-gray-800 border-b pb-2">تكليف موظف بالتنفيذ</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">اختر الموظف:</label>
            <select v-model="selectedEmployeeId" class="input w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none">
              <option :value="null">اختر موظفاً...</option>
              <option v-for="emp in employees" :key="emp.id" :value="emp.id">
                {{ emp.fullName }} - {{ emp.employeeNumber }}
              </option>
            </select>
          </div>
        </div>
        <div class="flex justify-end gap-3 mt-6">
          <button @click="showAssignModal = false" class="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition">إلغاء</button>
          <button @click="assignRequest" class="px-6 py-2 bg-primary text-white rounded-lg hover:bg-green-700 transition">تكليف</button>
        </div>
      </div>
    </div>

    <!-- نافذة إعلان تمام التنفيذ -->
    <div v-if="showCompleteModal" class="fixed inset-0 bg-black/50 flex justify-center items-center z-[60] p-4">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
        <button @click="showCompleteModal = false" class="absolute top-4 left-4 text-gray-400 hover:text-red-600 text-xl font-bold">
          &times;
        </button>
        <h3 class="font-bold text-xl mb-6 text-gray-800 border-b pb-2">إعلان تمام التنفيذ</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">ملاحظات التنفيذ:</label>
            <textarea v-model="completionNotes" rows="3" class="input w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="اكتب ملاحظات عن التنفيذ... (اختياري)"></textarea>
          </div>
        </div>
        <div class="flex justify-end gap-3 mt-6">
          <button @click="showCompleteModal = false" class="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition">إلغاء</button>
          <button @click="completeRequest" class="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition">إعلان تمام</button>
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
import api from "@/services/api";
import { EyeIcon, CheckCircleIcon, XCircleIcon, HandRaisedIcon, UserPlusIcon, CheckIcon } from '@heroicons/vue/24/outline';

export default {
  name: "DepartmentRequestsPage",
  components: { Sidebar, Navbar, ToastPage, EyeIcon, CheckCircleIcon, XCircleIcon, HandRaisedIcon, UserPlusIcon, CheckIcon },

  setup() {
    const displayedRequests = ref([]);
    const searchTable = ref("");
    const selectedRequest = ref(null);
    const showToast = ref(false);
    const toastMessage = ref("");
    const toastType = ref("success");

    const currentPage = ref(1);
    const itemsPerPage = ref(10);

    const baseURL = "http://localhost:5205";

    // Workflow modals
    const showAssignModal = ref(false);
    const showCompleteModal = ref(false);
    const currentActionRequest = ref(null);
    const employees = ref([]);
    const selectedEmployeeId = ref(null);
    const completionNotes = ref("");

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
          { url: "/ExitPermit/pending-for-manager", name: "إذن خروج", type: "ExitPermit" },
          { url: "/ExitPermit/hr-view", name: "إذن خروج", type: "ExitPermit" },
          { url: "/DataUpdate/pending-for-my-dept", name: "تعديل بيانات", type: "DataUpdate" },
          { url: "/SalaryCertificate/pending-for-my-dept", name: "شهادة راتب", type: "SalaryCertificate" },
          { url: "/Maintenance/pending-for-my-dept", name: "صيانة", type: "Maintenance" }
        ];

        for (const endpoint of endpoints) {
          try {
            const res = await api.get(endpoint.url);

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
      const success = ["مقبول", "جاهزة", "تمت_الموافقة", "تم_الإصلاح", "تمت_العملية"];
      if (success.includes(status)) return "text-green-600";
      if (status === "مرفوض") return "text-red-600";
      if (status === "في_انتظار_المصادقة") return "text-blue-600";
      if (status === "قيد_التنفيذ") return "text-purple-600";
      return "text-yellow-600";
    };

    const fetchEmployees = async () => {
      try {
        const res = await api.get("/Employee/by-my-department");
        employees.value = res.data.employees || [];
      } catch (err) {
        console.error("Failed to fetch employees", err);
      }
    };

    // Workflow Actions
  const claimRequest = async (req) => {
  try {
    let url = "";

    switch (req.type) {

      case "ExitPermit":
        url = `/ExitPermit/manager-decision/${req.id}?approve=true`;
        break;

      case "DataUpdate":
        url = `/DataUpdate/claim/${req.id}`;
        break;

      case "SalaryCertificate":
        url = `/SalaryCertificate/claim/${req.id}`;
        break;

      case "Maintenance":
        url = `/Maintenance/claim/${req.id}`;
        break;
    }

    await api.post(url);

    if (req.type === "ExitPermit") {
      req.status = "تمت_الموافقة";
    } else {
      req.status = "قيد_التنفيذ";
      req.isClaimedByMe = true;
    }

    triggerToast("تمت العملية بنجاح");

  } catch (err) {
    console.log(err.response?.data);
    triggerToast("فشل في تنفيذ العملية", "error");
  }
};

    const openAssignModal = (req) => {
      currentActionRequest.value = req;
      selectedEmployeeId.value = null;
      fetchEmployees();
      showAssignModal.value = true;
    };

    const assignRequest = async () => {
      if (!selectedEmployeeId.value) return triggerToast("اختر موظفاً", "error");
      try {
        const req = currentActionRequest.value;
        let url = "";
        switch (req.type) {
          case "DataUpdate": url = `/DataUpdate/assign/${req.id}?employeeId=${selectedEmployeeId.value}`; break;
          case "SalaryCertificate": url = `/SalaryCertificate/assign/${req.id}?employeeId=${selectedEmployeeId.value}`; break;
          case "Maintenance": url = `/Maintenance/assign/${req.id}?employeeId=${selectedEmployeeId.value}`; break;
        }
        await api.post(url);
        req.assignedToName = employees.value.find(e => e.id === selectedEmployeeId.value)?.fullName;
        showAssignModal.value = false;
        triggerToast("تم تكليف الموظف بنجاح");
      } catch (err) {
        triggerToast(err.response?.data?.message || "فشل في تكليف الموظف", "error");
      }
    };

    const openCompleteModal = (req) => {
      currentActionRequest.value = req;
      completionNotes.value = "";
      showCompleteModal.value = true;
    };

    const completeRequest = async () => {
      try {
        const req = currentActionRequest.value;
        let url = "";
        switch (req.type) {
          case "DataUpdate": url = `/DataUpdate/complete/${req.id}`; break;
          case "SalaryCertificate": url = `/SalaryCertificate/complete/${req.id}`; break;
          case "Maintenance": url = `/Maintenance/complete/${req.id}`; break;
        }
        await api.post(url, { notes: completionNotes.value });
        req.status = "في_انتظار_المصادقة";
        showCompleteModal.value = false;
        triggerToast("تم إعلان التنفيذ بنجاح");
      } catch (err) {
        triggerToast(err.response?.data?.message || "فشل في إعلان التنفيذ", "error");
      }
    };

    const rejectRequest = async (req) => {
      try {
        let url = "";
        switch (req.type) {
          case "ExitPermit":
            url = `/ExitPermit/manager-decision/${req.id}?approve=false`;
            await api.post(url);
            break;
          case "DataUpdate":
            url = `/DataUpdate/reject/${req.id}`;
            await api.post(url, { reason: "تم الرفض من الإدارة" });
            break;
          case "SalaryCertificate":
            url = `/SalaryCertificate/reject/${req.id}`;
            await api.post(url, { reason: "تم الرفض من الإدارة" });
            break;
          case "Maintenance":
            url = `/Maintenance/reject/${req.id}`;
            await api.post(url, { reason: "تم الرفض من الإدارة" });
            break;
        }
        req.status = "مرفوض";
        triggerToast("تم رفض الطلب بنجاح");
      } catch (err) {
        triggerToast(err.response?.data?.message || "فشل في رفض الطلب", "error");
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
      showToast,
      toastMessage,
      toastType,
      selectedRequest,
      openDetails,
      baseURL,
      currentPage,
      totalPages,
      paginatedRequests,
      itemsPerPage,
      // Workflow
      claimRequest,
      rejectRequest,
      openAssignModal,
      openCompleteModal,
      showAssignModal,
      showCompleteModal,
      employees,
      selectedEmployeeId,
      assignRequest,
      completeRequest,
      completionNotes,
      currentActionRequest
    };
  }
};
</script>