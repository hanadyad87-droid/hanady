<template>
  <div class="flex min-h-screen bg-background font-cairo" dir="rtl">
    <Sidebar class="fixed top-0 right-0 h-screen w-24 md:w-64 bg-primary text-white p-4 z-50" />
    <div class="flex-1 p-6 min-h-screen mr-24 md:mr-64">
      <Navbar />

      <div class="bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
        <h2 class="text-2xl font-bold mb-6 text-right">تعديل البيانات الإدارية للموظف</h2>

        <form v-if="formLoaded" @submit.prevent="updateAdministrative">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block mb-1 font-semibold">رقم الموظف</label>
              <input type="text" class="input" v-model="employeeNumber" readonly />
            </div>

            <div>
              <label class="block mb-1 font-semibold">الصفة الوظيفية</label>
              <select v-model.number="form.jobTitleId" class="input">
                <option :value="null">اختر</option>
                <option v-for="j in jobTitles" :key="j.id" :value="j.id">{{ j.name }}</option>
              </select>
            </div>

            <div>
              <label class="block mb-1 font-semibold">الإدارة</label>
              <select v-model.number="form.departmentId" class="input">
                <option :value="null">اختر</option>
                <option v-for="d in departments" :key="d.id" :value="d.id">{{ d.name }}</option>
              </select>
            </div>

            <div>
              <label class="block mb-1 font-semibold">الإدارة الفرعية</label>
              <select v-model.number="form.subDepartmentId" class="input">
                <option :value="null">اختر</option>
                <option v-for="s in filteredSubDepartments" :key="s.id" :value="s.id">{{ s.name }}</option>
              </select>
            </div>

            <div>
              <label class="block mb-1 font-semibold">القسم</label>
              <select v-model.number="form.sectionId" class="input">
                <option :value="null">اختر</option>
                <option v-for="s in filteredSections" :key="s.id" :value="s.id">{{ s.name }}</option>
              </select>
            </div>

            <div>
              <label class="block mb-1 font-semibold">موقع العمل</label>
              <select v-model.number="form.workLocationId" class="input">
                <option :value="null">اختر</option>
                <option v-for="w in workLocations" :key="w.id" :value="w.id">{{ w.name }}</option>
              </select>
            </div>

            <div>
              <label class="block mb-1 font-semibold">الدرجة الوظيفية</label>
              <select v-model.number="form.jobGradeId" class="input">
                <option :value="null">اختر</option>
                <option v-for="g in jobGrades" :key="g.id" :value="g.id">{{ g.name }}</option>
              </select>
            </div>

            <div>
              <label class="block mb-1 font-semibold">تاريخ المباشرة</label>
              <input type="date" v-model="form.startWorkDate" class="input" />
            </div>

            <div>
              <label class="block mb-1 font-semibold">رصيد الإجازات</label>
              <input type="number" v-model.number="form.leaveBalance" class="input" />
            </div>

            <div>
              <label class="block mb-1 font-semibold">الوضع الوظيفي</label>
              <select v-model.number="form.jobStatus" class="input">
                <option :value="JobStatus.Appointment">تعيين</option>
                <option :value="JobStatus.Contract">متعاقد</option>
                <option :value="JobStatus.Transfer">منتدب</option>
                <option :value="JobStatus.Secondment">إعارة</option>
              </select>
            </div>

            <!-- الحقول الخاصة حسب الوضع الوظيفي -->
            <div v-if="form.jobStatus === JobStatus.Appointment">
              <label class="block mb-1 font-semibold">تاريخ التعيين</label>
              <input type="date" v-model="form.appointmentDate" class="input" />
            </div>

            <div v-if="form.jobStatus === JobStatus.Contract" class="grid grid-cols-2 gap-4">
              <div>
                <label class="block mb-1 font-semibold">بداية العقد</label>
                <input type="date" v-model="form.contractStartDate" class="input" />
              </div>
              <div>
                <label class="block mb-1 font-semibold">نهاية العقد</label>
                <input type="date" v-model="form.contractEndDate" class="input" />
              </div>
            </div>

            <div v-if="form.jobStatus === JobStatus.Transfer" class="space-y-3">
              <label class="block mb-1 font-semibold">الجهة المنتدب منها</label>
              <select v-model.number="form.transferFromEntityId" class="input">
                <option :value="null">اختر</option>
                <option v-for="d in departments" :key="d.id" :value="d.id">{{ d.name }}</option>
              </select>

              <div class="flex gap-6 mt-2">
                <label><input type="radio" value="Internal" v-model="form.transferType" /> كلي</label>
                <label><input type="radio" value="Partial" v-model="form.transferType" /> جزئي</label>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <input type="date" v-model="form.transferStartDate" class="input" />
                <input type="date" v-model="form.transferEndDate" class="input" />
              </div>
            </div>

            <div v-if="form.jobStatus === JobStatus.Secondment" class="space-y-3">
              <label class="block mb-1 font-semibold">الجهة المعار إليها</label>
              <select v-model.number="form.secondmentToEntityId" class="input">
                <option :value="null">اختر</option>
                <option v-for="d in departments" :key="d.id" :value="d.id">{{ d.name }}</option>
              </select>

              <div class="grid grid-cols-2 gap-4">
                <input type="date" v-model="form.secondmentStartDate" class="input" />
                <input type="date" v-model="form.secondmentEndDate" class="input" />
              </div>
            </div>

          </div>

          <div class="flex justify-center mt-6">
            <button type="submit" class="bg-primary hover:bg-primaryDark text-white py-2 px-6 rounded-lg transition w-full max-w-xs">
              حفظ البيانات
            </button>
          </div>
        </form>
      </div>

      <ToastPage
        v-if="showToast"
        :message="toastMessage"
        :type="toastType"
        @close="showToast = false"
      />
    </div>
  </div>
