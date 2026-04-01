<template>
  <div dir="rtl" class="flex min-h-screen bg-white">

    <!-- Sidebar -->
    <Sidebar class="fixed top-0 right-0 h-screen w-24 sm:w-28 md:w-60 z-40" />

    <div class="flex-1 mr-24 sm:mr-28 md:mr-60 p-6">
      <Navbar />

      <!-- زر فتح مودال إضافة تكليف -->
      <div class="flex justify-end mb-4">
        <button @click="showDelegationModal = true"
                class="bg-primary hover:bg-primaryDark text-white px-4 py-2 rounded-xl font-semibold shadow-md">
          إضافة تكليف
        </button>
      </div>

      <!-- مودال إضافة التكليف -->
      <div v-if="showDelegationModal" class="fixed inset-0 bg-black/40 flex items-start justify-center z-50 p-4 pt-20">
        <div class="bg-white p-6 rounded-xl w-full max-w-lg shadow-lg space-y-4">

          <h2 class="text-lg font-bold text-green-900">🔄 التكليف الإداري</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

            <!-- بحث الموظف -->
            <div class="relative">
              <label class="block mb-1 font-semibold text-gray-600">الموظف المكلف</label>
              <input type="text" v-model="search" placeholder="ابحث عن الموظف..." class="input" />
              <ul v-if="search && filteredEmployees.length"
                  class="absolute top-full left-0 right-0 border rounded max-h-40 overflow-auto mt-1 bg-white z-50">
                <li v-for="emp in filteredEmployees" :key="emp.id" @click="selectEmployee(emp)"
                    class="p-2 hover:bg-gray-200 cursor-pointer">
                  {{ emp.fullName }}
                </li>
              </ul>
              <div v-if="form.actingManager" class="mt-2 text-gray-700">
                الموظف المختار: <b>{{ form.actingManager.fullName }}</b>
              </div>
            </div>

            <!-- تاريخ النهاية -->
            <div>
              <label class="block mb-1 font-semibold text-gray-600">تاريخ النهاية</label>
              <input type="date" v-model="form.endDate" class="input" />
            </div>

            <!-- نوع الكيان -->
            <div>
              <label class="block mb-1 font-semibold text-gray-600">نوع الكيان</label>
              <select v-model="form.targetEntityType" @change="onTypeChange" class="input">
                <option :value="null">-- اختر نوع الكيان --</option>
                <option value="Section">قسم</option>
                <option value="SubDepartment">إدارة فرعية</option>
              </select>
            </div>

            <!-- الكيان -->
            <div>
              <label class="block mb-1 font-semibold text-gray-600">الكيان</label>
              <select v-model="form.targetEntityId" class="input">
                <option :value="null">-- اختر الكيان --</option>
                <option v-for="t in targets" :key="t.id" :value="t.id">{{ t.name }}</option>
              </select>
            </div>

          </div>

          <div class="flex justify-end gap-2 mt-4">
            <button @click="submitDelegation" class="bg-primary text-white px-4 py-2 rounded-xl hover:bg-primaryDark font-semibold">
              تنفيذ التكليف
            </button>
            <button @click="closeDelegationModal" class="bg-gray-300 px-4 py-2 rounded-xl hover:bg-gray-400 font-semibold">
              إلغاء
            </button>
          </div>
        </div>
      </div>

      <!-- جدول التكليفات النشطة -->
      <div class="bg-white rounded-2xl shadow-lg p-6 max-w-5xl mx-auto mt-6">
        <h2 class="text-xl font-bold mb-4 text-gray-700">التكليفات النشطة</h2>
        <table class="min-w-full bg-white border rounded-lg">
          <thead>
            <tr class="bg-navbar">
              <th class="p-2 border">الموظف المكلف</th>
              <th class="p-2 border">المدير الأصلي</th>
              <th class="p-2 border">نوع الكيان</th>
              <th class="p-2 border">الكيان</th>
              <th class="p-2 border">تاريخ البداية</th>
              <th class="p-2 border">تاريخ النهاية</th>
              <th class="p-2 border">إلغاء</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="d in activeDelegations" :key="d.id">
              <td class="p-2 border">{{ d.actingManagerName }}</td>
              <td class="p-2 border">{{ d.originalManagerName }}</td>
              <td class="p-2 border">{{ d.entityType }}</td>
              <td class="p-2 border">{{ d.entityName || 'غير محدد' }}</td>
              <td class="p-2 border">{{ formatDate(d.startDate) }}</td>
              <td class="p-2 border">{{ formatDate(d.endDate) }}</td>
              <td class="p-2 border">
                <button @click="confirmRevoke(d.id)" class="bg-red-500 text-white px-2 rounded">
                  إلغاء
                </button>
              </td>
            </tr>
            <tr v-if="!activeDelegations.length">
              <td colspan="7" class="text-center p-4 text-gray-500">لا توجد تكليفات نشطة</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- مودال تأكيد الإلغاء -->
      <div v-if="confirmRevokeId !== null" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm text-center">
          <p class="mb-4 text-gray-800">هل أنت متأكد من إلغاء التكليف؟</p>
          <div class="flex justify-center gap-4">
            <button @click="confirmRevokeId = null" class="px-4 py-2 rounded border border-gray-300">إلغاء</button>
            <button @click="revokeDelegation(confirmRevokeId)" class="px-4 py-2 bg-red-600 text-white rounded">إلغاء التكليف</button>
          </div>
        </div>
      </div>

      <!-- التوست -->
      <transition name="fade">
        <div v-if="toastProps" class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                px-6 py-3 rounded-lg shadow-lg text-white text-center z-[999]"
             :class="toastProps.type === 'success' ? 'bg-green-600' : 'bg-red-600'">
          {{ toastProps.message }}
        </div>
      </transition>

    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import Sidebar from "@/components/Sidebar.vue";
