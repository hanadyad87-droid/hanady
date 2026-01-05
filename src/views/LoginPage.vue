<template>
  <div class="login-container">
      <img src="../assets/image.png" class="bg-img" />
    <div class="login-box">
      <h2>تسجيل الدخول</h2>
      <p>أدخل بياناتك</p>
      <input type="text" placeholder="اسم المستخدم" v-model="username" />
      <input type="password" placeholder="كلمة المرور" v-model="password" />
      <button @click="login">دخول</button>
    </div>
  </div>
</template>

<script>
  import api from "../services/api"; 
export default {
  name: 'LoginPage',
  data() {
    return {
      username: '',
      password: ''
    }
  },
  methods: {
        async login() {
      try {
        const res = await api.post("/User/login", {
          username: this.username,
          password: this.password
        });
        // نخزن التوكن و الدور
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", res.data.role);

        alert("تم تسجيل الدخول!");
        this.$router.push("/dashboard"); // بعد تسجيل الدخول
      } catch (err) {
        alert("خطأ في اسم المستخدم أو كلمة المرور");
        console.error(err);
      }
    }
  }
  
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
}

.login-box {
  background-color: #fff4e5;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  text-align: center;
  width: 300px;
}

.login-box h2 {
  margin-bottom: 0.5rem;
}

.login-box p {
  margin-bottom: 1rem;
  color: #888;
}

.login-box input {
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border-radius: 5px;
  border: 1px solid #ccc;
}

.login-box button {
  width: 100%;
  padding: 0.5rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.login-box button:hover {
  background-color: #0056b3;
}

.bg-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover; /* أو cover */
  opacity: 0.2; /* لتخفيف وضوح الصورة */
  z-index: 0;
}

.login-box {
  position: relative;
  z-index: 1; /* فوق الصورة */
}

</style>
