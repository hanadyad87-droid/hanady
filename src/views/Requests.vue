<template>
  <div class="flex min-h-screen bg-white" dir="rtl">

    <!-- Sidebar -->
    <SidebarPage class="fixed top-0 right-0 h-screen w-24 md:w-64 z-50" />

    <!-- المحتوى الرئيسي -->
    <div class="flex-1 p-6 mr-24 md:mr-64">

      <!-- Navbar -->
      <Navbar />

      <!-- كارد الطلبات -->
      <div class="card p-6 bg-white rounded-xl shadow-lg mt-4">
        <h3 class="text-xl font-bold text-bg-primary mb-4 text-right">الطلبات الخاصة بي</h3>

        <!-- زر فتح المودال -->
        <div class="flex justify-end mb-4">
          <button @click="showModal = true"
                  class="bg-primary hover:bg-green-700 text-white px-4 py-2 rounded-xl font-semibold shadow-md">
            تقديم طلب جديد
          </button>
        </div>

        <!-- جدول الطلبات -->
        <div class="overflow-x-auto">
         <table class="min-w-full divide-y divide-gray-200 text-right">
  <thead class="bg-navbar">
    <tr>
      <th class="px-4 py-2 text-sm font-medium text-gray-700">نوع الطلب</th>
      <th class="px-4 py-2 text-sm font-medium text-gray-700">التاريخ</th>
      <th class="px-4 py-2 text-sm font-medium text-gray-700">الحالة</th>
      <th class="px-4 py-2 text-sm font-medium text-gray-700">الإجراءات</th>
    </tr>
  </thead>
  <tbody class="divide-y divide-gray-200">
    <tr v-for="req in displayedRequests" :key="req.id" class="hover:bg-gray-50">
      <td class="px-4 py-2 text-sm text-gray-700">{{ req.typeName }}</td>
      <td class="px-4 py-2 text-sm text-gray-700">{{ req.date || req.createdAt }}</td>
      <td class="px-4 py-2 text-sm"
          :class="{
            'text-green-600': ['مقبول','جاهزة','تمت_الموافقة','تم_الإصلاح'].includes(req.status),
            'text-red-600': req.status==='مرفوض',
            'text-yellow-600': ['قيد_الانتظار','تحت المراجعة'].includes(req.status)
          }">
        {{ req.status }}
      </td>
      <td class="px-4 py-2 text-sm">
       <button
    @click="openDetails(req)"
    title="عرض التفاصيل"
    class="text-blue-500 hover:text-blue-700"
  >
    <EyeIcon class="w-6 h-6" />
  </button>
      </td>
    </tr>
  </tbody>
