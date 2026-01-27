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
        <input
          v-model="localEmployee.FullName"
          @input="validateArabic('FullName')"
          @keypress="allowArabic($event)"
          class="input"
        />
        <span class="text-red-600 text-xs mt-1">{{ errors.fullName }}</span>
      </div>

      <!-- اسم الأم -->
      <div class="flex flex-col">
        <label class="text-sm text-gray-600 mb-1">اسم الأم</label>
        <input
          v-model="localEmployee.MotherName"
          @input="validateArabic('MotherName')"
          @keypress="allowArabic($event)"
          class="input"
        />
        <span class="text-red-600 text-xs mt-1">{{ errors.motherName }}</span>
      </div>

      <!-- الرقم الوطني -->
      <div class="flex flex-col">
        <label class="text-sm text-gray-600 mb-1"> الرقم الوطني</label>
        <input
          v-model="localEmployee.NationalId"
          @input="validateNationalId"
          @keypress="allowDigits($event)"
          class="input"
        />
        <span class="text-red-600 text-xs mt-1">{{ errors.nationalId }}</span>
      </div>

      <!-- الهاتف الأول -->
      <div class="flex flex-col">
        <label class="text-sm text-gray-600 mb-1">رقم الهاتف 1</label>
        <input
          v-model="localEmployee.phone1"
          @input="validatePhone('phone1')"
          @keypress="allowDigits($event)"
          class="input"
          placeholder="091xxxxxxx"
        />
        <span class="text-red-600 text-xs mt-1">{{ errors.phone1 }}</span>
      </div>

      <!-- الهاتف الثاني -->
      <div class="flex flex-col">
        <label class="text-sm text-gray-600 mb-1">رقم الهاتف 2</label>
        <input
          v-model="localEmployee.phone2"
          @input="validatePhone('phone2')"
          @keypress="allowDigits($event)"
          class="input"
          placeholder="092xxxxxxx"
        />
        <span class="text-red-600 text-xs mt-1">{{ errors.phone2 }}</span>
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

      <!-- باقي الحقول (تاريخ التعيين، الجنسية، الحالة الاجتماعية، الصفة، الوضع الوظيفي، الإدارة، موقع العمل، الدرجة الوظيفية، رصيد الإجازات، المدير) -->
      <div class="flex flex-col">
        <label class="text-sm text-gray-600 mb-1">تاريخ التعيين</label>
        <input type="date" v-model="localEmployee.HireDate" class="input" />
      </div>

      <div class="flex flex-col">
        <label class="text-sm text-gray-600 mb-1">الحالة الاجتماعية</label>
        <select v-model="localEmployee.MaritalStatusId" class="input text-right pr-2">
          <option :value="1">أعزب</option>
          <option :value="2">متزوج</option>
          <option :value="3">مطلق</option>
          <option :value="4">أرمل</option>
        </select>
      </div>

      <div class="flex flex-col">
        <label class="text-sm text-gray-600 mb-1">الصفة</label>
        <select v-model="localEmployee.JobTitleId" class="input">
          <option :value="4">موظف</option>
          <option :value="5">فني</option>
          <option :value="6">مأمور ضبط</option>
          <option :value="7">مأمور ضبط قضائي</option>
          <option :value="8">عضو</option>
          <option :value="9">عضو تحقيق</option>
        </select>
      </div>

      <div class="flex flex-col">
        <label class="text-sm text-gray-600 mb-1">الوضع الوظيفي</label>
        <select v-model="localEmployee.EmploymentStatusId" class="input text-right pr-2">
          <option :value="1">موظف دائم</option>
          <option :value="2">موظف مؤقت</option>
          <option :value="3">موظف متعاقد</option>
             <option :value="4"> متدرب</option>
          <option :value="5"> مستقبل</option>
          <option :value="6">موقوف </option>
        </select>
      </div>

      <div class="flex flex-col">
        <label class="text-sm text-gray-600 mb-1">الإدارة</label>
        <select v-model="localEmployee.DepartmentId" class="input text-right pr-2">
          <option :value="5">الإدارة العامة</option>
          <option :value="6">الإدارة المالية</option>
          <option :value="7"> الموارد البشرية</option>
           <option :value="8">  تقنية المعلومات</option>
        </select>
      </div>

      <div class="flex flex-col">
        <label class="text-sm text-gray-600 mb-1">موقع العمل</label>
        <select v-model="localEmployee.WorkLocationId" class="input text-right pr-2">
          <option :value="1">المكتب الرئيسي</option>
          <option :value="2">فرع طرابلس </option>
          <option :value="3">فرع الجمهورية</option>
          <option :value="4">فرع سبها</option>
          <option :value="5">فرع مصراتة</option>
         
        </select>
      </div>

      <div class="flex flex-col">
        <label class="text-sm text-gray-600 mb-1">الدرجة الوظيفية</label>
        <select v-model="localEmployee.JobGradeId" class="input text-right pr-2">
          <option :value="1">الدرجة الأولى</option>
          <option :value="2">الدرجة الثانية</option>
          <option :value="3">الدرجة الثالثة</option>
        </select>
      </div>

      <div class="flex flex-col">
        <label class="text-sm text-gray-600 mb-1">رصيد الإجازات السنوية</label>
        <input type="number" v-model.number="localEmployee.AnnualLeaveBalance" class="input" min="0" />
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
      currentUserRole: "SuperAdmin",
      errors: { nationalId: "", phone1: "", phone2: "", fullName: "", motherName: "" }
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
      } catch (err) {
        console.error("خطأ في جلب المدراء:", err);
      }
    },

    // فلديشن مباشر
    validateNationalId() {
      const id = this.localEmployee.NationalId;
      if (!/^\d{0,12}$/.test(id)) {
        this.errors.nationalId = "الرقم الوطني يجب أن يكون 12 رقماً";
      } else if (id.length < 12) {
        this.errors.nationalId = "الرقم الوطني يجب أن يحتوي على 12 رقم";
      } else {
        this.errors.nationalId = "";
      }
    },

    validatePhone(field) {
      const phone = this.localEmployee[field];
      if (!/^\d{0,10}$/.test(phone)) {
        this.errors[field] = "رقم الهاتف يجب أن يكون 10 أرقام فقط";
      } else if (phone.length < 10) {
        this.errors[field] = "رقم الهاتف يجب أن يحتوي على 10 أرقام";
      } else {
        this.errors[field] = "";
      }
    },

    validateArabic(field) {
      const value = this.localEmployee[field];
      if (!/^[\u0621-\u064A\s]*$/.test(value)) {
        this.errors[field] = "يجب أن يحتوي على حروف عربية فقط";
      } else {
        this.errors[field] = "";
      }
    },

    // منع كتابة أي حرف غير مسموح
    allowDigits(event) {
      if (!/[0-9]/.test(event.key)) {
        event.preventDefault();
      }
    },

    allowArabic(event) {
      if (!/[\u0621-\u064A\s]/.test(event.key)) {
        event.preventDefault();
      }
    },

