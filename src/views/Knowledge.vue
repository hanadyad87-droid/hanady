<template>
  <div class="flex min-h-screen bg-background" dir="rtl">
    <Sidebar class="fixed top-0 right-0 h-screen w-24 md:w-64 bg-primary text-white p-4 z-50" />

    <div class="flex-1 p-6 mr-24 md:mr-64">
      <Navbar />

      <div class="bg-white rounded-xl shadow p-6 max-w-4xl mx-auto">
        <h2 class="text-2xl font-bold mb-2 text-right">مركز المعرفة</h2>
        <p class="text-gray-500 mb-6 text-right">مقالات، سياسات، وأدلة</p>

        <ul class="list-disc pr-6 space-y-2">
          <li>دليل الموظف</li>
          <li>سياسات العمل</li>
          <li>إجراءات إدارية</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from "@/components/Sidebar.vue";
import Navbar from "@/components/Navbar.vue";

export default {
  name: "KnowledgePage",
  components: { Sidebar, Navbar }
};
</script>
