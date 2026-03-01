<template>
  <div dir="rtl" class="flex min-h-screen bg-gray-100">

    <!-- Sidebar -->
    <Sidebar class="fixed top-0 right-0 h-screen w-24 sm:w-28 md:w-60 z-50" />

    <!-- المحتوى -->
    <div class="flex-1 mr-24 sm:mr-28 md:mr-60 p-4 sm:p-6">

      <!-- Navbar -->
      <Navbar />

      <!-- الكارد -->
      <div class="bg-white rounded-xl shadow p-6 max-w-6xl mx-auto mt-4">

        <!-- العنوان -->
        <h3 class="text-xl font-bold mb-6 text-right text-green-900">
          إعدادات توجيه الطلبات
        </h3>

        <!-- زر فتح المودال -->
        <div class="flex justify-end mb-4">
          <button
            @click="openModal"
            class="bg-primary hover:bg-primaryDark text-white px-6 py-2 rounded-lg font-semibold transition shadow-md">
          >
            إضافة توجيه جديد
          </button>
        </div>

        <!-- جدول الطلبات -->
        <div class="overflow-x-auto">
          <table class="w-full border-collapse border border-gray-300">
            <thead class="bg-green-100">
              <tr>
                <th class="border p-2">نوع الطلب</th>
                <th class="border p-2">الإدارة المرتبطة</th>
                <th class="border p-2">المدير الحالي</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="routing in routings" :key="routing.requestType" class="hover:bg-green-50">
                <td class="border p-2">{{ requestTypeLabel(routing.requestType) }}</td>
                <td class="border p-2">{{ routing.subDepartment?.name || defaultDeptName() }}</td>
                <td class="border p-2">{{ routing.subDepartment?.managerName || defaultDeptManager() }}</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>

    <!-- مودال الإضافة -->
    <div v-if="showModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div class="bg-white p-6 rounded-xl w-full max-w-md space-y-4 shadow-lg">

        <h2 class="text-lg font-bold text-green-900">توجيه طلب جديد</h2>

        <div class="grid grid-cols-1 gap-4">
          <div class="flex flex-col">
            <label class="text-sm text-gray-600 mb-1">نوع الطلب</label>
            <select v-model="form.requestType" class="input">
              <option v-for="(label, key) in requestTypes" :key="key" :value="key">
                {{ label }}
              </option>
            </select>
          </div>

          <div class="flex flex-col">
            <label class="text-sm text-gray-600 mb-1">الإدارة</label>
            <select v-model="form.deptId" class="input">
              <option v-for="dept in subDepartments" :key="dept.id" :value="dept.id">
                {{ dept.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="flex justify-end gap-2 mt-4">
          <button @click="saveRouting" class="bg-primary text-white px-4 py-2 rounded-xl hover:bg-green-700 font-semibold">حفظ</button>
          <button @click="closeModal" class="bg-gray-300 px-4 py-2 rounded-xl hover:bg-gray-400 font-semibold">إلغاء</button>
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

  </div>
</template>

<script>
import Sidebar from "../components/Sidebar.vue";
import Navbar from "../components/Navbar.vue";
import axios from 'axios';
import { ref, onMounted } from 'vue';

export default {
  name: "RequestSettingsPage",
  components: { Sidebar, Navbar },
  setup() {
    const routings = ref([]);
    const subDepartments = ref([]);
    const showModal = ref(false);
    const form = ref({
      requestType: 'Maintenance',
      deptId: null
    });

    const requestTypes = {
      Maintenance: "صيانة",
      SalaryCertificate: "شهادة راتب",
      ExitPermit: "استئدان خروج",
      DataUpdate: "تحديث بيانات"
    };

    // Axios baseURL + Authorization
    axios.defaults.baseURL = "http://localhost:5205"; 
    const token = localStorage.getItem('token');
    if(token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    const loadSubDepartments = async () => {
      try {
        const { data } = await axios.get("/api/RequestSettings/sub-departments");
        subDepartments.value = data;
      } catch(err) {
        console.error(err);
        showToast('تعذر تحميل الإدارات ❌', 'error');
      }
    };

    const loadRoutings = async () => {
      try {
        const { data } = await axios.get("/api/RequestSettings/all-routings");
        routings.value = Object.keys(requestTypes).map(key => {
          const match = data.find(r => r.requestType === key);
          return match || { requestType: key, subDepartment: null, id: null };
        });
      } catch(err) {
        console.error(err);
        showToast('تعذر تحميل التوجيهات ❌', 'error');
      }
    };

    const requestTypeLabel = (type) => requestTypes[type] || type;

    const defaultDeptName = () => {
      const dept = subDepartments.value[0];
      return dept ? dept.name : '-';
    };

    const defaultDeptManager = () => {
      const dept = subDepartments.value[0];
      return dept ? dept.managerName || '-' : '-';
    };

    const openModal = () => showModal.value = true;
    const closeModal = () => showModal.value = false;

    const toastMessage = ref('');
    const toastType = ref('success');
    const showToast = (msg, type = 'success') => {
      toastMessage.value = msg;
      toastType.value = type;
      setTimeout(() => toastMessage.value = '', 3000);
    };

 const saveRouting = async () => {
  if(!form.value.requestType || !form.value.deptId){
    showToast('الرجاء ملء جميع الحقول ❌', 'error');
    return;
  }
  try {
    console.log("Saving routing:", form.value.requestType, form.value.deptId);

    await axios.post("/api/RequestSettings/set-routing", null, {
      params: {
        type: form.value.requestType,
        deptId: form.value.deptId
      }
    });

    await loadRoutings();
    closeModal();
    showToast('تم حفظ التوجيه بنجاح ✅', 'success');
  } catch(err) {
    console.error(err);
    showToast('تعذر حفظ التوجيه ❌', 'error');
  }
};

    onMounted(async () => {
      await loadSubDepartments();
      await loadRoutings();
    });

    return {
      routings,
      subDepartments,
      showModal,
      form,
      requestTypes,
      requestTypeLabel,
      defaultDeptName,
      defaultDeptManager,
      openModal,
      closeModal,
      saveRouting,
      toastMessage,
      toastType
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