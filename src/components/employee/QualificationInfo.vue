<template>
  <div dir="rtl" class="w-full">

    <!-- العنوان -->
    <h3 class="text-xl font-bold mb-4 text-right text-blue-800">
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
        class="bg-blue-800 hover:bg-blue-900 text-white px-8 py-2 rounded-lg transition w-full max-w-xs"
      >
        حفظ المؤهل العلمي
      </button>
    </div>

    <!-- Toast (نفس المالية بالضبط) -->
    <transition name="fade">
      <div
        v-if="toastMessage"
        class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
               px-6 py-3 rounded-lg shadow-lg text-white text-center"
        :class="toastType === 'success' ? 'bg-green-600' : 'bg-red-600'"
      >
        {{ toastMessage }}
      </div>
    </transition>

  </div>
</template>

<script>
export default {
  name: "QualificationInfo",
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
