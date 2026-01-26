<template>
  <div class="flex min-h-screen bg-gray-100">

    <!-- Sidebar ثابت -->
    <Sidebar class="fixed top-0 right-0 h-screen w-24 md:w-64 z-50" />

    <!-- المحتوى الرئيسي -->
    <div class="flex-1 p-6 min-h-screen mr-24 md:mr-64">

      <!-- Navbar ثابت -->
      <Navbar />

      <!-- عنوان الصفحة -->
      <div class="p-6 max-w-4xl mx-auto">
        <h2 class="text-2xl font-bold mb-4 text-right">الإشعارات</h2>

        <!-- إذا لا توجد إشعارات -->
        <div v-if="notifications.length === 0" class="text-gray-500 text-center">
          لا توجد إشعارات
        </div>

        <!-- قائمة الإشعارات -->
        <div v-for="n in notifications" :key="n.id"
             @click="handleNotificationClick(n)"
             class="rounded-xl shadow p-4 mb-3 cursor-pointer transition flex justify-between items-start"
             :class="n.isRead ? 'bg-gray-100' : 'bg-red-100 border-r-4 border-red-500'">
          <div class="text-right flex-1">
            <h3 class="font-bold text-right">{{ n.title }}</h3>
            <p class="text-gray-600 text-right">{{ n.message }}</p>
            <small class="text-gray-400 text-right">{{ formatDate(n.createdAt) }}</small>
          </div>
          <div v-if="!n.isRead" class="ml-4 flex items-center justify-center">
            <span class="w-3 h-3 bg-red-500 rounded-full"></span>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>

<script>
import Sidebar from "../components/Sidebar.vue";
import Navbar from "../components/Navbar.vue";
import axios from "axios";

export default {
  name: "NotificationsPage",
  components: { Sidebar, Navbar },
  data() {
    return {
      notifications: []
    };
  },
  async mounted() {
    await this.fetchNotifications();
  },
  methods: {
    formatDate(date) {
      return new Date(date).toLocaleString("ar-LY");
    },

    async fetchNotifications() {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5205/api/Notifications", {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.notifications = res.data;
      } catch (err) {
        console.error("خطأ في تحميل الإشعارات", err);
      }
    },

  async handleNotificationClick(notification) {
  if (!notification) return;

  try {
    const token = localStorage.getItem("token");
    const roleId = localStorage.getItem("roleId");

    // تعليم الإشعار كمقروء
    if (!notification.isRead) {
      await axios.put(
        `http://localhost:5205/api/Notifications/${notification.id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      notification.isRead = true;
    }

    const text = `${notification.title} ${notification.message}`;

    // إشعارات الإجازات
    if (text.includes("إجازة") || text.includes("الإجازة")) {

      // مدير
      if (['1','2','3','4'].includes(roleId)) {
        this.$router.push("/manager/leaves");
        return;
      }

      // موظف
      this.$router.push("/leaves");
      return;
    }

    console.log("🔕 إشعار بدون توجيه");

  } catch (err) {
    console.error("خطأ أثناء التفاعل مع الإشعار", err);
  }
}


  }
};
</script>

<style scoped>
.bg-gray-100 {
  background-color: #f5f5f5;
}
</style>
