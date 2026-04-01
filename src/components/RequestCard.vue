<template>
  <div class="bg-white p-3 rounded-lg shadow-sm flex flex-col gap-2 text-right text-sm">
    <!-- عنوان الكارد -->
    <h4 class="font-semibold text-gray-800">{{ title }}</h4>

    <!-- الطلبات مع الحالة -->
    <div v-if="requests && requests.length" class="space-y-1">
      <div
        v-for="(count, status) in requestCounts"
        :key="status"
        class="flex justify-between items-center bg-gray-50 p-1.5 rounded-lg border border-gray-200"
      >
        <span class="text-gray-700 font-medium">{{ status }}</span>
        <span class="text-blue-600 font-bold">{{ count }} ({{ getPercentage(count) }}%)</span>
      </div>
    </div>

    <!-- حالة عدم وجود طلبات -->
    <div v-else class="text-gray-400 text-center py-2">
      لا توجد طلبات
    </div>
  </div>
</template>

<script>
export default {
  name: "RequestCard",
  props: {
    title: { type: String, required: true },
    requests: { type: Array, default: () => [] },
  },
  computed: {
    requestCounts() {
      const counts = {};
      this.requests.forEach(r => {
        const status = r.status || "بدون حالة";
        counts[status] = (counts[status] || 0) + 1;
      });
      return counts;
    },
    totalRequests() {
      return this.requests.length;
    }
  },
  methods: {
    getPercentage(count) {
      if (!this.totalRequests) return 0;
      return ((count / this.totalRequests) * 100).toFixed(0);
    }
  }
};
</script>

<style scoped>
/* عند تمرير الماوس، الكارد يبرز */
div.bg-white:hover {
  transform: translateY(-2px);
  transition: transform 0.2s ease;
}
</style>