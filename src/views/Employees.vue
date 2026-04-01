<template>
  <div class="flex min-h-screen bg-white">

    <!-- Sidebar -->
    <Sidebar class="fixed top-0 right-0 h-screen w-24 md:w-64 z-50" />

    <!-- المحتوى -->
    <div class="flex-1 p-6 mr-24 md:mr-64">

      <Navbar />

      <!-- العنوان + زر إضافة -->
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">الموظفين</h2>

        <router-link
          to="/employees/add"
          class="bg-primary hover:bg-primaryDark text-white px-6 py-2 rounded-xl font-semibold shadow-md transition"
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
        <table class="min-w-full divide-y divide-gray-200 text-right">
            <thead class="bg-navbar">
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
              :key="emp.PublicId"
              class="border-t hover:bg-gray-50"
            >
              <td class="p-3">{{ emp.EmployeeNumber }}</td>
              <td class="p-3 font-medium">{{ emp.fullName }}</td>
              <td class="p-3">{{ emp.department }}</td>
              <td class="p-3">{{ emp.jobTitle }}</td>
              <td class="p-3">{{ emp.workLocation }}</td>
              <td class="p-3">
                <span
                  :class="emp.employmentStatus === 'نشط'
                    ? 'text-green-600'
                    : 'text-yellow-600'">
                  {{ emp.employmentStatus }}
                </span>
              </td>

              <!-- الإجراءات -->
              <td class="p-3 text-center flex justify-center gap-2">
                <router-link
                  :to="`/employees/${emp.PublicId}`"
                  class="text-blue-600 hover:underline"
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
      employees: [], // بيانات مدموجة
      search: "",
      departmentFilter: "",
      departments: []
    };
  },

  computed: {
    filteredEmployees() {
      return this.employees.filter(emp => {
        const matchesName = emp.fullName?.toLowerCase().includes(this.search.toLowerCase());
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
        // جلب بيانات Employee و EmployeeAdministrative
        const [empRes, adminRes] = await Promise.all([
          api.get("/Employee/all"),
          api.get("/EmployeeAdministrative/all-with-admin")
        ]);

        const employees = empRes.data;
        const adminData = adminRes.data;

        // دمج البيانات حسب id
       this.employees = adminData
  .map(adm => {
    const emp = employees.find(e => e.id === adm.id);
    return {
      fullName: adm.fullName,
      EmployeeNumber: emp ? emp.employeeNumber : "غير محدد",
      department: adm.department || "غير محدد",
      jobTitle: adm.jobTitle || "-",
      workLocation: adm.workLocation || "-",
      employmentStatus: adm.employmentStatus || "غير محدد",
      PublicId: adm.employeePublicId,
      id: adm.id // نحتفظ بالـ id للترتيب
    };
  })
  .sort((a, b) => b.id - a.id); // الترتيب التنازلي

        // استخراج الإدارات للفلترة
        this.departments = [
          ...new Set(this.employees.map(e => e.department).filter(Boolean))
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
