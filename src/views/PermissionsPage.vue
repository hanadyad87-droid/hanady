<template>
  <div class="flex min-h-screen bg-gray-50 font-cairo" dir="rtl">
    <SidebarPage />

    <div class="flex-1 w-full min-w-0 p-4 sm:p-6 mr-0 lg:mr-60">
      <Navbar />

      <div v-if="loading" class="text-center mt-20 text-primary animate-pulse font-bold">
        جاري سحب بيانات الصلاحيات من السيرفر...
      </div>

      <template v-else>
        <div class="flex justify-between items-center mb-8 mt-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-[#E9F5DB] text-primary rounded-xl flex items-center justify-center text-xl font-bold shadow-sm">
              {{ currentEmployeeName ? currentEmployeeName.charAt(0) : '?' }}
            </div>
            <div>
              <h1 class="text-xl font-bold text-gray-800">إدارة الاستثناءات والصلاحيات</h1>
              <p class="text-primary text-xs font-semibold">الموظف: {{ currentEmployeeName }}</p>
            </div>
          </div>
          <button @click="$router.go(-1)" class="text-gray-400 hover:text-primary transition-colors flex items-center gap-1 text-sm font-semibold">
            <span>رجوع</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
        </div>

        <div class="space-y-8">
          <div v-for="category in categories" :key="category.name" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            
            <div class="flex justify-between items-center mb-6 pb-4 border-b border-gray-50">
              <h3 class="font-bold text-gray-800 border-r-4 border-primary pr-3">
                {{ category.name }}
              </h3>
              <label class="flex items-center gap-2 text-xs font-bold text-primary cursor-pointer hover:underline">
                <input 
                  type="checkbox" 
                  v-model="category.selectAll" 
                  @change="toggleCategory(category)" 
                  class="w-4 h-4 rounded accent-primary" 
                />
                تحديد الكل
              </label>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div 
                v-for="perm in category.permissions" :key="perm.id" 
                class="flex items-center justify-between p-4 rounded-xl border transition-all"
                :class="perm.hasPermission ? 'border-primary/20 bg-primary/[0.02]' : 'border-gray-100 bg-gray-50/30'"
              >
                <div class="flex flex-col gap-1">
                  <span class="text-sm font-bold" :class="perm.hasPermission ? 'text-gray-800' : 'text-gray-400'">
                    {{ perm.permissionName }}
                  </span>
                  
                  <span v-if="perm.isException" class="text-[10px] text-orange-600 font-bold flex items-center gap-1">
                    <span class="w-1 h-1 bg-orange-500 rounded-full"></span>
                    تعديل مخصص
                  </span>
                  <span v-else class="text-[10px] text-gray-400 flex items-center gap-1">
                    <span class="w-1 h-1 bg-gray-300 rounded-full"></span>
                    موروثة
                  </span>
                </div>

                <label class="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    v-model="perm.hasPermission" 
                    @change="updateSelectAllStatus" 
                    class="sr-only peer"
                  >
                  <div class="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div class="sticky bottom-6 mt-10 flex justify-center">
          <button 
            @click="savePermissions" 
            :disabled="saving"
            class="flex items-center justify-center gap-3 w-full max-w-md bg-primary hover:bg-green-700 text-white py-4 rounded-2xl font-bold transition-all shadow-xl disabled:bg-gray-300"
          >
            <span v-if="saving" class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
            <span v-else>حفظ التغييرات النهائية</span>
            <svg v-if="!saving" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </button>
        </div>

      </template>

      <ToastPage v-if="showToast" :message="toastMessage" :type="toastType" />
    </div>
  </div>
</template>

<script>
import Navbar from "../components/Navbar.vue";
import SidebarPage from "../components/Sidebar.vue";
import ToastPage from "../components/Toast.vue";
import api from "../services/api";

export default {
  components: { Navbar, SidebarPage, ToastPage },
  props: ['publicId'],

  data() {
    return {
      selectedPublicId: null,
      currentEmployeeName: "",
      permissions: [],
      categories: [],
      loading: true,
      saving: false,
      showToast: false,
      toastMessage: "",
      toastType: "success"
    };
  },

  mounted() {
    this.selectedPublicId = this.publicId;
    this.loadPermissionsData();
  },

  methods: {
    async loadPermissionsData() {
      this.loading = true;
      try {
        const [allRes, summaryRes] = await Promise.all([
          api.get("/Permission/all"),
          api.get(`/PermissionsManagement/user-summary/${this.selectedPublicId}`)
        ]);

        const all = allRes.data;
        const summary = summaryRes.data;

        this.currentEmployeeName = summary.employeeName;
        const defaults = summary.defaultPermissions.map(n => String(n).trim());

        this.permissions = all.map(p => {
          const exc = summary.exceptions.find(e =>
            String(e.permissionName).trim() === String(p.permissionName).trim()
          );

          let status = exc ? exc.isAllowed : defaults.includes(String(p.permissionName).trim());
          
          return {
            ...p,
            hasPermission: status,
            isException: !!exc,
            originalStatus: status
          };
        });

        this.groupIntoCategories();
        this.updateSelectAllStatus();

      } catch (err) {
        this.toast("خطأ في تحميل البيانات", "error");
      } finally {
        this.loading = false;
      }
    },

    groupIntoCategories() {
      const result = {};
      this.permissions.forEach(p => {
        let category = "صلاحيات عامة";
        if (p.permissionName.includes("Employee") || p.permissionName.includes("Role")) category = "إدارة الموظفين";
        else if (p.permissionName.includes("Leave") || p.permissionName.includes("Exit")) category = "الإجازات والطلبات";
        else if (p.permissionName.includes("Education")) category = "المؤهلات العلمية";

        if (!result[category]) result[category] = [];
        result[category].push(p);
      });

      this.categories = Object.keys(result).map(key => ({
        name: key,
        permissions: result[key],
        selectAll: false
      }));
    },

    updateSelectAllStatus() {
      this.categories.forEach(c => {
        c.selectAll = c.permissions.every(p => p.hasPermission);
      });
    },

    toggleCategory(cat) {
      cat.permissions.forEach(p => {
        p.hasPermission = cat.selectAll;
      });
    },

    async savePermissions() {
      const changed = this.permissions.filter(p => p.hasPermission !== p.originalStatus);
      if (changed.length === 0) return this.toast("لا توجد تغييرات", "info");

      this.saving = true;
      try {
        for (const p of changed) {
          await api.post(`/PermissionsManagement/set-exception`, null, {
            params: {
              publicId: this.selectedPublicId,
              permissionId: p.id,
              isAllowed: p.hasPermission
            }
          });
        }
        this.toast("تم الحفظ بنجاح");
        await this.loadPermissionsData();
      } catch (err) {
        this.toast("فشل الحفظ", "error");
      } finally {
        this.saving = false;
      }
    },

    toast(msg, type = "success") {
      this.toastMessage = msg;
      this.toastType = type;
      this.showToast = true;
      setTimeout(() => this.showToast = false, 3000);
    }
  }
};
</script>