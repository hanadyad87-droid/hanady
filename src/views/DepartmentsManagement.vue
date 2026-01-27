<template>
  <div dir="rtl" class="flex min-h-screen bg-gray-100">
    <Sidebar class="fixed top-0 right-0 h-screen w-24 sm:w-28 md:w-60 z-50" />
    <div class="flex-1 mr-24 sm:mr-28 md:mr-60 p-4 sm:p-6">
      <Navbar />

      <div class="bg-white rounded-xl shadow p-6 max-w-5xl mx-auto mt-4">

        <!-- إضافة إدارة -->
        <div class="bg-gray-50 p-4 rounded-lg mb-6 border">
          <h3 class="font-bold mb-4">إضافة إدارة جديدة</h3>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div class="flex flex-col">
              <label class="text-sm text-gray-600 mb-1">اسم الإدارة</label>
              <input
                v-model="newDepartment.name"
                placeholder="اسم الإدارة"
                class="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
              />
            </div>

            <div class="flex flex-col">
              <label class="text-sm text-gray-600 mb-1">مدير الإدارة</label>
              <select v-model="newDepartment.managerId" class="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right">
                <option :value="null">اختر المدير (اختياري)</option>
                <option v-for="m in managers" :key="m.id" :value="m.id">
                  {{ m.fullName }}
                </option>
              </select>
            </div>

          </div>

          <div class="flex justify-center mt-6">
            <button 
              @click="createDepartment" 
              class="bg-primary hover:bg-primaryDark text-white px-6 py-2 rounded-lg transition"
            >
              إنشاء الإدارة
            </button>
          </div>
        </div>

        <!-- جدول الإدارات -->
        <div class="overflow-x-auto">
          <table class="w-full border rounded-lg text-right">
            <thead class="bg-gray-100">
              <tr>
                <th class="p-2 border font-bold">الإدارة</th>
                <th class="p-2 border font-bold">المدير</th>
                <th class="p-2 border font-bold">إجراء</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="d in departments" :key="d.id" class="hover:bg-gray-50">
                <td class="p-2 border">{{ d.name }}</td>

                <td class="p-2 border">
                  <select v-model="d.managerId" class="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right">
                    <option :value="null">بدون</option>
                    <option v-for="m in managers" :key="m.id" :value="m.id">
                      {{ m.fullName }}
                    </option>
                  </select>
                </td>

                <td class="p-2 border">
                  <button 
                    @click="assignManager(d)" 
                    class="bg-primary hover:bg-primaryDark text-white px-6 py-2 rounded-lg transition"
                  >
                    حفظ
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>

      <!-- Toast -->
      <ToastPage
        v-if="toastMessage"
        :message="toastMessage"
        :type="toastType"
        @update:visible="toastMessage = ''"
      />
    </div>
  </div>
</template>

<script>
import Sidebar from "../components/Sidebar.vue";
import Navbar from "../components/Navbar.vue";
import ToastPage from "../components/Toast.vue";
import api from "@/services/api";

export default {
  name: "DepartmentsManagement",
  components: { Sidebar, Navbar, ToastPage },
  data() {
    return {
      departments: [],
      managers: [],
      newDepartment: {
        name: "",
        managerId: null
      },
      toastMessage: "",
      toastType: "success"
    };
  },
  mounted() {
    this.loadData();
  },
  methods: {
    async loadData() {
      const [deps, mgrs] = await Promise.all([
        api.get("/Department"),
        api.get("/Employee/managers")
      ]);

      this.departments = deps.data.map(d => ({
        ...d,
        managerId: null
      }));

      this.managers = mgrs.data;
    },

    async createDepartment() {
      if (!this.newDepartment.name) {
        this.showToast("الرجاء إدخال اسم الإدارة ❌", "error");
        return;
      }

      try {
        await api.post("/Department", { name: this.newDepartment.name });

        if (this.newDepartment.managerId) {
          const deps = await api.get("/Department");
          const lastDep = deps.data.at(-1);
          await api.post(
            `/Employee/assign-manager?departmentId=${lastDep.id}&employeeId=${this.newDepartment.managerId}`
          );
        }

        this.showToast("تم إنشاء الإدارة بنجاح ✅", "success");
        this.newDepartment = { name: "", managerId: null };
        this.loadData();
      } catch (err) {
        this.showToast("حدث خطأ أثناء إنشاء الإدارة ❌", "error");
      }
    },

    async assignManager(dep) {
      if (!dep.managerId) {
        this.showToast("الرجاء اختيار مدير قبل الحفظ ❌", "error");
        return;
      }

      try {
        await api.post(
          `/Employee/assign-manager?departmentId=${dep.id}&employeeId=${dep.managerId}`
        );
        this.showToast("تم تعيين المدير ✅", "success");
      } catch (err) {
        this.showToast("حدث خطأ أثناء تعيين المدير ❌", "error");
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
