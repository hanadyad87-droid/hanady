<template>
  <div class="flex h-screen bg-gray-100" dir="rtl">
    
     <Sidebar class="fixed top-0 right-0 h-screen w-24 md:w-64 bg-primary text-white p-4 z-50" />


    <!-- Main content -->
    <div class="flex-1 p-6 min-h-screen mr-24 md:mr-64">
      <Navbar />

      <!-- Mobile Sidebar -->
      <transition name="slide">
        <aside v-if="sidebarOpen" class="fixed inset-0 bg-black bg-opacity-30 z-50 md:hidden">
          <div class="absolute right-0 w-64 bg-blue-800 h-full p-4">
            <button @click="sidebarOpen = false" class="text-white text-xl mb-4">✕</button>
            <ul class="flex flex-col gap-2">
              <li v-for="link in links" :key="link.name">
                <router-link 
                  :to="link.path"
                  class="flex items-center gap-2 px-2 py-2 rounded hover:bg-blue-700 transition"
                  @click="sidebarOpen=false"
                  :class="$route.path === link.path ? 'bg-gray-200 text-gray-900 font-semibold' : ''"
                >
                  <span>{{ link.icon }}</span>
                  <span>{{ link.name }}</span>
                </router-link>
              </li>
            </ul>
          </div>
        </aside>
      </transition>

      <!-- Page content -->
      <main class="p-6 overflow-auto">
        <h2 class="text-2xl font-bold text-blue-800 mb-4">إدارة الصلاحيات</h2>

        <div class="bg-white shadow rounded-xl p-6 max-w-4xl mx-auto flex flex-col gap-6">

          <!-- اختيار الموظف -->
          <div>
            <label class="block mb-1 font-medium text-gray-700">اختر الموظف</label>
            <select v-model="selectedEmployee" class="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option disabled value="">ابحث باسم الموظف...</option>
              <option v-for="emp in filteredEmployees" :key="emp.id" :value="emp">{{ emp.FullName }}</option>
            </select>
          </div>

          <!-- اختيار الصلاحية -->
          <div>
            <label class="block mb-1 font-medium text-gray-700">الصلاحية</label>
            <select v-model="selectedRole" class="w-full p-2 border rounded-lg">
              <option disabled value="">اختر الصلاحية</option>
              <option v-for="role in roles" :key="role" :value="role">{{ role }}</option>
            </select>
          </div>

          <!-- اختيار الوظائف والصلاحيات -->
          <div>
            <h3 class="font-bold text-lg mb-2">وظائف الموظف</h3>
            <div v-for="(func, index) in functions" :key="index" class="border rounded-lg p-3 mb-3">
              <div class="flex justify-between items-center mb-2">
                <span class="font-semibold">{{ func.name }}</span>
                <label class="flex items-center gap-2 text-sm">
                  <input type="checkbox" v-model="func.selectAll" @change="toggleAll(func)">
                  تحديد الكل
                </label>
              </div>
              <div class="grid grid-cols-2 md:grid-cols-5 gap-2">
                <label v-for="perm in permissions" :key="perm" class="flex items-center gap-1 text-sm">
                  <input type="checkbox" v-model="func.perms" :value="perm">
                  {{ perm }}
                </label>
              </div>
            </div>
          </div>

          <!-- زر حفظ -->
          <div class="flex justify-center mt-4">
            <button @click="savePermissions" class="bg-primary hover:bg-primaryDark text-white py-2 px-6 rounded-lg transition w-full max-w-xs">
              حفظ
            </button>
          </div>

          <!-- Toast -->
          <Toast v-if="toastMessage" :message="toastMessage" :type="toastType" />

        </div>
      </main>
    </div>

  </div>
</template>

<script>
import Toast from "../components/Toast.vue";
import Navbar from "../components/Navbar.vue";
import Sidebar from "../components/Sidebar.vue";

export default {
  name: "PermissionsPage",
  components: { Toast, Sidebar, Navbar },
  data() {
    return {
      sidebarOpen: false,
      selectedEmployee: null,
      employees: [
        { id: 1, FullName: "هند عبدالله" },
        { id: 2, FullName: "محمد علي" },
        { id: 3, FullName: "سامي محمود" },
        { id: 4, FullName: "ميساء يوسف" }
      ],
      selectedRole: "",
      roles: ["موظف", "مدير قسم", "مدير إدارة", "مسؤول النظام", "موارد بشرية", "IT/توثيق"],
      permissions: ["عرض", "إضافة", "حذف", "تعديل", "طباعة"],
      functions: [
    
        { name: "الشكاوى", perms: [], selectAll: false },
        { name: "الإجازات", perms: [], selectAll: false },
        { name: "الطلبات", perms: [], selectAll: false },
        { name: "النماذج", perms: [], selectAll: false },
       
     { name: "التقييم", perms: [], selectAll: false },
       
     { name: "مركز المعرفة", perms: [], selectAll: false },
       { name: "إدارة الصلاحيات RBAC", perms: [], selectAll: false },

    
    
    ],
      toastMessage: "",
      toastType: "success",
      employeeSearch: ""
    };
  },
  computed: {
    filteredEmployees() {
      const search = this.employeeSearch.toLowerCase();
      return this.employees.filter(emp => emp.FullName.toLowerCase().includes(search));
    },
    links() {
      const role = localStorage.getItem("role") || "موظف";
      const allLinks = [
        { name: "الرئيسية", path: "/dashboard", icon: "🏠", roles: ["موظف","مدير قسم","مدير إدارة","مسؤول النظام"] },
        { name: "إضافة موظف", path: "/employee", icon: "👤", roles: ["مسؤول النظام"] },
        { name: "الطلبات", path: "/requests", icon: "📄", roles: ["موظف","مدير قسم","مدير إدارة"] },
        { name: "الإجازات", path: "/leaves", icon: "✈️", roles: ["موظف","مدير قسم","مدير إدارة"] },
        { name: "المؤهل العلمي", path: "/employee-qualification", icon: "🎓", roles: ["موظف","مدير قسم","مدير إدارة"] },
        { name: "إدارة الصلاحيات", path: "/permissions", icon: "🔑", roles: ["مسؤول النظام"] },
      ];
      return allLinks.filter(l => l.roles.includes(role));
    }
  },
  methods: {
    toggleAll(func) {
      func.perms = func.selectAll ? [...this.permissions] : [];
    },
    savePermissions() {
      if (!this.selectedEmployee) {
        this.toastMessage = "الرجاء اختيار الموظف";
        this.toastType = "error";
        return;
      }
      if (!this.selectedRole) {
        this.toastMessage = "الرجاء اختيار الصلاحية";
        this.toastType = "error";
        return;
      }

      console.log("Employee:", this.selectedEmployee);
      console.log("Role:", this.selectedRole);
      console.log("Functions:", this.functions);

      this.toastMessage = "تم حفظ الصلاحيات بنجاح ✅";
      this.toastType = "success";

      setTimeout(() => { this.toastMessage = ""; }, 2000);
    }
  }
};
</script>


