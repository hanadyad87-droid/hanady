<template>
  <div class="basic-info p-4" dir="rtl">

    <h3 class="text-xl font-bold mb-4 text-right text-blue-800">
      البيانات الأساسية
    </h3>

    <div class="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4">


      <!-- رقم الموظف -->
      <div class="flex flex-col">
        <label class="text-sm text-gray-600 mb-1">رقم الموظف</label>
        <input v-model="localEmployee.EmployeeNumber" class="input" />
      </div>

      <!-- الاسم الكامل -->
      <div class="flex flex-col">
        <label class="text-sm text-gray-600 mb-1">الاسم الكامل</label>
        <input v-model="localEmployee.FullName" class="input" />
      </div>

      <!-- اسم الأم -->
      <div class="flex flex-col">
        <label class="text-sm text-gray-600 mb-1">اسم الأم</label>
        <input v-model="localEmployee.MotherName" class="input" />
      </div>

       <div class="flex flex-col">
        <label class="text-sm text-gray-600 mb-1"> الرقم الوطني</label>
        <input v-model="localEmployee.NationalId" class="input" />
      </div>

<!-- الهاتف الأول -->
<div class="flex flex-col">
  <label class="text-sm text-gray-600 mb-1">رقم الهاتف 1</label>
  <input
    v-model="localEmployee.phone1"
    class="input"
    placeholder="091xxxxxxx"
  />
</div>
   
<!-- الهاتف الثاني -->
<div class="flex flex-col">
  <label class="text-sm text-gray-600 mb-1">رقم الهاتف 2</label>
  <input
    v-model="localEmployee.phone2"
    class="input"
    placeholder="092xxxxxxx"
  />
</div>

    
      <!-- تاريخ الميلاد -->
      <div class="flex flex-col">
        <label class="text-sm text-gray-600 mb-1">تاريخ الميلاد</label>
        <input type="date" v-model="localEmployee.BirthDate" class="input" />
      </div>

      <!-- الجنس -->
 <div class="flex flex-col">
  <label class="text-sm text-gray-600 mb-1">الجنس</label>
 <div class="flex flex-col sm:flex-row gap-2 sm:gap-4">

    <label>
      <input type="radio" value="ذكر" v-model="localEmployee.Gender" /> ذكر
    </label>
    <label>
      <input type="radio" value="أنثى" v-model="localEmployee.Gender" /> أنثى
    </label>
  </div>
</div>


  

      <!-- تاريخ التعيين -->
      <div class="flex flex-col">
        <label class="text-sm text-gray-600 mb-1">تاريخ التعيين</label>
        <input type="date" v-model="localEmployee.HireDate" class="input" />
      </div>

      <!-- الجنسية -->
      <div class="flex flex-col">
        <label class="text-sm text-gray-600 mb-1">الجنسية</label>
        <input v-model="localEmployee.Nationality" class="input" />
      </div>
      <!-- الحالة الاجتماعية -->
      <div class="flex flex-col">
        <label class="text-sm text-gray-600 mb-1">الحالة الاجتماعية</label>
        <select v-model="localEmployee.MaritalStatusId" class="input text-right pr-2">
         
          <option :value="1">أعزب</option>
          <option :value="2">متزوج</option>
          <option :value="3">مطلق</option>
          <option :value="4">أرمل</option>
        </select>
      </div>

      <!-- المسمى الوظيفي -->
      <div class="flex flex-col">
        <label class="text-sm text-gray-600 mb-1">الصفة</label>
        <select v-model="localEmployee.JobTitleId" class="input">
         
       <option :value="1">موظف</option>
<option :value="2">فني</option>
<option :value="3">مأمور ضبط</option>
<option :value="4">مأمور ضبط قضائي</option>
<option :value="5">عضو</option>
<option :value="6">عضو تحقيق</option>
        </select>
      </div>

      <!-- حالة التوظيف -->
      <div class="flex flex-col">
        <label class="text-sm text-gray-600 mb-1">الوضع الوظيفي</label>
        <select v-model="localEmployee.EmploymentStatusId" class="input text-right pr-2">
          
          <option :value="1">نشط</option>
          <option :value="2">إجازة مؤقتة</option>
          <option :value="3">متقاعد</option>
        </select>
      </div>

      <!-- الإدارة -->
      <div class="flex flex-col">
        <label class="text-sm text-gray-600 mb-1">الإدارة</label>
        <select v-model="localEmployee.DepartmentId" class="input text-right pr-2">
         
          <option :value="1">الإدارة العامة</option>
          <option :value="2">الإدارة المالية</option>
          <option :value="3">إدارة الموارد البشرية</option>
        </select>
      </div>

      <!-- موقع العمل -->
      <div class="flex flex-col">
        <label class="text-sm text-gray-600 mb-1">موقع العمل</label>
        <select v-model="localEmployee.WorkLocationId" class="input text-right pr-2">
         
          <option :value="1">طرابلس</option>
          <option :value="2">بنغازي</option>
          <option :value="3">مصراتة</option>
          <option :value="4">الزاوية</option>
          <option :value="5">سبها</option>
          <option :value="6">الجبل الغربي</option>
          <option :value="7">الجفرة</option>
        </select>
      </div>

      <!-- الدرجة الوظيفية -->
      <div class="flex flex-col">
        <label class="text-sm text-gray-600 mb-1">الدرجة الوظيفية</label>
        <select v-model="localEmployee.JobGradeId" class="input text-right pr-2">
          
          <option :value="7">الدرجة الأولى</option>
          <option :value="8">الدرجة الثانية</option>
          <option :value="9">الدرجة الثالثة</option>
        </select>
      </div>

        <!-- رصيد الإجازات السنوية -->
      <div class="flex flex-col">
        <label class="text-sm text-gray-600 mb-1">رصيد الإجازات السنوية</label>
        <input type="number" v-model.number="localEmployee.AnnualLeaveBalance" class="input" min="0" />
      </div>

      <!-- اختيار المدير -->
      <div class="flex flex-col">
        <label class="text-sm text-gray-600 mb-1">المدير</label>
        <select v-model="localEmployee.ManagerId" class="input text-right pr-2">
        
          <option v-for="mgr in managers" :key="mgr.id" :value="mgr.id">
            {{ mgr.fullName }}
          </option>
        </select>
      </div>

     <!-- بيانات حساب المستخدم (SuperAdmin فقط) -->
