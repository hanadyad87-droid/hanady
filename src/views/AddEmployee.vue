<template>
  <div class="flex min-h-screen bg-gray-100">
    <Sidebar class="fixed top-0 right-0 h-screen w-24 md:w-64 z-50" />
    <div class="flex-1 p-6 min-h-screen mr-24 md:mr-64">
      <Navbar />

      <!-- التابات -->
      <div class="flex flex-nowrap gap-2 mb-4 overflow-x-auto justify-start sticky top-16 bg-gray-100 z-40">
        <button
          v-for="tab in tabs"
          :key="tab.name"
          @click="switchTab(tab.name)"
          :class="[
            'flex-shrink-0 rounded-lg transition text-sm md:text-base px-3 md:px-4 py-2',
            currentTab === tab.name ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-primaryDark'
          ]"
        >
          {{ tab.name }}
        </button>
      </div>

      <keep-alive>
        <component 
          :is="currentComponent"
          :employee-id="employeeId"
          @saved-basic="afterBasicSaved"
          @saved-admin="afterAdminSaved"
          @saved-financial="afterFinancialSaved"
        />
      </keep-alive>
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
      currentTab: "البيانات الأساسية",
      tabs: [
        { name: "البيانات الأساسية", component: BasicInfoPage },
        { name: "البيانات الإدارية", component: AdminInfoPage },
        { name: "البيانات المالية", component: EmployeeFinancialPage },
      ],
    };
  },
  computed: {
    currentComponent() {
      const tab = this.tabs.find(t => t.name === this.currentTab);
      return tab ? tab.component : null;
    },
  },
  methods: {
    switchTab(name) {
      this.currentTab = name;
    },
    afterBasicSaved(id) {
      this.employeeId = id;
      this.currentTab = "البيانات الإدارية"; // الانتقال تلقائي للإدارية
    },
    afterAdminSaved() {
      this.currentTab = "البيانات المالية"; // الانتقال تلقائي للمالية
    },
    afterFinancialSaved() {
      console.log("تم حفظ البيانات المالية بنجاح ✅");
    }
  }
};
</script>

<style scoped>
.bg-primary { @apply bg-blue-600; }
.bg-primaryDark { @apply bg-blue-700; }
</style>