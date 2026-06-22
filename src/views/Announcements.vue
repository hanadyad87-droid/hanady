<template>
  <div class="flex min-h-screen bg-gray-100 font-cairo" dir="rtl">
    <SidebarPage />

    <div class="flex-1 w-full min-w-0 p-4 sm:p-6 mr-0 lg:mr-60">
      <Navbar />

      <div class="bg-white rounded-2xl shadow-lg p-6 mt-4">
        <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 class="text-xl font-bold text-gray-800"> الإعلانات</h2>
          <button
            @click="openAddModal"
            class="bg-primary hover:bg-green-700 text-white px-5 py-2 rounded-xl shadow transition-all flex items-center gap-2"
          >
            <span class="text-lg">+</span> إضافة إعلان جديد
          </button>
        </div>

        <div class="mb-6 relative">
          <input
            v-model="searchTable"
            placeholder="بحث بالعنوان أو محتوى الإعلان..."
            class="input w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all"
          />
          <span class="absolute inset-y-0 left-3 flex items-center text-gray-400">
            🔍
          </span>
        </div>

        <div class="overflow-x-auto rounded-lg border border-gray-200">
          <table class="min-w-full text-right divide-y divide-gray-200">
            <thead class="bg-navbar">
              <tr>
                <th class="p-3 text-sm font-semibold text-gray-600">العنوان</th>
                <th class="p-3 text-sm font-semibold text-gray-600">موجه لـ</th>
                <th class="p-3 text-sm font-semibold text-gray-600 text-center">التاريخ</th>
                <th class="p-3 text-sm font-semibold text-gray-600 text-center">الحالة</th>
                <th class="p-3 text-sm font-semibold text-gray-600 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="ann in paginatedAnnouncements" :key="ann.id" class="hover:bg-gray-50 transition">
                <td class="p-3 text-sm">
                  <div class="font-bold text-gray-800">{{ ann.title }}</div>
                  <div class="text-xs text-gray-500 truncate max-w-[300px]">{{ ann.message }}</div>
                </td>
                <td class="p-3 text-sm">
                  <span v-if="ann.targetAll" class="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-semibold">📢 الجميع</span>
                  <span v-else class="text-gray-600 flex items-center gap-1">
                    🏢 {{ getDepartmentName(ann.targetDepartmentId) }}
                  </span>
                </td>
                <td class="p-3 text-sm text-gray-500 text-center">{{ formatDate(ann.createdAt) }}</td>
                <td class="p-3 text-sm text-center">
                  <span :class="ann.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
                        class="px-3 py-1 rounded-full text-[11px] font-bold">
                    {{ ann.active ? 'نشط' : 'متوقف' }}
                  </span>
                </td>
                <td class="p-3 text-sm flex justify-center gap-4">
                  <button @click="toggleStatus(ann)" :title="ann.active ? 'تعطيل' : 'تفعيل'" class="hover:scale-125 transition">
                   {{ ann.active ? '🚫' : '✅' }}
                  </button>
                  <button @click="editAnnouncement(ann)" class="text-blue-600 hover:scale-125 transition" title="تعديل">✏️</button>
                  <button @click="askDelete(ann.id)" class="text-red-600 hover:scale-125 transition" title="حذف">🗑️</button>
                </td>
              </tr>
              <tr v-if="!filteredAnnouncements.length">
                <td colspan="5" class="text-center py-12 text-gray-400 italic">لا توجد إعلانات تطابق بحثك</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4" v-if="totalPages > 1">
          <div class="text-sm text-gray-600">
            عرض <span class="font-bold text-gray-800">{{ paginatedAnnouncements.length }}</span> من إجمالي <span class="font-bold text-gray-800">{{ filteredAnnouncements.length }}</span> إعلان
          </div>
          
          <div class="flex items-center gap-2">
            <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="px-4 py-2 border rounded-xl disabled:opacity-30 hover:bg-gray-50 transition text-sm font-bold"
            >
              السابق
            </button>
            
            <div class="flex gap-1">
              <button 
                v-for="page in totalPages" 
                :key="page"
                @click="currentPage = page"
                :class="['px-3 py-1 rounded-lg text-sm transition-all', currentPage === page ? 'bg-primary text-white shadow-md' : 'hover:bg-gray-100']"
              >
                {{ page }}
              </button>
            </div>

            <button
              @click="currentPage++"
              :disabled="currentPage >= totalPages"
              class="px-4 py-2 border rounded-xl disabled:opacity-30 hover:bg-gray-50 transition text-sm font-bold"
            >
              التالي
            </button>
          </div>
        </div>
      </div>
    </div>
