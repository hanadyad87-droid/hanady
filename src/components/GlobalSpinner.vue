<template>
  <transition name="fade">
    <div
      v-if="loadingStore.isLoading"
      class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-sm"
      aria-live="polite"
      aria-busy="true"
    >
      <div class="rounded-2xl bg-white/90 px-8 py-6 shadow-2xl border border-white/40 flex flex-col items-center gap-3">
        <div class="spinner" />
        <div class="text-sm font-bold text-gray-700">جارٍ التحميل...</div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { loadingStore } from "@/stores/loadingStore";
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.spinner {
  width: 46px;
  height: 46px;
  border-radius: 999px;
  border: 4px solid rgba(22, 90, 64, 0.18);
  border-top-color: rgba(22, 90, 64, 0.95);
  animation: spin 0.85s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>

