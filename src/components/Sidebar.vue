<template>
  <div
   dir="rtl"
    class="fixed top-0 right-0 h-screen w-24 sm:w-28 md:w-60
           bg-primary text-white
           flex flex-col items-end
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
    <ul class="flex flex-col gap-1 w-full items-end">
  <li v-for="link in normalLinks"
      :key="link.name"
      class="w-full flex justify-end">
<router-link
  :to="link.path"
  class="flex items-center 
         gap-2
         px-2 py-2 rounded-lg transition
         text-sm md:text-base font-medium
         text-right w-full"
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
      roleId: 0 // افتراضي
    };
  },
  computed: {
    normalLinks() {
      const links = [
        { name: "الرئيسية", path: "/dashboard", icon: "🏠", roles: [1,2,3,4,5] },
        { name: "الموظفون", path: "/employees", icon: "👥", roles: [1] }, // فقط SuperAdmin
        { name: "الإجازات", path: "/leaves", icon: "✈️", roles: [5,2,3,4,] },
        { name: "الطلبات", path: "/requests", icon: "📄", roles: [1,2,3,4,5] },
         { 
        name: "إدارة الإدارات",
        path: "/departments-management",
        icon: "🏢",
        roles: [1] 
      },
        { name: "المؤهل العلمي", path: "/employee-qualification", icon: "🎓", roles: [1,2,3,4,5] },
        { name: "إدارة الإجازات", path: "/manager/leaves", icon: "🗂️", roles: [2,3,4] },
        { name: "الصلاحيات", path: "/permissions", icon: "🔐", roles: [1,2] },
        { name: "الشكاوى", path: "/complaints", icon: "📝", roles: [1,2,3,4,5] },
        { name: "التكليفات", path: "/tasks", icon: "💼", roles: [1,2,3,4,5] },
        { name: "النماذج", path: "/templates", icon: "📑", roles: [1] },
        { name: "التقييم", path: "/evaluation", icon: "⭐", roles: [1,2,3,4,5] },
        { name: "مركز المعرفة", path: "/knowledge", icon: "📚", roles: [1,2,3,4,5] }
      ];

      // فلترة الروابط حسب roleId
      return links.filter(link => link.roles.includes(this.roleId));
    }
  },
  mounted() {
    const storedRoleId = Number(localStorage.getItem("roleId"));
    if (storedRoleId) this.roleId = storedRoleId;

    // تحديث roleId لو تغير في localStorage
    window.addEventListener("storage", () => {
      const updatedRoleId = Number(localStorage.getItem("roleId"));
      if (updatedRoleId) this.roleId = updatedRoleId;
    });
  }
};
</script>

  