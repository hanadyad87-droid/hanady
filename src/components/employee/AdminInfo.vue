<template>
  <div>
    <h3 class="section-title">البيانات الإدارية</h3>

    <div class="form-grid">
      <input placeholder="رقم الموظف" v-model="form.EmployeeNumber" />

      <select v-model="form.DepartmentId">
        <option :value="null">اختر الإدارة</option>
        <option :value="1">إدارة الموارد البشرية</option>
        <option :value="2">إدارة تقنية المعلومات</option>
      </select>

      <select v-model="form.JobTitleId">
        <option :value="null">المسمى الوظيفي</option>
        <option :value="1">موظف</option>
        <option :value="2">مشرف</option>
      </select>

      <select v-model="form.JobGradeId">
        <option :value="null">الدرجة الوظيفية</option>
        <option :value="1">الأولى</option>
        <option :value="2">الثانية</option>
      </select>

      <select v-model="form.EmploymentStatusId">
        <option :value="null">حالة التوظيف</option>
        <option :value="1">مثبت</option>
        <option :value="2">متعاقد</option>
      </select>

      <input type="date" v-model="form.HireDate" />
    </div>

    <button class="btn btn-primary" @click="save">
      حفظ البيانات الإدارية
    </button>
  </div>
</template>

<script>
export default {
  name: "AdminInfo",
  props: {
    employee: Object // نستخدم بيانات parent إذا حبيت
  },
  data() {
    return {
      form: {
        EmployeeNumber: "",
        DepartmentId: null,
        JobTitleId: null,
        JobGradeId: null,
        EmploymentStatusId: null,
        HireDate: ""
      }
    }
  },
  methods: {
    save() {
      // نرسل البيانات للـ parent
      this.$emit("update-employee", { ...this.form });
      alert("تم حفظ البيانات الإدارية");
    }
  }
}
</script>
<style>
.section-title {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

input, select {
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid #ccc;
}
.btn {
  margin: 2rem auto 0;
  display: block;
  padding: 0.7rem 1.8rem;
  border-radius: 10px;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  transition: 0.3s;
}

</style>