<!-- Modal Add/Edit -->
<div
  v-if="showModal"
  class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
>
  <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
    <h3 class="text-xl font-bold mb-6">
      {{ isEdit ? "تعديل الإعلان" : "إضافة إعلان جديد" }}
    </h3>

    <div class="space-y-4">

      <div>
        <label class="block mb-1 text-sm font-medium">
          عنوان الإعلان
        </label>
        <input
          v-model="form.title"
          type="text"
          class="w-full border rounded-lg p-3"
        />
      </div>

      <div>
        <label class="block mb-1 text-sm font-medium">
          محتوى الإعلان
        </label>
        <textarea
          v-model="form.message"
          rows="4"
          class="w-full border rounded-lg p-3"
        ></textarea>
      </div>

      <div class="flex items-center gap-2">
        <input
          type="checkbox"
          v-model="form.targetAll"
        />
        <label>إرسال لجميع الموظفين</label>
      </div>

      <div v-if="!form.targetAll">
        <label class="block mb-1 text-sm font-medium">
          القسم
        </label>

        <select
          v-model="form.targetDepartmentId"
          class="w-full border rounded-lg p-3"
        >
          <option :value="null">اختر القسم</option>

          <option
            v-for="dept in departments"
            :key="dept.id"
            :value="dept.id"
          >
            {{ dept.name }}
          </option>
        </select>
      </div>

      <div>
        <label class="block mb-1 text-sm font-medium">
          تاريخ انتهاء الإعلان
        </label>

        <input
          type="datetime-local"
          v-model="form.expiryDate"
          class="w-full border rounded-lg p-3"
        />
      </div>

      <div class="flex items-center gap-2">
        <input
          type="checkbox"
          v-model="form.active"
        />
        <label>نشط</label>
      </div>

    </div>

    <div class="flex justify-end gap-3 mt-6">
      <button
        @click="closeModal"
        class="px-5 py-2 rounded-lg bg-gray-200"
      >
        إلغاء
      </button>

      <button
        @click="saveAnnouncement"
        class="px-5 py-2 rounded-lg bg-primary text-white"
      >
        {{ isEdit ? "تحديث" : "حفظ" }}
      </button>
    </div>
  </div>
</div>
    <ToastPage v-if="showToast" :message="toastMessage" :type="toastType" />
  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from "vue";
import SidebarPage from "@/components/Sidebar.vue";
import Navbar from "@/components/Navbar.vue";
import ToastPage from "@/components/Toast.vue";
import api from "@/services/api";

