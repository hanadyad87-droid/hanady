<template>
  <div dir="rtl" class="flex min-h-screen bg-gray-100 font-cairo">

    <!-- Sidebar -->
    <Sidebar class="fixed top-0 right-0 h-screen w-24 sm:w-28 md:w-60 z-50" />

    <!-- المحتوى -->
    <div class="flex-1 mr-24 sm:mr-28 md:mr-60 p-4 sm:p-6">

      <!-- Navbar -->
      <Navbar />

      <!-- الكارد الرئيسي -->
      <div class="bg-white rounded-2xl shadow-lg p-6 mt-4 max-w-6xl mx-auto">

        <!-- العنوان والزر العلوي -->
        <div class="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b pb-4">
          <div>
            <h3 class="text-xl font-bold text-gray-800">إعدادات توجيه الطلبات</h3>
            <p class="text-sm text-gray-500 mt-1">تحديد الإدارات المسؤولة عن استقبال ومعالجة طلبات الموظفين</p>
          </div>
          <button
            @click="openModal"
            class="bg-primary hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
          >
            <span class="text-lg">+</span> إضافة توجيه جديد
          </button>
        </div>

        <!-- جدول التوجيهات -->
        <div class="overflow-x-auto rounded-xl border border-gray-100">
          <table class="min-w-full divide-y divide-gray-200 text-right">
            <thead class="bg-navbar">
              <tr>
                <th class="px-6 py-4 text-sm font-bold text-gray-600">نوع الطلب</th>
                <th class="px-6 py-4 text-sm font-bold text-gray-600">الإدارة المرتبطة</th>
                <th class="px-6 py-4 text-sm font-bold text-gray-600">المدير المسؤول</th>
                <th class="px-6 py-4 text-sm font-bold text-gray-600 text-center">الحالة</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-100">
              <tr v-for="routing in routings" :key="routing.requestType" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 text-sm font-semibold text-gray-700">
                  <div class="flex items-center gap-3">
                    <div class="w-2 h-2 rounded-full bg-primary"></div>
                    {{ requestTypeLabel(routing.requestType) }}
                  </div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-600">
                  {{ routing.subDepartment?.name || defaultDeptName() }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-600 italic">
                  {{ routing.subDepartment?.managerName || defaultDeptManager() }}
                </td>
                <td class="px-6 py-4 text-center">
                  <span class="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-bold">نشط</span>
                </td>
              </tr>
              <tr v-if="routings.length === 0">
                <td colspan="4" class="text-center py-10 text-gray-400">لا توجد بيانات توجيه حالياً</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>

    <!-- مودال الإضافة (Compact Style) -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
      <div class="bg-white rounded-2xl w-full max-w-md shadow-2xl transform transition-all overflow-hidden">
        
        <!-- رأس المودال -->
        <div class="bg-primary p-4 text-white flex justify-between items-center">
          <h2 class="font-bold text-lg">تعديل توجيه الطلبات</h2>
          <button @click="closeModal" class="text-white/80 hover:text-white transition">✖</button>
        </div>

        <div class="p-6 space-y-5">
          <!-- اختيار نوع الطلب -->
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2 mr-1">نوع الطلب</label>
            <select v-model="form.requestType" class="input-modern">
              <option v-for="(label, key) in requestTypes" :key="key" :value="key">
                {{ label }}
              </option>
            </select>
          </div>

          <!-- اختيار الإدارة -->
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2 mr-1">الإدارة المستلمة للطلب</label>
            <select v-model="form.deptId" class="input-modern">
              <option :value="null" disabled>اختر الإدارة المناسبة</option>
              <option v-for="dept in subDepartments" :key="dept.id" :value="dept.id">
                {{ dept.name }}
              </option>
            </select>
          </div>

          <!-- تنبيه بسيط -->
          <div class="bg-blue-50 p-3 rounded-lg flex items-start gap-3">
            <span class="text-blue-500 mt-0.5 text-lg">ℹ️</span>
            <p class="text-[11px] text-blue-700 leading-relaxed">
              سيتم تحويل جميع الطلبات من هذا النوع تلقائياً إلى مدير الإدارة المختارة للموافقة عليها أو رفضها.
            </p>
          </div>
        </div>

        <!-- أزرار التحكم -->
        <div class="p-6 bg-gray-50 flex justify-end gap-3 border-t">
          <button @click="closeModal" class="bg-gray-200 text-gray-700 px-5 py-2 rounded-xl font-bold hover:bg-gray-300 transition">إلغاء</button>
          <button @click="saveRouting" class="bg-primary text-white px-8 py-2 rounded-xl font-bold hover:shadow-lg transition">حفظ التعديلات</button>
        </div>

      </div>
    </div>

    <!-- Toast المخصص -->
    <Toast v-if="toastMessage" :message="toastMessage" :type="toastType" />

  </div>
</template>

<script>
import Sidebar from "../components/Sidebar.vue";
import Navbar from "../components/Navbar.vue";
import Toast from "../components/Toast.vue"; // تأكد من استيراد الـ Toast الخاص بك
import axios from 'axios';
import { ref, onMounted } from 'vue';

export default {
  name: "RequestSettingsPage",
  components: { Sidebar, Navbar, Toast },
  setup() {
    const routings = ref([]);
    const subDepartments = ref([]);
    const showModal = ref(false);
    const toastMessage = ref('');
    const toastType = ref('success');

    const form = ref({
      requestType: 'Maintenance',
      deptId: null
    });

    const requestTypes = {
      Maintenance: "طلبات الصيانة",
      SalaryCertificate: "شهادات الراتب",
      ExitPermit: "أذونات الخروج",
      DataUpdate: "تحديث البيانات الشخصية"
    };

    const showToast = (msg, type = 'success') => {
      toastMessage.value = msg;
      toastType.value = type;
      setTimeout(() => toastMessage.value = '', 3000);
    };

    const loadSubDepartments = async () => {
      try {
        const { data } = await axios.get("/api/RequestSettings/sub-departments");
        subDepartments.value = data;
      } catch(err) {
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
        showToast('تعذر تحميل البيانات ❌', 'error');
      }
    };

    const requestTypeLabel = (type) => requestTypes[type] || type;
    const defaultDeptName = () => "غير محدد";
    const defaultDeptManager = () => "---";

    const openModal = () => showModal.value = true;
    const closeModal = () => showModal.value = false;

    const saveRouting = async () => {
      if(!form.value.deptId){
        showToast('يرجى اختيار الإدارة ⚠️', 'error');
        return;
      }
      try {
        await axios.post("/api/RequestSettings/set-routing", null, {
          params: { type: form.value.requestType, deptId: form.value.deptId }
        });
        await loadRoutings();
        closeModal();
        showToast('تم تحديث إعدادات التوجيه بنجاح ✅');
      } catch(err) {
        showToast('خطأ في الحفظ ❌', 'error');
      }
    };

    onMounted(async () => {
      axios.defaults.baseURL = "http://localhost:5205";
      const token = localStorage.getItem('token');
      if(token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      await loadSubDepartments();
      await loadRoutings();
    });

    return {
      routings, subDepartments, showModal, form, requestTypes,
      requestTypeLabel, defaultDeptName, defaultDeptManager,
      openModal, closeModal, saveRouting, toastMessage, toastType
    };
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');

.font-cairo {
  font-family: 'Cairo', sans-serif;
}

.input-modern {
  @apply w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>