</table>
        </div>

      </div>
    </div>

    <!-- مودال تقديم طلب جديد -->
    <div v-if="showModal" class="fixed inset-0 bg-black/40 flex items-start justify-center z-50 p-4 pt-20">
      <div class="bg-white p-6 rounded-xl w-full max-w-lg shadow-lg space-y-4">

        <h2 class="text-lg font-bold text-green-900">تقديم طلب جديد</h2>

        <!-- اختيار نوع الطلب -->
        <div class="flex flex-col">
          <label class="text-sm text-gray-600 mb-1">نوع الطلب</label>
          <select v-model="selectedRequestType" class="input">
            <option value="">اختر نوع الطلب</option>
            <option value="update">طلب تعديل بيانات</option>
            <option value="salaryCertificate">طلب شهادة راتب</option>
            <option value="permission">طلب إذن خروج</option>
            <option value="maintenance">طلب صيانة</option>
          </select>
        </div>

        <!-- نموذج حسب النوع -->
        <div v-if="selectedRequestType==='update'" class="grid grid-cols-1 gap-2">
          <label>نوع التعديل</label>
          <select v-model="form.updateType" class="input">
            <option value="الاسم_الكامل">الاسم الكامل</option>
            <option value="الإدارة">الإدارة</option>
            <option value="المسمى_الوظيفي">المسمى الوظيفي</option>
            <option value="الرقم_الوطني">الرقم الوطني</option>
            <option value="رقم_الهاتف_الأول">رقم الهاتف 1</option>
            <option value="رقم_الهاتف_الثاني">رقم الهاتف 2</option>
          </select>
          <label>القيمة الجديدة</label>
          <input v-model="form.newValue" type="text" class="input"/>
          <label>السبب</label>
          <textarea v-model="form.reason" rows="3" class="input"></textarea>
        </div>

        <div v-if="selectedRequestType==='salaryCertificate'">
          <label>الغرض</label>
          <input v-model="form.purpose" type="text" class="input"/>
        </div>

        <div v-if="selectedRequestType==='permission'" class="grid grid-cols-1 gap-2">
          <label>نوع الإذن</label>
          <select v-model="form.permitType" class="input">
            <option value="خروج_عاجل">خروج عاجل</option>
            <option value="خروج_شخصي">خروج شخصي</option>
            <option value="خروج_طبي">خروج طبي</option>
          </select>
          <label>التاريخ</label>
          <input v-model="form.permitDate" type="date" class="input"/>
          <label>الوقت</label>
          <input v-model="form.permitTime" type="time" class="input"/>
          <label>السبب</label>
          <textarea v-model="form.reason" rows="2" class="input"></textarea>
        </div>

        <div v-if="selectedRequestType==='maintenance'" class="grid grid-cols-1 gap-2">
          <label>اسم الجهاز</label>
          <input v-model="form.equipmentName" type="text" class="input"/>
          <label>وصف المشكلة</label>
          <textarea v-model="form.problemDescription" rows="3" class="input"></textarea>
          <label>رفع صورة (اختياري)</label>
          <input type="file" @change="onFileChange" class="input"/>
        </div>

        <div class="flex justify-end gap-2 mt-2">
          <button @click="submitRequest" class="bg-primary text-white px-4 py-2 rounded-xl hover:bg-green-700 font-semibold">إرسال</button>
          <button @click="showModal=false" class="bg-gray-300 px-4 py-2 rounded-xl hover:bg-gray-400 font-semibold">إلغاء</button>
        </div>

      </div>
    </div>

   <!-- مودال عرض تفاصيل الطلب -->
<div v-if="showDetailModal" class="fixed inset-0 bg-black/40 flex items-start justify-center z-50 p-4 pt-20">
  <div class="bg-white p-6 rounded-xl w-full max-w-lg shadow-lg space-y-4 relative">
    
    <!-- زر الإغلاق X أعلى المودال -->
    <button @click="showDetailModal = false" 
            class="absolute top-3 left-3 text-gray-500 hover:text-gray-700 text-lg">
      ✖
    </button>

    <h2 class="text-lg font-bold text-green-900">تفاصيل الطلب</h2>

    <div v-if="detailRequest" class="space-y-2">
      <p><strong>نوع الطلب:</strong> {{ detailRequest.typeName }}</p>
      <p v-if="detailRequest.status"><strong>الحالة:</strong> {{ detailRequest.status }}</p>
      <p v-if="detailRequest.reason"><strong>السبب:</strong> {{ detailRequest.reason }}</p>
      <p v-if="detailRequest.newValue"><strong>القيمة الجديدة:</strong> {{ detailRequest.newValue }}</p>
      <p v-if="detailRequest.purpose"><strong>الغرض:</strong> {{ detailRequest.purpose }}</p>
      <p v-if="detailRequest.permitType"><strong>نوع الإذن:</strong> {{ detailRequest.permitType }}</p>
      <p v-if="detailRequest.permitDate"><strong>التاريخ:</strong> {{ detailRequest.permitDate }}</p>
      <p v-if="detailRequest.permitTime"><strong>الوقت:</strong> {{ detailRequest.permitTime }}</p>
      <p v-if="detailRequest.equipmentName"><strong>اسم الجهاز:</strong> {{ detailRequest.equipmentName }}</p>
      <p v-if="detailRequest.problemDescription"><strong>وصف المشكلة:</strong> {{ detailRequest.problemDescription }}</p>
      <p v-if="detailRequest.imagePath">
        <strong>الصورة:</strong>
        <img :src="detailRequest.imagePath" class="mt-2 rounded-lg max-h-60 w-full object-contain" />
      </p>
    </div>

  </div>
</div>

    <!-- Toast -->
    <transition name="fade">
      <div v-if="toastMessage" class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
               px-6 py-3 rounded-lg shadow-lg text-white text-center z-[999]"
           :class="toastType === 'success' ? 'bg-green-600' : 'bg-red-600'">
        {{ toastMessage }}
      </div>
    </transition>

  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import axios from "axios";
