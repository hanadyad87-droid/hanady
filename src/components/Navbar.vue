<template>
  <div>
    <header
      class="fixed top-0 right-0 z-[40] flex h-14 items-center border-b border-slate-200/80 bg-navbar shadow-sm backdrop-blur-sm transition-[left,right] duration-200 left-0 lg:right-60"
      dir="rtl"
      ref="navbarRef"
    >
      <div class="flex w-full items-center justify-between gap-2 px-3 sm:px-4">
        <div class="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <button
            type="button"
            class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 lg:hidden"
            aria-label="فتح القائمة"
            @click="toggleSidebar"
          >
            <Bars3Icon class="h-6 w-6" />
          </button>

          <div class="flex min-w-0 items-center gap-2">
            <div
              class="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100 sm:h-10 sm:w-10"
            >
              <img
                :src="userProfile?.photoUrl || userImg"
                alt=""
                class="h-full w-full object-cover"
              />
            </div>
            <div class="min-w-0 leading-tight">
              <div class="truncate text-sm font-semibold text-slate-800">{{ userName }}</div>
              <div v-if="userProfile?.departmentName" class="truncate text-xs text-slate-500">
                {{ userProfile.departmentName }}
              </div>
            </div>
          </div>
        </div>

        <div class="flex shrink-0 items-center gap-1 sm:gap-2">
          <router-link
            to="/notifications"
            class="relative inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition hover:bg-white/80 hover:text-primary"
            title="الإشعارات"
          >
            <BellAlertIcon class="h-6 w-6" />
            <span
              v-if="unreadCount > 0"
              class="absolute -top-0.5 -right-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white"
            >
              {{ unreadCount > 99 ? "99+" : unreadCount }}
            </span>
          </router-link>

          <div class="relative" ref="dropdownRef">
            <button
              type="button"
              @click.stop="toggleMenu"
              class="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 sm:px-3 sm:text-sm"
            >
              <UserCircleIcon class="hidden h-5 w-5 sm:inline" />
              <span>الحساب</span>
              <ChevronDownIcon
                class="h-4 w-4 text-slate-500 transition-transform"
                :class="{ 'rotate-180': showMenu }"
              />
            </button>

            <div
              v-if="showMenu"
              class="absolute left-0 z-50 mt-1 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
            >
              <button
                type="button"
                class="flex w-full items-center justify-between border-b border-slate-100 px-3 py-2.5 text-right text-sm hover:bg-slate-50"
                @click="openPasswordModal"
              >
                <span>تغيير كلمة المرور</span>
                <KeyIcon class="h-4 w-4 text-slate-400" />
              </button>
              <button
                type="button"
                class="flex w-full items-center justify-between px-3 py-2.5 text-right text-sm text-red-600 hover:bg-red-50"
                @click="logout"
              >
                <span>تسجيل خروج</span>
                <ArrowRightOnRectangleIcon class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <div class="h-14 shrink-0" aria-hidden="true" />

    <div
      v-if="showPasswordModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      @click.self="closePasswordModal"
    >
      <div class="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h3 class="mb-4 flex items-center justify-center gap-2 text-center text-lg font-bold text-slate-800">
          <LockClosedIcon class="h-5 w-5 text-primary" />
          تغيير كلمة المرور
        </h3>

        <div class="flex flex-col gap-3">
          <input v-model="currentPassword" type="password" placeholder="كلمة المرور الحالية" class="input-field" />
          <input v-model="newPassword" type="password" placeholder="كلمة المرور الجديدة" class="input-field" />
          <input v-model="confirmPassword" type="password" placeholder="تأكيد كلمة المرور" class="input-field" />
        </div>

        <div class="mt-6 flex gap-3">
          <button type="button" class="input-btn-secondary flex-1" @click="closePasswordModal">إلغاء</button>
          <button type="button" class="input-btn-primary flex-1" @click="savePassword">حفظ</button>
        </div>
      </div>
    </div>

    <Toast v-if="toastMessage" :message="toastMessage" :type="toastType" />
  </div>
</template>

<script>
import {
  Bars3Icon,
  BellAlertIcon,
  ChevronDownIcon,
  UserCircleIcon,
  KeyIcon,
  ArrowRightOnRectangleIcon,
  LockClosedIcon,
} from "@heroicons/vue/24/outline";
import api from "../services/api";
import userImg from "../assets/user.png";
import Toast from "../components/Toast.vue";
import { notificationStore } from "../stores/notificationStore";
import { ensureNotificationHubConnected, stopNotificationHub } from "../services/notificationHub";

