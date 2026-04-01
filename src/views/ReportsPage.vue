<template>
  <div class="flex min-h-screen bg-white" dir="rtl">
    
    <!-- Sidebar -->
    <Sidebar class="fixed top-0 right-0 h-screen w-24 md:w-64 bg-primary text-white p-4 z-50" />

    <!-- Main Content -->
    <div class="flex-1 p-6 mr-24 md:mr-64">
      <Navbar />

      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-6 text-right">
          <h1 class="text-3xl font-extrabold text-gray-800 mb-1">التقارير</h1>
          <p class="text-gray-500">عرض وتحليل بيانات النظام بشكل مفصل</p>
        </div>

        <!-- Filter Section -->
        <div class="bg-white p-4 rounded-xl shadow-md mb-6 flex flex-wrap gap-4 items-end">
          <div class="flex-1 min-w-[150px]">
            <label class="block text-sm font-medium text-gray-700 mb-1">رقم الدرجة</label>
            <input v-model="gradeId" type="number" placeholder="رقم الدرجة"
              class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-primary focus:border-primary" />
          </div>

          <div class="flex-1 min-w-[150px]">
            <label class="block text-sm font-medium text-gray-700 mb-1">من تاريخ</label>
            <input v-model="fromDate" type="date"
              class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-primary focus:border-primary" />
          </div>

          <div class="flex-1 min-w-[150px]">
            <label class="block text-sm font-medium text-gray-700 mb-1">إلى تاريخ</label>
            <input v-model="toDate" type="date"
              class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-primary focus:border-primary" />
          </div>

          <button @click="loadAllReports"
            class="bg-primary text-white px-5 py-2 rounded-lg hover:opacity-90 transition">تحميل التقارير</button>
        </div>

        <!-- Reports Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          <!-- Employees by SubDepartment -->
          <div class="bg-white p-5 rounded-xl shadow hover:shadow-lg transition">
            <h3 class="text-lg font-semibold mb-3 flex items-center gap-2">👥 الموظفين حسب القسم</h3>
            <ul class="text-sm text-gray-700 space-y-1">
              <li v-for="item in employeesBySub" :key="item.subDepartmentName">
                {{ item.subDepartmentName }} ({{ item.employeeCount }})
              </li>
            </ul>
          </div>

          <!-- Requests -->
          <div class="bg-white p-5 rounded-xl shadow hover:shadow-lg transition">
            <h3 class="text-lg font-semibold mb-3 flex items-center gap-2">📄 الطلبات</h3>
            <ul class="text-sm text-gray-700 space-y-1">
              <li v-for="item in requestsReport" :key="item.requestType + item.status">
                {{ item.requestType }} - {{ item.status }} ({{ item.count }})
              </li>
            </ul>
          </div>

          <!-- Delegations -->
          <div class="bg-white p-5 rounded-xl shadow hover:shadow-lg transition">
            <h3 class="text-lg font-semibold mb-3 flex items-center gap-2">🔄 التكليفات</h3>
            <ul class="text-sm text-gray-700 space-y-1">
              <li v-for="item in delegations" :key="item.actingManager">
                {{ item.actingManager }} → {{ item.originalManager }} ({{ item.status }})
              </li>
            </ul>
          </div>

          <!-- Employees by Grade -->
          <div class="bg-white p-5 rounded-xl shadow hover:shadow-lg transition">
            <h3 class="text-lg font-semibold mb-3 flex items-center gap-2">🎓 حسب الدرجة</h3>
            <p v-if="employeesByGrade" class="text-gray-700">
              {{ employeesByGrade.jobGrade }} ({{ employeesByGrade.count }})
            </p>
          </div>

          <!-- Employees on Leave -->
          <div class="bg-white p-5 rounded-xl shadow hover:shadow-lg transition md:col-span-2 lg:col-span-3">
            <h3 class="text-lg font-semibold mb-3 flex items-center gap-2">🏖️ الموظفين في إجازة</h3>
            <ul class="text-sm text-gray-700 space-y-1">
              <li v-for="item in employeesOnLeave" :key="item.employeeName">
                {{ item.employeeName }} - {{ item.leaveType }}
              </li>
            </ul>
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
  name: "ReportsPage",
  components: { Sidebar, Navbar },

  data() {
    return {
      employeesBySub: [],
      requestsReport: [],
      delegations: [],
      employeesByGrade: null,
      employeesOnLeave: [],

      gradeId: "",
      fromDate: "",
      toDate: ""
    };
  },

  methods: {
    async loadAllReports() {
      const token = localStorage.getItem("token");

      try {
        const sub = await axios.get("http://localhost:5205/api/Reports/employees-by-subdepartment", {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.employeesBySub = sub.data;

        const req = await axios.get("http://localhost:5205/api/Reports/requests-report", {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.requestsReport = req.data;

        const del = await axios.get("http://localhost:5205/api/Reports/delegations-report", {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.delegations = del.data;

        if (this.gradeId) {
          const grade = await axios.get(`http://localhost:5205/api/Reports/employees-by-grade/${this.gradeId}`);
          this.employeesByGrade = grade.data;
        }

        if (this.fromDate && this.toDate) {
          const leave = await axios.get(
            `http://localhost:5205/api/Reports/employees-on-leave?fromDate=${this.fromDate}&toDate=${this.toDate}`,
            { headers: { Authorization: `Bearer ${token}` } }
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