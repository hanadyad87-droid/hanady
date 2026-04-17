<template>
  <div
    dir="rtl"
    class="fixed top-0 right-0 h-screen w-24 sm:w-28 md:w-60
           flex flex-col items-end
           px-2 py-3
           overflow-y-auto
           bg-gradient-to-b from-[#1D4736] via-[#165a40] to-[#1D4736] shadow-lg"
  >
    <!-- شعار واسم الهيئة -->
    <div class="flex flex-col items-center w-full mb-4">
      <div class="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 
                  rounded-full border-2 border-white/30 
                  shadow-xl overflow-hidden mb-2 
                  flex items-center justify-center bg-white/10
                  transform transition-all duration-300 hover:scale-105">
        <img src="@/assets/image.png" 
             alt="شعار الرقابة" 
             class="w-full h-full object-cover"/>
      </div>
      <h2
        class="text-sm sm:text-base md:text-lg font-bold text-center
               py-1 border-b border-white/40 w-full tracking-wide text-white drop-shadow-md"
      >
         هيئة الرقابة الإدارية
      </h2>
    </div>

    <!-- الروابط -->
    <ul class="flex flex-col gap-1 w-full items-end">
      <li v-for="link in normalLinks"
          :key="link.name"
          class="w-full flex justify-end">
        <router-link
          :to="link.path"
          class="flex items-center gap-2 px-2 py-2 rounded-lg transition
                 text-sm md:text-base font-medium text-right w-full"
          :class="[ $route.path === link.path
                    ? 'bg-white/20 text-white font-semibold'
                    : 'hover:bg-white/10 text-white' ]"
        >
          <span class="text-lg md:text-xl">{{ link.icon }}</span>
          <span class="whitespace-nowrap leading-tight">{{ link.name }}</span>
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
      roles: []
    };
  },

  computed: {
    normalLinks() {
      const links = [
        { name: "الرئيسية", path: "/dashboard", icon: "🏠", roles: [1,2,3,4,5,6] },
        { name: "الموظفين", path: "/employees", icon: "👥", roles: [1] },
        { name: "الإجازات", path: "/leaves", icon: "✈️", roles: [5,4,6] },
        { name: "الطلبات", path: "/requests", icon: "📄", roles: [1,2,3,4,5,6] },
{ name: "إدارة الإدارات", path: "/departments", icon: "🏢", roles: [1] },
{ name: "تعيين المدراء", path: "/assign-managers", icon: "👔", roles: [1] },
        { name: "المؤهل العلمي", path: "/employee-qualification", icon: "🎓", roles: [1] },
        { name: "إدارة الإجازات", path: "/manager/leaves", icon: "🗂️", roles: [2,3,4,5] },
        { name: "الشكاوى", path: "/complaints", icon: "📝", roles: [3,4,5,6] },
        { name: "ادارة الشكاوي", path: "/manager/complaints", icon: "📝", roles: [3,4,5] },
        { name: "الإعلانات", path: "/announcements", icon: "📢", roles: [1] },
      { name: "طلبات الإدارة", path: "/department-requests", icon: "📋", roles: [2,5,6] },
         { name: "إعدادات توجيه الطلبات", path: "/request-settings", icon: "⚙️", roles: [1] },
         { name: "سجلات التدقيق", path: "/audit-logs", icon: "📝", roles: [1] } ,
        { name: "إدارة المهام", path: "/manager-tasks", icon: "💼", roles: [5] },
{ name: "مهامي", path: "/my-tasks", icon: "📋", roles: [6] },
{ name: "التكليف الإداري", path: "/delegation", icon: "🔄", roles: [5,3,4] },
{ name: "التقارير", path: "/reports", icon: "📊", roles: [3,4,5] },
{ name: "النماذج", path: "/company-forms", icon: "📄", roles: [6] },
{ name: "إدارة النماذج", path: "/company-forms/manage", icon: "📑", roles: [1,2,3,4,5] },
        
        { name: "الاسئلة الشائعة", path: "/knowledge", icon: "📚", roles: [1,2,3,4,5,6] },
        { name: "إدارة الاسئلة الشائعة", path: "/faq-mangement", icon: "📚", roles: [1,2] }
      ];

      // 🔥 يتحقق لو عنده أي رول من المسموح
      return links.filter(link =>
        this.roles.some(role => link.roles.includes(role))
      );
    }
  },

  mounted() {
    this.loadRoles();

    window.addEventListener("storage", this.loadRoles);
  },

  methods: {
    loadRoles() {
      const storedRoles = JSON.parse(localStorage.getItem("roles") || "[]");
      this.roles = storedRoles.map(Number);
    }
  }
};
</script>

