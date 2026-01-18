<template>
  <div class="flex min-h-screen bg-gray-100">

    <!-- Sidebar ثابتة على اليمين -->
    <Sidebar class="fixed top-0 right-0 h-screen w-24 md:w-64 z-50" />

    
    <!-- المحتوى الرئيسي -->
    <div class="flex-1 p-6 min-h-screen mr-24 md:mr-64">
      
     <Navbar />
<!-- التابات -->
<div
  class="flex flex-nowrap gap-2 mb-4 overflow-x-auto justify-start"
>
  <button
    v-for="tab in tabs"
    :key="tab"
    @click="activeTab = tab"
    :class="[
      'flex-shrink-0 rounded-lg transition text-sm md:text-base px-3 md:px-4 py-2',
      activeTab === tab
        ? 'bg-primary text-white'          /* نفس لون Sidebar */
        : 'bg-gray-200 text-gray-700 hover:bg-primaryDark'  /* Hover بنفس اللون الأغمق */
    ]"
  >
    {{ tab }}
  </button>
</div>


      <!-- بطاقة المحتوى -->
      <div class="bg-white
 p-6 rounded-xl shadow mb-6 w-full max-w-4xl mx-auto">
        <BasicInfo
          v-if="activeTab === 'البيانات الأساسية'"
          :employee="employee"
          @update-employee="updateEmployee"
        />
        <AdminInfo
          v-if="activeTab === 'البيانات الإدارية'"
          :employee="employee"
          @update-employee="updateEmployee"
        />
        <FinancialInfo
          v-if="activeTab === 'البيانات المالية'"
          :employee="employee"
          @update-employee="updateEmployee"
        />
       
      </div>

      <!-- زر الحفظ -->
      <div class="flex justify-center mb-6">
        <button
          @click="saveToBackend"
          class="bg-primary hover:bg-primaryDark text-white py-2 px-6 rounded-lg transition w-full max-w-xs"
        >
          حفظ الموظف 💾
        </button>
      </div>

    </div>
  </div>
</template>

<script>
import Sidebar from "../components/Sidebar.vue"
import Navbar from "../components/Navbar.vue";
import BasicInfo from "../components/employee/BasicInfo.vue"
import AdminInfo from "../components/employee/AdminInfo.vue"
import FinancialInfo from "../components/employee/FinancialInfo.vue"
import api from "../services/api";


export default {
  name: "AddEmployee",
  components: {
    Sidebar,
    Navbar,
    BasicInfo,
    AdminInfo,
    FinancialInfo,
   
  },
  data() {
    return {
    employee: {
  EmployeeNumber: '',
  FullName: '',
  MotherName: '',
  NationalId: '',
  BirthDate: '',
  Gender: '',
  Nationality: '',
  HireDate: '',
  DepartmentId: null,
  JobTitleId: null,
  EmploymentStatusId: null,
  JobGradeId: null,
  WorkLocationId: null,
  UserId: null,              // جديد
  ManagerId: null,           // جديد، null لو المدير الأعلى
  AnnualLeaveBalance: 20,    // جديد
  Salary: 0,
  BankId: null,
  BankBranchId: null,
  Qualification: ''
}
,
      tabs: [
        "البيانات الأساسية",
        "البيانات الإدارية",
        "البيانات المالية",
      
      ],
      activeTab: "البيانات الأساسية"
    }
  },
  methods: {
    updateEmployee(data) {
      this.employee = { ...this.employee, ...data };
    },
    async saveToBackend() {
  try {
    // هنا نجيب الـ UserId من localStorage
    this.employee.UserId = parseInt(localStorage.getItem("userId"));

    const res = await api.post("/Employee/create", this.employee);
    alert("تم إضافة الموظف بنجاح!");
    console.log(res.data);
  } catch (err) {
    console.error(err);
    alert("حدث خطأ أثناء الحفظ");
  }
}

  }
}
</script>


