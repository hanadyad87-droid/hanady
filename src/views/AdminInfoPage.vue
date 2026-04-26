<template>
  <div class="flex min-h-screen bg-gray-100 font-cairo" dir="rtl">
    <Sidebar />

    <div class="flex-1 w-full min-w-0 p-4 sm:p-6 mr-0 lg:mr-60">
      <Navbar />

      <div class="bg-white p-8 rounded-2xl shadow-lg max-w-5xl mx-auto mt-6 border border-gray-100">
        <div class="border-b pb-4 mb-8 flex justify-between items-center">
          <h2 class="text-2xl font-bold text-gray-800">البيانات الإدارية</h2>
          <div class="flex gap-2">
            <span class="text-sm font-medium bg-blue-50 text-blue-600 px-3 py-1 rounded-full">ID: {{ employeeNumber }}</span>
            <span class="text-sm font-medium bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{{ employeeName }}</span>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          
          <div class="flex flex-col">
            <label class="label text-gray-700 font-bold mb-2">الصفة الوظيفية</label>
            <select v-model.number="form.jobTitleId" class="input-modern">
              <option :value="null">اختر الصفة...</option>
              <option v-for="j in jobTitles" :key="j.id" :value="j.id">{{ j.name }}</option>
            </select>
          </div>

          <div class="flex flex-col">
            <label class="label text-gray-700 font-bold mb-2">الإدارة</label>
            <select v-model.number="form.departmentId" class="input-modern">
              <option :value="null">اختر الإدارة...</option>
              <option v-for="d in departments" :key="d.id" :value="d.id">{{ d.name }}</option>
            </select>
          </div>

          <div class="flex flex-col">
            <label class="label text-gray-700 font-bold mb-2">الإدارة الفرعية</label>
            <select v-model.number="form.subDepartmentId" class="input-modern">
              <option :value="null">اختر الإدارة الفرعية...</option>
              <option v-for="s in subDepartments" :key="s.id" :value="s.id">{{ s.name }}</option>
            </select>
          </div>

          <div class="flex flex-col">
            <label class="label text-gray-700 font-bold mb-2">القسم</label>
            <select v-model.number="form.sectionId" class="input-modern">
              <option :value="null">اختر القسم...</option>
              <option v-for="s in sections" :key="s.id" :value="s.id">{{ s.name }}</option>
            </select>
          </div>

          <div class="flex flex-col">
            <label class="label text-gray-700 font-bold mb-2">موقع العمل</label>
            <select v-model.number="form.workLocationId" class="input-modern">
              <option :value="null">اختر الموقع...</option>
              <option v-for="w in workLocations" :key="w.id" :value="w.id">{{ w.name }}</option>
            </select>
          </div>

          <div class="flex flex-col">
            <label class="label text-gray-700 font-bold mb-2">الدرجة الوظيفية</label>
            <select v-model.number="form.jobGradeId" class="input-modern">
              <option :value="null">اختر الدرجة...</option>
              <option v-for="g in jobGrades" :key="g.id" :value="g.id">{{ g.name }}</option>
            </select>
          </div>

          <div class="flex flex-col">
            <label class="label text-gray-700 font-bold mb-2">تاريخ المباشرة</label>
            <input type="date" v-model="form.startWorkDate" class="input-modern" />
          </div>

          <div class="flex flex-col">
            <label class="label text-gray-700 font-bold mb-2">رصيد الإجازات</label>
            <input type="number" v-model.number="form.leaveBalance" class="input-modern" placeholder="0" />
          </div>
        </div>

        <div class="mt-10 bg-gray-50 p-6 rounded-2xl border border-gray-200">
          <h4 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span class="w-2 h-6 bg-primary rounded-full"></span>
            الوضع الوظيفي الحالي
          </h4>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="flex flex-col">
              <label class="label font-bold mb-2">نوع التبعية</label>
              <select v-model="form.jobStatus" class="input-modern bg-white">
                <option value="Appointment">تعيين</option>
                <option value="Contract">متعاقد</option>
                <option value="Transfer">منتدب</option>
                <option value="Secondment">إعارة</option>
              </select>
            </div>

            <div v-if="form.jobStatus === JobStatus.Appointment" class="flex flex-col animate-fade-in">
              <label class="label font-bold mb-2">تاريخ التعيين</label>
              <input type="date" v-model="form.appointmentDate" class="input-modern bg-white" />
            </div>

            <template v-if="form.jobStatus === JobStatus.Contract">
              <div class="flex flex-col animate-fade-in">
                <label class="label font-bold mb-2">بداية العقد</label>
                <input type="date" v-model="form.contractStartDate" class="input-modern bg-white" />
              </div>
              <div class="flex flex-col animate-fade-in">
                <label class="label font-bold mb-2">نهاية العقد</label>
                <input type="date" v-model="form.contractEndDate" class="input-modern bg-white" />
              </div>
            </template>

            <template v-if="form.jobStatus === JobStatus.Transfer">
              <div class="flex flex-col animate-fade-in">
                <label class="label font-bold mb-2">نوع الانتداب</label>
                <div class="flex gap-4 p-2 bg-white rounded-xl border border-gray-200 h-[50px] items-center px-4">
                  <label class="flex items-center gap-2 cursor-pointer grow">
                    <input type="checkbox" value="كلي" v-model="transferTypeSelection" @change="onTransferTypeChange" class="w-5 h-5 accent-primary" />
                    <span class="text-sm">كلي</span>
                  </label>
                  <div class="w-px bg-gray-200 h-6"></div>
                  <label class="flex items-center gap-2 cursor-pointer grow">
                    <input type="checkbox" value="جزئي" v-model="transferTypeSelection" @change="onTransferTypeChange" class="w-5 h-5 accent-primary" />
                    <span class="text-sm">جزئي</span>
                  </label>
                </div>
              </div>
              <div class="flex flex-col animate-fade-in">
                <label class="label font-bold mb-2">الجهة المنتدب منها</label>
       <select v-model.number="form.transferFromOrganizationId" class="input-modern bg-white">
  <option :value="null">اختر الجهة...</option>
  <option v-for="o in organizations" :key="o.id" :value="o.id">{{ o.name }}</option>
