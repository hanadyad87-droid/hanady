<template>
  <div dir="rtl" class="flex min-h-screen bg-gray-100">

    <Sidebar class="fixed top-0 right-0 h-screen w-24 sm:w-28 md:w-60 z-40" />
    <div class="flex-1 mr-24 sm:mr-28 md:mr-60 p-4 sm:p-6">
      <Navbar />

      <div class="bg-white rounded-2xl shadow-lg p-8 max-w-6xl mx-auto mt-0.5 relative">

        <!-- زر إضافة تعيين -->
        <button
          @click="showAssignModal = true"
          class="absolute top-6 left-40 bg-primary hover:bg-primaryDark text-white px-6 py-2 rounded-xl font-semibold shadow-md transition"
        >
          + تعيين مدير
        </button>

        <!-- زر إضافة جديد -->
        <button
          @click="showAddModal = true"
          class="absolute top-6 left-6 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-xl font-semibold shadow-md transition"
        >
          + إضافة جديد
        </button>

        <!-- جدول المديرين -->
        <div class="overflow-x-auto mt-12">
          <table class="min-w-full divide-y divide-gray-200 text-right">
            <thead class="bg-navbar">
              <tr>
                <th class="p-2 border font-bold">النوع</th>
                <th class="p-2 border font-bold">الاسم</th>
                <th class="p-2 border font-bold">المدير الحالي</th>
                <th class="p-2 border font-bold">المدير السابق</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="m in allManagers" :key="m.id">
                <td class="p-2 border">{{ m.type }}</td>
                <td class="p-2 border">{{ m.name }}</td>
                <td class="p-2 border">{{ m.currentManager || "لا يوجد" }}</td>
                <td class="p-2 border">{{ m.previousManager || "لا يوجد" }}</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>

      <!-- ================= مودال التعيين ================= -->
      <div v-if="showAssignModal" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div class="bg-white p-6 rounded-lg shadow w-96">

          <h3 class="text-lg font-bold mb-4">تعيين مدير</h3>

          <div class="flex flex-col gap-4">

            <!-- اختيار الموظف -->
            <select v-model="selectedEmployeeId" class="p-2 border rounded-lg">
              <option :value="null">-- اختر موظف --</option>
              <option v-for="emp in employees" :key="emp.id" :value="emp.id">
                {{ emp.fullName }}
              </option>
            </select>

            <!-- اختيار النوع -->
            <select v-model="selectedType" @change="onTypeChange" class="p-2 border rounded-lg">
              <option :value="null">-- اختر النوع --</option>
              <option value="department">إدارة</option>
              <option value="subdepartment">إدارة فرعية</option>
              <option value="section">قسم</option>
            </select>

            <!-- اختيار الكيان -->
            <select v-if="managerTargets.length"
                    v-model="selectedEntityId"
                    class="p-2 border rounded-lg">
              <option :value="null">-- اختر --</option>
              <option v-for="t in managerTargets" :key="t.id" :value="t.id">
                {{ t.name }}
              </option>
            </select>

            <div class="flex justify-end gap-2 mt-4">
              <button @click="closeAssignModal" class="px-4 py-2 border rounded-lg">
                إلغاء
              </button>

              <button @click="submitAssign"
                      class="bg-primary hover:bg-primaryDark text-white px-6 py-2 rounded-lg font-semibold">
                حفظ
              </button>
            </div>

          </div>
        </div>
      </div>

      <!-- ================= مودال الإضافة ================= -->
      <div v-if="showAddModal" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div class="bg-white p-6 rounded-lg shadow w-96">
          <h3 class="text-lg font-bold mb-4">إضافة جديد</h3>

          <div class="flex flex-col gap-4">
            <select v-model="addType" @change="onAddTypeChange" class="p-2 border rounded-lg">
              <option :value="null">-- اختر النوع --</option>
              <option value="department">إدارة</option>
              <option value="subdepartment">إدارة فرعية</option>
              <option value="section">قسم</option>
            </select>

            <input v-model="addName" type="text" placeholder="اسم الكيان" class="p-2 border rounded-lg" />

            <!-- اختيار الأب إذا الإدارة الفرعية أو القسم -->
            <select v-if="parentTargets.length" v-model="selectedParentId" class="p-2 border rounded-lg">
              <option :value="null">-- اختر الأب --</option>
              <option v-for="p in parentTargets" :key="p.id" :value="p.id">
                {{ p.name }}
              </option>
            </select>

            <div class="flex justify-end gap-2 mt-4">
              <button @click="closeAddModal" class="px-4 py-2 border rounded-lg">إلغاء</button>
              <button @click="submitAdd" class="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold">
                حفظ
              </button>
            </div>

          </div>
        </div>
      </div>

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
  components: { Sidebar, Navbar, ToastPage },

  data() {
    return {
      employees: [],
      departments: [],
      subDepartments: [],
      sections: [],
      allManagers: [],

      // مودال التعيين
      showAssignModal: false,
      selectedEmployeeId: null,
      selectedType: null,
      selectedEntityId: null,
      managerTargets: [],

      // مودال الإضافة
      showAddModal: false,
      addType: null,
      addName: "",
      parentTargets: [],
      selectedParentId: null,

      toastMessage: "",
      toastType: "success"
    };
  },

  mounted() {
    this.loadAllData();
  },

  methods: {
    async loadAllData() {
      try {
        const [empRes, depRes, subRes, secRes] = await Promise.all([
          api.get("/Employee/all"),
          api.get("/Organization/Departments"),
          api.get("/Organization/SubDepartments"),
          api.get("/Organization/Sections")
        ]);

        this.employees = empRes.data;
        this.departments = depRes.data;
        this.subDepartments = subRes.data;
        this.sections = secRes.data;

        this.loadManagerTable();
      } catch {
        this.showToast("خطأ في تحميل البيانات ❌", "error");
      }
    },

    // ======== تعيين المدير ========
    onTypeChange() {
      this.selectedEntityId = null;
      if (this.selectedType === "department") this.managerTargets = this.departments;
      else if (this.selectedType === "subdepartment") this.managerTargets = this.subDepartments;
      else if (this.selectedType === "section") this.managerTargets = this.sections;
      else this.managerTargets = [];
    },

  async submitAssign() {
  if (!this.selectedEmployeeId || !this.selectedType || !this.selectedEntityId) {
    this.showToast("يرجى تعبئة كل الحقول ❌", "error");
    return;
  }

  // تحديد الدور حسب النوع
  let roleId;
  if (this.selectedType === "department") roleId = 3;
  else if (this.selectedType === "subdepartment") roleId = 4;
  else if (this.selectedType === "section") roleId = 5;

  try {
    await api.post("/Employee/assign-role-and-entity", {
      EmployeeId: this.selectedEmployeeId,
      Type: this.selectedType,
      EntityId: this.selectedEntityId,
      RoleId: roleId
    });

    this.showToast("تم التعيين بنجاح ✅", "success");
    this.closeAssignModal();
    this.loadAllData();
  } catch (err) {
    this.showToast(err.response?.data || "حدث خطأ ❌", "error");
  }
},

    loadManagerTable() {
      this.allManagers = [
        ...this.departments.map(d => ({
          id: d.id, type: "إدارة", name: d.name,
          currentManager: d.managerName, previousManager: d.previousManagerName
        })),
        ...this.subDepartments.map(s => ({
          id: s.id, type: "إدارة فرعية", name: s.name,
          currentManager: s.managerName, previousManager: s.previousManagerName
        })),
        ...this.sections.map(s => ({
          id: s.id, type: "قسم", name: s.name,
          currentManager: s.managerName, previousManager: s.previousManagerName
        }))
      ];
    },

    closeAssignModal() {
      this.showAssignModal = false;
      this.selectedEmployeeId = null;
      this.selectedType = null;
      this.selectedEntityId = null;
      this.managerTargets = [];
    },

    showToast(message, type = "success") {
      this.toastMessage = message;
      this.toastType = type;
      setTimeout(() => this.toastMessage = "", 2500);
    },

    // ======== إضافة جديد ========
    onAddTypeChange() {
      this.selectedParentId = null;
      if (this.addType === "subdepartment") this.parentTargets = this.departments;
      else if (this.addType === "section") this.parentTargets = this.subDepartments;
      else this.parentTargets = [];
    },

    closeAddModal() {
      this.showAddModal = false;
      this.addType = null;
      this.addName = "";
      this.parentTargets = [];
      this.selectedParentId = null;
    },

   async submitAdd() {
  if (!this.addType || !this.addName || (this.parentTargets.length && !this.selectedParentId)) {
    this.showToast("يرجى تعبئة كل الحقول ❌", "error");
    return;
  }

  try {
    if (this.addType === "department") {
      // إرسال الاسم في body كـ JSON
      await api.post(`/Organization/AddDepartment`, {
        name: this.addName
      });
    } else if (this.addType === "subdepartment") {
      await api.post(`/Organization/AddSubDepartment`, {
        name: this.addName,
        departmentId: this.selectedParentId
      });
    } else if (this.addType === "section") {
      await api.post(`/Organization/AddSection`, {
        name: this.addName,
        subDeptId: this.selectedParentId
      });
    }

    this.showToast("تمت الإضافة بنجاح ✅", "success");
    this.closeAddModal();
    this.loadAllData();
  } catch (err) {
    this.showToast(err.response?.data || "حدث خطأ ❌", "error");
  }
}

  }
};
</script>