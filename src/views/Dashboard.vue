<template>
  <div class="flex min-h-screen bg-background" dir="rtl">

    <!-- Sidebar -->
    <Sidebar class="fixed top-0 right-0 h-screen w-24 md:w-64 bg-primary text-white p-4 z-50" />

    <!-- المحتوى -->
    <div class="flex-1 min-h-screen p-6 mr-24 md:mr-64">

      <!-- Navbar -->
      <Navbar />



<!-- شريط الإعلانات -->
<div class="max-w-5xl mx-auto mb-6">

  <!-- في حالة وجود إعلانات -->
  <div
    v-if="announcements && announcements.length"
    class="announcement-bar overflow-hidden rounded-md h-12 flex items-center px-4 shadow-sm relative"
    style="background: linear-gradient(90deg, #1D4736 0%, #165a40 50%, #1D4736 100%);"
  >
    <div
      class="announcement-track flex items-center gap-24"
      :style="{ animationDuration: scrollDuration + 's' }"
    >
      <!-- الإعلان -->
      <div
        v-for="ann in announcements"
        :key="ann.id"
        class="relative group announcement-text flex items-center gap-2 text-sm
               px-2 py-1 rounded-md hover:bg-white/10 transition"
      >
        <!-- العنوان -->
        <span class="text-white font-semibold group-hover:underline">
          {{ ann.title }}
        </span>

        <span class="text-white/60">—</span>

        <!-- نص الإعلان -->
        <span class="text-white/80 truncate max-w-[280px]">
          {{ ann.message }}
        </span>

        <!-- التاريخ -->
        <span class="text-white/50 text-xs font-medium mr-2">
          {{ formatDate(ann.createdAt) }}
        </span>
      </div>

      <!-- تكرار -->
      <div
        v-for="ann in announcements"
        :key="'dup-' + ann.id"
        class="announcement-text flex items-center gap-2 text-sm"
      >
        <span class="text-white font-semibold">
          {{ ann.title }}
        </span>
        <span class="text-white/60">—</span>
        <span class="text-white/80">
          {{ ann.message }}
        </span>
        <span class="text-white/50 text-xs font-medium mr-2">
          {{ formatDate(ann.createdAt) }}
        </span>
      </div>
    </div>
  </div>

  <!-- في حالة عدم وجود إعلانات -->
  <div
    v-else
    class="h-12 flex items-center justify-center rounded-md text-white/50 text-sm"
    style="background: linear-gradient(90deg, #1D4736 0%, #165a40 50%, #1D4736 100%);"
  >
    لا توجد إعلانات حالياً
  </div>

</div>








<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto mb-6">

  <!-- الإجازات خلال السنة -->
  <div class="bg-white rounded-xl shadow p-6">
    <h3 class="font-bold mb-4 text-right">الإجازات خلال السنة</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div v-for="(count, type) in leaveTypeCounts" :key="type" 
           class="bg-gray-50 hover:bg-gray-100 transition-colors p-4 rounded-xl flex justify-between items-center border border-gray-200">
        <span class="font-bold text-right text-gray-800">{{ type }}</span>
        <div class="flex items-center gap-3">
          <div class="relative w-12 h-12">
            <svg class="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" stroke="#E5E7EB" stroke-width="3"/>
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" stroke="#3B82F6" :stroke-width="3" 
                    :stroke-dasharray="`${getLeavePercentage(type)} 100`"/>
            </svg>
            <span class="absolute inset-0 flex items-center justify-center text-sm font-bold text-primary">
              {{ getLeavePercentage(type).toFixed(0) }}%
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- الطلبات -->
  <div class="bg-white rounded-xl shadow p-6">
    <h3 class="font-bold mb-4 text-right">ملخص الطلبات</h3>
    <div class="grid grid-cols-3 md:grid-cols-1 lg:grid-cols-3 gap-6 text-center">
      <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border-2 border-blue-200 hover:shadow-lg transition-shadow">
        <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span class="text-2xl font-bold text-blue-700">{{ leaveSummary.new }}</span>
        </div>
        <p class="text-sm text-blue-600 font-medium">طلبات جديدة</p>
      </div>
      <div class="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border-2 border-green-200 hover:shadow-lg transition-shadow">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span class="text-2xl font-bold text-green-700">{{ leaveSummary.approved }}</span>
        </div>
        <p class="text-sm text-green-600 font-medium">طلبات مقبولة</p>
      </div>
      <div class="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-2xl border-2 border-red-200 hover:shadow-lg transition-shadow">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span class="text-2xl font-bold text-red-700">{{ leaveSummary.rejected }}</span>
        </div>
        <p class="text-sm text-red-600 font-medium">طلبات مرفوضة</p>
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

      // بيانات الإعلانات
         announcements: [],
    scrollDuration: 35 // كل ما كبر الرقم = أبطأ
    };
  },
  async mounted() {
    await this.fetchUserData();
    await this.fetchAnnouncements();
    // تم حذف this.startAutoScroll();
  },
  methods: {
    async fetchUserData() {
      try {
        const resProfile = await api.get("/Employee/my-profile");
        this.user = {
          fullName: resProfile.data.fullName,
          jobTitle: resProfile.data.jobTitle,
          jobGrade: resProfile.data.jobGrade,
          profileImage: resProfile.data.profileImage,
          departmentId: resProfile.data.departmentId,
          departmentName: resProfile.data.departmentName 
        };

        const resLeaves = await api.get("/LeaveRequest/my-requests");
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
      } catch (err) {
        console.error("خطأ في جلب بيانات الداشبورد:", err);
      }
    },

    async fetchAnnouncements() {
      try {
        const response = await api.get("/Announcements");
        const allAnnouncements = response.data || [];

        const userDeptId = this.user.departmentId;
        if (!userDeptId) {
          console.warn("departmentId غير موجود، سيتم عرض الإعلانات العامة فقط");
        }

        const filteredAnnouncements = allAnnouncements
          .filter(ann => ann.active && (ann.targetAll || ann.targetDepartmentId === userDeptId))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        this.announcements = filteredAnnouncements;
      } catch (err) {
        console.error("خطأ في جلب الإعلانات:", err);
      }
    },

    formatDate(dateString) {
      if (!dateString) return 'بدون تاريخ';
      const date = new Date(dateString);
      const options = { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric'
      };
      return date.toLocaleDateString('ar-SA', options);
    },

    getLeavePercentage(type) {
      if (this.totalLeaves === 0) return 0;
      return ((this.leaveTypeCounts[type] || 0) / this.totalLeaves) * 100;
    },
  }
};
</script>

<style scoped>
/* شريط الأخبار */
.announcement-bar {
  direction: rtl;
  font-size: 0.875rem;
}

/* المسار المتحرك */
.announcement-track {
  display: flex;
  width: max-content;
  animation: marquee linear infinite;
}

/* إيقاف عند المرور */
.announcement-bar:hover .announcement-track {
  animation-play-state: paused;
}

/* حركة ناعمة */
@keyframes marquee {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}

/* نص الإعلان */
.announcement-text {
  white-space: nowrap;
}


</style>