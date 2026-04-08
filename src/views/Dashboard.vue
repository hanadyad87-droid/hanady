<template>
  <div class="flex min-h-screen bg-gray-100" dir="rtl">

    <!-- Sidebar -->
    <Sidebar class="fixed top-0 right-0 h-screen w-20 md:w-64 bg-primary text-white z-50" />

    <!-- Main Content -->
    <div class="flex-1 p-4 md:p-6 mr-20 md:mr-64">

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
                   class="text-white text-sm flex gap-2 whitespace-nowrap">
                <span class="font-semibold">{{ ann.title }}</span>
                <span>—</span>
                <span>{{ ann.message }}</span>
              </div>
            </div>
          </div>
          <div v-else
               class="h-10 flex items-center justify-center rounded-md text-white/60 text-sm"
               style="background: linear-gradient(90deg,#1D4736,#165a40,#1D4736);">
            لا توجد إعلانات حالياً
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="stat-card">
            <p class="text-gray-500 text-sm">📄 الطلبات</p>
            <h2 class="text-2xl font-bold">{{ totalRequests }}</h2>
          </div>
          <div class="stat-card">
            <p class="text-gray-500 text-sm">✅ المهام</p>
            <h2 class="text-2xl font-bold">{{ totalTasks }}</h2>
          </div>
          <div class="stat-card">
            <p class="text-gray-500 text-sm">🏖️ الإجازات</p>
            <h2 class="text-2xl font-bold">{{ totalLeaves }}</h2>
          </div>
          <div class="stat-card">
            <p class="text-gray-500 text-sm">🔄 التكليفات</p>
            <h2 class="text-2xl font-bold">{{ delegations.length }}</h2>
          </div>
        </div>

        <!-- Charts -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

       

          <!-- Tasks Chart -->
          <div class="card">
            <h3 class="mb-3 font-semibold">📊 المهام حسب الحالة</h3>
            <canvas ref="tasksChart"></canvas>
          </div>

          <!-- Employees Tasks Chart -->
          <div class="card">
            <h3 class="mb-3 font-semibold">👤 أكثر الموظفين مهام</h3>
            <canvas ref="employeesChart"></canvas>
          </div>

          <!-- Leaves Chart عمودي -->
          <div class="card md:col-span-2 lg:col-span-1">
            <h3 class="mb-3 font-semibold">🏖️ الإجازات حسب النوع</h3>
            <canvas ref="leavesChart"></canvas>
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
  name: "DashboardRealData",
  components: { Sidebar, Navbar },
  data() {
    return {
      announcements: [],
      scrollDuration: 35,

      requestsReport: [],
      tasksReport: [],
      tasksByEmployee: [],
      delegations: [],
      employeesOnLeave: [],

      totalRequests: 0,
      totalTasks: 0,
      totalLeaves: 0

      
    };
  },
  async mounted() {
    await this.fetchAnnouncements();
    await this.loadReports();
     await nextTick();
    this.renderCharts();
  },
  methods: {
    async fetchAnnouncements() {
      const res = await api.get("/Announcements/my-announcements");
      this.announcements = res.data || [];
    },
    async loadReports() {
      const [req, task, taskEmp, del, leave] = await Promise.all([
        api.get("/Reports/requests-report"),
        api.get("/Reports/tasks-report"),
        api.get("/Reports/tasks-by-employee"),
        api.get("/Reports/delegations-report"),
        api.get("/Reports/employees-on-leave?fromDate=2025-01-01&toDate=2026-12-31")
      ]);

      this.requestsReport = req.data;
      this.tasksReport = task.data;
      this.tasksByEmployee = taskEmp.data;
      this.delegations = del.data;
      this.employeesOnLeave = leave.data;

      this.totalRequests = this.requestsReport.reduce((a,b)=>a+b.count,0);
      this.totalTasks = this.tasksReport.reduce((a,b)=>a+b.count,0);
      this.totalLeaves = this.employeesOnLeave.length;
    },
    renderCharts() {
    

      // Tasks Chart
      new Chart(this.$refs.tasksChart, {
        type: 'bar',
        data: {
          labels: this.tasksReport.map(t => t.status),
          datasets: [{ data: this.tasksReport.map(t => t.count), backgroundColor:'#10B981' }]
        }
      });

      // Employees Chart
      new Chart(this.$refs.employeesChart, {
        type: 'bar',
        data: {
          labels: this.tasksByEmployee.slice(0,5).map(e => e.employee),
          datasets: [{ data: this.tasksByEmployee.slice(0,5).map(e => e.count), backgroundColor:'#16a34a' }]
        }
      });

      // Leaves Chart عمودي
      const leaveTypes = [...new Set(this.employeesOnLeave.map(e=>e.leaveType))];
      const leaveCounts = leaveTypes.map(type => this.employeesOnLeave.filter(e=>e.leaveType===type).length);
      new Chart(this.$refs.leavesChart, {
        type: 'bar',
        data: {
          labels: leaveTypes,
          datasets: [{
            label: 'عدد الموظفين',
            data: leaveCounts,
            backgroundColor: ['#F87171','#60A5FA','#34D399','#FBBF24','#A78BFA']
          }]
        },
        options: {
          indexAxis: 'y', // عمودي
          responsive: true,
          plugins: { legend: { display: false } }
        }
      });
    }
  }
};
</script>

<style scoped>
.stat-card, .card {
  background: white;
  padding: 16px;
  border-radius: 14px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

.announcement-track {
  display: flex;
  animation: marquee linear infinite;
}

.announcement-bar:hover .announcement-track {
  animation-play-state: paused;
}

@keyframes marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
</style>