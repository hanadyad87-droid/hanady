<template>
  <div class="flex min-h-screen bg-gray-100 font-cairo" dir="rtl">
    <!-- Sidebar -->
    <Sidebar />

    <!-- Main content -->
    <div class="flex-1 w-full min-w-0 p-4 sm:p-6 mr-0 lg:mr-60">
      <Navbar />

      <!-- Card -->
      <div class="bg-white rounded-2xl shadow-lg p-6 mt-4">
        <!-- Header -->
        <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div>
            <h2 class="text-xl font-bold text-gray-800">إدارة التكليفات الإدارية</h2>
            <p class="text-sm text-gray-500 mt-1">تكليف الموظفين بمهام إدارية لفترات محددة</p>
          </div>
          <button
            @click="openAddModal"
            class="bg-primary hover:bg-green-700 text-white px-6 py-2.5 rounded-xl shadow transition-all flex items-center gap-2 font-bold"
          >
            <PlusIcon class="w-5 h-5" />
            إضافة تكليف جديد
          </button>
        </div>

        <!-- Search Table -->
        <div class="relative mb-4">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="بحث في الجدول (اسم الموظف، الكيان)..."
            class="w-full p-2.5 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm transition-all bg-gray-50"
          />
          <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" />
          </div>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table class="min-w-full text-right divide-y divide-gray-200">
            <thead class="bg-navbar">
              <tr>
                <th class="p-4 text-sm font-bold text-gray-700">الموظف المكلف</th>
                <th class="p-4 text-sm font-bold text-gray-700">المدير الأصلي</th>
                <th class="p-4 text-sm font-bold text-gray-700">الكيان الإداري</th>
                <th class="p-4 text-sm font-bold text-gray-700 text-center">الفترة الزمنية</th>
                <th class="p-4 text-sm font-bold text-gray-700 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-100">
              <tr 
                v-for="d in filteredDelegations" 
                :key="d.id" 
                class="hover:bg-gray-50 transition-colors text-sm"
              >
                <td class="p-4 font-semibold text-gray-800">{{ d.actingManagerName }}</td>
                <td class="p-4 text-gray-600">{{ d.originalManagerName }}</td>
                <td class="p-4">
                  <span class="block font-medium text-blue-700">{{ d.entityName || 'غير محدد' }}</span>
                  <span class="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 uppercase">
                    {{ d.entityType === 'Section' ? 'قسم' : 'إدارة فرعية' }}
                  </span>
                </td>
                <td class="p-4 text-center">
                  <div class="flex items-center justify-center gap-2 text-xs font-mono text-gray-500">
                    <span class="bg-green-50 text-green-700 px-2 py-1 rounded border border-green-100">{{ formatDate(d.startDate) }}</span>
                    <span>⬅️</span>
                    <span class="bg-red-50 text-red-700 px-2 py-1 rounded border border-red-100">{{ formatDate(d.endDate) }}</span>
                  </div>
                </td>
                <td class="p-4 text-center">
                  <button 
                    @click="askRevoke(d.id)" 
                    class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all" 
                    title="إلغاء التكليف"
                  >
                    <TrashIcon class="w-5 h-5" />
                  </button>
                </td>
              </tr>
              <tr v-if="filteredDelegations.length === 0">
                <td colspan="5" class="text-center py-20">
                  <div class="flex flex-col items-center">
                    <BriefcaseIcon class="w-12 h-12 text-gray-200 mb-2" />
                    <p class="text-gray-400 italic">لا توجد تكليفات نشطة تطابق بحثك</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal إضافة تكليف -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex justify-center items-center z-[60] p-4 backdrop-blur-sm">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-fade-in">
        <h3 class="font-bold text-xl mb-6 text-gray-800 flex items-center gap-2">
            <ArrowsRightLeftIcon class="w-6 h-6 text-primary" />
            إنشاء تكليف إداري جديد
        </h3>

        <div class="space-y-4">
          <!-- Employee Selection (Searchable) -->
          <div class="relative">
            <label class="block text-sm font-bold text-gray-600 mb-1">الموظف المُراد تكليفه</label>
            <div class="flex gap-2">
              <input 
                v-model="empSearch" 
                :placeholder="form.actingManager ? 'تم اختيار الموظف' : 'ابحث عن موظف...'" 
                class="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-primary outline-none bg-gray-50"
                :disabled="form.actingManager !== null" 
              />
              <button v-if="form.actingManager" @click="resetEmployeeSelection" class="text-red-500 text-xs underline">تغيير</button>
            </div>
            <ul v-if="filteredEmployees.length && empSearch.length > 0 && !form.actingManager" 
                class="absolute bg-white border w-full mt-1 rounded-xl shadow-xl max-h-40 overflow-y-auto z-[70] p-1">
              <li v-for="emp in filteredEmployees" :key="emp.id"
                  @click="selectEmployee(emp)"
                  class="p-2.5 hover:bg-blue-50 cursor-pointer border-b last:border-0 text-sm rounded-lg transition-colors">
                {{ emp.fullName }}
              </li>
            </ul>
          </div>

          <!-- End Date -->
          <div>
            <label class="block text-sm font-bold text-gray-600 mb-1">تاريخ نهاية التكليف</label>
            <input type="date" v-model="form.endDate" class="w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-primary bg-gray-50" />
          </div>

          <!-- Entity Type -->
          <div>
            <label class="block text-sm font-bold text-gray-600 mb-1">نوع الكيان</label>
            <select v-model="form.targetEntityType" @change="onTypeChange" class="w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-primary bg-gray-50">
              <option :value="null">اختر النوع</option>
              <option value="Section">قسم</option>
              <option value="SubDepartment">إدارة فرعية</option>
            </select>
          </div>

          <!-- Target Entity -->
          <div>
            <label class="block text-sm font-bold text-gray-600 mb-1">الجهة أو الكيان المستهدف</label>
            <select v-model="form.targetEntityId" class="w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-primary bg-gray-50">
              <option :value="null">اختر الكيان</option>
              <option v-for="t in targets" :key="t.id" :value="t.id">{{ t.name }}</option>
            </select>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-8">
          <button @click="closeModal" class="flex-1 bg-gray-100 px-5 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-200 transition">إلغاء</button>
          <button @click="saveDelegation" class="flex-1 bg-primary text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition">
            تنفيذ التكليف
          </button>
        </div>
      </div>
    </div>

    <!-- Confirm Revoke (Delete) -->
    <div v-if="confirmRevokeId !== null" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] backdrop-blur-sm">
      <div class="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm text-center border border-red-50">
        <div class="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center text-red-600 mx-auto mb-4 font-bold text-2xl">!</div>
        <h3 class="text-xl font-bold text-gray-800 mb-2">إلغاء التكليف؟</h3>
        <p class="text-sm text-gray-500 mb-8 leading-relaxed">أنت على وشك سحب صلاحيات التكليف الإداري، هل تريد المتابعة؟</p>
        <div class="flex justify-center gap-4">
          <button @click="confirmRevokeId = null" class="flex-1 px-6 py-3 rounded-xl border border-gray-300 font-bold text-gray-500">تراجع</button>
          <button @click="revokeDelegation(confirmRevokeId)" class="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all">نعم، إلغاء</button>
        </div>
      </div>
    </div>

    <Toast v-if="showToast" :message="toastMsg" :type="toastType" />
  </div>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import Sidebar from "@/components/Sidebar.vue";