</template>

<script>
import Sidebar from "@/components/Sidebar.vue";
import Navbar from "@/components/Navbar.vue";
import ToastPage from "@/components/Toast.vue";
import api from "@/services/api";

const JobStatus = { Appointment: 3, Contract: 2, Transfer: 4, Secondment: 5 };

export default {
  components: { Sidebar, Navbar, ToastPage },

  data() {
    return {
      JobStatus,
      selectedEmployeeId: null,
      employeeNumber: "",
      form: {},
      formLoaded: false,
      showToast: false,
      toastMessage: "",
      toastType: "success",
      // بيانات ثابتة
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

  computed: {
    filteredSubDepartments() {
      return this.subDepartments.filter(s => s.departmentId === this.form.departmentId);
    },
    filteredSections() {
      return this.sections.filter(s => s.subDepartmentId === this.form.subDepartmentId);
    }
  },

  async mounted() {
    this.selectedEmployeeId = Number(this.$route.params.id);
    await this.fetchEmployeeAdministrative();
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
        transferType: "",
        transferFromEntityId: null,
        transferStartDate: "",
        transferEndDate: "",
        secondmentToEntityId: null,
        secondmentStartDate: "",
        secondmentEndDate: ""
      };
    },

    async fetchEmployeeAdministrative() {
      if (!this.selectedEmployeeId) return;

      try {
        const res = await api.get(`/EmployeeAdministrative/by-employee/${this.selectedEmployeeId}`);
        const data = res.data;

        this.employeeNumber = data.employeeId;

        const jobTitle = this.jobTitles.find(j => j.name === data.jobTitle) || this.jobTitles[0];
        const jobGrade = this.jobGrades.find(g => g.name === data.jobGrade) || this.jobGrades[0];

        this.form = {
          ...this.emptyForm(),
          id: data.id,
          jobStatus: data.jobStatus || JobStatus.Appointment,
          jobTitleId: jobTitle.id,
          jobGradeId: jobGrade.id,
          departmentId: this.departments.find(d => d.name === data.department)?.id || null,
          subDepartmentId: this.subDepartments.find(s => s.name === data.subDepartment)?.id || null,
          sectionId: this.sections.find(s => s.name === data.section)?.id || null,
          startWorkDate: data.startWorkDate?.split("T")[0] || "",
          workLocationId: this.workLocations.find(w => w.name === data.workLocation)?.id || null,
          leaveBalance: data.leaveBalance || 0,
          appointmentDate: data.appointmentDate?.split("T")[0] || null,
          contractStartDate: data.contractStartDate?.split("T")[0] || null,
          contractEndDate: data.contractEndDate?.split("T")[0] || null,
          transferType: data.transferType || null,
          transferFromEntityId: this.departments.find(d => d.name === data.transferFromEntity)?.id || null,
          transferStartDate: data.transferStartDate?.split("T")[0] || null,
          transferEndDate: data.transferEndDate?.split("T")[0] || null,
          secondmentToEntityId: this.departments.find(d => d.name === data.secondmentToEntity)?.id || null,
          secondmentStartDate: data.secondmentStartDate?.split("T")[0] || null,
          secondmentEndDate: data.secondmentEndDate?.split("T")[0] || null
        };

        this.formLoaded = true;
      } catch (err) {
        console.error(err);
        this.form = this.emptyForm();
        this.formLoaded = true;
      }
    },

    async updateAdministrative() {
      try {
        const payload = {
          employeeId: this.selectedEmployeeId,
          jobStatus: this.form.jobStatus,
          jobTitleId: this.form.jobTitleId,
          departmentId: this.form.departmentId,
          subDepartmentId: this.form.subDepartmentId,
          sectionId: this.form.sectionId,
          startWorkDate: this.form.startWorkDate,
          workLocationId: this.form.workLocationId,
          jobGradeId: this.form.jobGradeId,
          leaveBalance: this.form.leaveBalance,
          appointmentDate: this.form.jobStatus === JobStatus.Appointment ? this.form.appointmentDate : null,
          contractStartDate: this.form.jobStatus === JobStatus.Contract ? this.form.contractStartDate : null,
          contractEndDate: this.form.jobStatus === JobStatus.Contract ? this.form.contractEndDate : null,
          transferType: this.form.jobStatus === JobStatus.Transfer ? this.form.transferType : null,
          transferFromEntityId: this.form.jobStatus === JobStatus.Transfer ? this.form.transferFromEntityId : null,
          transferStartDate: this.form.jobStatus === JobStatus.Transfer ? this.form.transferStartDate : null,
          transferEndDate: this.form.jobStatus === JobStatus.Transfer ? this.form.transferEndDate : null,
          secondmentToEntityId: this.form.jobStatus === JobStatus.Secondment ? this.form.secondmentToEntityId : null,
          secondmentStartDate: this.form.jobStatus === JobStatus.Secondment ? this.form.secondmentStartDate : null,
          secondmentEndDate: this.form.jobStatus === JobStatus.Secondment ? this.form.secondmentEndDate : null
        };

        if (this.form.id) {
          await api.put(`/EmployeeAdministrative/${this.form.id}`, payload);
        } else {
          const res = await api.post(`/EmployeeAdministrative`, payload);
          this.form.id = res.data.id;
        }

        this.toastMessage = "✅ تم حفظ البيانات بنجاح";
        this.toastType = "success";
        this.showToast = true;
      } catch (err) {
        console.error(err.response?.data || err);
        this.toastMessage = "❌ فشل الحفظ – تأكد من البيانات";
        this.toastType = "error";
        this.showToast = true;
      }
    }
  }
};
</script>


<style scoped>
.input { @apply border rounded px-3 py-2 w-full; }
.label { @apply text-sm text-gray-700 mb-1 block; }
.bg-background { background-color: #f9fafb; }
</style>
