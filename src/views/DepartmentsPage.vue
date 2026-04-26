<template>
  <div class="flex min-h-screen bg-gray-100 font-cairo" dir="rtl">
    <!-- Sidebar -->
    <SidebarPage />

    <!-- Main content -->
    <div class="flex-1 w-full min-w-0 p-4 sm:p-6 mr-0 lg:mr-60">
      <Navbar />

      <!-- Card -->
      <div class="bg-white rounded-2xl shadow-lg p-6 mt-4">
        <!-- Header -->
        <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div>
            <h2 class="text-xl font-bold text-gray-800">إدارة الادارات</h2>
            <p class="text-sm text-gray-500 mt-1">إدارة الوحدات الإدارية، الإدارات الفرعية والأقسام</p>
          </div>
          <button
            @click="openAddModal"
            class="bg-primary hover:bg-green-700 text-white px-6 py-2.5 rounded-xl shadow-md flex items-center gap-2 font-bold transition-all"
          >
            <PlusIcon class="w-5 h-5" />
            إضافة جديد
          </button>
        </div>

        <!-- Search -->
        <div class="flex flex-col md:flex-row gap-4 mb-6">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="بحث في الهيكل (الاسم أو النوع)..."
            class="input w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none"
          />
        </div>

        <!-- Table -->
        <div class="overflow-x-auto rounded-xl border border-gray-200">
          <table class="min-w-full text-right divide-y divide-gray-200">
            <thead class="bg-navbar">
              <tr>
                <th class="p-4 text-sm font-semibold text-gray-600">النوع</th>
                <th class="p-4 text-sm font-semibold text-gray-600">الاسم</th>
                <th class="p-4 text-sm font-semibold text-gray-600">يتبع لـ</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="item in paginatedData" :key="item.typeRaw + item.id" class="hover:bg-gray-50 transition">
                <td class="p-4 text-sm">
                  <span 
                    :class="{
                      'bg-blue-100 text-blue-700': item.typeRaw === 'department',
                      'bg-purple-100 text-purple-700': item.typeRaw === 'subdepartment',
                      'bg-orange-100 text-orange-700': item.typeRaw === 'section'
                    }"
                    class="px-3 py-1 rounded-full text-xs font-bold"
                  >
                    {{ item.type }}
                  </span>
                </td>
                <td class="p-4 text-sm font-medium text-gray-800">{{ item.name }}</td>
                <td class="p-4 text-sm text-gray-500">{{ item.parent || '-' }}</td>
              </tr>
              <tr v-if="!filteredData.length">
                <td colspan="3" class="text-center py-10 text-gray-400 italic">لا توجد نتائج بحث مطابقة</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="flex justify-between items-center mt-6">
          <button 
            @click="currentPage--" 
            :disabled="currentPage === 1"
            class="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition"
          >
            السابق
          </button>
          <span class="text-sm text-gray-600">صفحة {{ currentPage }} من {{ totalPages }}</span>
          <button 
            @click="currentPage++" 
            :disabled="currentPage >= totalPages"
            class="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition"
          >
            التالي
          </button>
        </div>
      </div>
    </div>

    <!-- Modal إضافة -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex justify-center items-center z-[60] p-4">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h3 class="font-bold text-xl mb-6 text-gray-800 text-center">إضافة وحدة إدارية جديدة</h3>

        <div class="space-y-4">
          <!-- Type Selection -->
          <div>
            <label class="block text-sm font-medium mb-1 text-gray-700">نوع الوحدة</label>
            <select 
              v-model="addType" 
              @change="onAddTypeChange"
              class="input w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
            >
              <option :value="null">اختر النوع...</option>
              <option value="department">إدارة (مستوى أول)</option>
              <option value="subdepartment">إدارة فرعية (تحت إدارة)</option>
              <option value="section">قسم (تحت إدارة فرعية)</option>
            </select>
          </div>

          <!-- Name Input -->
          <div>
            <label class="block text-sm font-medium mb-1 text-gray-700">اسم الوحدة</label>
            <input 
              v-model="addName" 
              type="text"
              placeholder="مثال: الإدارة المالية"
              class="input w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          <!-- Parent Selection (Conditional) -->
          <div v-if="parentTargets.length">
            <label class="block text-sm font-medium mb-1 text-gray-700">تتبع لـ (الأب)</label>
            <select 
              v-model="selectedParentId" 
              class="input w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
            >
              <option :value="null">اختر التبعية...</option>
              <option v-for="p in parentTargets" :key="p.id" :value="p.id">
                {{ p.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-8">
          <button @click="closeModal" class="bg-gray-200 px-5 py-2 rounded-lg font-medium hover:bg-gray-300 transition">إلغاء</button>
          <button 
            @click="submitAdd" 
            :disabled="!addType || !addName || (addType !== 'department' && !selectedParentId)"
            class="bg-primary text-white px-8 py-2 rounded-lg font-bold hover:shadow-lg transition disabled:opacity-50"
          >
            حفظ البيانات
          </button>
        </div>
      </div>
    </div>

    <!-- Toast Component -->
    <ToastPage v-if="showToast" :message="toastMessage" :type="toastType" />
  </div>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import SidebarPage from "@/components/Sidebar.vue";
import Navbar from "@/components/Navbar.vue";
import ToastPage from "@/components/Toast.vue";
import api from "@/services/api";
import { PlusIcon } from "@heroicons/vue/24/outline";

export default {
  components: { SidebarPage, Navbar, ToastPage, PlusIcon },

  setup() {
    // Data State
    const allEntities = ref([]); // للجدول الموحد
    const departments = ref([]); // لمودل الإضافة
    const subDepartments = ref([]); // لمودل الإضافة
    
    // UI State
    const showModal = ref(false);
    const searchQuery = ref("");
    const currentPage = ref(1);
    const itemsPerPage = ref(10);

    // Form State
    const addType = ref(null);
    const addName = ref("");
    const parentTargets = ref([]);
    const selectedParentId = ref(null);

    // Toast State
    const showToast = ref(false);
    const toastMessage = ref("");
    const toastType = ref("success");

    const toast = (msg, type = "success") => {
      toastMessage.value = msg;
      toastType.value = type;
      showToast.value = true;
      setTimeout(() => (showToast.value = false), 3000);
    };

    const loadData = async () => {
      try {
        const [all, dep, sub] = await Promise.all([
          api.get("/Organization/AllEntitiesByDate"),
          api.get("/Organization/Departments"),
          api.get("/Organization/SubDepartments")
        ]);
        allEntities.value = all.data;
        departments.value = dep.data;
        subDepartments.value = sub.data;
      } catch (e) {
        toast("فشل في تحميل بيانات الهيكل التنظيمي", "error");
      }
    };

    const allData = computed(() => {
      return allEntities.value.map(item => ({
        ...item,
        typeRaw: item.type,
        type: item.type === 'department' ? 'إدارة' : 
              item.type === 'subdepartment' ? 'إدارة فرعية' : 'قسم'
      }));
    });

    const filteredData = computed(() => {
      const q = searchQuery.value.toLowerCase();
      return allData.value.filter(x =>
        x.name.toLowerCase().includes(q) || x.type.toLowerCase().includes(q)
      );
    });

    const totalPages = computed(() => Math.ceil(filteredData.value.length / itemsPerPage.value) || 1);

    const paginatedData = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value;
      return filteredData.value.slice(start, start + itemsPerPage.value);
    });

    // Methods
    const onAddTypeChange = () => {
      selectedParentId.value = null;
      if (addType.value === "subdepartment") {
        parentTargets.value = departments.value;
      } else if (addType.value === "section") {
        parentTargets.value = subDepartments.value;
      } else {
        parentTargets.value = [];
      }
    };

    const openAddModal = () => {
      showModal.value = true;
    };

    const closeModal = () => {
      showModal.value = false;
      addType.value = null;
      addName.value = "";
      selectedParentId.value = null;
      parentTargets.value = [];
    };

    const submitAdd = async () => {
      if (!addName.value || !addType.value) return;

      try {
        if (addType.value === "department") {
          await api.post("/Organization/AddDepartment", { name: addName.value });
        } 
        else if (addType.value === "subdepartment") {
          await api.post("/Organization/AddSubDepartment", null, {
            params: { name: addName.value, departmentId: selectedParentId.value }
          });
        } 
        else if (addType.value === "section") {
          await api.post("/Organization/AddSection", null, {
            params: { name: addName.value, subDeptId: selectedParentId.value }
          });
        }

        toast("تمت الإضافة بنجاح");
        closeModal();
        await loadData();
        currentPage.value = 1;
      } catch (err) {
        toast("حدث خطأ أثناء الحفظ", "error");
      }
    };

    onMounted(loadData);

    return {
      allEntities, departments, subDepartments,
      searchQuery, currentPage, totalPages, paginatedData, filteredData,
      showModal, addType, addName, parentTargets, selectedParentId,
      showToast, toastMessage, toastType,
      openAddModal, closeModal, onAddTypeChange, submitAdd
    };
  }
};
</script>

<style scoped>
.input { @apply bg-gray-50; }
</style>