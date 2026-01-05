<template>
  <div class="request-page" dir="rtl">
    <!-- Sidebar ثابت -->
    <Sidebar />

    <div class="main-content">
      <!-- العنوان + الحالة -->
      <div class="header">
        <h1>طلب تعديل بيانات</h1>
        <span class="status pending">قيد المراجعة</span>
      </div>

      <!-- الكارد -->
      <div class="card">
        <!-- البيانات الحالية -->
        <h3 class="section-title">البيانات الحالية</h3>
        <div class="form-grid">
          <div class="form-group">
            <label>رقم الموظف</label>
            <input disabled :value="employee.EmployeeNumber" />
          </div>
          <div class="form-group">
            <label>الاسم الكامل</label>
            <input disabled :value="employee.FullName" />
          </div>
          <div class="form-group">
            <label>اسم الأم</label>
            <input disabled :value="employee.MotherName" />
          </div>
          <div class="form-group">
            <label>رقم الهوية</label>
            <input disabled :value="employee.NationalId" />
          </div>
          <div class="form-group">
            <label>تاريخ الميلاد</label>
            <input disabled type="date" :value="employee.BirthDate" />
          </div>
          <div class="form-group">
            <label>الجنس</label>
            <input disabled :value="employee.Gender" />
          </div>
        </div>

        <!-- البيانات الجديدة -->
        <h3 class="section-title">البيانات الجديدة</h3>
        <div class="form-grid">
          <div class="form-group">
            <label>الاسم الكامل الجديد</label>
            <input v-model="request.NewFullName" />
          </div>
          <div class="form-group">
            <label>الحالة الاجتماعية</label>
            <select v-model="request.MaritalStatusId">
              <option value="">اختر</option>
              <option value="1">أعزب</option>
              <option value="2">متزوج</option>
              <option value="3">مطلق</option>
              <option value="4">أرمل</option>
            </select>
          </div>
          <div class="form-group">
            <label>المسمى الوظيفي الجديد</label>
            <select v-model="request.JobTitleId">
              <option value="1">موظف</option>
              <option value="2">مشرف</option>
            </select>
          </div>
          <div class="form-group">
            <label>الدرجة الوظيفية</label>
            <select v-model="request.JobGradeId">
              <option value="1">الأولى</option>
              <option value="2">الثانية</option>
            </select>
          </div>
          <div class="form-group">
            <label>الإدارة الجديدة</label>
            <select v-model="request.DepartmentId">
              <option value="1">إدارة الموارد البشرية</option>
              <option value="2">إدارة تقنية المعلومات</option>
            </select>
          </div>
          <div class="form-group">
            <label>موقع العمل</label>
            <select v-model="request.WorkLocationId">
              <option value="1">طرابلس</option>
              <option value="2">بنغازي</option>
            </select>
          </div>
        </div>

        <!-- سبب التعديل + مرفق -->
        <div class="form-group full">
          <label>سبب التعديل</label>
          <textarea v-model="request.Reason"></textarea>
        </div>
        <div class="form-group full">
          <label>مرفق (وثيقة رسمية)</label>
          <input type="file" />
        </div>

        <!-- زر الإرسال -->
        <div class="submit-wrapper">
          <button class="btn btn-primary" @click="submitRequest">
            إرسال الطلب
          </button>
        </div>
      </div>

      <!-- سجل الإجراءات -->
      <div class="timeline">
        <h3>سجل الإجراءات</h3>
        <p>🟡 تم تقديم الطلب – 10:30</p>
        <p class="muted">بانتظار المراجعة</p>
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from "@/components/Sidebar.vue";

export default {
  name: "UpdateInfoRequest",
  components: { Sidebar },
  data() {
    return {
      employee: {
        EmployeeNumber: "EMP001",
        FullName: "محمد أحمد",
        MotherName: "فاطمة علي",
        NationalId: "123456789",
        BirthDate: "1990-05-15",
        Gender: "ذكر",
      },
      request: {
        NewFullName: "",
        MaritalStatusId: "",
        JobTitleId: "",
        JobGradeId: "",
        DepartmentId: "",
        WorkLocationId: "",
        Reason: "",
      },
    };
  },
  methods: {
    submitRequest() {
      alert("تم إرسال الطلب بنجاح!");
    },
  },
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
}
.request-page {
  margin-right: 7.5rem; /* يترك مساحة للـ Sidebar */
  padding: 1.5rem;
  direction: rtl; /* كل المحتوى من اليمين لليسار */
  text-align: right;
}
/* محتوى الصفحة */
.main-content {
  flex: 1;            /* ياخذ باقي المساحة بجانب السايدبار */
  padding: 1.5rem;
  direction: rtl;
  text-align: right;
  overflow-y: auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  background: #fef3c7;
  color: #92400e;
}

.card {
  background: #fff4e5;
  padding: 1.5rem;
  border-radius: 10px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr; /* افتراضي: عمودين */
  gap: 1rem;
}

/* Responsive للشاشات الصغيرة */
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr; /* يصير عمود واحد */
  }

  .form-group.full {
    grid-column: span 1; /* كامل يأخذ عرض العمود الواحد */
  }
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full {
  grid-column: span 2;
}

input, select, textarea {
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  font-size: 0.85rem;
  width: 100%; /* دائمًا ياخذ عرض الحاوية */
}

textarea {
  min-height: 60px;
  resize: vertical; /* يسمح للمستخدم بتغيير الطول عموديًا */
}

.btn {
  width: 100%;
  padding: 0.6rem;
  border-radius: 5px;
  border: none;
  cursor: pointer;
  max-width: 200px;
  align-self: center;
}

.btn-primary {
  background-color: #1890ff;
  color: white;
}

.btn-primary:hover {
  background-color: #096dd9;
}

.submit-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.timeline {
  margin-top: 2rem;
  font-size: 0.85rem;
}

.muted {
  color: #6b7280;
}

</style>
