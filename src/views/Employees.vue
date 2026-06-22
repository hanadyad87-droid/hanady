<template>
  <div class="flex min-h-screen bg-gray-100 font-cairo" dir="rtl">
    <SidebarPage />

    <div class="flex-1 w-full min-w-0 p-4 sm:p-6 mr-0 lg:mr-60">
      <Navbar />

      <div class="bg-white rounded-2xl shadow-lg p-6 mt-4">
        
        <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div>
            <h2 class="text-xl font-bold text-gray-800"> الموظفين</h2>
            <p class="text-gray-500 text-sm mt-1">إدارة بيانات الموظفين والحالة الوظيفية والصلاحيات</p>
          </div>
          <router-link
            to="/employees/add"
            class="bg-primary hover:bg-green-700 text-white px-6 py-2 rounded-xl shadow transition-all flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            إضافة موظف
          </router-link>
        </div>

        <div class="relative mb-6">
          <input
            v-model="search"
            @input="currentPage = 1" 
            placeholder="بحث باسم الموظف، المسمى الوظيفي، أو الإدارة..."
            class="input w-full p-3 pr-11 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
          />
          <span class="absolute inset-y-0 left-4 flex items-center text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </span>
        </div>

        <div class="overflow-x-auto rounded-xl border border-gray-100">
          <table class="min-w-full text-right divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="p-4 text-sm font-semibold text-gray-600">الموظف</th>
                <th class="p-4 text-sm font-semibold text-gray-600">رقم الموظف</th>
                <th class="p-4 text-sm font-semibold text-gray-600">المسمى الوظيفي</th>
                <th class="p-4 text-sm font-semibold text-gray-600">الإدارة</th>
                <th class="p-4 text-sm font-semibold text-gray-600">الحالة</th>
                <th class="p-4 text-sm font-semibold text-gray-600 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-100">
              <tr v-for="emp in paginatedEmployees" :key="emp.id" class="hover:bg-blue-50/30 transition">
                <td class="p-4">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 bg-blue-100 text-primary rounded-lg flex items-center justify-center font-bold text-sm">
                      {{ emp.fullName ? emp.fullName.charAt(0) : '?' }}
                    </div>
                    <span class="text-sm font-medium text-gray-800">{{ emp.fullName }}</span>
                  </div>
                </td>
                <td class="p-4 text-sm font-mono text-gray-600">{{ emp.EmployeeNumber }}</td>
                <td class="p-4 text-sm text-gray-700">
                  <span class="bg-blue-50 text-primary px-2.5 py-1 rounded-md text-xs font-semibold">
                    {{ emp.jobTitle }}
                  </span>
                </td>
                <td class="p-4 text-sm text-gray-600">{{ emp.department }}</td>
                <td class="p-4 text-sm">
                  <span 
                    :class="emp.employmentStatus === 'نشط' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'"
                    class="px-3 py-1 rounded-full text-[10px] font-black"
                  >
                    {{ emp.employmentStatus }}
                  </span>
                </td>
                <td class="p-4 text-sm">
                  <div class="flex items-center gap-4 justify-center">
                    <router-link 
                      :to="`/employees/${emp.publicId}`" 
                      class="p-2 text-primary hover:bg-[#E9F5DB] rounded-lg transition-all duration-300 hover:scale-110 flex items-center justify-center"
                      title="عرض وتعديل الملف الشامل"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                      </svg>
                    </router-link>

                    <router-link 
                      :to="`/employees/permissions/${emp.publicId}`" 
                      class="p-2 text-primary hover:bg-[#E9F5DB] rounded-lg transition-all duration-300 hover:scale-110 flex items-center justify-center"
                      title="إدارة الصلاحيات والاستثناءات"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
                      </svg>
                    </router-link>
                  </div>
                </td>
              </tr>

              <tr v-if="filteredEmployees.length === 0">
                <td colspan="6" class="text-center py-16 text-gray-400">
                  <div class="flex flex-col items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" class="w-12 h-12 mb-2 opacity-50">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
                    <span class="text-lg">لا توجد نتائج تطابق بحثك</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex justify-between items-center mt-6">
          <button
            @click="changePage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-4 py-2 border rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium text-gray-700"
          >
            السابق
          </button>

          <span class="text-sm font-medium text-gray-600">
            صفحة <span class="text-primary font-bold">{{ currentPage }}</span> من {{ totalPages }}
          </span>

          <button
            @click="changePage(currentPage + 1)"
            :disabled="currentPage >= totalPages"
            class="px-4 py-2 border rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium text-gray-700"
          >
            التالي
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import SidebarPage from "../components/Sidebar.vue";
import Navbar from "../components/Navbar.vue";
import api from "../services/api";

export default {
  name: "EmployeesList",
  components: { SidebarPage, Navbar },

  data() {
    return {
      employees: [],
      search: "",
      currentPage: 1,
      itemsPerPage: 10, 
    };
  },

  computed: {
    filteredEmployees() {
      const s = this.search.toLowerCase();
      return this.employees.filter(emp => {
        return (
          emp.fullName?.toLowerCase().includes(s) ||
          emp.jobTitle?.toLowerCase().includes(s) ||
          emp.department?.toLowerCase().includes(s) ||
          emp.EmployeeNumber?.toString().includes(s)
        );
      });
    },

    totalPages() {
      const pages = Math.ceil(this.filteredEmployees.length / this.itemsPerPage);
      return pages > 0 ? pages : 1;
    },

    startIndex() {
      return (this.currentPage - 1) * this.itemsPerPage;
    },
    
    endIndex() {
      return this.startIndex + this.itemsPerPage;
    },

    paginatedEmployees() {
      return this.filteredEmployees.slice(this.startIndex, this.endIndex);
    }
  },

  mounted() {
    this.fetchEmployees();
  },

  methods: {
    changePage(newPage) {
      if (newPage < 1 || newPage > this.totalPages) return;
      this.currentPage = newPage;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    async fetchEmployees() {
      try {
        const [empRes, adminRes] = await Promise.all([
          api.get("/Employee/all"),
          api.get("/EmployeeAdministrative/all-with-admin")
        ]);

     const employeesData = empRes.data.employees;
const adminData = Array.isArray(adminRes.data)
  ? adminRes.data
  : adminRes.data.data || adminRes.data;

this.employees = adminData
  .map(adm => {
    const emp = employeesData.find(e => e.id === adm.id);
    return {
      id: adm.id,
      fullName: adm.fullName,
      EmployeeNumber: emp ? emp.employeeNumber : "غير محدد",
      department: adm.department || "غير محدد",
      jobTitle: adm.jobTitle || "-",
      workLocation: adm.workLocation || "-",
      employmentStatus: adm.employmentStatus || "غير محدد",
      publicId: adm.employeePublicId, 
    };
  })
  .sort((a, b) => b.id - a.id);
      } catch (err) {
        console.error("خطأ في جلب الموظفين:", err);
      }
    }
  }
};
</script>

<style scoped>
.input { @apply bg-gray-50; }

::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: #f1f1f1;
}
::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
</style>