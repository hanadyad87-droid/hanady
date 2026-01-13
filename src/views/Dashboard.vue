<template>
  <div class="flex min-h-screen bg-background" dir="rtl" >

    <!-- Sidebar -->
    <Sidebar class="fixed top-0 right-0 h-screen w-24 md:w-64 bg-primary text-white p-4 z-50" />

    <!-- المحتوى -->
    <div class="flex-1 min-h-screen p-6 mr-24 md:mr-64">

      <!-- Navbar -->
      <Navbar />

      <!-- كرت الترحيب -->
      <div class="bg-white rounded-xl shadow p-6 mb-6 text-right">
        <p class="text-lg font-bold text-primary">مرحباً Hanady 👋</p>
        <p class="text-gray-500 text-sm">آخر دخول: اليوم</p>
      </div>

      <!-- Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <!-- بطاقة المستخدم -->
        <div class="bg-white rounded-xl shadow p-6 flex flex-col items-center">
          <img :src="userImg" class="w-24 h-24 rounded-full border mb-3" />
          <h3 class="font-bold text-lg">موظف برمجة</h3>
          <p class="text-gray-500 text-sm mb-4">Employee</p>

          
        </div>

        <!-- رسم بياني الإجازات -->
        <div class="bg-white rounded-xl shadow p-6 col-span-2">
          <h3 class="font-bold mb-4 text-right">الإجازات خلال السنة</h3>

          <div class="space-y-3">
            <div>
              <p class="text-sm">إجازة مرضية</p>
              <div class="w-full bg-gray-200 rounded">
                <div class="bg-blue-600 h-3 rounded w-2/3"></div>
              </div>
            </div>

            <div>
              <p class="text-sm">إجازة سنوية</p>
              <div class="w-full bg-gray-200 rounded">
                <div class="bg-green-500 h-3 rounded w-1/2"></div>
              </div>
            </div>

            <div>
              <p class="text-sm">إجازة طارئة</p>
              <div class="w-full bg-gray-200 rounded">
                <div class="bg-red-500 h-3 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- الطلبات -->
        <div class="bg-white rounded-xl shadow p-6 col-span-3">
          <h3 class="font-bold mb-4 text-right">ملخص الطلبات</h3>

          <div class="grid grid-cols-3 gap-4 text-center">
            <div class="bg-blue-100 p-4 rounded">
              <p class="text-2xl font-bold">5</p>
              <p class="text-sm">طلبات جديدة</p>
            </div>
            <div class="bg-green-100 p-4 rounded">
              <p class="text-2xl font-bold">12</p>
              <p class="text-sm">طلبات مقبولة</p>
            </div>
            <div class="bg-red-100 p-4 rounded">
              <p class="text-2xl font-bold">2</p>
              <p class="text-sm">طلبات مرفوضة</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from "../components/Sidebar.vue";
import Navbar from "../components/Navbar.vue";
import userImage from "../assets/user.png";

export default {
  name: "DashboardPage",
  components: { Sidebar, Navbar },
  data() {
    return {
      userImg: userImage
    };
  }
};
</script>