<div
  v-if="currentUserRole === 'SuperAdmin'"
  class="col-span-1 md:col-span-2 border p-4 rounded-lg"
>

  <h4 class="font-bold text-blue-700 mb-3">بيانات حساب المستخدم</h4>

<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">

    <div>
      <label class="text-sm">اسم المستخدم</label>
      <input v-model="localEmployee.username" class="input" />
    </div>

    <div>
      <label class="text-sm">كلمة المرور</label>
      <input type="password" v-model="localEmployee.password" class="input" />
    </div>

    <div>
      <label class="text-sm">الصلاحية</label>
 
  
<select v-model.number="localEmployee.roleId" class="input">
  <option :value="1">SuperAdmin</option>
  <option :value="2">مدير إدارة</option>
  <option :value="3">مدير إدارة فرعية</option>
  <option :value="4">مدير قسم</option>
  <option :value="5">موظف</option>
</select>



    </div>
  </div>
</div>


     

    </div>

    <div class="flex justify-center mt-8">
      <button
        @click="save"
        class="bg-primary hover:bg-primaryDark text-white py-2 px-6 rounded-lg transition w-full max-w-xs"
      >
        حفظ البيانات الأساسية
      </button>
    </div>

    <Toast v-if="toastMessage" :message="toastMessage" :type="toastType" />

  </div>
</template>

<script>
import api from "../../services/api";
import Toast from "../Toast.vue";

export default {
  name: "BasicInfo",
  props: { employee: { type: Object, required: true } },
  components: { Toast },
  data() {
  return {
    localEmployee: {
      ...this.employee,
     username: "",
password: "",
roleId: null,
 phone1: "",
      phone2: "",
      AnnualLeaveBalance: 20,
      ManagerId: null
    },
    managers: [],
    toastMessage: "",
    toastType: "success",
    currentUserRole: "SuperAdmin"
  };
},

  watch: {
    employee: {
      deep: true,
      handler(val) {
        this.localEmployee = { ...val, ManagerId: val.ManagerId || null };
      }
    }
  },
  mounted() {
    this.fetchManagers();
  
  },
  methods: {
async fetchManagers() {
  try {
    const { data } = await api.get("/Employee/managers");

   
    this.managers = data;

    console.log("المدراء:", this.managers);
  } catch (err) {
    console.error("خطأ في جلب المدراء:", err);
  }
}

,

  
 async save() {
  try {
    if (!this.localEmployee.EmployeeNumber || !this.localEmployee.FullName) {
      throw "رقم الموظف والاسم الكامل إجباري";
    }

    if (
      this.currentUserRole === "SuperAdmin" &&
      (!this.localEmployee.username ||
        !this.localEmployee.password ||
       !this.localEmployee.roleId
)
    ) {
      throw "بيانات حساب المستخدم ناقصة";
    }

  const payload = {
  username: this.localEmployee.username,
  password: this.localEmployee.password,
  roleId: Number(this.localEmployee.roleId),

  employeeNumber: this.localEmployee.EmployeeNumber,
  fullName: this.localEmployee.FullName,

  phone1: this.localEmployee.phone1,
  phone2: this.localEmployee.phone2,

  motherName: this.localEmployee.MotherName,
  nationalId: this.localEmployee.NationalId,

  birthDate: this.localEmployee.BirthDate
    ? this.localEmployee.BirthDate + "T00:00:00"
    : null,

  gender: this.localEmployee.Gender,
  nationality: this.localEmployee.Nationality,

  hireDate: this.localEmployee.HireDate
    ? this.localEmployee.HireDate + "T00:00:00"
    : null,

  maritalStatusId: Number(this.localEmployee.MaritalStatusId),
  jobTitleId: Number(this.localEmployee.JobTitleId),
  employmentStatusId: Number(this.localEmployee.EmploymentStatusId),
  departmentId: Number(this.localEmployee.DepartmentId),
  workLocationId: Number(this.localEmployee.WorkLocationId),
  jobGradeId: Number(this.localEmployee.JobGradeId),

  managerId: this.localEmployee.ManagerId
    ? Number(this.localEmployee.ManagerId)
    : null,

  annualLeaveBalance: Number(this.localEmployee.AnnualLeaveBalance || 20)
};


    console.log("SEND TO BACKEND:", payload);

    await api.post("/Employee/create-account", payload);

    this.toastMessage = "تم الحفظ بنجاح ✅";
    this.toastType = "success";
  } catch (err) {
    // التأكد أن toastMessage دائما String
    this.toastMessage =
      err.response?.data?.message || err.message || "خطأ في الحفظ ❌";
    this.toastType = "error";
  }
}



  }
};
</script>

<style scoped>
.input { @apply p-2 border rounded-lg text-right; }
</style>
