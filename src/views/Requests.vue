<template>
  <div class="flex min-h-screen bg-gray-100 font-cairo" dir="rtl">
    <SidebarPage />

    <div class="flex-1 w-full min-w-0 p-4 sm:p-6 mr-0 lg:mr-60">
      <Navbar />

      <div class="bg-white rounded-2xl shadow-lg p-6 mt-4">
        <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 class="text-xl font-bold text-gray-800">الطلبات</h2>
          <button
            @click="openCreateModal"
            class="bg-primary hover:bg-green-700 text-white px-4 py-2 rounded-xl shadow transition-all flex items-center gap-2"
          >
            <span>+</span> تقديم طلب جديد
          </button>
        </div>

        <div class="overflow-x-auto rounded-lg border border-gray-200">
          <table class="min-w-full text-right divide-y divide-gray-200">
            <thead class="bg-navbar">
              <tr>
                <th class="p-3 text-sm font-semibold text-gray-600">نوع الطلب</th>
                <th class="p-3 text-sm font-semibold text-gray-600">التاريخ</th>
                <th class="p-3 text-sm font-semibold text-gray-600">الحالة</th>
                <th class="p-3 text-sm font-semibold text-gray-600 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="req in paginatedRequests" :key="req.id" class="hover:bg-gray-50 transition">
                <td class="p-3 text-sm font-medium">{{ req.typeName }}</td>
                <td class="p-3 text-sm text-gray-500">{{ formatDate(req.date || req.createdAt) }}</td>
                <td class="p-3 text-sm">
                  <span :class="statusBadgeClass(req.status)" class="px-2 py-1 rounded-md text-xs font-bold">
                    {{ req.status }}
                  </span>
                </td>
                <td class="p-3 text-sm text-center">
                  <div class="flex justify-center gap-2">
                   <button @click="openDetails(req)">
                    <EyeIcon class="w-5 h-5 text-blue-600" />
                  </button>

                  <!-- ✅ مصادقة -->
                  <button
                    v-if="req.status === 'في_انتظار_المصادقة' && req.type !== 'ExitPermit'"
                    @click="verifyRequest(req, true)"
                  >
                    <CheckCircleIcon class="w-5 h-5 text-green-600" />
                  </button>

                  <!-- ❌ رفض المصادقة -->
                  <button
                    v-if="req.status === 'في_انتظار_المصادقة' && req.type !== 'ExitPermit'"
                    @click="verifyRequest(req, false)"
                  >
                    <XCircleIcon class="w-5 h-5 text-red-600" />
                  </button>
                  </div>
                </td>
              </tr>
              <tr v-if="!paginatedRequests.length">
                <td colspan="4" class="text-center py-10 text-gray-400 italic">لا توجد طلبات متاحة حالياً</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex justify-between items-center mt-6">
          <button
            @click="changePage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-4 py-2 border rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium text-gray-700"
          >
            السابق
          </button>

          <span class="text-sm font-medium text-gray-600">
            صفحة <span class="text-primary font-bold">{{ currentPage }}</span> من {{ totalPages }}
          </span>

          <button
            @click="changePage(currentPage + 1)"
            :disabled="currentPage >= totalPages"
            class="px-4 py-2 border rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium text-gray-700"
          >
            التالي
          </button>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex justify-center items-center z-[60] p-4">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh]">
        <h3 class="font-bold text-xl mb-4 text-gray-800 border-b pb-2">تقديم طلب جديد</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">نوع الطلب</label>
            <select v-model="selectedRequestType" class="input w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary">
              <option value="">اختر نوع الطلب</option>
              <option value="update">طلب تعديل بيانات</option>
              <option value="salaryCertificate">طلب شهادة راتب</option>
              <option value="permission">طلب إذن خروج</option>
              <option value="maintenance">طلب صيانة</option>
            </select>
          </div>

          <div v-if="selectedRequestType === 'update'" class="space-y-3 p-3 bg-gray-50 rounded-lg">
            <div>
              <label class="block text-sm font-medium mb-1">نوع التعديل</label>
              <select v-model="form.updateType" class="input w-full p-2 border rounded-lg bg-white">
                <option value="الاسم_الكامل">الاسم الكامل</option>
                <option value="الإدارة">الإدارة</option>
                <option value="المسمى_الوظيفي">المسمى الوظيفي</option>
                <option value="الرقم_الوطني">الرقم الوطني</option>
                <option value="رقم_الهاتف_الأول">رقم الهاتف 1</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">القيمة الجديدة</label>
              <input v-model="form.newValue" type="text" :class="['input w-full p-2 rounded-lg bg-white', errors.newValue ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300']" @input="errors.newValue = false" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">السبب (إجباري)</label>
              <textarea v-model="form.reason" rows="2" :class="['input w-full p-2 rounded-lg bg-white', errors.reason ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300']" @input="errors.reason = false"></textarea>
            </div>
          </div>

          <div v-if="selectedRequestType === 'permission'" class="space-y-3 p-3 bg-gray-50 rounded-lg">
            <label class="block text-sm font-medium mb-1">نوع الإذن</label>
            <div class="flex flex-wrap gap-2 mb-2">
              <label class="flex items-center gap-1 text-xs"><input type="radio" value="خروج_شخصي" v-model="form.permitType" /> شخصي</label>
              <label class="flex items-center gap-1 text-xs"><input type="radio" value="خروج_عاجل" v-model="form.permitType" /> عاجل</label>
              <label class="flex items-center gap-1 text-xs"><input type="radio" value="خروج_طبي" v-model="form.permitType" /> طبي</label>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <input v-model="form.permitDate" type="date" :class="['input w-full p-2 rounded-lg text-xs', errors.permitDate ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300']" @change="errors.permitDate = false" />
             <div class="grid grid-cols-2 gap-2">
  <input 
    v-model="form.fromTime" 
    type="time"
    :class="['input w-full p-2 rounded-lg text-xs', errors.fromTime ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300']"
    @change="errors.fromTime = false"
  />

  <input 
    v-model="form.toTime" 
    type="time"
    :class="['input w-full p-2 rounded-lg text-xs', errors.toTime ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300']"
    @change="errors.toTime = false"
  />
