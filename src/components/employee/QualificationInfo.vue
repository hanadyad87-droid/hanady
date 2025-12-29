<template>
  <div>
    <h3 class="section-title">المؤهل العلمي</h3>

    <div class="form-grid">
      <input placeholder="المؤهل العلمي" v-model="form.degree" />
      <input placeholder="التخصص" v-model="form.specialization" />
      <input placeholder="الجامعة / المعهد" v-model="form.institution" />
      <input type="date" v-model="form.graduationDate" />
    </div>

    <button class="btn btn-primary" @click="save">
      حفظ المؤهل العلمي
    </button>
  </div>
</template>

<script>
export default {
  name: "QualificationInfo",
  data() {
    return {
      form: {
        degree: "",
        specialization: "",
        institution: "",
        graduationDate: ""
      }
    }
  },
  methods: {
    save() {
      console.log("Qualification Info:", this.form)
      alert("تم حفظ المؤهل العلمي")
    }
  }
}
</script>
<style>
.card {
  background: #ffffff;
  padding: 1.5rem;
  border-radius: 14px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
  max-width: 900px;
  margin: 1.5rem auto;
}

.section-title {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 1.2rem;
  color: #1e3a8a;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 0.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

input {
  padding: 0.65rem 0.75rem;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  font-size: 0.95rem;
  transition: 0.3s;
}

input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
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

.btn-primary {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(37, 99, 235, 0.4);
}


</style>