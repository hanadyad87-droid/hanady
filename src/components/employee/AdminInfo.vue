<template>
  <div class="p-6 space-y-6" dir="rtl">
    <h3 class="text-xl font-bold text-black-800">البيانات الإدارية</h3>

    <!-- اختيار الموظف -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
      <div>
        <label class="label">اختر الموظف</label>
        <select v-model="selectedEmployee" class="input" @change="onEmployeeChange">
          <option :value="null">-- اختر الموظف --</option>
          <option v-for="e in employees" :key="e.id" :value="e">
            {{ e.fullName }}
          </option>
        </select>
      </div>

      <div>
        <label class="label">رقم الموظف</label>
        <input class="input" type="text" v-model="employeeNumber" readonly />
      </div>
    </div>

    <!-- البيانات الثابتة (عمودين) -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="label">الصفة الوظيفية</label>
        <select v-model.number="form.jobTitleId" class="input">
          <option :value="null">اختر</option>
          <option v-for="j in jobTitles" :key="j.id" :value="j.id">{{ j.name }}</option>
        </select>
      </div>
      <div>
        <label class="label">الإدارة</label>
        <select v-model.number="form.departmentId" class="input">
          <option :value="null">اختر</option>
          <option v-for="d in departments" :key="d.id" :value="d.id">{{ d.name }}</option>
        </select>
      </div>
      <div>
        <label class="label">الإدارة الفرعية</label>
        <select v-model.number="form.subDepartmentId" class="input">
          <option :value="null">اختر</option>
          <option v-for="s in filteredSubDepartments" :key="s.id" :value="s.id">{{ s.name }}</option>
        </select>
      </div>
      <div>
        <label class="label">القسم</label>
        <select v-model.number="form.sectionId" class="input">
          <option :value="null">اختر</option>
          <option v-for="s in filteredSections" :key="s.id" :value="s.id">{{ s.name }}</option>
        </select>
      </div>
      <div>
        <label class="label">موقع العمل</label>
        <select v-model.number="form.workLocationId" class="input">
          <option :value="null">اختر</option>
          <option v-for="w in workLocations" :key="w.id" :value="w.id">{{ w.name }}</option>
        </select>
      </div>
      <div>
        <label class="label">الدرجة الوظيفية</label>
        <select v-model.number="form.jobGradeId" class="input">
          <option :value="null">اختر</option>
          <option v-for="g in jobGrades" :key="g.id" :value="g.id">{{ g.name }}</option>
        </select>
      </div>
        <div>
        <label class="label">تاريخ المباشرة</label>
        <input type="date" v-model="form.startWorkDate" class="input" />
      </div>

      <div>
        <label class="label">رصيد الإجازات</label>
        <input type="number" v-model.number="form.leaveBalance" class="input" />
      </div>
    </div>

  
    

<div>
  <label class="label">الوضع الوظيفي</label>
  <select v-model.number="form.jobStatus" class="input">
   
    <option :value="JobStatus.Appointment">تعيين</option>
    <option :value="JobStatus.Contract">متعاقد</option>
    <option :value="JobStatus.Transfer">منتدب</option>
    <option :value="JobStatus.Secondment">إعارة</option>
  </select>
</div>

<!-- الحقول الخاصة بكل وضع وظيفي -->
<div v-if="form.jobStatus === JobStatus.Appointment">
  <label class="label">تاريخ التعيين</label>
  <input type="date" v-model="form.appointmentDate" class="input" />
</div>

<div v-if="form.jobStatus === JobStatus.Contract" class="grid grid-cols-2 gap-4">
  <div>
    <label class="label">بداية العقد</label>
    <input type="date" v-model="form.contractStartDate" class="input" />
  </div>
  <div>
    <label class="label">نهاية العقد</label>
    <input type="date" v-model="form.contractEndDate" class="input" />
  </div>
</div>

<div v-if="form.jobStatus === JobStatus.Transfer" class="space-y-3">
  <div>
    <label class="label">الجهة المنتدب منها</label>
    <select v-model.number="form.transferFromEntityId" class="input">
      <option :value="null">اختر الجهة</option>
      <option v-for="e in departments" :key="e.id" :value="e.id">{{ e.name }}</option>
    </select>
  </div>
  <div>
    <label class="label">نوع الانتداب</label>
    <div class="flex gap-6 mt-2">
      <label><input type="radio" value="كلي" v-model="form.transferType" /> كلي</label>
      <label><input type="radio" value="جزئي" v-model="form.transferType" /> جزئي</label>
    </div>
  </div>
  <div class="grid grid-cols-2 gap-4">
    <input type="date" v-model="form.transferStartDate" class="input" />
    <input type="date" v-model="form.transferEndDate" class="input" />
  </div>
