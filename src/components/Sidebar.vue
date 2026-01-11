<template>
  <div class="fixed top-0 right-0 h-screenw-16 sm:w-24 md:w-64
bg-primary text-white flex flex-col p-4">
    <h2 class="text-lg font-bold text-center mb-6 py-2 border-b border-blue-700">
      هيئة الرقابة
    </h2>

    <ul class="flex flex-col gap-2">
      <!-- روابط عادية -->
      <li v-for="link in normalLinks" :key="link.name">
        <router-link
          :to="link.path"
          class="flex flex-row-reverse items-center gap-2 p-2 rounded-lg transition hover:bg-blue-900"
          :class="{ 'bg-blue-900 font-bold': $route.path === link.path }"
        >
          <span class="text-xl">{{ link.icon }}</span>
          <span class="text-sm">{{ link.name }}</span>
        </router-link>
      </li>

      <!-- الطلبات -->
   <li>
  <router-link
    to="/requests"
    class="flex flex-row-reverse items-center gap-2 p-2 rounded-lg transition hover:bg-blue-900"
    :class="{ 'bg-blue-900 font-bold': $route.path.startsWith('/requests') }"
  >
    <span class="text-xl">📄</span>
    <span class="text-sm">الطلبات</span>
  </router-link>
</li>

    </ul>
  </div>
</template>

<script>
export default {
  name: "SidebarPage",
  data() {
    return {
      showRequests: false,
    };
  },
  computed: {
    role() {
      return localStorage.getItem("role") || "Employee";
    },
    normalLinks() {
      const links = [
        { name: "الرئيسية", path: "/dashboard", icon: "🏠", roles: ["Employee", "SuperAdmin"] },
        { name: "إضافة موظف", path: "/employee", icon: "👤", roles: ["SuperAdmin"] },
        { name: "الإشعارات", path: "/notifications", icon: "🔔", roles: ["Employee", "SuperAdmin"] },
        { name: "الإجازات", path: "/leaves", icon: "✈️", roles: ["Employee", "SuperAdmin"] },
        { name: "الشكاوى", path: "/complaints", icon: "📝", roles: ["Employee", "SuperAdmin"] },
        { name: "التكليفات ", path: "/tasks", icon: "💼", roles: ["Employee", "SuperAdmin"] },
        { name: "النماذج", path: "/templates", icon: "📑", roles: ["SuperAdmin"] },
        { name: "التقييم", path: "/evaluation", icon: "⭐", roles:["Employee", "SuperAdmin"] },
        { name: "مركز المعرفة", path: "/knowledge", icon: "📚", roles: ["Employee", "SuperAdmin"] },
      ];
      return links.filter(l => l.roles.includes(this.role));
    },
    requestLinks() {
      return [
        { name: "طلب تعديل بيانات", path: "/requests/update-info" },
        { name: "طلب نقل قسم", path: "/requests/transfer" },
        { name: "طلب إذن خروج", path: "/requests/permission" },
        { name: "طلب دورة تدريبية", path: "/requests/training" },
        { name: "طلب زواج", path: "/requests/marriage" },
        { name: "طلب إنترنت", path: "/requests/internet" },
        { name: "طلب صيانة", path: "/requests/maintenance" },
      ];
    }
  },
  methods: {
    toggleRequests() {
      this.showRequests = !this.showRequests;
    },
    closeRequests() {
      this.showRequests = false;
    }
  }
};
</script>

<style>
.fade-enter-active, .fade-leave-active {
  transition: all 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateX(10px);
}
</style>
