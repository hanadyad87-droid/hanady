<template>
  <div dir="rtl" class="w-full">

    <!-- العنوان -->
    <h3 class="text-xl font-bold mb-4 text-right text-blue-800">
      البيانات الإدارية
    </h3>

    <!-- اختيار الموظف + رقم الموظف -->
    <div class="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-end">

      <!-- اختيار الاسم -->
      <div>     
        <label class="text-sm text-gray-600 mb-1">اختر الموظف</label>
        <select v-model="selectedEmployee" class="input text-left pr-2">
          <option :value="null">-- اختر الموظف --</option>
          <option v-for="e in employees" :key="e.id" :value="e">
            {{ e.fullName }}
          </option>
        </select>
      </div>

      <!-- رقم الموظف -->
      <div>
        <label class="text-sm text-gray-600 mb-1">رقم الموظف</label>
        <input 
          type="text" 
          v-model="employeeNumber"
          class="input bg-gray-100" 
          readonly 
          placeholder="رقم الموظف يظهر هنا"
        />
      </div>
    </div>

    <!-- الفورم -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

      <div class="flex flex-col">
        <label class="text-sm text-gray-600 mb-1">نوع العقد</label>
        <select v-model="form.contractType" class="input" :disabled="!canAdd">
          
          <option value="دائم">دائم</option>
          <option value="متعاقد">متعاقد</option>
        </select>
      </div>

      <div class="flex flex-col">
        <label class="text-sm text-gray-600 mb-1">رقم الملف</label>
        <input 
          type="text" 
          v-model="form.fileNumber" 
          class="input" 
          :disabled="!canAdd"
        />
      </div>

      <div class="flex flex-col">
        <label class="text-sm text-gray-600 mb-1">تاريخ بدء العقد</label>
        <input 
          type="date" 
          v-model="form.contractStartDate" 
          class="input" 
          :disabled="!canAdd"
        />
      </div>

      <div class="flex flex-col">
        <label class="text-sm text-gray-600 mb-1">تاريخ انتهاء العقد</label>
        <input 
          type="date" 
          v-model="form.contractEndDate" 
          class="input" 
          :disabled="!canAdd"
        />
      </div>

    </div>

    <!-- زر الحفظ -->
    <div class="flex justify-center mt-8">
      <button 
        @click="save"
        :disabled="!canAdd"
        class="bg-primary hover:bg-primaryDark disabled:bg-gray-400 text-white py-2 px-6 rounded-lg transition w-full max-w-xs">
        حفظ البيانات الإدارية
      </button>
    </div>

    <!-- Toast -->
    <Toast v-if="toastMessage" :message="toastMessage" :type="toastType" />

  </div>
</template>

<script>
import api from "../../services/api";
import Toast from "../Toast.vue";

export default {
  components: { Toast },
  data() {
    return {
      employees: [],
      selectedEmployee: null,
    

      hasAdministrativeData: false, // ⭐ مهم

      form: {
        contractType: "",
        fileNumber: "",
        contractStartDate: "",
        contractEndDate: ""
      },

      toastMessage: "",
      toastType: "success",
   

    };
    
  },
     computed: {
  canAdd() {
    return this.selectedEmployee && !this.hasAdministrativeData;
  }
},

  async mounted() {
    await this.fetchEmployees();
  },
watch: {
  async selectedEmployee(newVal) {
    this.employeeNumber = newVal ? newVal.id : "";
    this.hasAdministrativeData = false;

    if (newVal) {
      await this.checkAdministrativeData(newVal.id);
    }
  }
}
,

  methods: {
    async fetchEmployees() {
      try {
        const res = await api.get("/Employee/all");
        this.employees = res.data;
      } catch (err) {
        this.showToast("خطأ في جلب قائمة الموظفين", "error");
      }
    },

    async checkAdministrativeData(employeeId) {
      try {
        await api.get(`/EmployeeAdministrative/by-employee/${employeeId}`);

        // لو وصلنا هنا معناها البيانات موجودة
        this.hasAdministrativeData = true;
        this.showToast(
          "⚠️ هذا الموظف لديه بيانات إدارية مسجلة مسبقًا",
          "error"
        );
      } catch (err) {
        // 404 معناها ما عندهش بيانات → نكمل عادي
        if (err.response?.status !== 404) {
          this.showToast("خطأ أثناء التحقق من البيانات", "error");
        }
      }
    },

    async save() {
      if (!this.selectedEmployee) {
        this.showToast("الرجاء اختيار الموظف أولاً", "error");
        return;
      }

      if (this.hasAdministrativeData) {
        this.showToast(
          "❌ لا يمكن إضافة بيانات إدارية لموظف لديه بيانات مسبقًا",
          "error"
        );
        return;
      }

      const payload = {
        employeeId: this.selectedEmployee.id,
        contractType: this.form.contractType,
        fileNumber: this.form.fileNumber,
        contractStartDate: this.form.contractStartDate,
        contractEndDate: this.form.contractEndDate
      };

      try {
        await api.post("/EmployeeAdministrative", payload);
        this.showToast("تم حفظ البيانات الإدارية بنجاح ✅", "success");
        this.resetForm();
      } catch (err) {
        this.showToast(          "❌ لا يمكن إضافة بيانات إدارية لموظف لديه بيانات مسبقًا", "error");
      }
    },

    resetForm() {
      this.form = {
        contractType: "",
        fileNumber: "",
        contractStartDate: "",
        contractEndDate: ""
      };
      this.selectedEmployee = null;
      this.employeeNumber = "";
      this.hasAdministrativeData = false;
    },

    showToast(message, type) {
      this.toastMessage = message;
      this.toastType = type;

      setTimeout(() => {
        this.toastMessage = "";
      }, 3000);
    }
  }
};
</script>


<style scoped>
.input {
  @apply p-2 border rounded-lg;
}
</style>
