<template>
  <div>
    <h3 class="section-title">البيانات المالية</h3>

    <div class="form-grid">
      <input
        type="number"
        placeholder="المرتب الأساسي"
        v-model.number="form.Salary"
      />

      <select v-model.number="form.BankId">
        <option :value="null">اختر المصرف</option>
        <option :value="1">مصرف الجمهورية</option>
        <option :value="2">مصرف الصحاري</option>
      </select>

      <select v-model.number="form.BankBranchId">
        <option :value="null">اختر الفرع</option>
        <option :value="1">فرع طرابلس</option>
        <option :value="2">فرع بنغازي</option>
      </select>
    </div>

    <button class="btn btn-primary" @click="save">
      حفظ البيانات المالية
    </button>
  </div>
</template>

<script>
import api from "../../services/api";

export default {
  name: "FinancialInfo",

  props: {
    employeeId: {
      type: Number,
      required: true
    }
  },

  data() {
    return {
      form: {
        EmployeeId: this.employeeId,
        Salary: null,
        BankId: null,
        BankBranchId: null
      }
    };
  },

  methods: {
    async save() {
      try {
        const res = await api.post(
          "/EmployeeFinancialDatas/create",
          this.form
        );

        alert("تم حفظ البيانات المالية ✅");
        console.log("Saved:", res.data);
      } catch (err) {
        console.error(err);
        alert("حدث خطأ أثناء حفظ البيانات المالية ❌");
      }
    }
  }
};
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