</select>
              </div>
              <div class="flex flex-col animate-fade-in">
                <label class="label font-bold mb-2">بداية الانتداب</label>
                <input type="date" v-model="form.transferStartDate" class="input-modern bg-white" />
              </div>
              <div class="flex flex-col animate-fade-in">
                <label class="label font-bold mb-2">نهاية الانتداب</label>
                <input type="date" v-model="form.transferEndDate" class="input-modern bg-white" />
              </div>
            </template>

            <template v-if="form.jobStatus === JobStatus.Secondment">
              <div class="flex flex-col animate-fade-in">
                <label class="label font-bold mb-2">الجهة المعار إليها</label>
                <select v-model.number="form.secondmentToOrganizationId" class="input-modern bg-white">
  <option :value="null">اختر الجهة...</option>
  <option v-for="o in organizations" :key="o.id" :value="o.id">{{ o.name }}</option>
</select>
              </div>
              <div class="flex flex-col animate-fade-in">
                <label class="label font-bold mb-2">بداية الإعارة</label>
                <input type="date" v-model="form.secondmentStartDate" class="input-modern bg-white" />
              </div>
              <div class="flex flex-col animate-fade-in">
                <label class="label font-bold mb-2">نهاية الإعارة</label>
                <input type="date" v-model="form.secondmentEndDate" class="input-modern bg-white" />
              </div>
            </template>
          </div>
        </div>

        <div class="flex justify-center gap-4 mt-12">
          <button @click="save" :disabled="loading"
                  class="bg-primary hover:bg-green-700 text-white font-bold py-3 px-16 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50">
            <span v-if="loading">جاري الحفظ...</span>
            <span v-else>حفظ البيانات الإدارية</span>
          </button>
        </div>
      </div>
    </div>

    <Toast v-if="toast.visible" :message="toast.message" :type="toast.type" />
  </div>
</template>

<script>
import Sidebar from "@/components/Sidebar.vue";
import Navbar from "@/components/Navbar.vue";
import Toast from "@/components/Toast.vue";
import api from "@/services/api";

const JobStatus = {
  Appointment: "Appointment",
  Contract: "Contract",
  Transfer: "Transfer",
  Secondment: "Secondment"
};