import SidebarPage from "../components/Sidebar.vue";
import Navbar from "../components/Navbar.vue";
import { EyeIcon } from '@heroicons/vue/24/outline';
export default {
  name: "EmployeeRequestsPage",
  components: { SidebarPage, Navbar,EyeIcon},
  setup() {
    const showModal = ref(false);
    const selectedRequestType = ref("");
    const displayedRequests = ref([]);
    const allRequests = ref([]);
    const form = ref({
      updateType: "",
      newValue: "",
      reason: "",
      purpose: "",
      permitType: "",
      permitDate: "",
      permitTime: "",
      equipmentName: "",
      problemDescription: "",
      imageFile: null
    });

    const toastMessage = ref('');
    const toastType = ref('success');
    const showToast = (msg, type='success') => {
      toastMessage.value = msg;
      toastType.value = type;
      setTimeout(() => toastMessage.value = '', 3000);
    };

    // المودال عرض التفاصيل
    const showDetailModal = ref(false);
    const detailRequest = ref(null);
    const openDetails = (req) => {
      detailRequest.value = req;
      showDetailModal.value = true;
    };

    // ضبط الـ baseURL
    axios.defaults.baseURL = "http://localhost:5205/api";
    axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;

    const fetchAllRequests = async () => {
      try {
        const [updates, salaries, permits, maintenance] = await Promise.all([
          axios.get("/DataUpdate/my-requests"),
          axios.get("/SalaryCertificate/my-requests"),
          axios.get("/ExitPermit/my-requests"),
          axios.get("/Maintenance/my-requests")
        ]);

        allRequests.value = [
          ...updates.data.map(r => ({ ...r, typeName:"طلب تعديل بيانات", type:"update" })),
          ...salaries.data.map(r => ({ ...r, typeName:"طلب شهادة راتب", type:"salaryCertificate" })),
          ...permits.data.map(r => ({ ...r, typeName:"طلب إذن خروج", type:"permission" })),
          ...maintenance.data.map(r => ({ ...r, typeName:"طلب صيانة", type:"maintenance" }))
        ];
        displayedRequests.value = allRequests.value;
      } catch(err) {
        console.error(err);
        showToast('تعذر تحميل الطلبات ❌','error');
      }
    };

    const submitRequest = async () => {
      if(!selectedRequestType.value){
        showToast('اختر نوع الطلب أولاً ❌','error');
        return;
      }
      try {
        let url="", payload=null;
        switch(selectedRequestType.value){
          case "update":
            url="/DataUpdate/submit";
            payload = new FormData();
            payload.append("UpdateType", form.value.updateType);
            payload.append("NewValue", form.value.newValue);
            payload.append("Reason", form.value.reason);
            break;
          case "salaryCertificate":
            url="/SalaryCertificate/submit";
            payload = { Purpose: form.value.purpose };
            break;
          case "permission":
            url="/ExitPermit/create";
            payload = new FormData();
            payload.append("PermitType", form.value.permitType);
            payload.append("PermitDate", form.value.permitDate);
            payload.append("PermitTime", form.value.permitTime);
            payload.append("Reason", form.value.reason);
            break;
          case "maintenance":
            url="/Maintenance/submit";
            payload = new FormData();
            payload.append("EquipmentName", form.value.equipmentName);
            payload.append("ProblemDescription", form.value.problemDescription);
            if(form.value.imageFile) payload.append("ImageFile", form.value.imageFile);
            break;
        }

        await axios.post(url, payload);
        await fetchAllRequests();
        showModal.value = false;
        showToast('تم إرسال الطلب بنجاح ✅','success');

      } catch(err){
        console.error(err);
        showToast('حدث خطأ أثناء إرسال الطلب ❌','error');
      }
    };

    const onFileChange = (e) => form.value.imageFile = e.target.files[0];

    onMounted(() => fetchAllRequests());

    return {
      showModal, selectedRequestType, displayedRequests, form,
      submitRequest, onFileChange,
      toastMessage, toastType,
      showDetailModal, detailRequest, openDetails
    };
  }
};
</script>

<style scoped>
.input {
  @apply p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>