<template>
  <div class="flex min-h-screen bg-gray-100 font-cairo" dir="rtl">
    <Sidebar />

    <div class="flex-1 w-full min-w-0 p-4 sm:p-6 mr-0 lg:mr-60">
      <Navbar />

      <div class="bg-white rounded-2xl shadow-lg p-6 mt-4">

        <!-- HEADER -->
        <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div>
            <h2 class="text-xl font-bold text-gray-800">الإجازات</h2>
            <p class="text-sm text-gray-500 mt-1">
              رصيد الإجازات:
              <span class="font-bold text-green-600">{{ balance }} يوم</span>
            </p>
          </div>

          <button
            @click="openAddModal"
            class="bg-primary hover:bg-green-700 text-white px-5 py-2 rounded-xl"
          >
            طلب إجازة
          </button>
        </div>

        <!-- TABLE -->
        <div class="overflow-x-auto border rounded-lg">
          <table class="min-w-full text-right">

            <thead class="bg-navbar">
              <tr>
                <th class="p-3">النوع</th>
                <th class="p-3">من</th>
                <th class="p-3">إلى</th>
                <th class="p-3">الحالة</th>
                
              </tr>
            </thead>

            <tbody>
              <tr v-for="l in paginatedLeaves" :key="l.id" class="border-t">
                <td class="p-3">{{ l.leaveType }}</td>
                <td class="p-3">{{ formatDate(l.fromDate) }}</td>
                <td class="p-3">{{ formatDate(l.toDate) }}</td>

                <td class="p-3">
                  <span :class="statusClass(l.status)">
                    {{ l.status }}
                  </span>
                </td>

                
              </tr>

              <tr v-if="!paginatedLeaves.length">
                <td colspan="5" class="text-center p-6 text-gray-400">
                  لا توجد طلبات
                </td>
              </tr>
            </tbody>

          </table>
        </div>

        <!-- PAGINATION -->
        <div class="flex justify-between items-center mt-4">

          <button
            class="px-3 py-1 border rounded"
            :disabled="currentPage === 1"
            @click="currentPage--"
          >
            السابق
          </button>

          <span>
            صفحة {{ currentPage }} من {{ totalPages }}
          </span>

          <button
            class="px-3 py-1 border rounded"
            :disabled="currentPage === totalPages"
            @click="currentPage++"
          >
            التالي
          </button>

        </div>

      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from "../components/Sidebar.vue";
import Navbar from "../components/Navbar.vue";
import api from "../services/api";

export default {
  components: { Sidebar, Navbar },

  data() {
    return {
      previousLeaves: [],
      balance: 0,

      currentPage: 1,
      pageSize: 5,
    };
  },

  computed: {
    totalPages() {
      return Math.ceil(this.previousLeaves.length / this.pageSize) || 1;
    },

    paginatedLeaves() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.previousLeaves.slice(start, start + this.pageSize);
    }
  },

  async mounted() {
    await this.fetchPreviousLeaves();
  },

  methods: {

    // =========================
    // LOAD DATA
    // =========================
    async fetchPreviousLeaves() {
      const res = await api.get("/leave-requests/my-requests");

      this.previousLeaves = res.data.requests || [];
      this.balance = res.data.balance || 0;

      this.currentPage = 1; // reset pagination
    },

    // =========================
    // FORMAT
    // =========================
    formatDate(d) {
      return d ? d.slice(0, 10) : "-";
    },

    statusClass(status) {
      if (status?.includes("مقبولة")) {
        return "text-green-600 font-bold";
      }
      if (status?.includes("مرفوض")) {
        return "text-red-600 font-bold";
      }
      if (status?.includes("بانتظار")) {
        return "text-yellow-600 font-bold";
      }
      return "text-gray-600";
    },

    // =========================
    // MODAL (لو تحتاجه لاحقاً)
    // =========================
    openAddModal() {
      console.log("open modal");
    }
  }
};
</script>