export default {
  name: "AdminInfoPage",
  components: { Sidebar, Navbar, Toast },
  props: ["publicId"],

  data() {
    return {
      JobStatus,
      loading: false,
      employeeName: "",
      employeeNumber: "",
      employeePublicIdInternal: null,

      form: this.emptyForm(),
      transferTypeSelection: [],

      toast: { visible: false, message: "", type: "success" },
organizations: [],
      departments: [],
      subDepartments: [],
      sections: [],
      workLocations: [],
      jobTitles: [],
      jobGrades: [],

      isEdit: false,
      lookupsLoaded: false
    };
  },

  watch: {
    publicId: {
      immediate: true,
      handler(val) {
        if (val) {
          this.employeePublicIdInternal = val;
          this.initPage();
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
        transferType: "",
    transferFromOrganizationId: null,
        transferStartDate: "",
        transferEndDate: "",
      secondmentToOrganizationId: null,
        secondmentStartDate: "",
        secondmentEndDate: ""
      };
    },

    async initPage() {
      await this.loadLookups();
      await this.loadEmployeeData(this.employeePublicIdInternal);
    },

    async loadLookups() {
      try {
        const [jt, d, sd, s, w, g, org] = await Promise.all([
  api.get("/JobTitle"),
  api.get("/Organization/Departments"),
  api.get("/Organization/SubDepartments"),
  api.get("/Organization/Sections"),
  api.get("/WorkLocation"),
  api.get("/JobGrade"),
  api.get("/organizations") // 🔥 الجديد
]);

this.organizations = org.data;

        this.jobTitles = jt.data;
        this.departments = d.data;
        this.subDepartments = sd.data;
        this.sections = s.data;
        this.workLocations = w.data;
        this.jobGrades = g.data;

        this.lookupsLoaded = true;
      } catch (e) {
        this.showToast("❌ خطأ في تحميل بيانات الاختيارات", "error");
      }
    },

    async loadEmployeeData(publicId) {
      if (!this.lookupsLoaded) return;
      try {
        this.loading = true;
        const emp = await api.get(`/Employee/details/${publicId}`);
        this.employeeName = emp.data.fullName;
        this.employeeNumber = emp.data.employeeNumber;

        const res = await api.get(`/EmployeeAdministrative/by-publicid/${publicId}`);
        if (res.data) {
          this.isEdit = true;
          const d = res.data;
          this.form = {
            ...d,
            startWorkDate: this.formatDate(d.startWorkDate),
            appointmentDate: this.formatDate(d.appointmentDate),
            contractStartDate: this.formatDate(d.contractStartDate),
            contractEndDate: this.formatDate(d.contractEndDate),
            transferStartDate: this.formatDate(d.transferStartDate),
            transferEndDate: this.formatDate(d.transferEndDate),
            secondmentStartDate: this.formatDate(d.secondmentStartDate),
            secondmentEndDate: this.formatDate(d.secondmentEndDate)
          };
          this.transferTypeSelection = d.transferType ? d.transferType.split(",") : [];
        }
      } catch (e) {
        console.error(e);
      } finally { this.loading = false; }
    },

    formatDate(d) { return d ? d.split("T")[0] : ""; },

    onTransferTypeChange() {
      this.form.transferType = this.transferTypeSelection.join(",");
    },

    async save() {
      const clean = (v) => (v === "" || v === undefined) ? null : v;
      
     const payload = {
  employeePublicId: this.employeePublicIdInternal,
  ...this.form,

  // تنظيف القيم
  startWorkDate: clean(this.form.startWorkDate),
  appointmentDate: this.form.jobStatus === "Appointment" ? clean(this.form.appointmentDate) : null,

  contractStartDate: this.form.jobStatus === "Contract" ? clean(this.form.contractStartDate) : null,
  contractEndDate: this.form.jobStatus === "Contract" ? clean(this.form.contractEndDate) : null,

  transferStartDate: this.form.jobStatus === "Transfer" ? clean(this.form.transferStartDate) : null,
  transferEndDate: this.form.jobStatus === "Transfer" ? clean(this.form.transferEndDate) : null,
  transferType: this.form.jobStatus === "Transfer" ? clean(this.form.transferType) : null,

  secondmentStartDate: this.form.jobStatus === "Secondment" ? clean(this.form.secondmentStartDate) : null,
  secondmentEndDate: this.form.jobStatus === "Secondment" ? clean(this.form.secondmentEndDate) : null
};

      try {
        this.loading = true;
        if (this.isEdit) {
          await api.put(`/EmployeeAdministrative/${this.employeePublicIdInternal}`, payload);
          this.showToast("تم تحديث البيانات الإدارية بنجاح ✅", "success");
        } else {
          await api.post(`/EmployeeAdministrative`, payload);
          this.showToast("تم حفظ البيانات الإدارية بنجاح جاري النقل للبيانات المالية", "success");
        }

        setTimeout(() => {
          this.$router.push({
            name: "EmployeeFinancial",
            params: { publicId: this.employeePublicIdInternal }
          });
        }, 1500);

      } catch (err) {
        this.showToast("❌ حدث خطأ أثناء الحفظ", "error");
      } finally { this.loading = false; }
    },

    showToast(message, type) {
      this.toast = { visible: true, message, type };
      setTimeout(() => this.toast.visible = false, 3000);
    }
  }
};
</script>

<style scoped>
.input-modern { 
  @apply w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-right bg-gray-50 text-gray-700; 
}
.label { @apply text-sm font-bold text-gray-600; }

.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>