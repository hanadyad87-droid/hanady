<template>
  <div class="relative min-h-screen bg-gray-100">
    <!-- Sidebar ثابت على اليمين -->
    <Sidebar />

    <!-- المحتوى الرئيسي -->
    <div class="main-content">

      <div class="top-bar mb-6">
  <div class="notification">
    🔔
    <span class="notification-badge">3</span>
  </div>
  <input type="text" placeholder="بحث..." class="search-input" />
</div>

      

      <!-- بطاقة الترحيب -->
      <div class="card welcome-card mb-6">
        <p class="welcome-text">مرحباً hanady</p>
        <p class="last-login">آخر دخول: اليوم</p>
      </div>

      <!-- شبكة البطاقات -->
      <div class="grid-cards">
        <div class="card attendance-card">
          <h3>الحضور</h3>
          <p class="attendance-percent">90%</p>
        </div>
        <div class="card requests-card">
          <h3>الطلبات</h3>
          <p>المفتوحة: 3</p>
          <p>المعلقة: 2</p>
          <p>المرفوضة: 1</p>
        </div>
        <div class="card employee-card">
          <img :src="userImg" class="employee-img" />
          <h3>موظف برمجة</h3>
          <p class="role-text">موظف</p>
          <button class="btn btn-primary" @click="$router.push('/leaves')">
            تقديم طلب إجازة ➕
          </button>
          <button class="btn btn-secondary">تقديم طلب استئذان ⏱️</button>
          <button class="btn btn-danger" @click="showModal = true">
            تغيير كلمة المرور 🔒
          </button>
        </div>
      </div>

      <!-- المودال -->
      <div v-if="showModal" class="modal-overlay">
        <div class="modal">
          <h3>تغيير كلمة المرور</h3>
          <div class="form-group">
            <label>الرمز الحالي</label>
            <input type="password" v-model="currentPassword" />
          </div>
          <div class="form-group">
            <label>الرمز الجديد</label>
            <input type="password" v-model="newPassword" />
          </div>
          <div class="form-group">
            <label>تأكيد الرمز الجديد</label>
            <input type="password" v-model="confirmPassword" />
          </div>
          <div class="modal-buttons">
            <button class="btn btn-secondary" @click="closeModal">إغلاق</button>
            <button class="btn btn-primary" @click="savePassword">حفظ</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from "../components/Sidebar.vue";
import userImage from '../assets/user.png';

export default {
  name: "DashboardPage",
  components: { Sidebar },
  data() {
    return {
      userImg: userImage,
      showModal: false,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  },
  methods: {
    closeModal() {
      this.showModal = false;
      this.currentPassword = '';
      this.newPassword = '';
      this.confirmPassword = '';
    },
    savePassword() {
      if (this.newPassword !== this.confirmPassword) {
        alert('كلمة المرور الجديدة وتأكيدها غير متطابقة!');
        return;
      }
      alert('تم تغيير كلمة المرور بنجاح!');
      this.closeModal();
    }
  }
};
</script>

<style scoped>
/* Sidebar */
.sidebar {
  position: fixed;
  top: 0;
  right: 0;
  width: 6.5rem;
  height: 100vh;
  background-color: #1e40af;
  color: white;
  padding: 1rem;
}

/* =====================
   Layout
===================== */
.main-content {
  margin-right: 7.5rem;
  padding: 2rem;
  background-color: #f5f7fb;
  min-height: 100vh;
}

/* =====================
   Top Bar
===================== */
.top-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.search-input {
  width: 45%;
  padding: 0.6rem 0.8rem;
  border-radius: 10px;
  border: 1px solid #d9d9d9;
  font-size: 0.9rem;
}

.notification {
  position: relative;
  font-size: 1.5rem;
  cursor: pointer;
}

.notification-badge {
  position: absolute;
  top: -6px;
  right: -10px;
  background: #ff4d4f;
  color: white;
  border-radius: 50%;
  padding: 0 6px;
  font-size: 0.7rem;
}

/* =====================
   Cards (عام)
===================== */
.card {
  background: #f7f5e6;
  padding: 1.6rem;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.06);
  text-align: center;
}

/* =====================
   Welcome Card
===================== */
.welcome-card {
  text-align: right;
}

.welcome-text {
  font-size: 1.2rem;
  font-weight: bold;
  color: #1e40af;
}

.last-login {
  font-size: 0.85rem;
  color: #6b7280;
}

/* =====================
   Cards Grid
===================== */
.grid-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
}



/* =====================
   Attendance
===================== */
.attendance-percent {
  font-size: 2rem;
  font-weight: bold;
  color: #22c55e;
}

/* =====================
   Employee Card
===================== */
.employee-card {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.employee-img {
  width: 95px;
  height: 95px;
  border-radius: 50%;
  border: 3px solid #93c5fd;
  margin-bottom: 0.8rem;
}

.role-text {
  font-size: 0.85rem;
  color: #64748b;
  margin-bottom: 1rem;
}

/* =====================
   Buttons
===================== */
.btn {
  width: 100%;
  padding: 0.55rem;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  transition: 0.3s;
}

.btn-primary {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
}

.btn-secondary {
  background: #e0f2fe;
  color: #0369a1;
}

.btn-danger {
  background: #fee2e2;
  color: #991b1b;
}

/* =====================
   Modal
===================== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.modal {
  background: white;
  padding: 1.8rem;
  border-radius: 16px;
  width: 360px;
}

.form-group {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
}

input[type="password"] {
  padding: 0.6rem;
  border-radius: 8px;
  border: 1px solid #d1d5db;
}

.modal-buttons {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
}



</style>
