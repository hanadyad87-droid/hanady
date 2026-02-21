<template>
  <div dir="rtl" class="flex min-h-screen bg-gray-100">


    <Sidebar class="fixed top-0 right-0 h-screen w-24 sm:w-28 md:w-60 z-40" />
    <div class="flex-1 mr-24 sm:mr-28 md:mr-60 p-4 sm:p-6">
      <Navbar />

       <div class="bg-white rounded-2xl shadow-lg p-8 max-w-6xl mx-auto mt-0.5 relative">

        <!-- زر الإضافة ثابت أعلى اليسار -->
        <button
          @click="showAddModal = true"
          class="absolute top-6 left-6 bg-primary hover:bg-primaryDark text-white px-6 py-2 rounded-xl font-semibold shadow-md transition"
        >
          + إضافة إدارة
        </button>
        <!-- ==================== اختيار الموظف ==================== -->
        <div class="mb-6">
    

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="flex flex-col">
              <label class="text-sm text-gray-600 mb-1">اختر الموظف</label>
              <select v-model="selectedEmployeeId" class="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" @change="onEmployeeChange">
                <option :value="null">-- اختر موظف --</option>
                <option v-for="emp in employees" :key="emp.id" :value="emp.id">
                  {{ emp.fullName }} 
                </option>
              </select>
            </div>

            <div class="flex flex-col">
              <label class="text-sm text-gray-600 mb-1">اختر الرول</label>
              <select v-model="selectedRoleId" class="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" @change="onRoleChange">
                <option :value="null">-- اختر الدور --</option>
                <option v-for="r in roles" :key="r.Id" :value="r.Id">{{ r.RoleName }}</option>
              </select>
            </div>

            <div class="flex items-end">
              <button @click="addRole" class="bg-primary hover:bg-primaryDark text-white px-6 py-2 rounded-xl font-semibold shadow-md transition">
                إضافة دور
              </button>
            </div>
          </div>
        </div>

        <!-- ==================== اختيار الإدارة/القسم حسب الرول ==================== -->
        <div v-if="showManagerDropdown" class="mb-6">
          <h3 class="text-xl font-bold mb-4">تعيين المدير</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div class="flex flex-col">
              <label class="text-sm text-gray-600 mb-1">اختر الإدارة / القسم</label>
              <select v-model="selectedManagerTargetId" class="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option :value="null">-- اختر --</option>
                <option v-for="t in managerTargets" :key="t.id" :value="t.id">{{ t.name }}</option>
              </select>
            </div>

            <div class="flex items-end">
              <button @click="assignManager" class="bg-primary hover:bg-primaryDark text-white px-6 py-2 rounded-xl font-semibold shadow-md transition">
                تعيين المدير
              </button>
            </div>
          </div>
        </div>

        <!-- ==================== جدول المديرين ==================== -->
        <div class="overflow-x-auto">
          <table class="w-full border rounded-lg text-right mt-4">
            <thead class="bg-gray-100">
              <tr>
                <th class="p-2 border font-bold">النوع</th>
                <th class="p-2 border font-bold">الإدارة / الإدارة الفرعية / القسم</th>
                <th class="p-2 border font-bold">المدير الحالي</th>
                <th class="p-2 border font-bold">المدير السابق</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="m in allManagers" :key="m.id" class="hover:bg-gray-50">
                <td class="p-2 border">{{ m.type }}</td>
                <td class="p-2 border">{{ m.name }}</td>
                <td class="p-2 border">{{ m.currentManager || "لا يوجد" }}</td>
                <td class="p-2 border">{{ m.previousManager || "لا يوجد" }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ==================== بوباب الإضافة ==================== -->
      <div v-if="showAddModal" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div class="bg-white p-6 rounded-lg shadow w-96">
          <h3 class="text-lg font-bold mb-4">إضافة جديد</h3>
          <div class="flex flex-col gap-4">
            <select v-model="addType" class="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option :value="null">-- اختر نوع الإضافة --</option>
              <option value="Department">إدارة</option>
              <option value="SubDepartment">إدارة فرعية</option>
              <option value="Section">قسم</option>
            </select>

            <input v-model="addName" type="text" placeholder="الاسم" class="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />

            <!-- اختيار الإدارة للأقسام أو الإدارة الفرعية -->
            <select v-if="addType === 'SubDepartment'" v-model="selectedParentDepartmentId" class="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option :value="null">-- اختر الإدارة --</option>
              <option v-for="d in departments" :key="d.id" :value="d.id">{{ d.name }}</option>
            </select>

            <select v-if="addType === 'Section'" v-model="selectedParentSubDepartmentId" class="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option :value="null">-- اختر الإدارة الفرعية --</option>
              <option v-for="s in subDepartments" :key="s.id" :value="s.id">{{ s.name }}</option>
            </select>

            <div class="flex justify-end gap-2">
              <button @click="showAddModal = false" class="px-4 py-2 rounded-lg border hover:bg-gray-100">إلغاء</button>
              <button @click="submitAdd" class="bg-primary hover:bg-primaryDark text-white px-6 py-2 rounded-lg font-semibold transition w-full md:w-auto">إضافة</button>
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
  name: "DepartmentsManagement",
  components: { Sidebar, Navbar, ToastPage },
  data() {
    return {
      employees: [],
      roles: [
       
        { Id: 3, RoleName: "مدير ادارة" },
        { Id: 4, RoleName: "مدير ادارة فرعية" },
        { Id: 5, RoleName: "مدير قسم" },
       
      ],
      departments: [],
      subDepartments: [],
      sections: [],
      allManagers: [],
      selectedEmployeeId: null,
      selectedRoleId: null,
      employeeRoles: [],
      managerTargets: [],
      selectedManagerTargetId: null,
      showManagerDropdown: false,
      toastMessage: "",
      toastType: "success",

      // بوباب الإضافة
      showAddModal: false,
      addType: null,
      addName: "",
      selectedParentDepartmentId: null,
      selectedParentSubDepartmentId: null
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
          api.get("/Department"),
          api.get("/SubDepartment"),
          api.get("/Section")
        ]);

        this.employees = empRes.data;
        this.departments = depRes.data;
        this.subDepartments = subRes.data;
        this.sections = secRes.data;

        this.loadManagerTable();
      } catch (err) {
        this.showToast("حدث خطأ أثناء تحميل البيانات ❌", "error");
      }
    },

    onEmployeeChange() {
      const emp = this.employees.find(e => e.id === this.selectedEmployeeId);
      if (!emp) return;
      this.employeeRoles = emp.rolesIds || [];
      this.selectedRoleId = this.employeeRoles.length === 1 ? this.employeeRoles[0] : null;
      this.onRoleChange();
    },

    onRoleChange() {
      this.selectedManagerTargetId = null;
      if (this.selectedRoleId === 3) this.managerTargets = this.departments;
      else if (this.selectedRoleId === 4) this.managerTargets = this.subDepartments;
      else if (this.selectedRoleId === 5) this.managerTargets = this.sections;
      else this.managerTargets = [];
      this.showManagerDropdown = this.managerTargets.length > 0;
    },

    async addRole() {
      if (!this.selectedEmployeeId || !this.selectedRoleId) {
        this.showToast("الرجاء اختيار الموظف والرول ❌", "error");
        return;
      }
      if (this.employeeRoles.includes(this.selectedRoleId)) {
        this.showToast("الموظف لديه هذا الرول مسبقًا ❌", "error");
        return;
      }
      try {
        await api.post("/Employee/add-role", null, {
          params: { employeeId: this.selectedEmployeeId, roleId: this.selectedRoleId }
        });
        this.showToast("تمت إضافة الرول بنجاح ✅", "success");
        this.employeeRoles.push(this.selectedRoleId);
      } catch {
        this.showToast("حدث خطأ أثناء إضافة الرول ❌", "error");
      }
    },

    async assignManager() {
      if (!this.selectedManagerTargetId || !this.selectedEmployeeId) {
        this.showToast("الرجاء اختيار الموظف والإدارة ❌", "error");
        return;
      }
      try {
        let url = "";
        const params = { employeeId: this.selectedEmployeeId };
        if (this.selectedRoleId === 3) { url = "/Department/AssignManager"; params.deptId = this.selectedManagerTargetId; }
        else if (this.selectedRoleId === 4) { url = "/SubDepartment/AssignManager"; params.subDeptId = this.selectedManagerTargetId; }
        else if (this.selectedRoleId === 5) { url = "/Section/AssignManager"; params.sectionId = this.selectedManagerTargetId; }

        const res = await api.put(url, null, { params });
        this.showToast("تم تعيين المدير ✅", "success");

        const updatedManager = res.data.currentManager;
        const prevManager = res.data.previousManager;
        const item = this.allManagers.find(
          m => m.id === this.selectedManagerTargetId &&
               ((this.selectedRoleId === 3 && m.type === "إدارة") ||
                (this.selectedRoleId === 4 && m.type === "إدارة فرعية") ||
                (this.selectedRoleId === 5 && m.type === "قسم"))
        );
        if (item) { item.currentManager = updatedManager; item.previousManager = prevManager; }

      } catch {
        this.showToast("حدث خطأ أثناء تعيين المدير ❌", "error");
      }
    },
