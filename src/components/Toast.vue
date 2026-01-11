<!-- components/Toast.vue -->
<template>
  <transition name="fade">
    <div v-if="visible" 
         class="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div :class="bgClass + ' text-white px-6 py-3 rounded-lg shadow-lg pointer-events-auto'">
        {{ message }}
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
    duration: { type: Number, default: 2000 }
  },
  data() {
    return { visible: false };
  },
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
      setTimeout(() => { this.visible = false }, this.duration);
    }
  },
  mounted() { this.show(); }
};
</script>

<style>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
