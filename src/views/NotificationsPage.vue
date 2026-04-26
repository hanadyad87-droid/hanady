<template>
  <div class="flex min-h-screen bg-slate-50" dir="rtl">
    <Sidebar />

    <div class="flex-1 w-full min-w-0 min-h-0 p-4 sm:p-6 mr-0 lg:mr-60">
      <Navbar />

      <div class="mx-auto max-w-3xl space-y-4">
        <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <h1 class="app-page-title flex items-center gap-2">
            <BellAlertIcon class="h-7 w-7 text-primary" />
            الإشعارات
          </h1>
          <p class="text-xs text-slate-500 sm:text-sm">يتم التحديث فوراً عبر الاتصال المباشر مع السيرفر</p>
        </div>

        <div v-if="notifications.length === 0" class="app-panel py-10 text-center text-slate-500">
          لا توجد إشعارات
        </div>

        <div
          v-for="n in notifications"
          :key="n.id"
          class="app-panel mb-3 flex cursor-pointer items-start justify-between gap-3 transition hover:shadow-md"
          :class="n.isRead ? 'border-slate-100 bg-slate-50/80' : 'border-red-200 bg-red-50/90'"
          @click="handleNotificationClick(n)"
        >
          <div class="min-w-0 flex-1 text-right">
            <h3 class="font-semibold text-slate-900">{{ n.title }}</h3>
            <p class="mt-1 text-sm text-slate-600">{{ n.message }}</p>
            <p class="mt-2 text-xs text-slate-400">{{ formatDate(n.createdAt) }}</p>
          </div>
          <div v-if="!n.isRead" class="flex shrink-0 items-center pt-1">
            <span class="h-2.5 w-2.5 rounded-full bg-red-500" aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { BellAlertIcon } from "@heroicons/vue/24/outline";
import Sidebar from "../components/Sidebar.vue";
import Navbar from "../components/Navbar.vue";
import api from "../services/api";
import { notificationStore } from "../stores/notificationStore";

export default {
  name: "NotificationsPage",
  components: { Sidebar, Navbar, BellAlertIcon },

  computed: {
    notifications() {
      return notificationStore.items;
    },
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
        const res = await api.get("/Notifications");
        notificationStore.setFromApi(res.data || []);
      } catch (err) {
        console.error("خطأ في تحميل الإشعارات", err);
      }
    },

    async handleNotificationClick(notification) {
      if (!notification) return;

      try {
        const roleId = localStorage.getItem("roleId");

        if (!notification.isRead) {
          await api.put(`/Notifications/${notification.id}/read`, {});
          notificationStore.markReadLocal(notification.id);
        }

        const text = `${notification.title} ${notification.message}`;

        if (text.includes("مهمتك") || text.includes("تكليف")) {
          const match = notification.message.match(/: (\S+)/);
          const taskId = match ? match[1] : null;
          this.$router.push({
            path: "/my-tasks",
            query: { highlightId: taskId || "" },
          });
          return;
        }

        if (text.includes("شكوى")) {
          this.$router.push({ path: "/complaints" });
          return;
        }

        if (text.includes("إجازة")) {
          if (["1", "2", "3", "4"].includes(roleId)) {
            this.$router.push("/manager/leaves");
            return;
          }
          this.$router.push("/leaves");
          return;
        }
      } catch (err) {
        console.error("خطأ أثناء التفاعل مع الإشعار", err);
      }
    },
  },
};
</script>
