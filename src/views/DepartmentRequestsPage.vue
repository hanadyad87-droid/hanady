<template>
  <div class="flex min-h-screen bg-gray-100" dir="rtl">

    <!-- Sidebar -->
    <Sidebar class="fixed top-0 right-0 h-screen w-24 sm:w-28 md:w-60 z-50" />

    <!-- المحتوى -->
    <div class="flex-1 mr-24 sm:mr-28 md:mr-60 p-4 sm:p-6">

      <!-- Navbar -->
      <Navbar />

      <!-- الكارد -->
      <div class="bg-white rounded-xl shadow p-6 max-w-6xl mx-auto mt-4">

        <h3 class="text-xl font-bold mb-6 text-right text-green-900">
          الطلبات المعلقة للإدارة
        </h3>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 text-right">
            <thead class="bg-navbar">
              <tr>
                <th class="border p-2">نوع الطلب</th>
                <th class="border p-2">الموظف</th>
                <th class="border p-2">الحالة</th>
                <th class="border p-2">الاجراءات</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="req in displayedRequests"
                :key="req.id + '-' + req.type"
                class="hover:bg-green-50"
              >
                <td class="border p-2">{{ req.typeName }}</td>
                <td class="border p-2">
                  {{ req.employee?.fullName || "—" }}
                </td>
                <td class="border p-2" :class="statusClass(req.status)">
                  {{ req.status }}
                </td>
             <td class="border p-2 flex gap-2 justify-center">

  <!-- أيقونة عرض التفاصيل -->
  <button
    @click="openDetails(req)"
    title="عرض التفاصيل"
    class="text-blue-500 hover:text-blue-700"
  >
    <EyeIcon class="w-6 h-6" />
  </button>

  <!-- أيقونة الموافقة -->
  <button
    @click="takeDecision(req, true)"
    title="موافقة"
    class="text-green-500 hover:text-green-700"
  >
    <CheckCircleIcon class="w-6 h-6" />
  </button>

  <!-- أيقونة الرفض -->
  <button
    @click="takeDecision(req, false)"
    title="رفض"
    class="text-red-500 hover:text-red-700"
  >
    <XCircleIcon class="w-6 h-6" />
  </button>

</td>
              </tr>

              <tr v-if="displayedRequests.length === 0">
                <td class="border p-2 text-center" colspan="4">
                  لا توجد طلبات حالياً
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>

    <!-- Toast -->
    <transition name="fade">
      <div
        v-if="toastMessage"
        class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
               px-6 py-3 rounded-lg shadow-lg text-white text-center z-[999]"
        :class="toastType === 'success' ? 'bg-green-600' : 'bg-red-600'"
      >
        {{ toastMessage }}
      </div>
    </transition>

    <!-- Details Modal -->
    <div
      v-if="selectedRequest"
      class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[1000]"
    >
      <div class="bg-white w-full max-w-xl rounded-xl p-6 relative">

        <button
          @click="selectedRequest = null"
          class="absolute top-2 left-2 text-red-600 text-lg"
        >
          ✖
        </button>

        <h3 class="text-lg font-bold mb-4 text-green-900">
          تفاصيل الطلب - {{ selectedRequest.typeName }}
        </h3>

        <!-- إذن خروج -->
        <div v-if="selectedRequest.type === 'ExitPermit'">
          <p><strong>نوع الاذن:</strong> {{ selectedRequest.permitType }}</p>
          <p><strong>التاريخ:</strong> {{ selectedRequest.permitDate }}</p>
          <p><strong>الوقت:</strong> {{ selectedRequest.permitTime }}</p>
          <p><strong>السبب:</strong> {{ selectedRequest.reason }}</p>
        </div>

        <!-- تعديل بيانات -->
        <div v-else-if="selectedRequest.type === 'DataUpdate'">
          <p><strong>نوع التعديل:</strong> {{ selectedRequest.updateType }}</p>
          <p><strong>القيمة الجديدة:</strong> {{ selectedRequest.newValue }}</p>
          <p><strong>السبب:</strong> {{ selectedRequest.reason }}</p>
        </div>

        <!-- شهادة راتب -->
        <div v-else-if="selectedRequest.type === 'SalaryCertificate'">
          <p><strong>الغرض:</strong> {{ selectedRequest.purpose }}</p>
          <p><strong>الحالة:</strong> {{ selectedRequest.status }}</p>
        </div>

        <!-- صيانة -->
        <div v-else-if="selectedRequest.type === 'Maintenance'">
          <p><strong>اسم الجهاز:</strong> {{ selectedRequest.equipmentName }}</p>
          <p><strong>وصف المشكلة:</strong> {{ selectedRequest.problemDescription }}</p>

          <div v-if="selectedRequest.imagePath" class="mt-3">
            <img
              :src="baseURL + selectedRequest.imagePath"
              class="w-40 rounded shadow"
            />
          </div>
        </div>

      </div>
    </div>

  </div>