async save() {
  this.toastMessage = "";

  // تحقق من الحقول المطلوبة
  const requiredFields = [
    'EmployeeNumber',
    'FullName',
    'MotherName',
    'NationalId',
    'phone1',
    'phone2'
  ];

  for (let field of requiredFields) {
    if (!this.localEmployee[field]) {
      this.toastMessage = `يرجى ملء الحقل: ${field}`;
      this.toastType = "error";
      return;
    }
  }

  if (
    this.errors.nationalId ||
    this.errors.phone1 ||
    this.errors.phone2 ||
    this.errors.fullName ||
    this.errors.motherName
  ) {
    this.toastMessage = "يرجى تصحيح الحقول قبل الحفظ";
    this.toastType = "error";
    return;
  }

  if (
    this.currentUserRole === "SuperAdmin" &&
    (!this.localEmployee.username ||
      !this.localEmployee.password ||
      !this.localEmployee.roleId)
  ) {
    this.toastMessage = "بيانات حساب المستخدم ناقصة";
    this.toastType = "error";
    return;
  }

  try {
    // إنشاء الموظف بدون ManagerId
  const payload = {
  username: this.localEmployee.username || "", // اجعلها string فارغ لو null
  password: this.localEmployee.password || "",
  roleId: Number(this.localEmployee.roleId || 5), // default لموظف
  employeeNumber: this.localEmployee.EmployeeNumber,
  fullName: this.localEmployee.FullName,
  phone1: this.localEmployee.phone1,
  phone2: this.localEmployee.phone2,
  motherName: this.localEmployee.MotherName,
  nationalId: this.localEmployee.NationalId,
  birthDate: this.localEmployee.BirthDate ? new Date(this.localEmployee.BirthDate).toISOString() : null,
  gender: this.localEmployee.Gender || "ذكر",
  hireDate: this.localEmployee.HireDate ? new Date(this.localEmployee.HireDate).toISOString() : null,
  maritalStatusId: Number(this.localEmployee.MaritalStatusId || 1),
  jobTitleId: Number(this.localEmployee.JobTitleId || 4),
  employmentStatusId: Number(this.localEmployee.EmploymentStatusId || 1),
  departmentId: Number(this.localEmployee.DepartmentId || 5),
  workLocationId: Number(this.localEmployee.WorkLocationId || 1),
  jobGradeId: Number(this.localEmployee.JobGradeId || 1),
  annualLeaveBalance: Number(this.localEmployee.AnnualLeaveBalance || 20)
};


     await api.post("/Employee/create-account", payload);

    // لو تم اختيار مدير، نرسل طلب تعيينه
    if (this.localEmployee.ManagerId) {
      await api.post(`/Employee/assign-manager?departmentId=${this.localEmployee.DepartmentId}&employeeId=${this.localEmployee.ManagerId}`);
    }

    this.toastMessage = "تم إنشاء الموظف  بنجاح ✅";
    this.toastType = "success";

    this.resetForm();
  } catch (err) {
    this.toastMessage =
      err.response?.data?.message || err.message || "خطأ في الحفظ ❌";
    this.toastType = "error";
  }
}
,

resetForm() {
  this.localEmployee = {
    EmployeeNumber: "",
    FullName: "",
    MotherName: "",
    NationalId: "",
    phone1: "",
    phone2: "",
    BirthDate: "",
    Gender: "",
    HireDate: "",
    Nationality: "",
    MaritalStatusId: null,
    JobTitleId: null,
    EmploymentStatusId: null,
    DepartmentId: null,
    WorkLocationId: null,
    JobGradeId: null,
    AnnualLeaveBalance: 20,
    ManagerId: null,
    username: "",
    password: "",
    roleId: null
  };

  // مسح الأخطاء
  this.errors = {
    nationalId: "",
    phone1: "",
    phone2: "",
    fullName: "",
    motherName: ""
  };
}

  }
};
</script>

<style scoped>
.input {
  @apply p-2 border rounded-lg text-right;
}
</style>
