<template>
  <div class="flex min-h-screen bg-gray-100" dir="rtl">

    <!-- Sidebar -->
    <Sidebar />

    <!-- Main Content -->
    <div class="flex-1 w-full min-w-0 p-4 md:p-6 mr-0 lg:mr-60">
      <Navbar />

      <div class="max-w-7xl mx-auto">

        <!-- Header -->
        <div class="mb-6 text-right">
          <h1 class="text-2xl md:text-3xl font-bold text-gray-800"> التقارير</h1>
          <p class="text-gray-500 text-sm md:text-base">لوحة تحكم متكاملة لعرض جميع التقارير</p>
        </div>

        <!-- Filters -->
        <div class="bg-white p-4 rounded-2xl shadow mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <input v-model="gradeId" type="number" placeholder="رقم الدرجة"
            class="border rounded-lg px-3 py-2 text-sm" />

          <input v-model="fromDate" type="date"
            class="border rounded-lg px-3 py-2 text-sm" />

          <input v-model="toDate" type="date"
            class="border rounded-lg px-3 py-2 text-sm" />

          <button @click="loadAllReports"
            class="bg-primary text-white rounded-lg py-2 hover:opacity-90">
            تحميل
          </button>
        </div>

        <!-- Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

          <!-- SubDepartments -->
          <div class="card">
            <h3>👥 حسب القسم</h3>
            <div v-if="employeesBySub.length">
              <div v-for="item in employeesBySub" :key="item.subDepartmentName" class="item">
                <span>{{ item.subDepartmentName }}</span>
                <span class="badge">{{ item.employeeCount }}</span>
              </div>
            </div>
            <p v-else class="empty">لا توجد بيانات</p>
          </div>

          <!-- Requests -->
          <div class="card">
            <h3>📄 الطلبات</h3>
            <div v-if="requestsReport.length">
              <div v-for="item in requestsReport" :key="item.requestType + item.status" class="item">
                <span>{{ item.requestType }} - {{ item.status }}</span>
                <span class="badge">{{ item.count }}</span>
              </div>
            </div>
            <p v-else class="empty">لا توجد بيانات</p>
          </div>

          <!-- Tasks -->
          <div class="card">
            <h3>✅ المهام</h3>
            <div v-if="tasksReport.length">
              <div v-for="item in tasksReport" :key="item.status" class="item">
                <span>{{ item.status }}</span>
                <span class="badge">{{ item.count }}</span>
              </div>
            </div>
          </div>

          <!-- Tasks by Employee -->
          <div class="card">
            <h3>👤 مهام الموظفين</h3>
            <div v-if="tasksByEmployee.length">
              <div v-for="item in tasksByEmployee" :key="item.employee" class="item">
                <span>{{ item.employee }}</span>
                <span class="badge">{{ item.count }}</span>
              </div>
            </div>
          </div>

          <!-- Delegations -->
          <div class="card">
            <h3>🔄 التكليفات</h3>
            <div v-if="delegations.length">
              <div v-for="item in delegations" :key="item.actingManager" class="item">
                <span>{{ item.actingManager }} → {{ item.originalManager }}</span>
                <span class="badge">{{ item.status }}</span>
              </div>
            </div>
          </div>

          <!-- Qualification -->
          <div class="card">
            <h3>🎓 المؤهلات</h3>
            <div v-if="employeesByQualification.length">
              <div v-for="item in employeesByQualification" :key="item.qualificationName" class="item">
                <span>{{ item.qualificationName }}</span>
                <span class="badge">{{ item.count }}</span>
              </div>
            </div>
          </div>

          <!-- Grade -->
          <div class="card">
            <h3>🏅 الدرجة</h3>
            <div v-if="employeesByGrade">
              <div class="item">
                <span>{{ employeesByGrade.jobGrade }}</span>
                <span class="badge">{{ employeesByGrade.count }}</span>
              </div>
            </div>
          </div>

        </div>

        <!-- Leave Table -->
        <div class="bg-white mt-6 p-4 rounded-2xl shadow">
          <h3 class="mb-4 font-semibold">🏖️ الموظفين في إجازة</h3>

          <div class="overflow-x-auto">
            <table class="w-full text-sm text-right">
              <thead class="bg-gray-100">
                <tr>
                  <th class="p-2">الاسم</th>
                  <th class="p-2">نوع الإجازة</th>
                  <th class="p-2">من</th>
                  <th class="p-2">إلى</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in employeesOnLeave" :key="item.employeeName" class="border-b">
                  <td class="p-2">{{ item.employeeName }}</td>
                  <td class="p-2">{{ item.leaveType }}</td>
                  <td class="p-2">{{ item.fromDate }}</td>
                  <td class="p-2">{{ item.toDate }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from "@/components/Sidebar.vue";
import Navbar from "@/components/Navbar.vue";
import axios from "axios";

export default {
  components: { Sidebar, Navbar },

  data() {
    return {
      employeesBySub: [],
      requestsReport: [],
      delegations: [],
      employeesByGrade: null,
      employeesOnLeave: [],
      tasksReport: [],
      tasksByEmployee: [],
      employeesByQualification: [],

      gradeId: "",
      fromDate: "",
      toDate: ""
    };
  },

  methods: {
    async loadAllReports() {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      try {
        const [sub, req, del, task, taskEmp, qual] = await Promise.all([
          axios.get("http://localhost:5205/api/Reports/employees-by-subdepartment", { headers }),
          axios.get("http://localhost:5205/api/Reports/requests-report", { headers }),
          axios.get("http://localhost:5205/api/Reports/delegations-report", { headers }),
          axios.get("http://localhost:5205/api/Reports/tasks-report", { headers }),
          axios.get("http://localhost:5205/api/Reports/tasks-by-employee", { headers }),
          axios.get("http://localhost:5205/api/Reports/employees-by-qualification", { headers })
        ]);

        this.employeesBySub = sub.data;
        this.requestsReport = req.data;
        this.delegations = del.data;
        this.tasksReport = task.data;
        this.tasksByEmployee = taskEmp.data;
        this.employeesByQualification = qual.data;

        if (this.gradeId) {
       const grade = await axios.get(
  `http://localhost:5205/api/Reports/employees-by-grade/${this.gradeId}`,
  { headers }
);
          this.employeesByGrade = grade.data;
        }

        if (this.fromDate && this.toDate) {
          const leave = await axios.get(
            `http://localhost:5205/api/Reports/employees-on-leave?fromDate=${this.fromDate}&toDate=${this.toDate}`,
            { headers }
          );
          this.employeesOnLeave = leave.data;
        }

      } catch (err) {
        console.error(err);
        alert("خطأ في تحميل التقارير");
      }
    }
  },

  mounted() {
    this.loadAllReports();
  }
};
</script>

<style scoped>
.card {
  background: white;
  padding: 16px;
  border-radius: 16px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
}

.card h3 {
  font-weight: bold;
  margin-bottom: 10px;
}

.item {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px solid #eee;
}

.badge {
  background: #6366f1;
  color: white;
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 12px;
}

.empty {
  color: gray;
  font-size: 13px;
}
</style>