import Navbar from "@/components/Navbar.vue";
import Toast from "@/components/Toast.vue";
import api from "@/services/api";
import { 
  MagnifyingGlassIcon, PlusIcon, TrashIcon, BriefcaseIcon, 
  ArrowsRightLeftIcon
} from "@heroicons/vue/24/outline";

export default {
  components: { Sidebar, Navbar, Toast, MagnifyingGlassIcon, PlusIcon, TrashIcon, BriefcaseIcon, ArrowsRightLeftIcon },

  setup() {
    const activeDelegations = ref([]);
    const employees = ref([]);
    const sections = ref([]);
    const subDepartments = ref([]);
    const targets = ref([]);
    
    const showModal = ref(false);
    const empSearch = ref("");
    const searchQuery = ref("");
    const confirmRevokeId = ref(null);

    const form = ref({
      actingManager: null,
      endDate: "",
      targetEntityType: null,
      targetEntityId: null
    });

    const showToast = ref(false);
    const toastMsg = ref("");
    const toastType = ref("success");

    const triggerToast = (msg, type = "success") => {
      toastMsg.value = msg;
      toastType.value = type;
      showToast.value = true;
      setTimeout(() => (showToast.value = false), 3000);
    };

    const fetchData = async () => {
      try {
        const [emp, sec, sub, active] = await Promise.all([
          api.get("/Delegation/AvailableEmployees"),
          api.get("/Organization/Sections"),
          api.get("/Organization/SubDepartments"),
          api.get("/Delegation/ActiveDelegations")
        ]);
        employees.value = emp.data;
        sections.value = sec.data;
        subDepartments.value = sub.data;
        activeDelegations.value = active.data;
      } catch {
        triggerToast("خطأ في تحميل البيانات", "error");
      }
    };

    const filteredDelegations = computed(() => {
      const s = searchQuery.value.toLowerCase();
      return activeDelegations.value.filter(d => 
        d.actingManagerName.toLowerCase().includes(s) || 
        (d.entityName || "").toLowerCase().includes(s)
      );
    });

    const filteredEmployees = computed(() =>
      employees.value.filter(e => e.fullName?.toLowerCase().includes(empSearch.value.toLowerCase()))
    );

    const selectEmployee = (emp) => {
      form.value.actingManager = emp;
      empSearch.value = emp.fullName;
    };

    const resetEmployeeSelection = () => {
      form.value.actingManager = null;
      empSearch.value = "";
    };

    const onTypeChange = () => {
      if (form.value.targetEntityType === "Section") targets.value = sections.value;
      else if (form.value.targetEntityType === "SubDepartment") targets.value = subDepartments.value;
      else targets.value = [];
      form.value.targetEntityId = null;
    };

    const openAddModal = () => {
      resetForm();
      showModal.value = true;
    };

    const saveDelegation = async () => {
      if (!form.value.actingManager || !form.value.endDate || !form.value.targetEntityId) {
        return triggerToast("يرجى ملء كافة الحقول", "error");
      }

      try {
        const payload = new FormData();
        payload.append('actingManagerId', form.value.actingManager.id);
        payload.append('endDate', form.value.endDate);
        payload.append('targetEntityType', form.value.targetEntityType);
        payload.append('targetEntityId', form.value.targetEntityId);

        await api.post("/Delegation/CreateDelegation", payload);
        triggerToast("تم إنشاء التكليف بنجاح ✅");
        closeModal();
        fetchData();
      } catch (err) {
        triggerToast(err.response?.data?.message || "فشل التنفيذ", "error");
      }
    };

    const askRevoke = (id) => (confirmRevokeId.value = id);

    const revokeDelegation = async (id) => {
      try {
        await api.post(`/Delegation/RevokeDelegation/${id}`);
        triggerToast("تم إلغاء التكليف");
        confirmRevokeId.value = null;
        fetchData();
      } catch {
        triggerToast("فشل الإلغاء", "error");
      }
    };

    const resetForm = () => {
      form.value = { actingManager: null, endDate: "", targetEntityType: null, targetEntityId: null };
      empSearch.value = "";
    };

    const closeModal = () => {
      showModal.value = false;
      resetForm();
    };

    const formatDate = (d) => d ? d.split("T")[0] : "---";

    onMounted(fetchData);

    return {
      activeDelegations, employees, targets, form, empSearch, searchQuery,
      filteredDelegations, filteredEmployees, showModal, confirmRevokeId,
      selectEmployee, resetEmployeeSelection, onTypeChange, openAddModal,
      saveDelegation, askRevoke, revokeDelegation, closeModal, formatDate,
      showToast, toastMsg, toastType
    };
  }
};
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>