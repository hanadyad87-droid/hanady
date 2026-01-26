<template>
  <div class="flex justify-between items-center bg-white shadow-sm px-4 py-2 mb-4">

    <!-- العنوان -->
    <h2 class="font-bold text-primary text-base">
      {{ pageTitle }}
    </h2>

    <!-- يمين -->
    <div class="flex items-center gap-3 relative">

<router-link to="/notifications" class="relative inline-block text-lg">
  🔔
  <span
    v-if="unreadCount > 0"
    class="absolute -top-2 -right-2 bg-red-500 text-white
           rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold"
  >
    {{ unreadCount }}
  </span>
</router-link>




      <!-- الحساب -->
      <div class="relative">
        <button
          @click="toggleMenu"
          class="px-3 py-1 border rounded-lg text-sm
                 hover:bg-gray-100 transition"
        >
          الحساب
        </button>

        <!-- Dropdown -->
        <div
          v-if="showMenu"
          class="absolute left-0 mt-2 w-44
                 bg-white border rounded-lg shadow-lg z-50"
        >

          <button
  @click="goToUpdateInfo"
  class="w-full text-right px-3 py-2 text-sm hover:bg-gray-100"
>
   طلب تعديل البيانات
</button>

          <button
            @click="openPasswordModal"
            class="w-full text-right px-3 py-2 text-sm hover:bg-gray-100"
          >
            تغيير كلمة المرور
          </button>

          <button
            @click="logout"
            class="w-full text-right px-3 py-2 text-sm
                   text-red-600 hover:bg-red-50"
          >
            تسجيل خروج
          </button>
        </div>
      </div>
    </div>

    <!-- مودال تغيير كلمة المرور -->
    <div
      v-if="showPasswordModal"
      class="fixed inset-0 bg-black/40
             flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-xl p-5 w-80">
        <h3 class="font-bold mb-4 text-center">
          تغيير كلمة المرور
        </h3>

        <div class="flex flex-col gap-3">
          <input
            type="password"
            v-model="currentPassword"
            placeholder="كلمة المرور الحالية"
            class="border rounded px-3 py-2 text-sm"
          />
          <input
            type="password"
            v-model="newPassword"
            placeholder="كلمة المرور الجديدة"
            class="border rounded px-3 py-2 text-sm"
          />
          <input
            type="password"
            v-model="confirmPassword"
            placeholder="تأكيد كلمة المرور"
            class="border rounded px-3 py-2 text-sm"
          />
        </div>

        <div class="flex gap-2 mt-4">
          <button
            @click="closePasswordModal"
            class="flex-1 bg-gray-200 rounded py-2 text-sm"
          >
            إلغاء
          </button>
          <button
            @click="savePassword"
            class="flex-1 bg-primary text-white rounded py-2 text-sm"
          >
            حفظ
          </button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <Toast v-if="toastMessage" :message="toastMessage" :type="toastType" />

  </div>
</template>

<script>
import Toast from "../components/Toast.vue";
import api from "../services/api";

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
      notifications: [] // 🔔
    };
  },

  computed: {
    pageTitle() {
      const map = {
        "/dashboard": "لوحة التحكم",
        "/leaves": "الإجازات",
        "/requests": "الطلبات",
        "/employee": "إضافة موظف",
        "/notifications": "الإشعارات",
        "/complaints": "الشكاوى",
        "/tasks": "التكليفات",
        "/evaluation": "التقييم",
        "/knowledge": "مركز المعرفة"
      };
      return map[this.$route.path] || "النظام";
    },

    // ✅ عدد الإشعارات غير المقروءة
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
        this.toastMessage = "الرجاء تعبئة جميع الحقول ❗";
        this.toastType = "error";
        setTimeout(() => (this.toastMessage = ""), 3000);
        return;
      }

      if (this.newPassword !== this.confirmPassword) {
        this.toastMessage = "كلمتا المرور غير متطابقتين ❌";
        this.toastType = "error";
        setTimeout(() => (this.toastMessage = ""), 3000);
        return;
      }

      this.toastMessage = "تم تغيير كلمة المرور بنجاح ✅";
      this.toastType = "success";
      setTimeout(() => (this.toastMessage = ""), 3000);

      this.closePasswordModal();
    },

    goToUpdateInfo() {
      this.showMenu = false;
      this.$router.push("/update-info");
    },

    logout() {
      this.showMenu = false;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("userId");
      localStorage.removeItem("role");
      this.$router.push("/");
    },

async loadNotifications() {
  try {
    const userId = Number(localStorage.getItem("userId"));
    const token = localStorage.getItem("token");

    if (!userId || !token) {
      this.notifications = []; // خلي الإشعارات فاضية
      return; // ما في أي رسالة أو console
    }

    const res = await api.get("/Notifications", {
      headers: { Authorization: `Bearer ${token}` }
    });

    this.notifications = res.data.filter(n => n.userId === userId);

  } catch (err) {
    // لو في أي خطأ نعرض toast فقط بدون console
    this.notifications = [];
    this.toastMessage = "تعذر جلب الإشعارات حالياً ❌";
    this.toastType = "error";
    setTimeout(() => (this.toastMessage = ""), 3000);
  }
}



    ,
    async markAsRead(notification) {
  if (notification.isRead) return;
  await api.put(`/Notifications/${notification.id}/read`);
  notification.isRead = true; // التحديث المباشر
}

  },

 mounted() {
  const token = localStorage.getItem("token");
  if (token) {
    this.loadNotifications();
    setInterval(() => this.loadNotifications(), 30000);
  }
}

};
</script>

