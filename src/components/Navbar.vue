<template>
  <div>
    <!-- Navbar ثابت أعلى الصفحة -->
    <div 
      class="fixed top-0 right-24 md:right-64 left-0 h-12 
             bg-navbar shadow-sm border-b border-gray-200 
             flex justify-between items-center px-4 z-40"
      dir="rtl"
      ref="navbarRef"
    >
      <!-- قسم الاسم + الصورة -->
      <div class="flex items-center gap-2">
        <div
          class="w-8 h-8 rounded-full overflow-hidden 
                 border border-gray-300 bg-gray-100 flex-shrink-0"
        >
          <img
            :src="userProfile?.photoUrl || userImg"
            alt="employee"
            class="w-full h-full object-cover"
          />
        </div>

        <div class="leading-tight">
          <div class="text-sm font-semibold text-gray-800">
            {{ userName }}
          </div>
          <div v-if="userProfile?.departmentName" class="text-xs text-gray-500">
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

        <!-- Dropdown الحساب -->
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

          <div
            v-if="showMenu"
            class="absolute left-0 mt-1 w-52
                   bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden"
          >
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
    </div>

    <!-- Spacer لتعويض ارتفاع Navbar -->
    <div class="h-12"></div>

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
  <Toast v-if="toastMessage" :message="toastMessage" :type="toastType" />

  </div>
</template>

<script>
import api from "../services/api";
import userImg from "../assets/user.png";
import Toast from "../components/Toast.vue";
export default {
  name: "NavbarPage",
components: { Toast },
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
      userImg
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

 async savePassword() {
  if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
    this.showToast("الرجاء تعبئة جميع الحقول ❗", "error");
    return;
  }

  if (this.newPassword !== this.confirmPassword) {
    this.showToast("كلمتا المرور غير متطابقتين ❌", "error");
    return;
  }

  try {
    const token = localStorage.getItem("token");

    await api.post(
      "/Employee/change-password",
      {
        currentPassword: this.currentPassword,
        newPassword: this.newPassword,
        confirmPassword: this.confirmPassword
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    this.showToast("تم تغيير كلمة المرور بنجاح ✅", "success");
    this.closePasswordModal();

  } catch (error) {
    console.error(error);

    if (error.response?.data) {
      this.showToast(error.response.data, "error");
    } else {
      this.showToast("حدث خطأ أثناء تغيير كلمة المرور ❌", "error");
    }
  }
},

   logout() {
  const token = localStorage.getItem("token");

  api.post("/User/logout", {}, {
    headers: { Authorization: `Bearer ${token}` }
  }).finally(() => {
    localStorage.clear();
    this.$router.push("/");
  });
},

    async loadNotifications() {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await api.get("/Notifications", { headers: { Authorization: `Bearer ${token}` } });
        this.notifications = res.data || [];
      } catch (err) {
        console.error("خطأ في جلب الإشعارات:", err);
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
        console.error("خطأ في جلب بيانات البروفايل:", err);
        this.userName = "الموظف";
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

.rotate-180 {
  transform: rotate(180deg);
  transition: transform 0.2s;
}

.shadow-lg { box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1),0 10px 10px -5px rgba(0,0,0,0.04); }
.shadow-sm { box-shadow: 0 2px 4px -1px rgba(0,0,0,0.06),0 4px 6px -1px rgba(0,0,0,0.1); }
</style>
