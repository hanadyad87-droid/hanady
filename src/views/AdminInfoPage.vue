<template>
  <div class="flex min-h-screen bg-gray-100">
    <!-- Sidebar ثابتة على اليمين -->
    <Sidebar class="fixed top-0 right-0 h-screen w-24 md:w-64 z-50" />

    <!-- المحتوى الرئيسي -->
    <div class="flex-1 p-6 min-h-screen mr-24 md:mr-64">
      <Navbar />

      <!-- محتوى الصفحة -->
      <div class="bg-white p-6 rounded-xl shadow max-w-4xl mx-auto mt-6">
        <h3 class="text-xl font-bold text-black-800">البيانات الإدارية</h3>

        <!-- معلومات الموظف -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div>
            <label class="label">الموظف</label>
            <input type="text" v-model="employeeName" class="input bg-gray-100" readonly />
          </div>

          <div>
            <label class="label">رقم الموظف</label>
            <input class="input bg-gray-100" v-model="employeeNumber" readonly />
          </div>
        </div>

        <!-- البيانات الإدارية -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
              <option v-for="s in subDepartments" :key="s.id" :value="s.id">{{ s.name }}</option>
            </select>
          </div>

          <div>
            <label class="label">القسم</label>
            <select v-model.number="form.sectionId" class="input">
              <option :value="null">اختر</option>
              <option v-for="s in sections" :key="s.id" :value="s.id">{{ s.name }}</option>
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

        <!-- الوضع الوظيفي -->
        <div class="mt-4">
          <label class="label">الوضع الوظيفي</label>
          <select v-model.number="form.jobStatus" class="input">
            <option :value="JobStatus.Appointment">تعيين</option>
            <option :value="JobStatus.Contract">متعاقد</option>
            <option :value="JobStatus.Transfer">منتدب</option>
            <option :value="JobStatus.Secondment">إعارة</option>
          </select>
        </div>

        <!-- الحقول الخاصة بكل وضع -->
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

        <div class="flex justify-center mt-8">
          <button @click="save" class="bg-primary hover:bg-primaryDark text-white py-2 px-6 rounded-lg">
            حفظ البيانات الإدارية
          </button>
        </div>

        <Toast v-if="toast.visible" :message="toast.message" :type="toast.type" @onConfirm="toast.onConfirm && toast.onConfirm()" />
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from "@/components/Sidebar.vue";
import Navbar from "@/components/Navbar.vue";
import Toast from "@/components/Toast.vue";
import api from "@/services/api";

const JobStatus = { Contract: 2, Appointment: 3, Transfer: 4, Secondment: 5 };

export default {
  name: "AdminInfoPage",
  components: { Sidebar, Navbar, Toast },
   props: ['publicId'],
  data() {
    return {
      JobStatus,
      employeeName: "",
      employeeNumber: "",
      employeePublicIdInternal: null,
      form: this.emptyForm(),
      toast: { visible: false, message: "", type: "success", onConfirm: null },
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
        { id: 3, name: "الثالثة" },
        { id: 4, name: "الرابعة" }
      ]
    };
  },
 
 watch: {
  publicId: {
    immediate: true,
    handler(newVal) {
      if (newVal) {
        this.employeePublicIdInternal = newVal;
        this.loadEmployeeData(newVal);
      }
    }
  }
},
  methods: {
    emptyForm() {
      return { jobStatus: JobStatus.Appointment, jobTitleId: null, departmentId: null, subDepartmentId: null, sectionId: null, startWorkDate: "", workLocationId: null, jobGradeId: null, leaveBalance: 0, appointmentDate: "", contractStartDate: "", contractEndDate: "", transferFromEntityId: null, transferType: "", transferStartDate: "", transferEndDate: "", secondmentToEntityId: null, secondmentStartDate: "", secondmentEndDate: "" };
    },

    async loadEmployeeData(publicId) {
      try {
        const res = await api.get(`/Employee/details/${publicId}`);
        console.log("Response Admin Data:", res.data);
        this.employeePublicIdInternal = res.data.publicId;
        this.employeeName = res.data.fullName;
        this.employeeNumber = res.data.employeeNumber;

        // ملء البيانات الإدارية
        if (res.data.departmentId) this.form.departmentId = res.data.departmentId;
        if (res.data.jobTitleId) this.form.jobTitleId = res.data.jobTitleId;
        if (res.data.jobGradeId) this.form.jobGradeId = res.data.jobGradeId;
        if (res.data.workLocationId) this.form.workLocationId = res.data.workLocationId;
        if (res.data.startWorkDate) this.form.startWorkDate = res.data.startWorkDate;
        if (res.data.leaveBalance) this.form.leaveBalance = res.data.leaveBalance;
        if (res.data.jobStatus) this.form.jobStatus = res.data.jobStatus;

      } catch (err) {
        console.error(err);
        this.showToast("❌ فشل تحميل بيانات الموظف", "error");
      }
    },

async save() {
  if (!this.employeePublicIdInternal) return this.showToast("❌ لم يتم تحديد الموظف", "error");

  const payload = {
    employeePublicId: this.employeePublicIdInternal,
    jobStatus: this.form.jobStatus,
    jobTitleId: this.form.jobTitleId || 0,
    departmentId: this.form.departmentId || 0,
    subDepartmentId: this.form.subDepartmentId || null,
    sectionId: this.form.sectionId || null,
    startWorkDate: this.form.startWorkDate,
    workLocationId: this.form.workLocationId || 0,
    jobGradeId: this.form.jobGradeId || 0,
    leaveBalance: this.form.leaveBalance || 0,
    contractStartDate: this.form.contractStartDate || null,
    contractEndDate: this.form.contractEndDate || null,
    appointmentDate: this.form.appointmentDate || this.form.startWorkDate,
    transferType: this.form.transferType || null,
    transferFromEntityId: this.form.transferFromEntityId || null,
    transferStartDate: this.form.transferStartDate || null,
    transferEndDate: this.form.transferEndDate || null,
    secondmentToEntityId: this.form.secondmentToEntityId || null,
    secondmentStartDate: this.form.secondmentStartDate || null,
    secondmentEndDate: this.form.secondmentEndDate || null
  };

  try {
    await api.post("/EmployeeAdministrative", payload); // هنا عرفنا المتغير response
    this.showToast("✅ تم حفظ البيانات الإدارية بنجاح", "success");

    // توجيه للصفحة المالية مع الاسم والرقم
  this.$router.push({
  name: "EmployeeFinancial",
  params: { publicId: this.employeePublicIdInternal }, 
  query: { name: this.employeeName, number: this.employeeNumber } // الاسم والرقم للعرض فقط
});
  } catch (err) {
    console.error(err);
    this.showToast("❌ فشل الحفظ – تأكد من البيانات", "error");
  }
},

    showToast(message, type = "success") { this.toast = { visible: true, message, type, onConfirm: null }; }
  }
};
</script>

<style scoped>
.input { @apply border rounded px-3 py-2 w-full; }
.label { @apply text-sm text-gray-700 mb-1 block; }
</style>