</template>

<script>
import Sidebar from "../components/Sidebar.vue";
import Navbar from "../components/Navbar.vue";
import axios from "axios";
import { ref, onMounted } from "vue";
import { EyeIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/vue/24/outline';
export default {
  name: "DepartmentRequestsPage",
  components: { Sidebar, Navbar,EyeIcon,CheckCircleIcon, XCircleIcon},

  setup() {

    const displayedRequests = ref([]);
    const toastMessage = ref("");
    const toastType = ref("success");
    const selectedRequest = ref(null);

    // إعداد axios
    axios.defaults.baseURL = "http://localhost:5205";
    const token = localStorage.getItem("token");
    if (token)
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    const baseURL = axios.defaults.baseURL; // ✅ هنا عرفنا baseURL لاستخدامه في template

    const showToast = (msg, type = "success") => {
      toastMessage.value = msg;
      toastType.value = type;
      setTimeout(() => (toastMessage.value = ""), 3000);
    };

    const statusClass = (status) => {
      if (
        [
          "مقبول",
          "جاهزة",
          "تمت_الموافقة",
          "تمت-الموافقة",
          "تم_الإصلاح"
        ].includes(status)
      )
        return "text-green-600";

      if (status === "مرفوض")
        return "text-red-600";

      return "text-yellow-600";
    };

    const fetchPendingRequests = async () => {
      try {

        const requests = [];

         // 1️⃣ طلبات Exit Permit للمدير
    try {
      const permits = await axios.get("/api/ExitPermit/pending-for-manager");
      requests.push(
        ...permits.data.map(r => ({
          ...r,
          typeName: "إذن خروج",
          type: "ExitPermit",
        }))
      );
    } catch (err) {
      if (err.response?.status !== 403) throw err;
    }

    // 2️⃣ طلبات Exit Permit للـ HR
    try {
      const hrPermits = await axios.get("/api/ExitPermit/hr-view");
      requests.push(
        ...hrPermits.data.map(r => ({
          ...r,
          typeName: "إذن خروج",
          type: "ExitPermit",
        }))
      );
    } catch (err) {
      if (err.response?.status !== 403) throw err;
    }

        // Data Update
        try {
          const updates = await axios.get("/api/DataUpdate/pending-for-my-dept");
          requests.push(
            ...updates.data.map((r) => ({
              ...r,
              typeName: "تعديل بيانات",
              type: "DataUpdate",
            }))
          );
        } catch (err) {
          if (err.response?.status !== 403) throw err;
        }

        // Salary Certificate
        try {
          const salaries = await axios.get("/api/SalaryCertificate/pending-for-my-dept");
          requests.push(
            ...salaries.data.map((r) => ({
              ...r,
              typeName: "شهادة راتب",
              type: "SalaryCertificate",
            }))
          );
        } catch (err) {
          if (err.response?.status !== 403) throw err;
        }

        // Maintenance
        try {
          const maintenance = await axios.get("/api/Maintenance/pending-for-my-dept");
          requests.push(
            ...maintenance.data.map((r) => ({
              ...r,
              typeName: "صيانة",
              type: "Maintenance",
            }))
          );
        } catch (err) {
          if (err.response?.status !== 403) throw err;
        }

        displayedRequests.value = requests;

        if (requests.length === 0) {
          showToast("لا توجد طلبات حالياً أو لا توجد صلاحية عرضها", "error");
        }

      } catch (err) {
        console.error(err);
        showToast("تعذر تحميل الطلبات ❌", "error");
      }
    };

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

          default:
            showToast("نوع الطلب غير معروف", "error");
            return;
        }

        await axios.post(url);

        showToast("تم تنفيذ القرار بنجاح");

        displayedRequests.value =
          displayedRequests.value.filter(
            (r) => !(r.id === req.id && r.type === req.type)
          );

      } catch (err) {
        console.error(err);

        if (err.response?.status === 403)
          showToast("ليس لديك صلاحية لاتخاذ هذا القرار", "error");
        else if (err.response?.status === 401)
          showToast("انتهت الجلسة، الرجاء تسجيل الدخول من جديد", "error");
        else if (err.response?.status === 404)
          showToast("الطلب غير موجود", "error");
        else
          showToast("فشل في تنفيذ القرار", "error");
      }
    };

    const openDetails = (req) => {
      selectedRequest.value = req;
    };

    onMounted(() => {
      fetchPendingRequests();
    });

    return {
      displayedRequests,
      statusClass,
      takeDecision,
      toastMessage,
      toastType,
      selectedRequest,
      openDetails,
      baseURL // ✅ رجعناه هنا لاستخدامه في template
    };
  },
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>