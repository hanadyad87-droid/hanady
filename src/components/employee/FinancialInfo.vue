<template>
  <div>
    <h3 class="section-title">البيانات المالية</h3>

    <div class="form-grid">
      <input
        type="number"
        placeholder="المرتب الأساسي"
        v-model="form.salary"
      />

      <select v-model="form.bankId">
        <option value="">اختر المصرف</option>
        <option value="1">مصرف الجمهورية</option>
        <option value="2">مصرف الصحاري</option>
      </select>

      <select v-model="form.bankBranchId">
        <option value="">الفرع</option>
        <option value="1">فرع طرابلس</option>
        <option value="2">فرع بنغازي</option>
      </select>
    </div>

    <button class="btn btn-primary" @click="save">
      حفظ البيانات المالية
    </button>
  </div>
</template>

<script>
export default {
  name: "FinancialInfo",
  data() {
    return {
      form: {
        salary: "",
        bankId: "",
        bankBranchId: ""
      }
    }
  },
  methods: {
    save() {
      console.log("Financial Info:", this.form)
      alert("تم حفظ البيانات المالية")
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