<template>
  <div class="sidebar flex flex-col bg-blue-800 text-white min-h-screen fixed right-0 w-64">
    <h2 class="text-lg font-bold mb-6 text-center py-4 border-b border-blue-700">
      هيئة الرقابة
    </h2>

    <ul>
      <!-- روابط عادية -->
      <li v-for="link in normalLinks" :key="link.name">
        <router-link
          :to="link.path"
          class="sidebar-link"
          active-class="active-link"
        >
          <span class="text-xl">{{ link.icon }}</span>
          <span class="sidebar-text">{{ link.name }}</span>
        </router-link>
      </li>

      
     <!-- الطلبات -->
<li class="sidebar-item" ref="requestsItem" >
 <div
  class="sidebar-link cursor-pointer"
  @click="toggleRequests"
  :class="{ 'active-link': showRequests }"
>
  <span class="text-xl">📄</span>
  <span class="sidebar-text">الطلبات</span>
  <span class="arrow" :class="{ open: showRequests }">▶</span>
</div>
  </li>

 </ul>
  </div>
   <!-- القائمة الجانبية (برا السايد) -->
  <Teleport to="body">
    <transition name="flyout">
      <ul
        v-show="showRequests"
        ref="flyout"
        class="requests-flyout"
        :style="flyoutStyle"
      >
        <li v-for="req in requestLinks" :key="req.name">
          <router-link
            :to="req.path"
            class="flyout-link"
            @click="closeRequests"
          >
            {{ req.name }}
          </router-link>
        </li>
      </ul>
    </transition>
  </Teleport>
</template>
<script>
export default {
  name: "SidebarPage",

  data() {
    return {
      showRequests: false,
      flyoutStyle: {},
    }
  },

  computed: {
    role() {
      return localStorage.getItem("role") // Employee / SuperAdmin
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
      ]

      return links.filter(l => l.roles.includes(this.role))
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
      ]
    }
  },

   methods: {
  toggleRequests() {
      this.showRequests = !this.showRequests;
      if (this.showRequests) {
        this.$nextTick(this.setFlyoutPosition);
      }
    },

    closeRequests() {
      this.showRequests = false;
    },

setFlyoutPosition() {
  const item = this.$refs.requestsItem;
  const rect = item.getBoundingClientRect();

  const flyoutHeight = this.requestLinks.length * 42;
  const spaceBelow = window.innerHeight - rect.bottom;

  let top;

  if (spaceBelow < flyoutHeight) {
    top = rect.top - flyoutHeight + rect.height;
  } else {
    top = rect.top;
  }

  this.flyoutStyle = {
    position: "fixed",
    top: top + "px",
    right: (window.innerWidth - rect.right) + rect.width + 10 + "px",
  };
},


  
   handleClickOutside(e) {
      const item = this.$refs.requestsItem;
      const flyout = this.$refs.flyout;

      if (
        this.showRequests &&
        item &&
        !item.contains(e.target) &&
        flyout &&
        !flyout.contains(e.target)
      ) {
        this.showRequests = false;
      }
    },
 
  },
  mounted() {
    document.addEventListener("click", this.handleClickOutside);
  },

  beforeUnmount() {
    document.removeEventListener("click", this.handleClickOutside);
  },

};

</script>


<style scoped>
.sidebar {
  position: fixed;
  right: 0;
  left: auto;      /* مهم */
  top: 0;
  width: 7rem;
  height: 100vh;
  background-color: #1e3a8a;
  overflow-y: auto;  
  padding: 0.5rem;
  box-shadow: -2px 0 5px rgba(0,0,0,0.1);
}

.sidebar h2 {
  font-size: 0.9rem;
  text-align: center;
  margin-bottom: 1rem;
  color: white;
}

.sidebar-text {
   position: sticky;
  font-size: 0.8rem;
  
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
  flex-direction: row-reverse;
  align-items: center;
  justify-content: flex-start;
  gap: 0.5rem;
  padding: 0.6rem;
  border-radius: 8px;
  color: white;
  text-decoration: none;
  transition: all 0.2s ease;
  background-color: transparent; /* خلي الخلفية شفافة عشان يظهر لون السايد */
}


.active-link {
  background: #273458;
  font-weight: bold;
}

.sidebar-item {
  position: relative;
}

/* flyout */
.requests-flyout {
  background: white;
  min-width: 220px;
  border-radius: 12px;
  padding: 0.5rem 0;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  z-index: 9999;
}

.flyout-link {
  display: block;
  padding: 0.6rem 1rem;
  text-align: right;
  font-size: 0.85rem;
  color: #1e3a8a;
  text-decoration: none;
}

.flyout-link:hover {
  background: #eff6ff;
  color: #1d4ed8;
}

/* animation */
.flyout-enter-active,
.flyout-leave-active {
  transition: all 0.2s ease;
}

.flyout-enter-from,
.flyout-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

.arrow {
  margin-left: auto;
  transition: transform 0.2s ease;
}

.arrow.open {
  transform: rotate(90deg);
}
</style>
