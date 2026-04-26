<template>
  <div class="flex min-h-screen bg-gray-100" dir="rtl">

    <Sidebar />

    <div class="flex-1 w-full min-w-0 p-4 md:p-6 mr-0 lg:mr-60">
      <Navbar />

      <div class="max-w-7xl mx-auto space-y-6">

        <!-- Announcements -->
        <div>
          <div v-if="announcements.length"
               class="announcement-bar overflow-hidden rounded-md h-10 flex items-center px-3"
               style="background: linear-gradient(90deg,#1D4736,#165a40,#1D4736);">

            <div class="announcement-track flex items-center gap-16"
                 :style="{ animationDuration: scrollDuration + 's' }">

              <div v-for="ann in announcements" :key="ann.id"
                   class="text-white text-sm whitespace-nowrap">
                <b>{{ ann.title }}</b> — {{ ann.message }}
              </div>

            </div>
          </div>
        </div>

        <!-- ================= EMPLOYEE ================= -->
        <div v-if="isEmployee">

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="stat-card">
              👤 <b>{{ myReport.employeeName || '---' }}</b>
            </div>

            <div class="stat-card">
              🏖️ الإجازات: <b>{{ myReport.leaves.length }}</b>
            </div>

            <div class="stat-card">
              📌 المهام: <b>{{ myReport.tasks.length }}</b>
            </div>
          </div>

          <div class="card mt-6" v-if="myReport.leaves.length">
            <h3>📊 الإجازات حسب الحالة</h3>
            <canvas ref="employeeChart"></canvas>
          </div>

          <div v-else class="text-center text-gray-500 mt-6">
            لا توجد بيانات
          </div>

        </div>

        <!-- ================= MANAGER / ADMIN ================= -->
        <div v-else>

          <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">

            <div class="stat-card">📄 الطلبات: {{ totalRequests }}</div>
            <div class="stat-card">✅ المهام: {{ totalTasks }}</div>
            <div class="stat-card">📊 السجلات: {{ adminLogsTotal }}</div>
            <div class="stat-card">🔄 التكليفات: {{ delegations.length }}</div>

          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

            <div class="card" v-if="tasksReport.length">
              <h3>📌 المهام حسب الحالة</h3>
              <canvas ref="tasksChart"></canvas>
            </div>

            <div class="card" v-if="adminLogs.length">
              <h3>🔐 نشاط النظام</h3>
              <canvas ref="logsChart"></canvas>
            </div>

          </div>

        </div>

      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from "../components/Sidebar.vue";
import Navbar from "../components/Navbar.vue";
import api from "../services/api";
import Chart from "chart.js/auto";
import { nextTick } from "vue";

export default {
  name: "DashboardView",

  components: { Sidebar, Navbar },

  data() {
    return {
      announcements: [],
      scrollDuration: 35,

      userRoles: [],
      isEmployee: false,

      myReport: { leaves: [], tasks: [] },

      requestsReport: [],
      tasksReport: [],
      adminLogs: [],
      delegations: [],

      totalRequests: 0,
      totalTasks: 0,
      adminLogsTotal: 0
    };
  },

  async mounted() {
    this.parseRoles();
    await this.fetchAnnouncements();

    if (this.isEmployee) {
      await this.loadMyReport();
      await nextTick();
      this.renderEmployeeChart();
    } else {
      await this.loadAdminData();
      await nextTick();
      this.renderAdminCharts();
    }
  },

  methods: {

    // ================= SAFE TOKEN =================
    parseRoles() {
      const token = localStorage.getItem("token");

      if (!token || token.split(".").length !== 3) {
        this.userRoles = [];
        this.isEmployee = true;
        return;
      }

      try {
        const payload = JSON.parse(atob(token.split(".")[1]));

        let roles =
          payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || [];

        if (!Array.isArray(roles)) roles = [roles];

        this.userRoles = roles;

        // 👇 تحديد الدور بشكل صحيح
        this.isEmployee =
          roles.includes("Employee") &&
          !roles.includes("SuperAdmin") &&
          !roles.includes("Admin");

      } catch (e) {
        this.userRoles = [];
        this.isEmployee = true;
      }
    },

    // ================= ANNOUNCEMENTS =================
    async fetchAnnouncements() {
      try {
        const res = await api.get("/Announcements/my-announcements");
        this.announcements = res.data || [];
      } catch {
        this.announcements = [];
      }
    },

    // ================= EMPLOYEE =================
    async loadMyReport() {
      try {
        const res = await api.get("/Reports/my-report");

        this.myReport = {
          leaves: res.data?.leaves || [],
          tasks: res.data?.tasks || [],
          employeeName: res.data?.employeeName || "---"
        };

      } catch {
        this.myReport = { leaves: [], tasks: [], employeeName: "---" };
      }
    },

    // ================= ADMIN =================
    async loadAdminData() {
      try {
        const [req, task, logs, del] = await Promise.all([
          api.get("/Reports/requests-report"),
          api.get("/Reports/tasks-report"),
          api.get("/Reports/admin-logs-summary"),
          api.get("/Reports/delegations-report")
        ]);

        this.requestsReport = req.data || [];
        this.tasksReport = task.data || [];
        this.adminLogs = logs.data || [];
        this.delegations = del.data || [];

        this.totalRequests = this.requestsReport.reduce((a,b)=>a+b.count,0);
        this.totalTasks = this.tasksReport.reduce((a,b)=>a+b.count,0);
        this.adminLogsTotal = this.adminLogs.reduce((a,b)=>a+b.count,0);

      } catch {
        this.requestsReport = [];
        this.tasksReport = [];
        this.adminLogs = [];
        this.delegations = [];
      }
    },

    // ================= EMPLOYEE CHART =================
    renderEmployeeChart() {
      if (!this.myReport.leaves.length || !this.$refs.employeeChart) return;

      const map = {};

      this.myReport.leaves.forEach(l => {
        map[l.status] = (map[l.status] || 0) + 1;
      });

      new Chart(this.$refs.employeeChart, {
        type: "bar",
        data: {
          labels: Object.keys(map),
          datasets: [{
            data: Object.values(map),
            backgroundColor: "#10B981"
          }]
        }
      });
    },

    // ================= ADMIN CHARTS =================
    renderAdminCharts() {

      if (this.tasksReport.length && this.$refs.tasksChart) {
        new Chart(this.$refs.tasksChart, {
          type: "bar",
          data: {
            labels: this.tasksReport.map(t => t.status),
            datasets: [{
              data: this.tasksReport.map(t => t.count),
              backgroundColor: "#16a34a"
            }]
          }
        });
      }

      if (this.adminLogs.length && this.$refs.logsChart) {
        new Chart(this.$refs.logsChart, {
          type: "pie",
          data: {
            labels: this.adminLogs.map(l => l.action),
            datasets: [{
              data: this.adminLogs.map(l => l.count)
            }]
          }
        });
      }
    }
  }
};
</script>

<style scoped>
.stat-card, .card {
  background: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

.announcement-track {
  display: flex;
  animation: marquee linear infinite;
}

@keyframes marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
</style>