</div>

<div v-if="form.jobStatus === JobStatus.Secondment" class="space-y-3">
  <div>
    <label class="label">الجهة المعار إليها</label>
    <select v-model.number="form.secondmentToEntityId" class="input">
      <option :value="null">اختر الجهة</option>
      <option v-for="e in departments" :key="e.id" :value="e.id">{{ e.name }}</option>
    </select>
  </div>
  <div class="grid grid-cols-2 gap-4">
    <input type="date" v-model="form.secondmentStartDate" class="input" />
    <input type="date" v-model="form.secondmentEndDate" class="input" />
  </div>
</div>



       <!-- زر الحفظ -->
    <div class="flex justify-center mt-8">
      <button
        @click="save"
        class="bg-primary hover:bg-primaryDark text-white py-2 px-6 rounded-lg transition w-full max-w-xs"
      >
        حفظ البيانات الادارية
      </button>
    </div>
    </div>

    <!-- Toast -->
    <Toast
      v-if="toast.visible"
      :message="toast.message"
      :type="toast.type"
      @onConfirm="toast.onConfirm && toast.onConfirm()"
    />
  
</template>

<script>
import api from "../../services/api";
import Toast from "../Toast.vue";

// ===== هنا تضيف JobStatus =====
const JobStatus = { 
 
  Contract: 2,     // متعاقد
  Appointment: 3,  // تعيين
  Transfer: 4,     // منتدب
  Secondment: 5    // إعارة
};

