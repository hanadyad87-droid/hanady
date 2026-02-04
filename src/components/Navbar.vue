<template>
  <div 
    class="fixed top-0 right-24 md:right-64 left-0 h-12 
           bg-navbar shadow-sm border-b border-gray-200 
           flex justify-between items-center px-4 z-40"
    dir="rtl"
    ref="navbarRef"
  >

 <div class="flex items-center gap-2">
  <!-- صورة الموظف (ثابتة) -->
  <div
    class="w-8 h-8 rounded-full overflow-hidden 
           border border-gray-300 bg-gray-100 flex-shrink-0"
  >
    <img
      src="@/assets/user.png"
      alt="employee"
      class="w-full h-full object-cover"
    />
  </div>

  <!-- الاسم + القسم -->
  <div class="leading-tight">
    <div class="text-sm font-semibold text-gray-800">
      {{ userName }}
    </div>
    <div
      v-if="userProfile?.departmentName"
      class="text-xs text-gray-500"
    >
      {{ userProfile.departmentName }}
    </div>
  </div>
</div>




    <!-- الإشعارات + الحساب -->
    <div class="flex items-center gap-3 relative">

      <!-- الإشعارات -->
      <router-link 
        to="/notifications" 
        class="relative text-lg hover:text-primary transition-colors"
      >
        🔔
        <span
          v-if="unreadCount > 0"
          class="absolute -top-1 -right-1 bg-red-500 text-white
                 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold"
        >
          {{ unreadCount }}
        </span>
      </router-link>

      <!-- الحساب -->
      <div class="relative" ref="dropdownRef">
        <button
          @click.stop="toggleMenu"
          class="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium
                 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200
                 flex items-center gap-1"
        >
         
          <span>الحساب</span>
          <span :class="showMenu ? 'rotate-180' : ''" class="transition-transform text-xs">▼</span>
        </button>

        <!-- Dropdown Menu -->
        <div
          v-if="showMenu"
          class="absolute left-0 mt-1 w-52
                 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden"
        >
          <button
            @click="goToUpdateInfo"
            class="w-full text-right px-3 py-2 text-sm hover:bg-gray-50 
                   border-b border-gray-100 flex items-center justify-between"
          >
             طلب تعديل البيانات
          </button>

          <button
            @click="openPasswordModal"
            class="w-full text-right px-3 py-2 text-sm hover:bg-gray-50 
                   border-b border-gray-100 flex items-center justify-between"
          >
             تغيير كلمة المرور
          </button>

          <button
            @click="logout"
            class="w-full text-right px-3 py-2 text-sm
                   text-red-600 hover:bg-red-50 flex items-center justify-between"
          >
             تسجيل خروج
          </button>
        </div>
      </div>
    </div>

    <!-- مودال تغيير كلمة المرور -->
    <div
      v-if="showPasswordModal"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      @click.self="closePasswordModal"
    >
      <div class="bg-white rounded-xl p-6 w-80">
        <h3 class="font-bold text-lg mb-4 text-center text-gray-800">
          🔒 تغيير كلمة المرور
        </h3>

        <div class="flex flex-col gap-3">
          <input type="password" v-model="currentPassword" placeholder="كلمة المرور الحالية" class="input-field"/>
          <input type="password" v-model="newPassword" placeholder="كلمة المرور الجديدة" class="input-field"/>
          <input type="password" v-model="confirmPassword" placeholder="تأكيد كلمة المرور" class="input-field"/>
        </div>

        <div class="flex gap-3 mt-6">
          <button @click="closePasswordModal" class="flex-1 bg-gray-100 text-gray-700 rounded-lg py-2 text-sm hover:bg-gray-200">إلغاء</button>
          <button @click="savePassword" class="flex-1 bg-primary text-white rounded-lg py-2 text-sm hover:bg-primaryDark">حفظ</button>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <div v-if="toastMessage" class="fixed top-16 left-1/2 transform -translate-x-1/2 z-50">
      <div :class="toastType === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'"
           class="px-4 py-2 rounded-lg border shadow-lg flex items-center gap-2">
        <span>{{ toastType === 'success' ? '✅' : '❌' }}</span>
        <span>{{ toastMessage }}</span>
      </div>
    </div>

  </div>

  <!-- Spacer لتعويض ارتفاع النافبار الثابت -->
  <div class="h-12"></div>
</template>

<script>
import api from "../services/api";

export default {
  name: "NavbarPage",

  data() {
    return {
      showMenu: false,
      showPasswordModal: false,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      toastMessage: "",
      toastType: "success",
      notifications: [],
      userName: "",
      userProfile: null,
    };
  },

  computed: {
    unreadCount() {
      return this.notifications.filter(n => !n.isRead).length;
    }
  },

  methods: {
    toggleMenu() {
      this.showMenu = !this.showMenu;
    },

    openPasswordModal() {
      this.showMenu = false;
      this.showPasswordModal = true;
    },

    closePasswordModal() {
      this.showPasswordModal = false;
      this.currentPassword = "";
      this.newPassword = "";
      this.confirmPassword = "";
    },

    savePassword() {
      if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
        this.showToast("الرجاء تعبئة جميع الحقول ❗", "error");
        return;
      }
      if (this.newPassword !== this.confirmPassword) {
        this.showToast("كلمتا المرور غير متطابقتين ❌", "error");
        return;
      }
      this.showToast("تم تغيير كلمة المرور بنجاح ✅", "success");
      this.closePasswordModal();
    },

    goToUpdateInfo() {
      this.showMenu = false;
      this.$router.push("/update-info");
    },

    logout() {
      this.showMenu = false;
      localStorage.clear();
      this.$router.push("/");
    },

    async loadNotifications() {
      try {
        const userId = Number(localStorage.getItem("userId"));
        const token = localStorage.getItem("token");
        if (!userId || !token) return;

        const res = await api.get("/Notifications", { headers: { Authorization: `Bearer ${token}` } });
        this.notifications = res.data.filter(n => n.userId === userId);
      } catch (err) {
        console.error(err);
      }
    },

    async loadUserProfile() {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await api.get("/Employee/my-profile", { headers: { Authorization: `Bearer ${token}` } });
        this.userName = res.data.fullName;
        this.userProfile = res.data;
      } catch (err) {
        console.error(err);
      }
    },

    showToast(message, type = "success") {
      this.toastMessage = message;
      this.toastType = type;
      setTimeout(() => { this.toastMessage = ""; }, 3000);
    },

    closeDropdownOnClickOutside(event) {
      if (this.$refs.dropdownRef && !this.$refs.dropdownRef.contains(event.target)) {
        this.showMenu = false;
      }
    }
  },

  mounted() {
    this.loadNotifications();
    this.loadUserProfile();
    setInterval(this.loadNotifications, 30000);
    document.addEventListener('click', this.closeDropdownOnClickOutside);
  },

  beforeUnmount() {
    document.removeEventListener('click', this.closeDropdownOnClickOutside);
  }
};
</script>

<style scoped>
/* input fields */
.input-field {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  outline: none;
  transition: all 0.2s;
}
.input-field:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59,130,246,0.3);
}

/* حركة السهم في زر الحساب */
.rotate-180 {
  transform: rotate(180deg);
  transition: transform 0.2s;
}

/* الظلال */
.shadow-lg { box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1),0 10px 10px -5px rgba(0,0,0,0.04); }
.shadow-sm { box-shadow: 0 2px 4px -1px rgba(0,0,0,0.06),0 4px 6px -1px rgba(0,0,0,0.1); }
</style>
