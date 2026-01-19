<template>
  <div
    class="fixed top-0 right-0 h-screen w-24 sm:w-28 md:w-60
           bg-primary text-white
           flex flex-col items-center
           px-2 py-3
           overflow-y-auto"
  >
    <!-- العنوان -->
    <h2
      class="text-base md:text-lg font-bold text-center mb-4 py-2
             border-b border-blue-700 w-full"
    >
      هيئة الرقابة
    </h2>

    <!-- الروابط -->
    <ul class="flex flex-col gap-1 w-full items-center">
      <li v-for="link in normalLinks" :key="link.name" class="w-full">
        <router-link
          :to="link.path"
          class="flex flex-col md:flex-row-reverse
                 items-center justify-center gap-1
                 px-2 py-2 rounded-lg transition
                 text-sm md:text-base font-medium
                 text-center md:text-right"
          :class="[ $route.path === link.path
                    ? 'bg-gray-300 text-gray-900 font-semibold'
                    : 'hover:bg-gray-500/30' ]"
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
   
      role: "موظف"
    };
  },
  computed: {
    normalLinks() {
      // كل الأدوار الممكنة
      const allRoles = ["موظف", "مدير قسم", "مدير إدارة فرعية", "مدير إدارة", "SuperAdmin"];
      const adminRoles = ["SuperAdmin", "مدير إدارة"]; // فقط للأقسام الإدارية

      const links = [
        { name: "الرئيسية", path: "/dashboard", icon: "🏠", roles: allRoles },
        { name: "إضافة موظف", path: "/employee", icon: "👤", roles: ["SuperAdmin"] },
        { name: "الطلبات", path: "/requests", icon: "📄", roles: allRoles },
        { name: "الإجازات", path: "/leaves", icon: "✈️", roles: ["موظف"] },
        { name: "المؤهل العلمي", path: "/employee-qualification", icon: "🎓", roles: allRoles },
        { name: "إدارة الإجازات", path: "/manager/leaves", icon: "🗂️", roles: ["مدير قسم", "مدير إدارة فرعية", "مدير إدارة", "SuperAdmin"] },
        { name: "الصلاحيات", path: "/permissions", icon: "🔐", roles: adminRoles },
        { name: "الشكاوى", path: "/complaints", icon: "📝", roles: allRoles },
        { name: "التكليفات", path: "/tasks", icon: "💼", roles: allRoles },
        { name: "النماذج", path: "/templates", icon: "📑", roles: ["SuperAdmin"] },
        { name: "التقييم", path: "/evaluation", icon: "⭐", roles: allRoles },
        { name: "مركز المعرفة", path: "/knowledge", icon: "📚", roles: allRoles }
      ];

      // فلترة الروابط حسب الدور الحالي
      return links.filter(link => link.roles.includes(this.role));
    }
  },
  mounted() {
    // خزن الدور كما جاء من السيرفر مباشرة
    const storedRole = localStorage.getItem("role")?.trim();
    if (storedRole) this.role = storedRole;

    // تحديث role لو تغيرت في localStorage
    window.addEventListener("storage", () => {
      const updatedRole = localStorage.getItem("role")?.trim();
      if (updatedRole) this.role = updatedRole;
    });
  }
};
</script>

