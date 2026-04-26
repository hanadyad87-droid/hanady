<template>
  <div class="flex min-h-screen bg-gray-100 font-cairo" dir="rtl">
    <SidebarPage />

    <div class="flex-1 w-full min-w-0 p-4 sm:p-6 mr-0 lg:mr-60">
      <Navbar />

      <div class="bg-white rounded-2xl shadow-lg p-6 mt-4">
        <!-- الرأس -->
        <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div>
            <h2 class="text-xl font-bold text-gray-800">  تعيين المدراء</h2>
            <p class="text-sm text-gray-500 mt-1">عرض الإدارات والأقسام التي تملك مديراً حالياً فقط</p>
          </div>
          <button
            @click="openAssignModal"
            class="bg-primary hover:bg-green-700 text-white px-6 py-2.5 rounded-xl shadow-md flex items-center gap-2 font-bold transition-all"
          >
            <PlusIcon class="w-5 h-5" />
            تعيين مدير جديد
          </button>
        </div>

        <!-- فلتر البحث في الجدول -->
        <div class="mb-6">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="بحث باسم الإدارة أو اسم المدير..."
            class="input w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none"
          />
        </div>

        <!-- الجدول: يعرض فقط المناصب المشغولة -->
        <div class="overflow-x-auto rounded-xl border border-gray-200">
          <table class="min-w-full text-right divide-y divide-gray-200">
            <thead class="bg-navbar">
              <tr>
                <th class="p-4 text-sm font-semibold text-gray-600">النوع</th>
                <th class="p-4 text-sm font-semibold text-gray-600">الجهة</th>
                <th class="p-4 text-sm font-semibold text-gray-600">المدير الحالي</th>
                <th class="p-4 text-sm font-semibold text-gray-600">المدير السابق</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="m in paginatedManagers" :key="m.typeRaw + m.id" class="hover:bg-gray-50 transition">
                <td class="p-4 text-sm">
                  <span 
                    :class="{
                      'bg-blue-100 text-blue-700': m.typeRaw === 'department',
                      'bg-purple-100 text-purple-700': m.typeRaw === 'subdepartment',
                      'bg-orange-100 text-orange-700': m.typeRaw === 'section'
                    }"
                    class="px-3 py-1 rounded-full text-xs font-bold"
                  >
                    {{ m.type }}
                  </span>
                </td>
                <td class="p-4 text-sm font-medium text-gray-800">{{ m.name }}</td>
                <td class="p-4 text-sm text-gray-700 font-bold">
                   <div class="flex items-center gap-2 text-primary">
                     <UserIcon class="w-4 h-4" />
                     {{ m.currentManager }}
                   </div>
                </td>
                <td class="p-4 text-sm text-gray-400 italic">{{ m.previousManager || "لا يوجد" }}</td>
              </tr>
              <tr v-if="!filteredManagers.length">
                <td colspan="4" class="text-center py-10 text-gray-400 italic">لا توجد جهات إدارية مشغولة حالياً</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="flex justify-between items-center mt-6">
          <button @click="currentPage--" :disabled="currentPage === 1" class="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300">السابق</button>
          <span class="text-sm text-gray-600">صفحة {{ currentPage }} من {{ totalPages }}</span>
          <button @click="currentPage++" :disabled="currentPage >= totalPages" class="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300">التالي</button>
        </div>
      </div>
    </div>

    <!-- مودال التعيين -->
    <div v-if="showAssignModal" class="fixed inset-0 bg-black/50 flex justify-center items-center z-[60] p-4 backdrop-blur-sm">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative border-t-8 border-primary">
        <h3 class="font-bold text-xl mb-6 text-gray-800 text-center">تعيين مسؤول جديد</h3>

        <div class="space-y-5">
          <!-- نظام البحث عن موظف -->
          <div class="relative">
            <label class="block text-sm font-medium mb-1 text-gray-700">البحث عن موظف</label>
            <div class="relative flex items-center">
              <input 
                v-model="empSearch" 
                type="text" 
                :disabled="selectedEmployee"
                placeholder="ابدأ بكتابة الاسم..." 
                class="input w-full p-3 border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
              />
              <button v-if="selectedEmployee" @click="resetEmployeeSelection" class="absolute left-3 text-red-500 text-xs font-bold hover:underline">تغيير</button>
            </div>

            <!-- قائمة النتائج المتطابقة -->
            <ul v-if="filteredEmployees.length && empSearch.length > 0 && !selectedEmployee" 
                class="absolute bg-white border border-gray-200 w-full mt-1 rounded-xl shadow-2xl max-h-48 overflow-y-auto z-[70] divide-y divide-gray-100">
              <li v-for="emp in filteredEmployees" :key="emp.id"
                  @click="selectEmployee(emp)"
                  class="p-3 hover:bg-primary/10 cursor-pointer text-sm transition-colors flex justify-between items-center">
                <span class="font-bold">{{ emp.fullName }}</span>
                <span class="text-xs text-gray-400">{{ emp.employeeCode }}</span>
              </li>
            </ul>
          </div>

          <!-- اختيار النوع -->
          <div>
            <label class="block text-sm font-medium mb-1 text-gray-700">نوع التكليف</label>
            <select v-model="selectedType" @change="onTypeChange" class="input w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-primary">
              <option :value="null">اختر النوع...</option>
              <option value="department">مدير إدارة</option>
              <option value="subdepartment">مدير إدارة فرعية</option>
              <option value="section">رئيس قسم</option>
            </select>
          </div>

          <!-- اختيار الجهة -->
          <div v-if="managerTargets.length">
            <label class="block text-sm font-medium mb-1 text-gray-700">الجهة الإدارية المقصودة</label>
            <select v-model="selectedEntityId" class="input w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm">
              <option :value="null">اختر الإدارة/القسم...</option>
              <option v-for="t in managerTargets" :key="t.id" :value="t.id">{{ t.name }}</option>
            </select>
          </div>
        </div>

        <!-- أزرار التحكم -->
        <div class="flex justify-end gap-3 mt-8">
          <button @click="closeAssignModal" class="bg-gray-100 px-5 py-2 rounded-xl font-medium hover:bg-gray-200 transition">إلغاء</button>
          <button 
            @click="submitAssign" 
            :disabled="!selectedEmployee || !selectedEntityId"
            class="bg-primary text-white px-8 py-2 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            تأكيد التعيين
          </button>
        </div>
      </div>
    </div>

    <ToastPage v-if="showToast" :message="toastMessage" :type="toastType" />
  </div>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import SidebarPage from "@/components/Sidebar.vue";