export default {
  name: "AnnouncementsList",
  components: { SidebarPage, Navbar, ToastPage },

  setup() {
    const announcements = ref([]);
    const departments = ref([]);
    const showModal = ref(false);
    const isEdit = ref(false);
    const searchTable = ref("");
    const confirmDeleteId = ref(null);

    // --- Pagination Logic ---
    const currentPage = ref(1);
    const pageSize = 7; // عدد العناصر في كل صفحة

   const form = ref({
  id: null,
  title: "",
  message: "",
  targetAll: true,
  targetDepartmentId: null,
  expiryDate: "",
  active: true
});

    const showToast = ref(false);
    const toastMessage = ref("");
    const toastType = ref("success");

    const toast = (msg, type = "success") => {
      toastMessage.value = msg;
      toastType.value = type;
      showToast.value = true;
      setTimeout(() => (showToast.value = false), 3000);
    };

    const fetchData = async () => {
      try {
        const [annRes, deptRes] = await Promise.all([
          api.get("/Announcements"),
          api.get("/Organization/Departments")
        ]);
        announcements.value = (annRes.data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        departments.value = deptRes.data || [];
      } catch (e) {
        toast("خطأ في جلب البيانات", "error");
      }
    };

    const filteredAnnouncements = computed(() => {
      const s = searchTable.value.toLowerCase();
      return announcements.value.filter(a => 
        (a.title || "").toLowerCase().includes(s) ||
        (a.message || "").toLowerCase().includes(s)
      );
    });

    // حساب إجمالي الصفحات
    const totalPages = computed(() => Math.ceil(filteredAnnouncements.value.length / pageSize));

    // استقطاع البيانات للصفحة الحالية فقط
    const paginatedAnnouncements = computed(() => {
      const start = (currentPage.value - 1) * pageSize;
      const end = start + pageSize;
      return filteredAnnouncements.value.slice(start, end);
    });

    // إعادة التصفير للصفحة الأولى عند البحث
    watch(searchTable, () => {
      currentPage.value = 1;
    });

    // بقية الدوال (getDepartmentName, openAddModal, editAnnouncement, saveAnnouncement, toggleStatus, askDelete, deleteAnnouncement, closeModal, formatDate)
    // ... [توضع هنا كما في الكود السابق]

    const getDepartmentName = (id) => {
      if (!id) return "---";
      const dept = departments.value.find(d => d.id == id);
      return dept ? dept.name : "غير معروف";
    };

    const openAddModal = () => {
      isEdit.value = false;
      resetForm();
      showModal.value = true;
    };

    const editAnnouncement = (ann) => {
      isEdit.value = true;
      form.value = { ...ann };
      showModal.value = true;
    };

    const saveAnnouncement = async () => {
      if (!form.value.title || !form.value.message) {
        return toast("يرجى كتابة العنوان والمحتوى", "error");
      }
      try {
       const payload = {
  title: form.value.title,
  message: form.value.message,
  targetAll: form.value.targetAll,
 targetDepartmentId: form.value.targetAll
  ? null
  : Number(form.value.targetDepartmentId),
  expiryDate: form.value.expiryDate,
  active: form.value.active
};

        if (isEdit.value) {
          await api.put(`/Announcements/${form.value.id}`, payload);
          toast("تم التحديث");
        } else {
          await api.post("/Announcements", payload);
          toast("تم النشر");
        }
        closeModal();
        fetchData();
      } catch (err) {
        toast("خطأ في الحفظ", "error");
      }
    };

    const toggleStatus = async (ann) => {
      try {
        const updatedAnn = { ...ann, active: !ann.active };
        await api.put(`/Announcements/${ann.id}`, updatedAnn);
        toast(`تم التغيير بنجاح`);
        fetchData();
      } catch (err) { toast("فشل التغيير", "error"); }
    };

    const askDelete = (id) => (confirmDeleteId.value = id);
    const deleteAnnouncement = async (id) => {
      try {
        await api.delete(`/Announcements/${id}`);
        toast("تم الحذف");
        confirmDeleteId.value = null;
        fetchData();
      } catch (err) { toast("خطأ في الحذف", "error"); }
    };

    const resetForm = () => {
      form.value = { id: null, title: "", message: "", targetAll: true, targetDepartmentId: null, active: true, createdAt: null };
    };

    const closeModal = () => {
      showModal.value = false;
      resetForm();
    };

    const formatDate = (dateStr) => {
      if (!dateStr) return "---";
      return new Date(dateStr).toLocaleDateString('en-GB');
    };

    onMounted(fetchData);

    return {
      announcements, departments, form, searchTable, filteredAnnouncements,
      paginatedAnnouncements, currentPage, totalPages,
      showModal, isEdit, confirmDeleteId, showToast, toastMessage, toastType,
      openAddModal, editAnnouncement, saveAnnouncement, toggleStatus,
      askDelete, deleteAnnouncement, closeModal, formatDate, getDepartmentName
    };
  }
};
</script>