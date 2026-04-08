<template>
  <transition name="fade">
    <div v-if="visible" 
         class="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div :class="toastClasses" 
           class="px-6 py-3 rounded-lg shadow-lg pointer-events-auto text-center flex flex-col items-center gap-2">
        <span>{{ message }}</span>

        <!-- زر التأكيد فقط -->
        <button v-if="onConfirm" @click="handleConfirm"
                class="bg-black text-white px-4 py-1 rounded hover:bg-gray-800 mt-2">
          تأكيد
        </button>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: "ToastPage",
  props: {
    message: { type: String, required: true },
    type: { type: String, default: 'success' }, // success, error, info, warning
    duration: { type: Number, default: 3000 },
    onConfirm: { type: Function, default: null }
  },
  data() { return { visible: false }; },
  computed: {
    toastClasses() {
      switch(this.type) {
        case 'success': return 'bg-green-500 text-white';
        case 'error': return 'bg-red-500 text-white';
        case 'warning': return 'bg-yellow-400 text-black';
        case 'info': return 'bg-blue-500 text-white';
        default: return 'bg-white text-black';
      }
    }
  },
  methods: {
    show() { 
      this.visible = true; 
      if (!this.onConfirm) {
        setTimeout(() => { this.visible = false }, this.duration);
      }
    },
    handleConfirm() {
      if (this.onConfirm) this.onConfirm();
      this.visible = false;
    }
  },
  mounted() { this.show(); }
};
</script>

<style>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>