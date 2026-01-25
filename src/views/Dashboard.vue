<template>
  <div class="flex min-h-screen bg-background" dir="rtl">

    <!-- Sidebar -->
    <Sidebar class="fixed top-0 right-0 h-screen w-24 md:w-64 bg-primary text-white p-4 z-50" />

    <!-- المحتوى -->
    <div class="flex-1 min-h-screen p-6 mr-24 md:mr-64">

      <!-- Navbar -->
      <Navbar />

      <!-- كرت الموظف -->
      <div class="bg-white rounded-xl shadow p-6 mb-6 flex items-center gap-4 max-w-4xl mx-auto">
        <img :src="user.profileImage || userImg" class="w-24 h-24 rounded-full border" />
        <div class="text-right">
          <h3 class="font-bold text-lg">{{ user.fullName || '...' }}</h3>
          <p class="text-gray-500 text-sm">{{ user.jobTitle || '...' }}</p>
          <p class="text-gray-500 text-sm">{{ user.jobGrade || '...' }}</p>
        </div>
      </div>

      <!-- رسم بياني الإجازات لكل نوع -->
<div class="bg-white rounded-xl shadow p-6 col-span-2 max-w-4xl mx-auto mb-6">
  <h3 class="font-bold mb-4 text-right">الإجازات خلال السنة</h3>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div v-for="(count, type) in leaveTypeCounts" :key="type" class="bg-gray-100 p-4 rounded flex justify-between items-center">
      <span class="font-bold text-right">{{ type }}</span>
      <span class="font-semibold">{{ getLeavePercentage(type).toFixed(1) }}%</span>
    </div>
  </div>
</div>


      <!-- الطلبات -->
      <div class="bg-white rounded-xl shadow p-6 col-span-3 max-w-4xl mx-auto">
        <h3 class="font-bold mb-4 text-right">ملخص الطلبات</h3>

        <div class="grid grid-cols-3 gap-4 text-center">
          <div class="bg-blue-100 p-4 rounded">
            <p class="text-2xl font-bold">{{ leaveSummary.new }}</p>
            <p class="text-sm">طلبات جديدة</p>
          </div>
          <div class="bg-green-100 p-4 rounded">
            <p class="text-2xl font-bold">{{ leaveSummary.approved }}</p>
            <p class="text-sm">طلبات مقبولة</p>
          </div>
          <div class="bg-red-100 p-4 rounded">
            <p class="text-2xl font-bold">{{ leaveSummary.rejected }}</p>
            <p class="text-sm">طلبات مرفوضة</p>
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
      leaveTypeCounts: {}, // { "إجازة مرضية": 2, "إجازة سنوية": 3, ... }
      totalLeaves: 0
    };
  },
  async mounted() {
    try {
      // جلب بيانات الموظف
      const resProfile = await api.get("/Employee/my-profile");
      this.user = {
        fullName: resProfile.data.fullName,
        jobTitle: resProfile.data.jobTitle,
        jobGrade: resProfile.data.jobGrade,
        profileImage: resProfile.data.profileImage
      };

      // جلب الإجازات
      const resLeaves = await api.get("/LeaveRequest/my-requests");
      const requests = resLeaves.data.requests || [];

      // ملخص الطلبات حسب الحالة
      this.leaveSummary.new = requests.filter(r => r.status === "قيد_الانتظار").length;
      this.leaveSummary.approved = requests.filter(r => r.status === "مقبولة").length;
      this.leaveSummary.rejected = requests.filter(r => r.status === "مرفوضة").length;

      // عد كل نوع إجازة
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
  methods: {
    getLeavePercentage(type) {
      if (this.totalLeaves === 0) return 0;
      return ((this.leaveTypeCounts[type] || 0) / this.totalLeaves) * 100;
    }
  }
};
</script>