</div>
            </div>
            <textarea v-model="form.reason" :class="['input w-full p-2 rounded-lg bg-white', errors.reason ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300']" placeholder="السبب... (إجباري)" @input="errors.reason = false"></textarea>
          </div>

          <div v-if="selectedRequestType === 'salaryCertificate'" class="p-3 bg-gray-50 rounded-lg">
            <label class="block text-sm font-medium mb-1">الجهة الموجه إليها (السبب)</label>
            <input v-model="form.purpose" :class="['input w-full p-2 rounded-lg bg-white', errors.purpose ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300']" placeholder="مثلاً: مصرف الوحدة" @input="errors.purpose = false" />
          </div>

          <div v-if="selectedRequestType === 'maintenance'" class="space-y-3 p-3 bg-gray-50 rounded-lg">
            <input v-model="form.equipmentName" placeholder="اسم الجهاز" class="input w-full p-2 border rounded-lg bg-white" />
            <textarea v-model="form.problemDescription" placeholder="وصف المشكلة (إجباري)" rows="2" :class="['input w-full p-2 rounded-lg bg-white', errors.problemDescription ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300']" @input="errors.problemDescription = false"></textarea>
            <input type="file" @change="onFileChange" class="w-full text-xs text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:bg-primary file:text-white" />
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-8">
          <button @click="showModal = false" class="bg-gray-200 px-5 py-2 rounded-lg font-medium hover:bg-gray-300 transition">إلغاء</button>
          <button @click="submitRequest" class="bg-primary hover:bg-green-700 text-white px-8 py-2 rounded-lg font-bold hover:shadow-lg transition">إرسال الطلب</button>
        </div>
      </div>
    </div>

    <div v-if="showDetailModal" class="fixed inset-0 bg-black/50 flex justify-center items-center z-[70] p-4">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
        <button @click="showDetailModal = false" class="absolute top-4 left-4 text-gray-400 hover:text-red-500 transition text-xl">✖</button>
        <h3 class="font-bold text-xl mb-6 text-gray-800 border-b pb-2">تفاصيل الطلب</h3>
        <div v-if="detailRequest" class="space-y-4 text-right">
          <div class="grid grid-cols-2 border-b pb-2">
            <span class="text-gray-500 text-sm">نوع الطلب:</span>
            <span class="text-sm font-bold">{{ detailRequest.typeName }}</span>
          </div>
          <div class="grid grid-cols-2 border-b pb-2">
            <span class="text-gray-500 text-sm">الحالة:</span>
            <span :class="statusBadgeClass(detailRequest.status)" class="text-xs px-2 py-0.5 rounded w-fit font-bold">{{ detailRequest.status }}</span>
          </div>
          <div v-if="detailRequest.purpose" class="border-b pb-2">
            <span class="text-gray-500 text-sm block mb-1">الجهة الموجه إليها:</span>
            <p class="text-sm bg-gray-50 p-2 rounded">{{ detailRequest.purpose }}</p>
          </div>
          <div v-if="detailRequest.reason" class="border-b pb-2">
            <span class="text-gray-500 text-sm block mb-1">السبب:</span>
            <p class="text-sm bg-gray-50 p-2 rounded">{{ detailRequest.reason }}</p>
          </div>
          <div v-if="detailRequest.imagePath" class="pt-2">
            <span class="text-gray-500 text-sm block mb-2">المرفقات:</span>
            <img :src="detailRequest.imagePath" class="rounded-lg max-h-48 w-full object-cover shadow-sm border" />
          </div>
        </div>
        <div class="mt-8">
          <button @click="showDetailModal = false" class="w-full bg-gray-100 py-2 rounded-lg font-bold hover:bg-gray-200 transition">إإغلاق</button>
        </div>
      </div>
    </div>

    <Toast v-if="toastMessage" :message="toastMessage" :type="toastType" />
  </div>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import api from "@/services/api";