async submitAdd() {
  if (!this.addType || !this.addName) {
    this.showToast("الرجاء اختيار النوع وإدخال الاسم ❌", "error");
    return;
  }

  if (this.addType === "SubDepartment" && !this.selectedParentDepartmentId) {
    this.showToast("الرجاء اختيار الإدارة للأدارة الفرعية ❌", "error");
    return;
  }
  if (this.addType === "Section" && !this.selectedParentSubDepartmentId) {
    this.showToast("الرجاء اختيار الإدارة الفرعية للقسم ❌", "error");
    return;
  }

  try {
    if (this.addType === "Department") {
      // JSON body
      await api.post("/Department", { name: this.addName });
    } 
    else if (this.addType === "SubDepartment") {
      // query params
      await api.post("/SubDepartment", null, { params: { name: this.addName, departmentId: this.selectedParentDepartmentId } });
    } 
    else if (this.addType === "Section") {
      // query params
      await api.post("/Section", null, { params: { name: this.addName, subDeptId: this.selectedParentSubDepartmentId } });
    }

    this.showToast("تمت الإضافة ✅", "success");

    // إعادة تهيئة الفورم
    this.showAddModal = false;
    this.addName = "";
    this.addType = null;
    this.selectedParentDepartmentId = null;
    this.selectedParentSubDepartmentId = null;

    this.loadAllData();

  } catch (err) {
    console.log(err.response?.data || err);
    this.showToast("حدث خطأ أثناء الإضافة ❌", "error");
  }
}

,

    async loadManagerTable() {
      try {
        const [deps, subs, secs] = await Promise.all([api.get("/Department"), api.get("/SubDepartment"), api.get("/Section")]);
        this.allManagers = [
          ...deps.data.map(d => ({ id: d.id, type: "إدارة", name: d.name, currentManager: d.managerName, previousManager: d.previousManagerName })),
          ...subs.data.map(s => ({ id: s.id, type: "إدارة فرعية", name: s.name, currentManager: s.managerName, previousManager: s.previousManagerName })),
          ...secs.data.map(s => ({ id: s.id, type: "قسم", name: s.name, currentManager: s.managerName, previousManager: s.previousManagerName }))
        ];
      } catch {
        this.showToast("حدث خطأ أثناء تحميل جدول المديرين ❌", "error");
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
