<template>
  <div class="flex min-h-screen bg-white">

    <!-- Sidebar -->
    <Sidebar class="fixed top-0 right-0 h-screen w-24 md:w-64 z-50" />

    <!-- المحتوى -->
    <div class="flex-1 p-6 mr-24 md:mr-64 flex flex-col">

      <Navbar />

      <!-- الصفحات المتسلسلة -->
      <div class="flex-1 flex items-start md:items-center justify-center">
        <BasicInfoPage 
          v-if="currentStep === 1" 
          @saved-basic="afterBasicSaved" 
        />
        <AdminInfoPage 
          v-if="currentStep === 2" 
          :employee-id="employeeId" 
          @saved-admin="afterAdminSaved" 
        />
        <EmployeeFinancialPage 
          v-if="currentStep === 3" 
          :employee-id="employeeId" 
          @saved-financial="afterFinancialSaved" 
        />
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from "@/components/Sidebar.vue";
import Navbar from "@/components/Navbar.vue";

import BasicInfoPage from "@/views/BasicInfoPage.vue";
import AdminInfoPage from "@/views/AdminInfoPage.vue";
import EmployeeFinancialPage from "@/views/EmployeeFinancialPage.vue";

export default {
  name: "AddEmployee",
  components: { Sidebar, Navbar, BasicInfoPage, AdminInfoPage, EmployeeFinancialPage },
  data() {
    return {
      employeeId: null,
      currentStep: 1, // 1=Basic, 2=Admin, 3=Financial
    };
  },
  methods: {
    afterBasicSaved(id) {
      this.employeeId = id;
      this.currentStep = 2; // الانتقال تلقائي للإدارية
    },
    afterAdminSaved() {
      this.currentStep = 3; // الانتقال تلقائي للمالية
    },
    afterFinancialSaved() {
      console.log("تم حفظ البيانات المالية بنجاح ✅");
      this.currentStep = 1; // اختياري: الرجوع للبداية أو إبقاء المالية ظاهرة
    }
  }
};
</script>

<style scoped>
.bg-primary { @apply bg-blue-600; }
.bg-primaryDark { @apply bg-blue-700; }
</style>