let cachedProfile = null;
let notificationsBootstrapped = false;
let cachedToken = null;

export default {
  name: "NavbarPage",
  components: {
    Toast,
    Bars3Icon,
    BellAlertIcon,
    ChevronDownIcon,
    UserCircleIcon,
    KeyIcon,
    ArrowRightOnRectangleIcon,
    LockClosedIcon,
  },

  data() {
    return {
      showMenu: false,
      showPasswordModal: false,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      toastMessage: "",
      toastType: "success",
      userName: "",
      userProfile: null,
      userImg,
      pollTimerId: null,
    };
  },

  computed: {
    unreadCount() {
      return notificationStore.items.filter((n) => !n.isRead).length;
    },
  },

  methods: {
    toggleSidebar() {
      window.dispatchEvent(new CustomEvent("hrms:toggle-sidebar"));
    },

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
        this.showToast("الرجاء تعبئة جميع الحقول", "error");
        return;
      }

      if (this.newPassword !== this.confirmPassword) {
        this.showToast("كلمتا المرور غير متطابقتين", "error");
        return;
      }

      try {
        await api.post("/Employee/change-password", {
          currentPassword: this.currentPassword,
          newPassword: this.newPassword,
          confirmPassword: this.confirmPassword,
        });

        this.showToast("تم تغيير كلمة المرور بنجاح", "success");
        this.closePasswordModal();
      } catch (error) {
        const msg = error.response?.data;
        this.showToast(typeof msg === "string" ? msg : "حدث خطأ أثناء تغيير كلمة المرور", "error");
      }
    },

    logout() {
      api
        .post("/User/logout", {})
        .finally(async () => {
          await stopNotificationHub();
          cachedProfile = null;
          notificationsBootstrapped = false;
          cachedToken = null;
          notificationStore.setFromApi([]);
          localStorage.clear();
          this.$router.push("/");
        });
    },

    async loadNotifications() {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        if (cachedToken && cachedToken !== token) {
          notificationStore.setFromApi([]);
          notificationsBootstrapped = false;
        }

        const res = await api.get("/Notifications");
        notificationStore.setFromApi(res.data || []);
        notificationsBootstrapped = true;
        cachedToken = token;
      } catch (err) {
        console.error("خطأ في جلب الإشعارات:", err);
      }
    },

    async loadUserProfile() {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        if (cachedProfile && cachedToken === token) {
          this.userName = cachedProfile.fullName || "الموظف";
          this.userProfile = cachedProfile;
          return;
        }

        const res = await api.get("/Employee/my-profile");
        this.userName = res.data.fullName;
        this.userProfile = res.data;
        cachedProfile = res.data;
        cachedToken = token;
      } catch (err) {
        console.error("خطأ في جلب بيانات البروفايل:", err);
        this.userName = "الموظف";
      }
    },

    showToast(message, type = "success") {
      this.toastMessage = message;
      this.toastType = type;
      setTimeout(() => {
        this.toastMessage = "";
      }, 3000);
    },

    closeDropdownOnClickOutside(event) {
      if (this.$refs.dropdownRef && !this.$refs.dropdownRef.contains(event.target)) {
        this.showMenu = false;
      }
    },
  },

  async mounted() {
    const token = localStorage.getItem("token");
    if (cachedToken && token && cachedToken !== token) {
      cachedProfile = null;
      notificationsBootstrapped = false;
      notificationStore.setFromApi([]);
    }

    await this.loadUserProfile();
    if (!notificationsBootstrapped) {
      await this.loadNotifications();
    }
    await ensureNotificationHubConnected();
    document.addEventListener("click", this.closeDropdownOnClickOutside);
  },

  beforeUnmount() {
    if (this.pollTimerId) clearInterval(this.pollTimerId);
    document.removeEventListener("click", this.closeDropdownOnClickOutside);
  },
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
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
}

.input-btn-primary {
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  background: #1d4736;
  color: white;
}
.input-btn-primary:hover {
  filter: brightness(1.05);
}

.input-btn-secondary {
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  background: #f3f4f6;
  color: #374151;
}
.input-btn-secondary:hover {
  background: #e5e7eb;
}

.rotate-180 {
  transform: rotate(180deg);
}
</style>
