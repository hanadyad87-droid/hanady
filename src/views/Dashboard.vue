<template>
  <div class="flex min-h-screen bg-white" dir="rtl">

    <!-- Sidebar -->
    <Sidebar class="fixed top-0 right-0 h-screen w-24 md:w-64 bg-primary text-white p-4 z-50" />

    <!-- المحتوى -->
    <div class="flex-1 p-4 sm:p-6 mr-24 md:mr-64">

      <Navbar />

      <!-- البوكس الأبيض الرئيسي -->
      <div class="bg-white rounded-xl shadow p-4 sm:p-5 md:p-6 w-full sm:max-w-xl md:max-w-3xl mx-auto space-y-4">

        <!-- الإعلانات -->
        <div>
          <div
            v-if="announcements.length"
            class="announcement-bar overflow-hidden rounded-md h-10 flex items-center px-2 sm:px-3 md:px-4"
            style="background: linear-gradient(90deg,#1D4736,#165a40,#1D4736);"
          >
            <div
              class="announcement-track flex items-center gap-12 sm:gap-16 md:gap-20"
              :style="{ animationDuration: scrollDuration + 's' }"
            >
              <div
                v-for="ann in announcements"
                :key="ann.id"
                class="text-white text-xs sm:text-sm flex gap-1 sm:gap-2 whitespace-nowrap"
              >
                <span class="font-semibold">{{ ann.title }}</span>
                <span class="opacity-70">—</span>
                <span class="opacity-90">{{ ann.message }}</span>
              </div>
            </div>
          </div>

          <div
            v-else
            class="h-10 flex items-center justify-center rounded-md text-white/60 text-xs sm:text-sm"
            style="background: linear-gradient(90deg,#1D4736,#165a40,#1D4736);"
          >
            لا توجد إعلانات حالياً
          </div>
        </div>

        <!-- الإجازات -->
        <div>
          <h3 class="font-bold mb-2 text-sm sm:text-base md:text-lg text-gray-800">الإجازات خلال السنة</h3>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            <div
              v-for="(count,type) in leaveTypeCounts"
              :key="type"
              class="bg-gray-50 hover:bg-gray-100 transition p-2 sm:p-3 rounded-lg border flex justify-between items-center"
            >
              <span class="font-semibold text-xs sm:text-sm">{{ type }}</span>

              <div class="relative w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10">
                <svg class="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845a15.9155 15.9155 0 010 31.831a15.9155 15.9155 0 010-31.831"
                    fill="none"
                    stroke="#E5E7EB"
                    stroke-width="3"
                  />
                  <path
                    d="M18 2.0845a15.9155 15.9155 0 010 31.831a15.9155 15.9155 0 010-31.831"
                    fill="none"
                    :stroke="getColor(type)"
                    stroke-width="3"
                    :stroke-dasharray="`${getLeavePercentage(type)} 100`"
                  />
                </svg>

                <span class="absolute inset-0 flex items-center justify-center text-[10px] sm:text-xs md:text-sm font-bold text-primary">
                  {{ getLeavePercentage(type).toFixed(0) }}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- الطلبات -->
        <div>
          <h3 class="font-bold mb-2 text-sm sm:text-base md:text-lg text-gray-800">طلبات الموظف</h3>

          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">

            <div class="request-card flex flex-col items-center p-2 sm:p-3">
              <div class="text-lg sm:text-xl">🏖</div>
              <div class="text-xs sm:text-sm font-semibold">طلبات الاستئدان</div>
              <div class="count">{{ leaveRequests.length }}</div>
            </div>

            <div class="request-card flex flex-col items-center p-2 sm:p-3">
              <div class="text-lg sm:text-xl">📝</div>
              <div class="text-xs sm:text-sm font-semibold">تعديل البيانات</div>
              <div class="count">{{ dataUpdateRequests.length }}</div>
            </div>

            <div class="request-card flex flex-col items-center p-2 sm:p-3">
              <div class="text-lg sm:text-xl">🚪</div>
              <div class="text-xs sm:text-sm font-semibold">إذن خروج</div>
              <div class="count">{{ exitPermitRequests.length }}</div>
            </div>

            <div class="request-card flex flex-col items-center p-2 sm:p-3">
              <div class="text-lg sm:text-xl">💰</div>
              <div class="text-xs sm:text-sm font-semibold">شهادة مرتب</div>
              <div class="count">{{ salaryRequests.length }}</div>
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
import userImage from "../assets/user.png";
import api from "../services/api";

export default {
  name: "DashboardPage",
  components: { Sidebar, Navbar },
  data() {
    return {
      userImg: userImage,
      user: {},
      leaveSummary: { new: 0, approved: 0, rejected: 0 },
      leaveTypeCounts: {},
      totalLeaves: 0,
      announcements: [],
      scrollDuration: 35,
      leaveRequests: [],
      dataUpdateRequests: [],
      exitPermitRequests: [],
      salaryRequests: [],
    };
  },
  async mounted() {
    await this.fetchUserData();
    await this.fetchAnnouncements();
    await this.fetchRequests();
  },
  methods: {
    async fetchUserData() {
      try {
        const resProfile = await api.get("/Employee/my-profile");
        this.user = resProfile.data;
        const resLeaves = await api.get("/leave-requests/my-requests");
        const requests = resLeaves.data.requests || [];
        this.leaveSummary.new = requests.filter(r => r.status === "قيد_الانتظار").length;
        this.leaveSummary.approved = requests.filter(r => r.status === "مقبولة").length;
        this.leaveSummary.rejected = requests.filter(r => r.status === "مرفوضة").length;
        const counts = {};
        requests.forEach(r => {
          const typeName = r.leaveTypeName?.اسم_الاجازة || r.leaveTypeName || "غير معروف";
          counts[typeName] = (counts[typeName] || 0) + 1;
        });
        this.leaveTypeCounts = counts;
        this.totalLeaves = requests.length;
      } catch (err) { console.error(err); }
    },
    async fetchAnnouncements() {
      try {
        const res = await api.get("/Announcements/my-announcements");
        this.announcements = res.data || [];
      } catch (err) { console.error(err); }
    },
    async fetchRequests() {
      try {
        this.leaveRequests = (await api.get("/leave-requests/my-requests")).data.requests || [];
        this.dataUpdateRequests = (await api.get("/DataUpdate/my-requests")).data || [];
        this.exitPermitRequests = (await api.get("/ExitPermit/my-requests")).data || [];
        this.salaryRequests = (await api.get("/SalaryCertificate/my-requests")).data || [];
      } catch (err) { console.error(err); }
    },
    getLeavePercentage(type) {
      if (this.totalLeaves === 0) return 0;
      return ((this.leaveTypeCounts[type] || 0) / this.totalLeaves) * 100;
    },
    getColor(type) {
      const colors = { "سنوية": "#3B82F6", "مرضية": "#F59E0B", "طارئة": "#EF4444" };
      return colors[type] || "#10B981";
    }
  }
};
</script>

<style scoped>
.announcement-bar { direction: rtl; font-size: 0.75rem; }
.announcement-track { display: flex; width: max-content; animation: marquee linear infinite; }
.announcement-bar:hover .announcement-track { animation-play-state: paused; }
@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }

.request-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.2s;
  cursor: pointer;
}

.request-card:hover {
  background: #f3f4f6;
  transform: translateY(-2px);
}

.count {
  font-size: 14px;
  font-weight: bold;
  color: #1D4736;
}
</style>