import Navbar from "@/components/Navbar.vue";
import ToastPage from "@/components/Toast.vue";
import api from "@/services/api";
import { PlusIcon, UserIcon,  } from "@heroicons/vue/24/outline";

export default {
  components: { SidebarPage, Navbar, ToastPage, PlusIcon, UserIcon },

  setup() {
    // مخازن البيانات
    const employees = ref([]);
    const allEntities = ref([]); // لتخزين كافة الجهات (إدارات، شعب، أقسام)
    const allManagers = ref([]); // النسخة المفلترة للجدول

    // حالات الواجهة والبحث
    const showAssignModal = ref(false);
    const searchQuery = ref("");
    const currentPage = ref(1);
    const itemsPerPage = ref(10);
    const empSearch = ref("");
    const selectedEmployee = ref(null);
    const selectedType = ref(null);
    const selectedEntityId = ref(null);

    // التنبيهات
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
        const [empRes, entitiesRes] = await Promise.all([
          api.get("/Employee/all"),
          api.get("/Organization/AllEntitiesByDate")
        ]);

        employees.value = empRes.data;
        allEntities.value = entitiesRes.data;

        refreshTable();
      } catch (e) {
        toast("خطأ في جلب البيانات من السيرفر", "error");
      }
    };

    const refreshTable = () => {
      // الفلترة: استبعاد أي جهة يكون فيها اسم المدير "لا يوجد" أو "لا يوجد مدير حالي" أو فارغ
      allManagers.value = allEntities.value
        .filter(item => {
          const mName = item.managerName;
          return mName && 
                 mName.trim() !== "" && 
                 mName !== "لا يوجد" && 
                 mName !== "لا يوجد مدير حالي";
        })
        .map(item => ({
          id: item.id,
          name: item.name,
          typeRaw: item.type,
          // تحويل النوع للنص العربي للعرض
          type: item.type === 'department' ? 'إدارة' : 
                item.type === 'subdepartment' ? 'إدارة فرعية' : 'قسم',
          currentManager: item.managerName,
          previousManager: item.previousManagerName
        }));
    };

    // فلترة الجهات في المودال بناءً على النوع المختار
    const managerTargets = computed(() => {
      if (!selectedType.value) return [];
      return allEntities.value.filter(e => e.type === selectedType.value);
    });

    // فلترة الموظفين للبحث
    const filteredEmployees = computed(() => {
      const q = empSearch.value.trim().toLowerCase();
      if (!q) return [];
      return employees.value.filter(e => 
        e.fullName.toLowerCase().includes(q)
      ).slice(0, 8);
    });

    const selectEmployee = (emp) => {
      selectedEmployee.value = emp;
      empSearch.value = emp.fullName;
    };

    const resetEmployeeSelection = () => {
      selectedEmployee.value = null;
      empSearch.value = "";
    };

    // فلترة الجدول بالبحث
    const filteredManagers = computed(() => {
      const q = searchQuery.value.toLowerCase();
      return allManagers.value.filter(m => 
        m.name.toLowerCase().includes(q) || m.currentManager.toLowerCase().includes(q)
      );
    });

    const totalPages = computed(() => Math.ceil(filteredManagers.value.length / itemsPerPage.value) || 1);
    const paginatedManagers = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value;
      return filteredManagers.value.slice(start, start + itemsPerPage.value);
    });

    const openAssignModal = () => (showAssignModal.value = true);

    const closeAssignModal = () => {
      showAssignModal.value = false;
      resetEmployeeSelection();
      selectedType.value = null;
      selectedEntityId.value = null;
    };

    const submitAssign = async () => {
      // تحديد الـ RoleId بناءً على النوع (3 للمدير، 4 للفرعي، 5 للقسم)
      let roleId = selectedType.value === "department" ? 3 : 
                   selectedType.value === "subdepartment" ? 4 : 5;

      try {
        await api.post("/Employee/assign-role-and-entity", {
          EmployeeId: selectedEmployee.value.id,
          Type: selectedType.value,
          EntityId: selectedEntityId.value,
          RoleId: roleId
        });
        toast("تم التعيين بنجاح");
        closeAssignModal();
        await loadData(); // تحديث الجدول فوراً
      } catch (err) {
        toast("فشل التكليف، يرجى المحاولة لاحقاً", "error");
      }
    };

    onMounted(loadData);

    return {
      empSearch, selectedEmployee, filteredEmployees, selectEmployee, resetEmployeeSelection,
      searchQuery, currentPage, totalPages, paginatedManagers, filteredManagers,
      showAssignModal, selectedType, selectedEntityId, managerTargets,
      showToast, toastMessage, toastType,
      closeAssignModal, submitAssign, openAssignModal
    };
  }
};
</script>

<style scoped>
.input { @apply bg-gray-50; }
::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-thumb { @apply bg-gray-300 rounded-full; }
</style>