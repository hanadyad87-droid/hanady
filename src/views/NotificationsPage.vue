<template>
 <div class="flex min-h-screen bg-gray-100">

    <!-- Sidebar ثابت -->
    <Sidebar class="fixed top-0 right-0 h-screen w-24 md:w-64 z-50" />

    <!-- المحتوى الرئيسي -->
     <div class="flex-1 p-6 min-h-screen mr-24 md:mr-64">

      <!-- Navbar ثابت -->
      <Navbar />

      <!-- قسم الإشعارات -->
      <div class="p-6 max-w-4xl mx-auto">
        <h2 class="text-2xl font-bold mb-4 text-right">الإشعارات</h2>

        <!-- لو ما فيش إشعارات -->
        <div v-if="notifications.length === 0" class="text-gray-500 text-center">
          لا توجد إشعارات
        </div>

        <!-- قائمة الإشعارات -->
        <div
          v-for="n in notifications"
          :key="n.id"
          class="rounded-lg shadow p-4 mb-3 cursor-pointer transition"
          :class="n.isRead ? 'bg-gray-100' : 'bg-red-100 border-r-4 border-red-500'"
          @click="markAsRead(n)"
        >
          <h3 class="font-bold">{{ n.title }}</h3>
          <p class="text-gray-600">{{ n.message }}</p>
          <small class="text-gray-400">{{ formatDate(n.createdAt) }}</small>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import axios from "axios";
import Sidebar from "../components/Sidebar.vue"
import Navbar from "../components/Navbar.vue";

export default {
     name: "NotificationsPage",
  components: { Sidebar, Navbar },
  data() {
    return {
      notifications: []
    };
  },
  async mounted() {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://localhost:5205/api/Notifications",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log("🔔 notifications:", res.data); // ← مهم
      this.notifications = res.data;
    } catch (err) {
      console.error("❌ error loading notifications", err);
    }
  },
  methods: {
  formatDate(date) {
    return new Date(date).toLocaleString("ar-LY");
  },
async markAsRead(notification) {
  if (notification.isRead) return;

  try {
    const token = localStorage.getItem("token");

    const res = await axios.put(
      `http://localhost:5205/api/Notifications/${notification.id}/read`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    // إذا أردت التأكد من التحديث من السيرفر:
    if (res.status === 200) {
      this.$set(notification, 'isRead', true); // Vue reactivity
    }
  } catch (err) {
    console.error("❌ error marking as read", err);
  }
}

}

};
</script>
