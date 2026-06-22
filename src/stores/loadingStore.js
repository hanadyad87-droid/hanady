import { reactive } from "vue";

export const loadingStore = reactive({
  pending: 0,
  get isLoading() {
    return this.pending > 0;
  },
  start() {
    this.pending += 1;
  },
  stop() {
    this.pending = Math.max(0, this.pending - 1);
  }
});

