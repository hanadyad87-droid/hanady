<template>
  <div class="relative min-h-screen bg-gray-100">
    <!-- Sidebar ثابتة على اليمين -->
    <Sidebar />

    <!-- المحتوى -->
    <div class="main-content">
      <!-- العنوان -->
      <div class="card welcome-card mb-6">
        <h2 class="page-title">الإجازات</h2>
        <p class="subtitle">إدارة ومتابعة طلبات الإجازة</p>
      </div>

      <!-- كارد تقديم طلب إجازة -->
      <div class="leave-card card mb-6">
        <form class="leave-form" @submit.prevent="submitLeave">
          <!-- نوع الإجازة -->
          <div class="form-group">
            <label>نوع الإجازة</label>
            <select v-model="leaveForm.type">
              <option disabled value="">اختر نوع الإجازة</option>
              <option>اجازة مرضية</option>
              <option>اجازة زواج</option>
              <option>اجازة طارئة</option>
              <option>اجازة العدة</option>
              <option>تبرير غياب</option>
              <option>اجازة امتحانات</option>
              <option>اجازة وفاة</option>
              <option>اجازة مرضية استثنائية</option>
            </select>
          </div>

          <!-- التواريخ -->
          <div class="form-row">
            <div class="form-group">
              <label>إلى تاريخ*</label>
              <input type="date" v-model="leaveForm.toDate" @change="calculateDays" />
            </div>
            <div class="form-group">
              <label>من تاريخ*</label>
              <input type="date" v-model="leaveForm.fromDate" @change="calculateDays" />
            </div>
          </div>

          <!-- عدد الأيام -->
          <div class="form-group">
            <label>عدد أيام الإجازة*</label>
            <input type="number" v-model="leaveForm.days" readonly />
          </div>

          <!-- ملاحظات -->
          <div class="form-group">
            <label>ملاحظات (اختياري)</label>
            <textarea placeholder="اكتب ملاحظاتك هنا..." v-model="leaveForm.notes"></textarea>
          </div>

          <!-- زر الإرسال -->
          <div class="submit-wrapper">
            <button type="submit" class="btn btn-primary">
              إرسال الطلب 📤
            </button>
            <div class="status-box" v-if="statusMessage">
              حالة الطلب: <span class="status pending">{{ statusMessage }}</span>
            </div>
          </div>
        </form>
      </div>

      <!-- جدول الإجازات السابقة -->
      <div class="card previous-leaves">
        <h3>الإجازات السابقة</h3>
        <table>
          <thead>
            <tr>
              <th>نوع الإجازة</th>
              <th>من تاريخ</th>
              <th>إلى تاريخ</th>
              <th>عدد الأيام</th>
              <th>الحالة</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(leave, index) in previousLeaves" :key="index">
              <td>{{ leave.type }}</td>
              <td>{{ leave.fromDate }}</td>
              <td>{{ leave.toDate }}</td>
              <td>{{ leave.days }}</td>
              <td :class="leave.status.toLowerCase()">{{ leave.status }}</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  </div>
</template>

<script>
import Sidebar from "../components/Sidebar.vue";

export default {
  name: "LeavesPage",
  components: { Sidebar },

  data() {
    return {
      leaveForm: {
        type: "",
        fromDate: "",
        toDate: "",
        days: 0,
        notes: ""
      },
      statusMessage: "",
      previousLeaves: [
        { type: "اجازة مرضية", fromDate: "2025-12-01", toDate: "2025-12-03", days: 3, status: "تمت الموافقة" },
        { type: "اجازة طارئة", fromDate: "2025-11-15", toDate: "2025-11-15", days: 1, status: "قيد المراجعة" }
      ]
    };
  },

  methods: {
    calculateDays() {
      if (this.leaveForm.fromDate && this.leaveForm.toDate) {
        const from = new Date(this.leaveForm.fromDate);
        const to = new Date(this.leaveForm.toDate);
        const diffTime = to - from;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        this.leaveForm.days = diffDays > 0 ? diffDays : 0;
      }
    },

    submitLeave() {
      if (!this.leaveForm.type || !this.leaveForm.fromDate || !this.leaveForm.toDate) {
        alert("الرجاء ملء جميع الحقول المطلوبة!");
        return;
      }

      // إضافة الطلب إلى الجدول
      this.previousLeaves.unshift({
        ...this.leaveForm,
        status: "قيد المراجعة"
      });

      this.statusMessage = "قيد المراجعة";

      // إعادة تعيين الفورم
      this.leaveForm = { type: "", fromDate: "", toDate: "", days: 0, notes: "" };
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
  box-shadow: -2px 0 5px rgba(0,0,0,0.1);
  overflow-y: auto;
  z-index: 1000;
}

/* Main content */
.main-content {
  margin-right: 7.5rem;
  padding: 1rem;
  text-align: right; /* نصوص الكارد كلها على اليمين */
}

/* العنوان */
.page-title {
  font-size: 1.4rem;
  font-weight: bold;
  text-align: right;
}

.subtitle {
  color: #666;
  margin-top: 0.3rem;
  text-align: right;
}

/* Cards */
.card {
  background-color: #fff4e5;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.06);
  margin-bottom: 1.5rem;
  text-align: right; /* كل النصوص داخل الكارد على اليمين */
}

/* Leave form */
.leave-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  text-align: right;
}

.form-group label {
  margin-bottom: 0.3rem;
  font-weight: 500;
  text-align: right;
}

input[type="number"],
select,
textarea,
input[type="date"] {
  padding: 0.5rem 0.6rem;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 0.95rem;
  text-align: right; /* نصوص الحقول على اليمين */
}

textarea {
  resize: none;
  min-height: 60px;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-row .form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* Buttons */
.btn {
  width: 100%;
  padding: 0.6rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  max-width: 200px;
  align-self: center;
  transition: 0.3s;
}

.btn-primary {
  background: #1890ff;
  color: white;
}

.btn-primary:hover {
  background: #096dd9;
}

/* Submit wrapper */
.submit-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

/* Status box */
.status-box {
  background-color: #f1f5f9;
  padding: 0.6rem;
  border-radius: 6px;
  font-weight: bold;
  text-align: center;
}

.status {
  font-weight: bold;
}

.status.pending {
  color: #d97706;
}

.status.تمت الموافقة {
  color: #16a34a;
}

/* جدول الإجازات السابقة */
.previous-leaves table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.previous-leaves th,
.previous-leaves td {
  border: 1px solid #ddd;
  padding: 0.6rem;
  text-align: center;
  font-size: 0.9rem;
}

.previous-leaves th {
  background-color: #f3f4f6;
}

/* Responsive */
@media (max-width: 768px) {
  .main-content {
    margin-right: 7.5rem; /* نترك السايد بار ظاهر */
    padding: 1rem;
  }

  .form-row {
    flex-direction: column;
    gap: 0.75rem;
  }

  .btn {
    max-width: 100%;
  }
}
</style>