import SidebarPage from "../components/Sidebar.vue";
import Navbar from "../components/Navbar.vue";
import Toast from "../components/Toast.vue";
import { EyeIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/vue/24/outline";

export default {
   name: "EmployeeRequestsPage",
  components: {
    SidebarPage,
    Navbar,
    Toast,
    EyeIcon,
    CheckCircleIcon,
    XCircleIcon,
  },

  setup() {
    const displayedRequests = ref([]);
    const toastMessage = ref("");
    const toastType = ref("success");

    const currentPage = ref(1);
    const itemsPerPage = ref(10);
const showModal = ref(false);
const selectedRequestType = ref("");
const form = ref({});
const errors = ref({});
    const paginatedRequests = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value;
      return displayedRequests.value.slice(start, start + itemsPerPage.value);
    });
const totalPages = computed(() => {
  return Math.ceil(displayedRequests.value.length / itemsPerPage.value);
});
    const showToast = (msg, type = "success") => {
      toastMessage.value = msg;
      toastType.value = type;
      setTimeout(() => (toastMessage.value = ""), 3000);
    };
const changePage = (newPage) => {
  if (newPage < 1 || newPage > totalPages.value) return;
  currentPage.value = newPage;

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};
const submitRequest = async () => {
  try {
    if (selectedRequestType.value === "update") {
      const formData = new FormData();

      formData.append("updateType", form.value.updateType || "");
      formData.append("newValue", form.value.newValue || "");
      formData.append("reason", form.value.reason || "");

     await api.post(
  "/DataUpdate/submit",
  formData,
  {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  }
);
    }

    else if (selectedRequestType.value === "salaryCertificate") {
      await api.post("/SalaryCertificate/submit", {
        purpose: form.value.purpose || ""
      });
    }

    else if (selectedRequestType.value === "permission") {
      const formData = new FormData();

      formData.append("permitType", form.value.permitType || "");
      formData.append("permitDate", form.value.permitDate || "");
      formData.append("fromTime", form.value.fromTime || "");
      formData.append("toTime", form.value.toTime || "");
      formData.append("reason", form.value.reason || "");

    await api.post(
  "/ExitPermit/create",
  formData,
  {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  }
);
    }

    else if (selectedRequestType.value === "maintenance") {
      const formData = new FormData();

      formData.append("equipmentName", form.value.equipmentName || "");
      formData.append("problemDescription", form.value.problemDescription || "");

      if (form.value.imageFile) {
        formData.append("imageFile", form.value.imageFile);
      }

      await api.post(
  "/Maintenance/submit",
  formData,
  {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  }
);
    }

    showToast("تم إرسال الطلب بنجاح");

    showModal.value = false;

    selectedRequestType.value = "";
    form.value = {};

    await fetchAllRequests();

  } catch (err) {
  console.log(err);
  console.log(err.response?.data);
  alert(JSON.stringify(err.response?.data));
}
};
    // ✅ جلب البيانات مع type مهم جداً
    const fetchAllRequests = async () => {
  try {
    const results = await Promise.allSettled([
      api.get("/DataUpdate/my-requests"),
      api.get("/SalaryCertificate/my-requests"),
      api.get("/ExitPermit/my-requests"),
      api.get("/Maintenance/my-requests"),
    ]);

    // ✅ دالة توحد شكل البيانات
    const extract = (res) => {
      if (!res || res.status !== "fulfilled") return [];
      const data = res.value?.data;

      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      if (Array.isArray(data?.Data)) return data.Data; // ExitPermit pagination response
      if (Array.isArray(data?.requests)) return data.requests; // safety (leave-like shape)

      return [];
    };

    const updates = extract(results[0]);
    const salaries = extract(results[1]);
    const permits = extract(results[2]);
    const maintenance = extract(results[3]);

    displayedRequests.value = [
      ...updates.map(r => ({
        ...r,
        typeName: "تعديل بيانات",
        type: "DataUpdate",
      })),

      ...salaries.map(r => ({
        ...r,
        typeName: "شهادة راتب",
        type: "SalaryCertificate",
      })),

      ...permits.map(r => ({
        ...r,
        typeName: "إذن خروج",
        type: "ExitPermit",
      })),

      ...maintenance.map(r => ({
        ...r,
        typeName: "طلب صيانة",
        type: "Maintenance",
      })),
    ].sort((a, b) => (b.id || 0) - (a.id || 0));

  } catch (err) {
    console.log(err);
    showToast("خطأ في تحميل البيانات", "error");
  }
};

    // ✅ أهم تعديل هنا
    const verifyRequest = async (req, isVerified) => {
      try {
        let url = "";

        switch (req.type) {
          case "DataUpdate":
            url = `/DataUpdate/verify/${req.id}?isVerified=${isVerified}`;
            break;

          case "SalaryCertificate":
            url = `/SalaryCertificate/verify/${req.id}?isVerified=${isVerified}`;
            break;

          case "Maintenance":
            url = `/Maintenance/verify/${req.id}?isVerified=${isVerified}`;
            break;

          default:
            return;
        }

        await api.post(url);

        req.status = isVerified
          ? "تمت_العملية"
          : "قيد_التنفيذ";

        showToast("تمت العملية بنجاح");
      } catch (err) {
        showToast("فشل في المصادقة", "error");
      }
    };

    const statusBadgeClass = (status) => {
      if (status === "تمت_العملية") return "text-green-600";
      if (status === "مرفوض") return "text-red-600";
      if (status === "في_انتظار_المصادقة") return "text-blue-600";
      return "text-gray-600";
    };
const onFileChange = (e) => {
  form.value.imageFile = e.target.files[0];
};
    const formatDate = (d) => (d ? d.split("T")[0] : "---");

    const openDetails = () => {};

  const openCreateModal = () => {
  showModal.value = true;
};

    onMounted(fetchAllRequests);

   return {
  paginatedRequests,
  verifyRequest,
  formatDate,
  statusBadgeClass,
  openDetails,
  openCreateModal,
  toastMessage,
  toastType,
  showModal,
  selectedRequestType,
  form,
  errors,
  currentPage,
  totalPages,
  changePage,

  submitRequest,
  onFileChange,
};
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
.font-cairo { font-family: 'Cairo', sans-serif; }
.input { @apply bg-gray-50 transition-all border border-gray-300 focus:border-primary outline-none; }
</style>