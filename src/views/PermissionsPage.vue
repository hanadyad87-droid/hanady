<template>
  <div class="flex h-screen bg-gray-100" dir="rtl">
    <Sidebar class="fixed top-0 right-0 h-screen w-24 md:w-64 bg-primary text-white p-4 z-50" />
    <div class="flex-1 p-6 min-h-screen mr-24 md:mr-64">
      <Navbar />

      <main class="p-6 overflow-auto">
        <div class="bg-white shadow-xl rounded-2xl p-6 max-w-7xl mx-auto flex flex-col gap-8">

          <!-- اختيار الموظف -->
          <div class="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <div>     
              <label class="text-base font-semibold text-gray-700 mb-2">اختر الموظف</label>
              <select v-model="selectedEmployeeId" @change="loadUserPermissions"
                      class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition">
                <option :value="null">-- اختر الموظف --</option>
                <option v-for="e in employees" :key="e.id" :value="e.id">
                  {{ e.fullName }}
                </option>
              </select>
            </div>
          </div>

        <!-- جدول الصلاحيات حسب الفئة -->
<div v-for="(category, index) in categories" :key="index" class="border border-gray-200 rounded-xl p-5 bg-gray-50 shadow-sm">
  <div class="flex justify-between items-center mb-4">
    <span class="font-semibold text-lg text-gray-800">{{ category.name }}</span>
    <label class="flex items-center gap-2 text-sm text-gray-600 font-medium cursor-pointer">
      <input type="checkbox" v-model="category.selectAll" @change="toggleCategory(category)"
             class="w-4 h-4 accent-blue-500" />
      تحديد الكل
    </label>
  </div>

  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <label v-for="perm in category.permissions" :key="perm.permissionName"
           class="flex items-center gap-2 text-sm bg-white p-3 rounded-lg shadow hover:shadow-md hover:bg-blue-50 transition cursor-pointer">
      <input type="checkbox" v-model="perm.hasPermission" class="w-4 h-4 accent-blue-500" />
      <span>{{ perm.permissionName }}</span>
      <span v-if="perm.isException" class="text-red-500 text-xs font-semibold">(استثناء)</span>
    </label>
  </div>
</div>


          <!-- زر الحفظ -->
          <div class="flex justify-center mt-6">
            <button @click="savePermissions"
              class="bg-primary hover:bg-primaryDark text-white py-3 px-8 rounded-lg transition font-semibold shadow-md hover:shadow-lg">
              حفظ الصلاحيات
            </button>
          </div>

          <!-- Toast -->
          <Toast v-if="toastMessage" :message="toastMessage" :type="toastType" />
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.bg-gray-50 {
  background-color: #f9fafb;
}
input[type="checkbox"] {
  accent-color: #2563eb;
}

/* تحسين البطاقات */
label:hover {
  transform: translateY(-2px);
  transition: transform 0.2s ease;
}

/* زر الحفظ */
button:focus {
  outline: none;
  ring: 2px solid #2563eb;
}

/* تحسين المسافات بين الفئات */
.grid > label {
  min-height: 50px;
}
</style>


<script>
import Navbar from "../components/Navbar.vue";
import Sidebar from "../components/Sidebar.vue";
import Toast from "../components/Toast.vue";
import api from "../services/api";

export default {
  name: "PermissionsPage",
  components: { Navbar, Sidebar, Toast },
  data() {
    return {
      selectedEmployeeId: null,
      employees: [],
      permissions: [],
      categories: [],
      toastMessage: "",
      toastType: "success"
    };
  },
  created() {
    this.loadEmployees();
    this.loadPermissions();
  },
  methods: {
    async loadEmployees() {
      try {
        const { data } = await api.get("/Employee/all", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        // نحتفظ بنفس أسماء الخصائص مثل API
        this.employees = data; // الآن كل عنصر فيه {id, fullName, employeeNumber}
      } catch (err) {
        console.error(err);
        this.showToast("❌ فشل تحميل الموظفين", "error");
      }
    },

    async loadPermissions() {
      try {
        const { data } = await api.get("/Permission/all", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        this.permissions = data.map(p => ({ ...p, hasPermission: false, isException: false }));

        const categoriesMap = {};
        this.permissions.forEach(p => {
          const cat = p.category || "عام";
          if (!categoriesMap[cat]) categoriesMap[cat] = [];
          categoriesMap[cat].push(p);
        });

        this.categories = Object.keys(categoriesMap).map(name => ({
          name,
          permissions: categoriesMap[name],
          selectAll: false
        }));

      } catch (err) {
        console.error(err);
        this.showToast("❌ فشل تحميل الصلاحيات", "error");
      }
    },

    async loadUserPermissions() {
      if (!this.selectedEmployeeId) return;
      try {
        const { data } = await api.get(`/PermissionsManagement/user-summary/${this.selectedEmployeeId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });

        this.permissions.forEach(p => {
          let has = data.defaultPermissions.includes(p.permissionName);
          const exception = data.exceptions.find(e => e.permissionName === p.permissionName);
          if (exception) has = exception.isAllowed;
          p.hasPermission = has;
          p.isException = !!exception;
        });

        this.categories.forEach(cat => {
          cat.selectAll = cat.permissions.every(p => p.hasPermission);
        });

      } catch (err) {
        console.error(err);
        this.showToast("❌ فشل تحميل صلاحيات الموظف", "error");
      }
    },

    toggleCategory(category) {
      category.permissions.forEach(p => (p.hasPermission = category.selectAll));
    },

    async savePermissions() {
      if (!this.selectedEmployeeId) {
        this.showToast("الرجاء اختيار الموظف", "error");
        return;
      }

      try {
        const promises = this.permissions.map(p =>
          api.post("/PermissionsManagement/set-exception", null, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            },
            params: {
              userId: this.selectedEmployeeId,
              permissionId: p.id,
              isAllowed: p.hasPermission
            }
          })
        );

        await Promise.all(promises);
        this.showToast("✅ تم حفظ الصلاحيات بنجاح", "success");
        await this.loadUserPermissions();

      } catch (err) {
        console.error(err);
        this.showToast("❌ فشل الحفظ", "error");
      }
    },

    showToast(message, type = "success") {
      this.toastMessage = message;
      this.toastType = type;
      setTimeout(() => (this.toastMessage = ""), 2500);
    }
  }
};
</script>


