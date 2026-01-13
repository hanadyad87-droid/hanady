<template>
  <div dir="rtl" class="flex min-h-screen bg-gray-100">

    <!-- Sidebar -->
    <Sidebar
      class="fixed top-0 right-0 h-screen w-24 sm:w-28 md:w-60 z-50"
    />

    <!-- المحتوى -->
    <div class="flex-1 mr-24 sm:mr-28 md:mr-60 p-4 sm:p-6">

      <!-- Navbar -->
      <Navbar />

      <!-- الكارد -->
      <div class="bg-white rounded-xl shadow p-6 max-w-4xl mx-auto mt-4">

        <!-- العنوان -->
        <h3 class="text-xl font-bold mb-6 text-right primary">
          المؤهل العلمي 
        </h3>

        <!-- الفورم -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <div class="flex flex-col">
            <label class="text-sm text-gray-600 mb-1">المؤهل العلمي</label>
            <input
              type="text"
              v-model="form.degree"
              class="input"
              placeholder="مثال: بكالوريوس"
            />
          </div>

          <div class="flex flex-col">
            <label class="text-sm text-gray-600 mb-1">التخصص</label>
            <input
              type="text"
              v-model="form.specialization"
              class="input"
              placeholder="مثال: علوم حاسوب"
            />
          </div>

          <div class="flex flex-col">
            <label class="text-sm text-gray-600 mb-1">الجامعة / المعهد</label>
            <input
              type="text"
              v-model="form.institution"
              class="input"
              placeholder="اسم الجهة التعليمية"
            />
          </div>

          <div class="flex flex-col">
            <label class="text-sm text-gray-600 mb-1">تاريخ التخرج</label>
            <input
              type="date"
              v-model="form.graduationDate"
              class="input"
            />
          </div>

        </div>

        <!-- زر الحفظ -->
        <div class="flex justify-center mt-8">
          <button
            @click="save"
           class="bg-primary hover:bg-primaryDark text-white py-2 px-6 rounded-lg transition w-full max-w-xs"
          >
            حفظ المؤهل العلمي
          </button>
        </div>

      </div>
    </div>

    <!-- Toast -->
    <transition name="fade">
      <div
        v-if="toastMessage"
        class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
               px-6 py-3 rounded-lg shadow-lg text-white text-center z-[999]"
        :class="toastType === 'success' ? 'bg-green-600' : 'bg-red-600'"
      >
        {{ toastMessage }}
      </div>
    </transition>

  </div>
</template>

<script>
import Sidebar from "../components/Sidebar.vue";
import Navbar from "../components/Navbar.vue";

export default {
  name: "QualificationInfo",
  components: { Sidebar, Navbar },
  data() {
    return {
      form: {
        degree: "",
        specialization: "",
        institution: "",
        graduationDate: ""
      },
      toastMessage: "",
      toastType: "success"
    };
  },
  methods: {
    save() {
      if (
        !this.form.degree ||
        !this.form.specialization ||
        !this.form.institution ||
        !this.form.graduationDate
      ) {
        this.toastMessage = "الرجاء ملء جميع الحقول ❌";
        this.toastType = "error";
        setTimeout(() => (this.toastMessage = ""), 3000);
        return;
      }

      this.toastMessage = "تم حفظ المؤهل العلمي ✅";
      this.toastType = "success";
      setTimeout(() => (this.toastMessage = ""), 3000);
    }
  }
};
</script>

<style scoped>
.input {
  @apply p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