export default {
  name: "AdminInfo",
  components: { Toast },
  data() {
    return {
      JobStatus,
      employees: [],
      selectedEmployee: null,
      employeeNumber: "",
      form: {},
      toast: { visible: false, message: "", type: "success", onConfirm: null },

     /* ====== STATIC LOOKUPS ====== */
      departments: [
        { id: 1, name: "الإدارة العامة" },
        { id: 2, name: "إدارة الموارد البشرية" },
        { id: 3, name: "إدارة المالية" },
        { id: 4, name: "إدارة الشؤون القانونية" },
        { id: 5, name: "إدارة تكنولوجيا المعلومات" }
      ],
      subDepartments: [
        { id: 1, name: "شعبة التخطيط والمتابعة", departmentId: 1 },
        { id: 2, name: "شعبة الجودة والمراقبة", departmentId: 1 },
        { id: 3, name: "شعبة التوظيف", departmentId: 2 },
        { id: 4, name: "شعبة التدريب والتطوير", departmentId: 2 },
        { id: 5, name: "شعبة الرواتب والمكافآت", departmentId: 3 },
        { id: 6, name: "شعبة الحسابات", departmentId: 3 },
        { id: 7, name: "شعبة الشؤون القانونية", departmentId: 4 },
        { id: 8, name: "شعبة العقود والاتفاقيات", departmentId: 4 },
        { id: 9, name: "شعبة البرمجيات", departmentId: 5 },
        { id: 10, name: "شعبة البنية التحتية", departmentId: 5 }
      ],
      sections: [
        { id: 1, name: "قسم التخطيط والمتابعة", subDepartmentId: 1 },
        { id: 2, name: "قسم الجودة والمراقبة", subDepartmentId: 2 },
        { id: 3, name: "قسم التوظيف", subDepartmentId: 3 },
        { id: 4, name: "قسم التدريب", subDepartmentId: 4 },
        { id: 5, name: "قسم الرواتب والمكافآت", subDepartmentId: 5 },
        { id: 6, name: "قسم الحسابات", subDepartmentId: 6 },
        { id: 7, name: "قسم الشؤون القانونية", subDepartmentId: 7 },
        { id: 8, name: "قسم العقود والاتفاقيات", subDepartmentId: 8 },
        { id: 9, name: "قسم البرمجيات", subDepartmentId: 9 },
        { id: 10, name: "قسم البنية التحتية", subDepartmentId: 10 }
      ],
      workLocations: [
        { id: 1, name: "طرابلس" },
        { id: 2, name: "فرع الجمهورية" },
        { id: 3, name: "فرع الدهماني" },
        { id: 4, name: "سبها" },
        { id: 5, name: "أجدابيا" },
        { id: 6, name: "الخمس" },
        { id: 7, name: "الزاوية" },
        { id: 8, name: "طرابلس الجديدة" },
        { id: 9, name: "الكفرة" },
        { id: 10, name: "غريان" }
      ],
      jobTitles: [
        { id: 1, name: "موظف" },
        { id: 2, name: "فني" },
        { id: 3, name: "مدير" },
        { id: 4, name: "مأمور ضبط" },
        { id: 5, name: "مأمور ضبط قضائي" },
        { id: 6, name: "عضو تحقيق" }
      ],
      jobGrades: [
        { id: 1, name: "الأولى" },
        { id: 2, name: "الثانية" },
        { id: 3, name: "الثالثة" }
       
      ],
    };
  },
  
  computed: {
    filteredSubDepartments() {
      return this.subDepartments.filter(s => s.departmentId === this.form.departmentId);
    },
    filteredSections() {
      return this.sections.filter(s => s.subDepartmentId === this.form.subDepartmentId);
    }
  },
  async mounted() {
    this.employees = (await api.get("/Employee/all")).data;
    this.form = this.emptyForm();
  },
  methods: {
    emptyForm() {
      return {
        jobStatus: JobStatus.Appointment,
        jobTitleId: null,
        departmentId: null,
        subDepartmentId: null,
        sectionId: null,
        startWorkDate: "",
        workLocationId: null,
        jobGradeId: null,
        leaveBalance: 0,
        appointmentDate: "",
        contractStartDate: "",
        contractEndDate: "",
        transferFromEntityId: null,
        transferType: "",
        transferStartDate: "",
        transferEndDate: "",
        secondmentToEntityId: null,
        secondmentStartDate: "",
        secondmentEndDate: ""
      };
    },
   async onEmployeeChange() {
  if (!this.selectedEmployee) {
    this.employeeNumber = "";
    this.form = this.emptyForm();
    return;
  }

  this.employeeNumber = this.selectedEmployee.id;

  try {
    const res = await api.get(`/EmployeeAdministrative/by-employee/${this.selectedEmployee.id}`);
    if (res.data) {
      this.form = { ...this.emptyForm(), ...res.data };
    } else {
      this.form = this.emptyForm();
    }
  } catch (err) {
    console.error(err);
    this.form = this.emptyForm();
  }
}
,
    async save() {
      if (!this.selectedEmployee) {
        this.showToast("❌ يرجى اختيار موظف أولاً", "error");
        return;
      }

      const payload = {
        employeeId: this.selectedEmployee.id,
        jobStatus: this.form.jobStatus,
        jobTitleId: this.form.jobTitleId || null,
        departmentId: this.form.departmentId || null,
        subDepartmentId: this.form.subDepartmentId || null,
        sectionId: this.form.sectionId || null,
        workLocationId: this.form.workLocationId || null,
        jobGradeId: this.form.jobGradeId || null,
        startWorkDate: this.form.startWorkDate || null,
        leaveBalance: this.form.leaveBalance || 0,
        appointmentDate: this.form.jobStatus === JobStatus.Appointment ? this.form.appointmentDate || null : null,
        contractStartDate: this.form.jobStatus === JobStatus.Contract ? this.form.contractStartDate || null : null,
        contractEndDate: this.form.jobStatus === JobStatus.Contract ? this.form.contractEndDate || null : null,
        transferFromEntityId: this.form.jobStatus === JobStatus.Transfer ? this.form.transferFromEntityId || null : null,
        transferType: this.form.jobStatus === JobStatus.Transfer ? this.form.transferType || null : null,
        transferStartDate: this.form.jobStatus === JobStatus.Transfer ? this.form.transferStartDate || null : null,
        transferEndDate: this.form.jobStatus === JobStatus.Transfer ? this.form.transferEndDate || null : null,
        secondmentToEntityId: this.form.jobStatus === JobStatus.Secondment ? this.form.secondmentToEntityId || null : null,
        secondmentStartDate: this.form.jobStatus === JobStatus.Secondment ? this.form.secondmentStartDate || null : null,
        secondmentEndDate: this.form.jobStatus === JobStatus.Secondment ? this.form.secondmentEndDate || null : null
      };

      try {
        await api.post("/EmployeeAdministrative", payload);
        this.showToast("✅ تم حفظ البيانات بنجاح", "success");

        this.selectedEmployee = null;
        this.employeeNumber = "";
        this.form = this.emptyForm();
      } catch (err) {
        console.error(err.response?.data || err);
        this.showToast("❌ فشل الحفظ – تأكد من البيانات", "error");
      }
    },
    showToast(message, type = "success", onConfirm = null) {
      this.toast = { visible: true, message, type, onConfirm };
    }
  }
};
</script>

<style scoped>
.input { @apply border rounded px-3 py-2 w-full; }
.label { @apply text-sm text-gray-700 mb-1 block; }
.btn { @apply cursor-pointer; }
</style>