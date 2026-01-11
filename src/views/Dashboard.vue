<template>
  <div class="flex min-h-screen bg-background">

    <!-- Sidebar ثابتة على اليمين -->
    <Sidebar class="fixed top-0 right-0 h-screen w-24 md:w-64 bg-primary text-white p-4 z-50" />

    <!-- المحتوى الرئيسي -->
    <div class="flex-1 p-6 min-h-screen"
         :class="{'mr-24 md:mr-64': true}"> <!-- مسافة ديناميكية حسب عرض Sidebar -->

      <!-- Top Bar -->
      <div class="flex justify-between items-center mb-6 gap-4">
        <div class="relative text-2xl cursor-pointer">
          🔔
          <span class="absolute -top-1 -right-2 bg-red-500 text-white rounded-full px-1 text-xs">3</span>
        </div>
        <input
          type="text"
          placeholder="بحث..."
          class="px-3 py-2 border rounded-lg w-1/3 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <!-- بطاقة الترحيب -->
      <div class="bg-white rounded-xl shadow-lg p-6 text-right mb-6">
        <p class="text-lg font-bold text-primary">مرحباً hanady</p>
        <p class="text-gray-500 text-sm">آخر دخول: اليوم</p>
      </div>

      <!-- شبكة البطاقات -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

    

        <!-- بطاقة الموظف -->
        <div class="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
          <img :src="userImg" class="w-24 h-24 rounded-full border-4 border-blue-300 mb-2" />
          <h3 class="font-bold text-lg">موظف برمجة</h3>
          <p class="text-gray-500 text-sm mb-4">موظف</p>
          <button @click="$router.push('/leaves')" class="w-full bg-primary text-white py-2 rounded-lg mb-2 hover:bg-blue-900 transition">تقديم طلب إجازة ➕</button>
          <button class="w-full bg-secondary text-white py-2 rounded-lg mb-2 hover:bg-orange-600 transition">تقديم طلب استئذان ⏱️</button>
          <button @click="showModal = true" class="w-full bg-red-200 text-red-700 py-2 rounded-lg hover:bg-red-300 transition">تغيير كلمة المرور 🔒</button>
        </div>

      </div>

      <!-- المودال -->
      <div v-if="showModal" class="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
        <div class="bg-white rounded-xl p-6 w-80">
          <h3 class="text-lg font-bold mb-4">تغيير كلمة المرور</h3>
          <div class="flex flex-col gap-3 mb-4">
            <input type="password" v-model="currentPassword" placeholder="الرمز الحالي" class="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
            <input type="password" v-model="newPassword" placeholder="الرمز الجديد" class="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
            <input type="password" v-model="confirmPassword" placeholder="تأكيد الرمز الجديد" class="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div class="flex justify-between gap-2">
            <button @click="closeModal" class="w-1/2 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition">إغلاق</button>
            <button @click="savePassword" class="w-1/2 bg-primary text-white py-2 rounded-lg hover:bg-blue-900 transition">حفظ</button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import Sidebar from "../components/Sidebar.vue";
import userImage from '../assets/user.png';

export default {
  name: "DashboardPage",
  components: { Sidebar },
  data() {
    return {
      userImg: userImage,
      showModal: false,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  },
  methods: {
    closeModal() {
      this.showModal = false;
      this.currentPassword = '';
      this.newPassword = '';
      this.confirmPassword = '';
    },
    savePassword() {
      if (this.newPassword !== this.confirmPassword) {
        alert('كلمة المرور الجديدة وتأكيدها غير متطابقة!');
        return;
      }
      alert('تم تغيير كلمة المرور بنجاح!');
      this.closeModal();
    }
  }
};
</script>

<style>
/* transition fade */
.fade-enter-active, .fade-leave-active {
  transition: all 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateX(10px);
}
</style>
