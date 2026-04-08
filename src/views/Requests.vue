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
          <h2 class="text-xl font-bold text-gray-800">الطلبات الخاصة بي</h2>
          <button
            @click="showModal = true"
            class="bg-primary hover:bg-green-700 text-white px-4 py-2 rounded-xl shadow transition-all flex items-center gap-2"
          >
            <span>+</span> تقديم طلب جديد
          </button>
        </div>

        <!-- Table -->
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
              <tr v-for="req in displayedRequests" :key="req.id" class="hover:bg-gray-50 transition">
                <td class="p-3 text-sm font-medium">{{ req.typeName }}</td>
                <td class="p-3 text-sm text-gray-500">{{ formatDate(req.date || req.createdAt) }}</td>
                <td class="p-3 text-sm">
                  <span :class="statusBadgeClass(req.status)" class="px-2 py-1 rounded-md text-xs font-bold">
                    {{ req.status }}
                  </span>
                </td>
                <td class="p-3 text-sm text-center">
                  <button @click="openDetails(req)" class="text-blue-600 hover:scale-110 transition inline-block">
                    <EyeIcon class="w-5 h-5" />
                  </button>
                </td>
              </tr>
              <tr v-if="!displayedRequests.length">
                <td colspan="4" class="text-center py-10 text-gray-400 italic">لا توجد طلبات متاحة حالياً</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal تقديم طلب جديد -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex justify-center items-center z-[60] p-4">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh]">
        <h3 class="font-bold text-xl mb-4 text-gray-800 border-b pb-2">تقديم طلب جديد</h3>

        <div class="space-y-4">
          <!-- اختيار نوع الطلب -->
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

          <!-- نموذج تعديل البيانات -->
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
              <input v-model="form.newValue" type="text" class="input w-full p-2 border rounded-lg bg-white" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">السبب</label>
              <textarea v-model="form.reason" rows="2" class="input w-full p-2 border rounded-lg bg-white"></textarea>
            </div>
          </div>

          <!-- شهادة راتب -->
          <div v-if="selectedRequestType === 'salaryCertificate'" class="p-3 bg-gray-50 rounded-lg">
            <label class="block text-sm font-medium mb-1">السبب</label>
            <input v-model="form.purpose" type="text" class="input w-full p-2 border rounded-lg bg-white" placeholder="مثلاً: مصرف الوحدة" />
          </div>

          <!-- إذن خروج -->
          <div v-if="selectedRequestType === 'permission'" class="space-y-3 p-3 bg-gray-50 rounded-lg">
            <label class="block text-sm font-medium mb-1">نوع الإذن</label>
            <div class="flex flex-wrap gap-2 mb-2">
              <label class="flex items-center gap-1 text-xs">
                <input type="radio" value="خروج_شخصي" v-model="form.permitType" class="accent-primary" /> شخصي
              </label>
              <label class="flex items-center gap-1 text-xs">
                <input type="radio" value="خروج_عاجل" v-model="form.permitType" class="accent-primary" /> عاجل
              </label>
              <label class="flex items-center gap-1 text-xs">
                <input type="radio" value="خروج_طبي" v-model="form.permitType" class="accent-primary" /> طبي
              </label>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <input v-model="form.permitDate" type="date" class="input w-full p-2 border rounded-lg text-xs" />
              <input v-model="form.permitTime" type="time" class="input w-full p-2 border rounded-lg text-xs" />
            </div>
            <textarea v-model="form.reason" placeholder="السبب..." rows="2" class="input w-full p-2 border rounded-lg bg-white"></textarea>
          </div>

          <!-- صيانة -->
          <div v-if="selectedRequestType === 'maintenance'" class="space-y-3 p-3 bg-gray-50 rounded-lg">
            <input v-model="form.equipmentName" placeholder="اسم الجهاز" class="input w-full p-2 border rounded-lg bg-white" />
            <textarea v-model="form.problemDescription" placeholder="وصف المشكلة" rows="2" class="input w-full p-2 border rounded-lg bg-white"></textarea>
            <input type="file" @change="onFileChange" class="w-full text-xs text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:bg-primary file:text-white" />
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-8">
          <button @click="showModal = false" class="bg-gray-200 px-5 py-2 rounded-lg font-medium hover:bg-gray-300 transition">إلغاء</button>
          <button @click="submitRequest" class="bg-primary text-white px-8 py-2 rounded-lg font-bold hover:shadow-lg transition">إرسال الطلب</button>
        </div>
      </div>
    </div>

    <!-- مودال عرض تفاصيل الطلب (نفس نمط التعديل) -->
    <div v-if="showDetailModal" class="fixed inset-0 bg-black/50 flex justify-center items-center z-[70] p-4">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
        <button @click="showDetailModal = false" class="absolute top-4 left-4 text-gray-400 hover:text-red-500 transition text-xl">✖</button>
        <h3 class="font-bold text-xl mb-6 text-gray-800 border-b pb-2">تفاصيل الطلب</h3>

        <div v-if="detailRequest" class="space-y-4">
          <div class="grid grid-cols-2 border-b pb-2">
            <span class="text-gray-500 text-sm">نوع الطلب:</span>
            <span class="text-sm font-bold">{{ detailRequest.typeName }}</span>
          </div>
          <div class="grid grid-cols-2 border-b pb-2">
            <span class="text-gray-500 text-sm">الحالة:</span>
            <span :class="statusBadgeClass(detailRequest.status)" class="text-xs px-2 py-0.5 rounded w-fit font-bold">
              {{ detailRequest.status }}
            </span>
          </div>
          <div v-if="detailRequest.reason" class="border-b pb-2">
            <span class="text-gray-500 text-sm block mb-1">السبب:</span>
            <p class="text-sm bg-gray-50 p-2 rounded">{{ detailRequest.reason }}</p>
          </div>
          <!-- صور الصيانة -->
          <div v-if="detailRequest.imagePath" class="pt-2">
            <span class="text-gray-500 text-sm block mb-2">المرفقات:</span>
            <img :src="detailRequest.imagePath" class="rounded-lg max-h-48 w-full object-cover shadow-sm border" />
          </div>
          <!-- بيانات أخرى بناءً على النوع -->
          <div v-if="detailRequest.newValue" class="text-sm">
             <span class="text-gray-500">القيمة الجديدة:</span> {{ detailRequest.newValue }}
          </div>
        </div>
        <div class="mt-8">
          <button @click="showDetailModal = false" class="w-full bg-gray-100 py-2 rounded-lg font-bold hover:bg-gray-200 transition">إغلاق</button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <Toast v-if="toastMessage" :message="toastMessage" :type="toastType" />
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import axios from "axios";
import SidebarPage from "../components/Sidebar.vue";
import Navbar from "../components/Navbar.vue";
import Toast from "../components/Toast.vue";
import { EyeIcon } from '@heroicons/vue/24/outline';