import Navbar from "@/components/Navbar.vue";
import api from "@/services/api";

export default {
  components: { Sidebar, Navbar },

  setup() {
    const showDelegationModal = ref(false);
    const search = ref("");
    const employees = ref([]);
    const sections = ref([]);
    const subDepartments = ref([]);
    const targets = ref([]);
    const activeDelegations = ref([]);
    const form = ref({
      actingManager: null,
      endDate: "",
      targetEntityType: null,
      targetEntityId: null
    });

    const toastProps = ref(null);
    const confirmRevokeId = ref(null);

    const filteredEmployees = computed(() => {
      const s = search.value.toLowerCase();
      return employees.value.filter(emp => emp.fullName.toLowerCase().includes(s));
    });

    const formatDate = (dt) => dt ? new Date(dt).toLocaleDateString("en-US") : "";

    const loadData = async () => {
      try {
        const [emp, sec, sub] = await Promise.all([
          api.get("/Delegation/AvailableEmployees"),
          api.get("/Organization/Sections"),
          api.get("/Organization/SubDepartments")
        ]);
        employees.value = emp.data;
        sections.value = sec.data;
        subDepartments.value = sub.data;
      } catch {
        showToast("خطأ في تحميل البيانات", "error");
      }
    };

    const loadActiveDelegations = async () => {
      try {
        const res = await api.get("/Delegation/ActiveDelegations");
        activeDelegations.value = res.data;
      } catch {
        showToast("خطأ في تحميل التكليفات النشطة", "error");
      }
    };

    const selectEmployee = (emp) => {
      form.value.actingManager = emp;
      search.value = "";
    };

    const onTypeChange = () => {
      if (form.value.targetEntityType === "Section") targets.value = sections.value;
      else if (form.value.targetEntityType === "SubDepartment") targets.value = subDepartments.value;
      else targets.value = [];
    };

    const confirmRevoke = (id) => {
      confirmRevokeId.value = id;
    };

    const submitDelegation = async () => {
      if (!form.value.actingManager) return showToast("الرجاء اختيار الموظف المكلف", "error");
      if (!form.value.endDate) return showToast("الرجاء تحديد تاريخ النهاية", "error");
      if (!form.value.targetEntityType) return showToast("الرجاء اختيار نوع الكيان", "error");
      if (!form.value.targetEntityId) return showToast("الرجاء اختيار الكيان", "error");

      try {
        const payload = new FormData();
        payload.append('actingManagerId', form.value.actingManager.id);
        payload.append('endDate', form.value.endDate);
        payload.append('targetEntityType', form.value.targetEntityType);
        payload.append('targetEntityId', form.value.targetEntityId);

        const res = await api.post("/Delegation/CreateDelegation", payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        showToast(res.data.message || "تم التكليف بنجاح ✅", "success");
        closeDelegationModal();
        await loadData();
        await loadActiveDelegations();

      } catch (err) {
        showToast(err.response?.data?.message || "فشل التكليف", "error");
      }
    };

    const revokeDelegation = async (id) => {
      try {
        const res = await api.post(`/Delegation/RevokeDelegation/${id}`);
        showToast(res.data.message || "تم إلغاء التكليف بنجاح! 🎉", "success");
        await loadActiveDelegations();
      } catch {
        showToast("فشل إلغاء التكليف", "error");
      } finally {
        confirmRevokeId.value = null;
      }
    };

    const closeDelegationModal = () => {
      showDelegationModal.value = false;
      form.value = { actingManager: null, endDate: "", targetEntityType: null, targetEntityId: null };
      targets.value = [];
      search.value = "";
    };

    const showToast = (message, type="success") => {
      toastProps.value = { message, type, key: Date.now() };
      setTimeout(() => { toastProps.value = null; }, 3000);
    };

    onMounted(() => {
      loadData();
      loadActiveDelegations();
    });

    return {
      showDelegationModal, search, filteredEmployees, selectEmployee, form, targets,
      onTypeChange, submitDelegation, activeDelegations, confirmRevokeId, confirmRevoke, revokeDelegation,
      closeDelegationModal, toastProps, formatDate
    };
  }
};
</script>

<style scoped>
.input { @apply p-2 border rounded-xl w-full; }
ul li { list-style: none; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>