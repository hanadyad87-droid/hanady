<template>
  <div class="basic-info" dir="rtl">
    <h3 class="title">البيانات الأساسية </h3>

    <div class="form-grid">
      <div class="form-group">
        <label>رقم الموظف</label>
        <input type="text" v-model="localEmployee.EmployeeNumber" />
      </div>

      <div class="form-group">
        <label>الاسم الكامل</label>
        <input type="text" v-model="localEmployee.FullName" />
      </div>

      <div class="form-group">
        <label>اسم الأم</label>
        <input type="text" v-model="localEmployee.MotherName" />
      </div>

      <div class="form-group">
        <label>رقم الهوية</label>
        <input type="text" v-model="localEmployee.NationalId" />
      </div>

      <div class="form-group">
        <label>تاريخ الميلاد</label>
        <input type="date" v-model="localEmployee.BirthDate" />
      </div>

      <div class="form-group">
        <label>الجنس</label>
        <select v-model="localEmployee.Gender">
          <option value="">اختر</option>
          <option value="ذكر">ذكر</option>
          <option value="أنثى">أنثى</option>
        </select>
      </div>

      <div class="form-group">
        <label>الجنسية</label>
        <input type="text" v-model="localEmployee.Nationality" />
      </div>

      <div class="form-group">
        <label>تاريخ التعيين</label>
        <input type="date" v-model="localEmployee.HireDate" />
      </div>

      <div class="form-group">
        <label>الحالة الاجتماعية</label>
        <select v-model="localEmployee.MaritalStatusId">
          <option value="">اختر</option>
          <option value="1">أعزب</option>
          <option value="2">متزوج</option>
          <option value="3">مطلق</option>
          <option value="4">أرمل</option>
        </select>
      </div>

      <div class="form-group">
        <label>المسمى الوظيفي</label>
        <select v-model="localEmployee.JobTitleId">
          <option value="">اختر</option>
          <option value="1">موظف</option>
          <option value="2">مشرف</option>
        </select>
      </div>

      <div class="form-group">
        <label>حالة التوظيف</label>
        <select v-model="localEmployee.EmploymentStatusId">
          <option value="">اختر</option>
          <option value="1">مثبت</option>
          <option value="2">متعاقد</option>
        </select>
      </div>

      <div class="form-group">
        <label>الإدارة</label>
        <select v-model="localEmployee.DepartmentId">
          <option value="">اختر</option>
          <option value="1">إدارة الموارد البشرية</option>
          <option value="2">إدارة تقنية المعلومات</option>
        </select>
      </div>

      <div class="form-group">
        <label>موقع العمل</label>
        <select v-model="localEmployee.WorkLocationId">
          <option value="">اختر</option>
          <option value="1">طرابلس</option>
          <option value="2">بنغازي</option>
        </select>
      </div>

      <div class="form-group">
        <label>الدرجة الوظيفية</label>
        <select v-model="localEmployee.JobGradeId">
          <option value="">اختر</option>
          <option value="1">الأولى</option>
          <option value="2">الثانية</option>
        </select>
      </div>
    </div>

    <button class="btn" @click="save">
      حفظ البيانات الأساسية والإدارية
    </button>
  </div>
</template>

<script>
import api from "../../services/api";

export default {
  name: "BasicInfo",
  props: {
    employee: {
      type: Object,
      required: true
    }
  },
  emits: ["update-employee"],
  data() {
    return {
      // نسخة محلية لتعديل البيانات بدون تغيير الـ prop مباشرة
      localEmployee: { ...this.employee }
    };
  },
  watch: {
    // لو تغير prop من الأب، نحدث النسخة المحلية
    employee: {
      deep: true,
      handler(newVal) {
        this.localEmployee = { ...newVal };
      }
    }
  },
  methods: {
    async save() {
      try {
        // نرسل البيانات للـ API
        const res = await api.post("/Employee/create", this.localEmployee);
        alert("تم حفظ البيانات الأساسية  ✅");
        console.log("Response:", res.data);

        // نخبر الأب بالبيانات الجديدة
        this.$emit("update-employee", { ...this.localEmployee });
      } catch (err) {
        console.error(err);
        alert("حدث خطأ أثناء الحفظ!");
      }
    }
  }
};
</script>


<style scoped>
.basic-info {
  text-align: right;
}

.title {
  font-weight: bold;
  margin-bottom: 1rem;
}

/* عمودين */
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem 1.5rem;
}


.form-group {
  display: flex;
  flex-direction: column;
}

input,
select {
  padding: 0.45rem;
  border: 1px solid #ccc;
  border-radius: 6px;
}

.btn {
    margin: 2rem auto 0;
  display: block;
  background: #1e40af;
  color: white;
  padding: 0.7rem 1.8rem;
  border-radius: 10px;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  transition: 0.3s;
}
</style>
