<template>
  <div class="relative min-h-screen flex items-center justify-center bg-background">

    <!-- الخلفية -->
    <img
      src="../assets/image.png"
      class="absolute inset-0 w-full h-full object-cover opacity-20"
    />

    <!-- Card -->
    <div class="relative z-10 w-full max-w-sm bg-white rounded-xl shadow-lg p-6">

      <h2 class="text-2xl font-bold text-center mb-2">
        تسجيل الدخول
      </h2>

      <p class="text-center text-gray-500 mb-6">
        أدخل بياناتك
      </p>

      <div class="space-y-4">
        <input
          v-model="username"
          type="text"
          placeholder="اسم المستخدم"
          class="w-full px-4 py-2 border rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-primary"
        />

        <input
          v-model="password"
          type="password"
          placeholder="كلمة المرور"
          class="w-full px-4 py-2 border rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-primary"
        />

        <button
          @click="login"
          class="w-full bg-primary text-white py-2 rounded-lg hover:bg-blue-900 transition"
        >
          دخول
        </button>
      </div>
    </div>

    <!-- Toast -->
    <Toast v-if="toastMessage" :message="toastMessage" :type="toastType" />

  </div>
</template>

<script>
import api from "../services/api";
import Toast from "../components/Toast.vue";

export default {
  name: "LoginPage",
  components: { Toast },
  data() {
    return {
      username: "",
      password: "",
      toastMessage: "",
      toastType: "success"
    };
  },
  methods: {
    async login() {
      if (!this.username || !this.password) {
        this.toastMessage = "الرجاء إدخال اسم المستخدم وكلمة المرور ❌";
        this.toastType = "error";
        setTimeout(() => (this.toastMessage = ""), 3000);
        return;
      }

      try {
        const res = await api.post("/User/login", {
          username: this.username,
          password: this.password
        });

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", res.data.role);

        this.toastMessage = "تم تسجيل الدخول بنجاح ✅";
        this.toastType = "success";

        setTimeout(() => {
          this.toastMessage = "";
          this.$router.push("/dashboard");
        }, 1500);

      } catch (err) {
        console.error(err);
        this.toastMessage = "خطأ في اسم المستخدم أو كلمة المرور ❌";
        this.toastType = "error";
        setTimeout(() => (this.toastMessage = ""), 3000);
      }
    }
  }
};
</script>
