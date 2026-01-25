<template>
  <div class="flex min-h-screen bg-gray-100">

    <!-- Sidebar -->
    <Sidebar class="fixed top-0 right-0 h-screen w-24 md:w-64 z-50" />

    <!-- المحتوى -->
    <div class="flex-1 p-6 mr-24 md:mr-64">

      <Navbar />

      <!-- العنوان + زر إضافة -->
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">الموظفون</h2>

        <router-link
          to="/employees/add"
          class="bg-primary hover:bg-primaryDark text-white px-4 py-2 rounded-lg transition"
        >
          ➕ إضافة موظف
        </router-link>
      </div>

      <!-- البحث والفلترة -->
      <div class="bg-white p-4 rounded-xl shadow mb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

          <input
            v-model="search"
            placeholder="🔍 بحث بالاسم"
            class="input"
          />

          <select v-model="departmentFilter" class="input">
            <option value="">كل الإدارات</option>
            <option
              v-for="dep in departments"
              :key="dep"
              :value="dep"
            >
              {{ dep }}
            </option>
          </select>

        </div>
      </div>

      <!-- جدول الموظفين -->
      <div class="bg-white rounded-xl shadow overflow-x-auto">
        <table class="w-full text-right text-sm border-collapse">
  <thead class="bg-gray-100">
            <tr>
              <th class="p-3">رقم الموظف</th>
              <th class="p-3">الاسم</th>
              <th class="p-3">الإدارة</th>
              <th class="p-3">الوظيفة</th>
              <th class="p-3">الموقع</th>
              <th class="p-3">الحالة</th>
              <th class="p-3 text-center">الإجراءات</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="emp in filteredEmployees"
              :key="emp.id"
              class="border-t hover:bg-gray-50"
            >
              <td class="p-3">{{ emp.id }}</td>
              <td class="p-3 font-medium">{{ emp.fullName }}</td>
              <td class="p-3">{{ emp.department }}</td>
              <td class="p-3">{{ emp.jobTitle }}</td>
              <td class="p-3">{{ emp.workLocation }}</td>
              <td class="p-3">
                <span
                  :class="emp.employmentStatus === 'نشط'
                    ? 'text-green-600'
                    : 'text-yellow-600'"
                >
                  {{ emp.employmentStatus }}
                </span>
              </td>

              <!-- الإجراءات -->
              <td class="p-3 text-center flex justify-center gap-2">
                <router-link
                  :to="`/employees/${emp.id}`"
                  class="text-blue-600 hover:underline"
                >
                  👁️
                </router-link>

                <router-link
                  :to="`/employees/${emp.id}/edit`"
                  class="text-yellow-600 hover:underline"
                >
                  ✏️
                </router-link>
              </td>
            </tr>

            <tr v-if="filteredEmployees.length === 0">
              <td colspan="7" class="p-6 text-center text-gray-500">
                لا توجد بيانات
              </td>
            </tr>

          </tbody>
        </table>
      </div>

    </div>
  </div>
</template>

<script>
import Sidebar from "../components/Sidebar.vue";
import Navbar from "../components/Navbar.vue";
import api from "../services/api";

export default {
  name: "EmployeesList",
  components: { Sidebar, Navbar },

  data() {
    return {
      employees: [],
      search: "",
      departmentFilter: "",
      departments: []
    };
  },

  computed: {
    filteredEmployees() {
      // فلترة حسب الاسم والإدارة فقط
      return this.employees
        .filter(emp => {
          const matchesName = emp.fullName?.includes(this.search);
          const matchesDepartment =
            !this.departmentFilter || emp.department === this.departmentFilter;
          return matchesName && matchesDepartment;
        });
    }
  },

  mounted() {
    this.fetchEmployees();
  },

  methods: {
    async fetchEmployees() {
      try {
        const { data } = await api.get("/Employee/all");

        // ترتيب تنازلي حسب id => آخر موظف مضاف أولاً
        this.employees = data.sort((a, b) => b.id - a.id);

        // استخراج الإدارات للفلترة
        this.departments = [
          ...new Set(data.map(e => e.department).filter(Boolean))
        ];
      } catch (err) {
        console.error("خطأ في جلب الموظفين:", err);
      }
    }
  }
};
</script>

<style scoped>
.input {
  @apply p-2 border rounded-lg text-right;
}
</style>
