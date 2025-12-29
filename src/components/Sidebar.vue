<template>
  <div class="sidebar flex flex-col bg-blue-800 text-white min-h-screen fixed right-0">
    <h2 class="text-lg font-bold mb-6 text-center py-4 border-b border-blue-700">هيئة الرقابة</h2>
    <ul>
      <li v-for="link in links" :key="link.name">
        <router-link
          :to="link.path"
          class="sidebar-link"
          active-class="active-link"
        >
          <span class="text-xl">{{ link.icon }}</span>
          <span class="sidebar-text">{{ link.name }}</span>
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: "SidebarPage",

  computed: {
    user() {
      return JSON.parse(localStorage.getItem("user"))
    },

    links() {
      const allLinks = [
        { name: "الرئيسية", path: "/dashboard", icon: "🏠", roles: ["Employee", "SuperAdmin"] },
        { name: "الموظفين", path: "/employee", icon: "👤", roles: ["SuperAdmin"] },
        { name: "الإشعارات", path: "/notifications", icon: "🔔", roles: ["Employee", "SuperAdmin"] },
        { name: "الطلبات", path: "/requests", icon: "📄", roles: ["Employee", "SuperAdmin"] },
        { name: "التكليفات", path: "/tasks", icon: "💼", roles: ["Employee", "SuperAdmin"] },
        { name: "الإجازات", path: "/leaves", icon: "✈️", roles: ["Employee", "SuperAdmin"] },
        { name: "الشكاوى", path: "/complaints", icon: "📝", roles: ["Employee", "SuperAdmin"] },
        { name: "النماذج", path: "/templates", icon: "📑", roles: ["SuperAdmin"] },
        { name: "التقييم", path: "/evaluation", icon: "⭐", roles: ["SuperAdmin"] },
        { name: "مركز المعرفة", path: "/knowledge", icon: "📚", roles: ["Employee", "SuperAdmin"] },
      ]

      // نرجع بس الروابط اللي مسموحة للدور
      return allLinks.filter(link =>
        link.roles.includes(this.user?.role)
      )
    }
  }
}

</script>

<style scoped>
.sidebar {
  width: 7rem;
  max-width: 7.5rem;
  padding: 0.5rem;
  box-shadow: -2px 0 5px rgba(0,0,0,0.1);
  overflow-y: auto;
}

.sidebar h2 {
  font-size: 0.9rem;
  text-align: center;
  margin-bottom: 1rem;
}

.sidebar-text {
  font-size: 0.8rem;
  white-space: nowrap;
  text-align: right; /* RTL */
  color: white;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

ul li {
  margin-bottom: 1rem;
}

.sidebar-link {
  display: flex;
  flex-direction: row-reverse; /* أيقونة على اليمين والنص على اليسار */
  align-items: center;
  justify-content: flex-start;
  gap: 0.5rem;
  padding: 0.6rem;
  border-radius: 8px;
  color: white;
  text-decoration: none;
  transition: all 0.2s ease;
}

.active-link {
  background-color: #273458;
  font-weight: bold;
  padding: 0.8rem;
  border-radius: 10px;
}

.sidebar-link:hover {
  background-color: #9eb6e9;
}
</style>
