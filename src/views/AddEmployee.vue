
<template>
  <div class="relative min-h-screen bg-gray-100">
    <Sidebar />

    <div class="main-content">
      

      <!-- التابات -->
      <div class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab"
          @click="activeTab = tab"
          :class="['tab-btn', { active: activeTab === tab }]"
        >
          {{ tab }}
        </button>
      </div>

      <!-- المحتوى -->
      <div class="card">
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
        <QualificationInfo
          v-if="activeTab === 'المؤهل العلمي'"
          :employee="employee"
          @update-employee="updateEmployee"
        />
      </div>
      <div class="submit-wrapper">
      <!-- الزر هنا -->
<button class="btn btn-primary" @click="saveToBackend">
  حفظ البيانات
</button>
</div>
    </div>
  </div>
</template>

<script>
import Sidebar from "../components/Sidebar.vue"
import BasicInfo from "../components/employee/BasicInfo.vue"
import AdminInfo from "../components/employee/AdminInfo.vue"
import FinancialInfo from "../components/employee/FinancialInfo.vue"
import QualificationInfo from "../components/employee/QualificationInfo.vue"
import api from "../services/api";

export default {
  name: "AddEmployee",
  components: {
    Sidebar,
    BasicInfo,
    AdminInfo,
    FinancialInfo,
    QualificationInfo
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
        // بيانات إدارية
        DepartmentId: null,
        JobTitleId: null,
        EmploymentStatusId: null,
        JobGradeId: null,
        WorkLocationId: null,
        // بيانات مالية
        Salary: 0,
        BankId: null,
        BankBranchId: null,
        // المؤهل العلمي
        Qualification: ''
      },
      tabs: [
        "البيانات الأساسية",
        "البيانات الإدارية",
        "البيانات المالية",
        "المؤهل العلمي"
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
      const response = await api.post("/employee", this.employee);
      alert("تم حفظ الموظف بنجاح!");
      console.log(response.data);
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء حفظ البيانات");
    }
  }
}


}
</script> 

<style scoped>
/* Sidebar */
.sidebar {
  position: fixed;
  top: 0;
  right: 0; /* يبقى على اليمين */
  width: 6.5rem; 
  height: 100vh;
  background-color: #1e40af;
  color: white;
  padding: 1rem;
  box-shadow: -2px 0 5px rgba(0,0,0,0.1);
  overflow-y: auto;
}

/* محتوى الصفحة */
.main-content {
  margin-right: 7.5rem; /* يترك مساحة للـ Sidebar */
  padding: 1.5rem;
  direction: rtl; /* كل المحتوى من اليمين لليسار */
  text-align: right;
}

.page-title {
  font-size: 1.4rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

/* Tabs */
.tabs {
  display: flex;
  flex-direction: row; /* تبدأ من اليمين */
  justify-content: flex-start;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tab-btn {
  padding: 0.5rem 1rem;
  border: none;
  background: #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  text-align: center;
}

.tab-btn.active {
  background: #1e40af;
  color: white;
}

/* بطاقة المحتوى */
.card {
  background: #fff4e5;
  padding: 1.5rem;
  border-radius: 10px;
}
.btn {
  width: 100%;
  padding: 0.6rem;
  border-radius: 5px;
  border: none;
  cursor: pointer;
    max-width: 200px; /* نفس عرض الحقول تقريباً */
  align-self: center; /* يحافظ على الزر من اليسار، أو استعمل center إذا تحب */
}
.btn-primary {
  background-color: #1890ff;
  color: white;
}

.btn-primary:hover {
  background-color: #096dd9;
}
.submit-wrapper {
  display: flex;
  flex-direction: column; /* عمودي: زر فوق الحالة */
  align-items: center;    /* لتوسيط المحتوى أفقياً */
  gap: 0.5rem;            /* مسافة بين الزر والحالة */
}

</style>