export default {
  name: "EmployeeRequestsPage",
  components: { SidebarPage, Navbar, EyeIcon, Toast },
  setup() {
    const showModal = ref(false);
    const showDetailModal = ref(false);
    const detailRequest = ref(null);
    const selectedRequestType = ref("");
    const displayedRequests = ref([]);
    
    const toastMessage = ref('');
    const toastType = ref('success');

    const form = ref({
      updateType: "الاسم_الكامل",
      newValue: "",
      reason: "",
      purpose: "",
      permitType: "خروج_شخصي",
      permitDate: "",
      permitTime: "",
      equipmentName: "",
      problemDescription: "",
      imageFile: null
    });

    const showToast = (msg, type = 'success') => {
      toastMessage.value = msg;
      toastType.value = type;
      setTimeout(() => toastMessage.value = '', 3000);
    };

    const statusBadgeClass = (status) => {
      if (['مقبول', 'جاهزة', 'تمت_الموافقة', 'تم_الإصلاح'].includes(status)) return 'bg-green-100 text-green-700';
      if (status === 'مرفوض') return 'bg-red-100 text-red-700';
      return 'bg-yellow-100 text-yellow-700';
    };

    const formatDate = (d) => d ? d.split("T")[0] : "---";

    const fetchAllRequests = async () => {
      try {
        axios.defaults.baseURL = "http://localhost:5205/api";
        axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;

        const [updates, salaries, permits, maintenance] = await Promise.all([
          axios.get("/DataUpdate/my-requests"),
          axios.get("/SalaryCertificate/my-requests"),
          axios.get("/ExitPermit/my-requests"),
          axios.get("/Maintenance/my-requests")
        ]);

        displayedRequests.value = [
          ...updates.data.map(r => ({ ...r, typeName: "تعديل بيانات" })),
          ...salaries.data.map(r => ({ ...r, typeName: "شهادة راتب" })),
          ...permits.data.map(r => ({ ...r, typeName: "إذن خروج" })),
          ...maintenance.data.map(r => ({ ...r, typeName: "طلب صيانة" }))
        ].sort((a, b) => b.id - a.id);
      } catch (err) {
        showToast('تعذر تحميل البيانات', 'error');
      }
    };

    const submitRequest = async () => {
      if (!selectedRequestType.value) return showToast('اختر نوع الطلب', 'error');
      
      try {
        let url = "", payload = null;
        const config = { headers: { 'Content-Type': 'multipart/form-data' } };

        if (selectedRequestType.value === 'update') {
          url = "/DataUpdate/submit";
          payload = new FormData();
          payload.append("UpdateType", form.value.updateType);
          payload.append("NewValue", form.value.newValue);
          payload.append("Reason", form.value.reason);
        } else if (selectedRequestType.value === 'salaryCertificate') {
          url = "/SalaryCertificate/submit";
          payload = { Purpose: form.value.purpose };
        } else if (selectedRequestType.value === 'permission') {
          url = "/ExitPermit/create";
          payload = new FormData();
          payload.append("PermitType", form.value.permitType);
          payload.append("PermitDate", form.value.permitDate);
          payload.append("PermitTime", form.value.permitTime);
          payload.append("Reason", form.value.reason);
        } else if (selectedRequestType.value === 'maintenance') {
          url = "/Maintenance/submit";
          payload = new FormData();
          payload.append("EquipmentName", form.value.equipmentName);
          payload.append("ProblemDescription", form.value.problemDescription);
          if (form.value.imageFile) payload.append("ImageFile", form.value.imageFile);
        }

        await axios.post(url, payload, (selectedRequestType.value !== 'salaryCertificate' ? config : {}));
        showToast('تم إرسال الطلب بنجاح');
        showModal.value = false;
        fetchAllRequests();
      } catch (err) {
        showToast('فشل في إرسال الطلب', 'error');
      }
    };

    const openDetails = (req) => {
      detailRequest.value = req;
      showDetailModal.value = true;
    };

    const onFileChange = (e) => form.value.imageFile = e.target.files[0];

    onMounted(fetchAllRequests);

    return {
      showModal, showDetailModal, detailRequest, selectedRequestType, displayedRequests, 
      form, submitRequest, onFileChange, openDetails, formatDate, statusBadgeClass,
      toastMessage, toastType
    };
  }
};
</script>

<style scoped>
.input { @apply bg-gray-50 transition-all; }
</style>