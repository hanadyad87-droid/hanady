<template>
  <div class="flex min-h-screen bg-slate-100" dir="rtl">
    <Sidebar />
    <div class="flex-1 w-full min-w-0 p-4 md:p-6 mr-0 lg:mr-60">
      <Navbar />
      <div class="max-w-7xl mx-auto space-y-5">
        <div class="flex flex-col gap-1">
          <h1 class="app-page-title">التقارير</h1>
          <p class="text-sm text-slate-500">عرض احترافي ملخص وقابل للقراءة لتقارير القسم.</p>
        </div>

        <div class="app-panel grid grid-cols-1 md:grid-cols-4 gap-3">
          <input v-model="gradeId" type="number" placeholder="رقم الدرجة" class="input" />
          <input v-model="fromDate" type="date" class="input" />
          <input v-model="toDate" type="date" class="input" />
          <button @click="loadAllReports" class="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
            {{ loading ? "جاري التحميل..." : "تحديث التقارير" }}
          </button>
        </div>

        <div v-if="errorMessage" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {{ errorMessage }}
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="app-panel"><p class="text-xs text-slate-500">طلبات</p><p class="mt-1 text-xl font-bold">{{ totalRequests }}</p></div>
          <div class="app-panel"><p class="text-xs text-slate-500">مهام</p><p class="mt-1 text-xl font-bold">{{ totalTasks }}</p></div>
          <div class="app-panel"><p class="text-xs text-slate-500">تكليفات</p><p class="mt-1 text-xl font-bold">{{ delegations.length }}</p></div>
          <div class="app-panel"><p class="text-xs text-slate-500">إجازات نشطة</p><p class="mt-1 text-xl font-bold">{{ employeesOnLeave.length }}</p></div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <div class="app-panel">
            <h3 class="mb-3 text-sm font-bold text-slate-700">الموظفون حسب الإدارة الفرعية</h3>
            <div v-if="employeesBySub.length" class="space-y-2">
              <div v-for="item in employeesBySub" :key="item.subDepartmentName" class="flex items-center justify-between text-sm">
                <span>{{ item.subDepartmentName }}</span>
                <span class="rounded bg-slate-100 px-2 py-0.5 font-semibold">{{ item.employeeCount }}</span>
              </div>
            </div>
            <p v-else class="text-sm text-slate-500">لا توجد بيانات</p>
          </div>

          <div class="app-panel">
            <h3 class="mb-3 text-sm font-bold text-slate-700">تقرير الطلبات</h3>
            <div v-if="requestsReport.length" class="space-y-2">
              <div v-for="item in requestsReport" :key="item.requestType + item.status" class="flex items-center justify-between text-sm">
                <span>{{ item.requestType }} - {{ item.status }}</span>
                <span class="rounded bg-slate-100 px-2 py-0.5 font-semibold">{{ item.count }}</span>
              </div>
            </div>
            <p v-else class="text-sm text-slate-500">لا توجد بيانات</p>
          </div>

          <div class="app-panel">
            <h3 class="mb-3 text-sm font-bold text-slate-700">المهام حسب الحالة</h3>
            <div v-if="tasksReport.length" class="space-y-2">
              <div v-for="item in tasksReport" :key="item.status" class="flex items-center justify-between text-sm">
                <span>{{ item.status }}</span>
                <span class="rounded bg-slate-100 px-2 py-0.5 font-semibold">{{ item.count }}</span>
              </div>
            </div>
            <p v-else class="text-sm text-slate-500">لا توجد بيانات</p>
          </div>

          <div class="app-panel">
            <h3 class="mb-3 text-sm font-bold text-slate-700">مهام الموظفين</h3>
            <div v-if="tasksByEmployee.length" class="space-y-2">
              <div v-for="item in tasksByEmployee" :key="item.employee" class="flex items-center justify-between text-sm">
                <span>{{ item.employee }}</span>
                <span class="rounded bg-slate-100 px-2 py-0.5 font-semibold">{{ item.count }}</span>
              </div>
            </div>
            <p v-else class="text-sm text-slate-500">لا توجد بيانات</p>
          </div>

          <div class="app-panel">
            <h3 class="mb-3 text-sm font-bold text-slate-700">التكليفات</h3>
            <div v-if="delegations.length" class="space-y-2">
              <div v-for="item in delegations" :key="item.actingManager + item.originalManager" class="flex items-center justify-between text-sm">
                <span>{{ item.actingManager }} - {{ item.originalManager }}</span>
                <span class="rounded bg-slate-100 px-2 py-0.5 font-semibold">{{ item.status }}</span>
              </div>
            </div>
            <p v-else class="text-sm text-slate-500">لا توجد بيانات</p>
          </div>

          <div class="app-panel">
            <h3 class="mb-3 text-sm font-bold text-slate-700">المؤهلات</h3>
            <div v-if="employeesByQualification.length" class="space-y-2">
              <div v-for="item in employeesByQualification" :key="item.qualificationName" class="flex items-center justify-between text-sm">
                <span>{{ item.qualificationName }}</span>
                <span class="rounded bg-slate-100 px-2 py-0.5 font-semibold">{{ item.count }}</span>
              </div>
            </div>
            <p v-else class="text-sm text-slate-500">لا توجد بيانات</p>
          </div>

          <div class="app-panel">
            <h3 class="mb-3 text-sm font-bold text-slate-700">تقرير الدرجة</h3>
            <div v-if="employeesByGrade">
              <div class="flex items-center justify-between text-sm">
                <span>{{ employeesByGrade.jobGrade }}</span>
                <span class="rounded bg-slate-100 px-2 py-0.5 font-semibold">{{ employeesByGrade.count }}</span>
              </div>
            </div>
            <p v-else class="text-sm text-slate-500">اختر رقم درجة لعرض التقرير.</p>
          </div>
        </div>

        <div class="app-panel">
          <h3 class="mb-4 text-sm font-bold text-slate-700">الموظفون في إجازة</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-sm text-right">
              <thead class="bg-slate-100 text-slate-700">
                <tr>
                  <th class="p-2">الاسم</th><th class="p-2">نوع الإجازة</th><th class="p-2">من</th><th class="p-2">إلى</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in employeesOnLeave" :key="item.employeeName + item.fromDate" class="border-b last:border-b-0">
                  <td class="p-2">{{ item.employeeName }}</td>
                  <td class="p-2">{{ item.leaveType }}</td>
                  <td class="p-2">{{ item.fromDate }}</td>
                  <td class="p-2">{{ item.toDate }}</td>
                </tr>
                <tr v-if="!employeesOnLeave.length">
                  <td class="p-3 text-center text-slate-500" colspan="4">لا توجد بيانات ضمن الفترة المحددة.</td>
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
import api from "@/services/api";

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
      toDate: "",
      loading: false,
      errorMessage: "",
    };
  },
  computed: {
    totalRequests() {
      return this.requestsReport.reduce((a, b) => a + (b.count || 0), 0);
    },
    totalTasks() {
      return this.tasksReport.reduce((a, b) => a + (b.count || 0), 0);
    },
  },

  methods: {
    async loadAllReports() {
      this.loading = true;
      this.errorMessage = "";
      try {
        const [sub, req, del, task, taskEmp, qual] = await Promise.all([
          api.get("/Reports/employees-by-subdepartment"),
          api.get("/Reports/requests-report"),
          api.get("/Reports/delegations-report"),
          api.get("/Reports/tasks-report"),
          api.get("/Reports/tasks-by-employee"),
          api.get("/Reports/employees-by-qualification")
        ]);

        this.employeesBySub = sub.data;
        this.requestsReport = req.data;
        this.delegations = del.data;
        this.tasksReport = task.data;
        this.tasksByEmployee = taskEmp.data;
        this.employeesByQualification = qual.data;

        if (this.gradeId) {
          const grade = await api.get(`/Reports/employees-by-grade/${this.gradeId}`);
          this.employeesByGrade = grade.data;
        }

        if (this.fromDate && this.toDate) {
          const leave = await api.get("/Reports/employees-on-leave", {
            params: { fromDate: this.fromDate, toDate: this.toDate }
          });
          this.employeesOnLeave = leave.data;
        } else {
          this.employeesOnLeave = [];
        }

      } catch (err) {
        this.errorMessage = "تعذر تحميل بعض التقارير. تأكد من الصلاحيات أو صحة البيانات.";
      } finally {
        this.loading = false;
      }
    }
  },

  mounted() {
    this.loadAllReports();
  }
};
</script>
