<template>
  <div class="flex min-h-screen bg-white">
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

        <!-- الانتداب -->
        <div v-if="form.jobStatus === JobStatus.Transfer" class="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label class="label">نوع الانتداب</label>
            <div class="flex gap-4 items-center mt-1">
              <label class="flex items-center">
                <input type="checkbox" value="كلي" v-model="transferTypeSelection" @change="onTransferTypeChange" />
                <span class="mr-1">كلي</span>
              </label>
              <label class="flex items-center">
                <input type="checkbox" value="جزئي" v-model="transferTypeSelection" @change="onTransferTypeChange" />
                <span class="mr-1">جزئي</span>
              </label>
            </div>
          </div>
          <div>
            <label class="label">الجهة المنتدب منها</label>
            <select v-model.number="form.transferFromEntityId" class="input">
              <option :value="null">اختر</option>
              <option v-for="d in departments" :key="d.id" :value="d.id">{{ d.name }}</option>
            </select>
          </div>

          <div>
            <label class="label">بداية الانتداب</label>
            <input type="date" v-model="form.transferStartDate" class="input" />
          </div>
          <div>
            <label class="label">نهاية الانتداب</label>
            <input type="date" v-model="form.transferEndDate" class="input" />
          </div>
        </div>

        <!-- الإعارة -->
        <div v-if="form.jobStatus === JobStatus.Secondment" class="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label class="label">الجهة المعار إليها</label>
            <select v-model.number="form.secondmentToEntityId" class="input">
              <option :value="null">اختر</option>
              <option v-for="d in departments" :key="d.id" :value="d.id">{{ d.name }}</option>
            </select>
          </div>
          <div>
            <label class="label">بداية الإعارة</label>
            <input type="date" v-model="form.secondmentStartDate" class="input" />
          </div>
          <div>
            <label class="label">نهاية الإعارة</label>
            <input type="date" v-model="form.secondmentEndDate" class="input" />
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
      transferTypeSelection: [], // لتخزين اختيار كلي أو جزئي
      toast: { visible: false, message: "", type: "success", onConfirm: null },
      departments: [
        { id: 1, name: "الإدارة العامة" },
        { id: 2, name: "إدارة الموارد البشرية" },
        { id: 3, name: "إدارة المالية" },
        { id: 4, name: "إدارة الشؤون القانونية" },
        { id: 5, name: "إدارة تكنولوجيا المعلومات" }
      ],
      subDepartments: [
        { id: 2, name: "شعبة التخطيط والمتابعة", departmentId: 1 },
        { id: 3, name: "شعبة الجودة والمراقبة", departmentId: 1 },
        { id: 4, name: "شعبة التوظيف", departmentId: 2 },
        { id: 5, name: "شعبة التدريب والتطوير", departmentId: 2 },
        { id: 6, name: "شعبة الرواتب والمكافآت", departmentId: 3 },
        { id: 7, name: "شعبة الحسابات", departmentId: 3 },
        { id: 8, name: "شعبة الشؤون القانونية", departmentId: 4 },
        { id: 9, name: "شعبة العقود والاتفاقيات", departmentId: 4 },
        { id: 10, name: "شعبة البرمجيات", departmentId: 5 },
        { id: 11, name: "شعبة البنية التحتية", departmentId: 5 }
      ],
      sections: [
        { id: 4, name: "قسم التخطيط والمتابعة", subDepartmentId: 1 },
        { id: 5, name: "قسم الجودة والمراقبة", subDepartmentId: 2 },
        { id: 6, name: "قسم التوظيف", subDepartmentId: 3 },
        { id: 7, name: "قسم التدريب", subDepartmentId: 4 },
        { id: 8, name: "قسم الرواتب والمكافآت", subDepartmentId: 5 },
        { id: 9, name: "قسم الحسابات", subDepartmentId: 6 },
        { id: 10, name: "قسم الشؤون القانونية", subDepartmentId: 7 },
        { id: 11, name: "قسم العقود والاتفاقيات", subDepartmentId: 8 },
        { id: 12, name: "قسم البرمجيات", subDepartmentId: 9 },
        { id: 13, name: "قسم البنية التحتية", subDepartmentId: 10 }
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

    onTransferTypeChange() {
      this.form.transferType = this.transferTypeSelection.join(",");
    },

    async loadEmployeeData(publicId) {
      try {
        const employeeRes = await api.get(`/Employee/details/${publicId}`);
        this.employeeName = employeeRes.data.fullName;
        this.employeeNumber = employeeRes.data.employeeNumber;

        const adminRes = await api.get(`/EmployeeAdministrative/by-publicid/${publicId}`);
        const data = adminRes.data;

        if (data) {
          this.isEdit = true;

          // تحويل النصوص إلى IDs
          const jobTitle = this.jobTitles.find(j => j.name === data.jobTitle);
          const department = this.departments.find(d => d.name === data.department);
          const subDepartment = this.subDepartments.find(s => s.name === data.subDepartment);
          const section = this.sections.find(s => s.name === data.section);
          const jobGrade = this.jobGrades.find(g => g.name === data.jobGrade);
          const workLocation = this.workLocations.find(w => w.name === data.workLocation);

          this.form.jobStatus = Number(data.jobStatus) || this.JobStatus.Appointment;
          this.form.jobTitleId = jobTitle ? jobTitle.id : null;
          this.form.departmentId = department ? department.id : null;
          this.form.subDepartmentId = subDepartment ? subDepartment.id : null;
          this.form.sectionId = section ? section.id : null;
          this.form.startWorkDate = data.startWorkDate ? data.startWorkDate.split('T')[0] : "";
          this.form.workLocationId = workLocation ? workLocation.id : null;
          this.form.jobGradeId = jobGrade ? jobGrade.id : null;
          this.form.leaveBalance = Number(data.leaveBalance) || 0;
          this.form.appointmentDate = data.appointmentDate ? data.appointmentDate.split('T')[0] : this.form.startWorkDate;
          this.form.contractStartDate = data.contractStartDate ? data.contractStartDate.split('T')[0] : "";
          this.form.contractEndDate = data.contractEndDate ? data.contractEndDate.split('T')[0] : "";
          this.form.transferType = data.transferType || "";
          this.transferTypeSelection = this.form.transferType ? this.form.transferType.split(",") : [];
          this.form.transferFromEntityId = data.transferFromEntity ? Number(data.transferFromEntity.id) : null;
          this.form.transferStartDate = data.transferStartDate ? data.transferStartDate.split('T')[0] : "";
          this.form.transferEndDate = data.transferEndDate ? data.transferEndDate.split('T')[0] : "";
          this.form.secondmentToEntityId = data.secondmentToEntity ? Number(data.secondmentToEntity.id) : null;
          this.form.secondmentStartDate = data.secondmentStartDate ? data.secondmentStartDate.split('T')[0] : "";
          this.form.secondmentEndDate = data.secondmentEndDate ? data.secondmentEndDate.split('T')[0] : "";
        } else {
          this.isEdit = false;
          Object.assign(this.form, this.emptyForm());
          this.transferTypeSelection = [];
        }
      } catch (err) {
        console.error(err);
        this.showToast("❌ فشل تحميل بيانات الموظف", "error");
      }
    },

    async save() {
      if (!this.employeePublicIdInternal) {
        return this.showToast("❌ لم يتم تحديد الموظف", "error");
      }

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
        transferType: this.form.jobStatus === JobStatus.Transfer ? (this.form.transferType || "") : null,
        transferFromEntityId: this.form.jobStatus === JobStatus.Transfer ? (this.form.transferFromEntityId || null) : null,
        transferStartDate: this.form.jobStatus === JobStatus.Transfer ? (this.form.transferStartDate || null) : null,
        transferEndDate: this.form.jobStatus === JobStatus.Transfer ? (this.form.transferEndDate || null) : null,
        secondmentToEntityId: this.form.jobStatus === JobStatus.Secondment ? (this.form.secondmentToEntityId || null) : null,
        secondmentStartDate: this.form.jobStatus === JobStatus.Secondment ? (this.form.secondmentStartDate || null) : null,
        secondmentEndDate: this.form.jobStatus === JobStatus.Secondment ? (this.form.secondmentEndDate || null) : null
      };

      try {
        if (this.isEdit) {
          await api.put(`/EmployeeAdministrative/${this.employeePublicIdInternal}`, payload);
        } else {
          await api.post(`/EmployeeAdministrative`, payload);
          this.isEdit = true;
        }

        this.showToast("✅ تم حفظ البيانات الإدارية بنجاح", "success");

        this.$router.push({
          name: "EmployeeFinancial",
          params: { publicId: this.employeePublicIdInternal },
          query: { name: this.employeeName, number: this.employeeNumber }
        });
      } catch (err) {
        console.error(err);
        this.showToast("❌ فشل الحفظ – تأكد من البيانات", "error");
      }
    },

    showToast(message, type = "success") {
      this.toast = { visible: true, message, type, onConfirm: null };
    }
  }
};
</script>

<style scoped>
.input { @apply border rounded px-3 py-2 w-full; }
.label { @apply text-sm text-gray-700 mb-1 block; }
</style>