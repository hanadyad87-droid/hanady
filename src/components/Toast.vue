<template>
  <transition name="fade">
    <div v-if="visible" 
         class="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div :class="bgClass + ' text-white px-6 py-3 rounded-lg shadow-lg pointer-events-auto text-center flex flex-col items-center gap-2'">
        <span>{{ message }}</span>

        <!-- زر التأكيد يظهر إذا تم تمرير callback -->
        <button v-if="onConfirm" @click="handleConfirm"
                class="bg-white text-black px-4 py-1 rounded hover:bg-gray-200 mt-1">
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
    type: { type: String, default: 'success' }, // success / error / info
    duration: { type: Number, default: 3000 },
    onConfirm: { type: Function, default: null } // callback عند الضغط على زر التأكيد
  },
  data() { return { visible: false }; },
  computed: {
    bgClass() {
      switch(this.type){
        case 'error': return 'bg-red-600';
        case 'info': return 'bg-blue-600';
        default: return 'bg-green-600';
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
