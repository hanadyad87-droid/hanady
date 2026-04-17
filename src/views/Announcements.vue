<template>
  <div class="flex min-h-screen bg-gray-100 font-cairo" dir="rtl">
    <!-- Sidebar -->
    <SidebarPage class="fixed top-0 right-0 h-screen w-24 md:w-64 z-50" />

    <!-- Main content -->
    <div class="flex-1 p-6 mr-24 md:mr-64">
      <Navbar />

      <!-- Card Container -->
      <div class="bg-white rounded-2xl shadow-lg p-6 mt-4">
        <!-- Header -->
        <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 class="text-xl font-bold text-gray-800"> الإعلانات</h2>
          <button
            @click="openAddModal"
            class="bg-primary hover:bg-green-700 text-white px-4 py-2 rounded-xl shadow transition-all flex items-center gap-2">
            <span>➕</span> إضافة إعلان جديد
          </button>
        </div>

        <!-- Search Bar -->
        <div class="mb-6">
          <input
            v-model="searchTable"
            placeholder="بحث بالعنوان أو محتوى الإعلان..."
            class="input w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
          />
        </div>

        <!-- Table -->
        <div class="overflow-x-auto rounded-lg border border-gray-200">
          <table class="min-w-full text-right divide-y divide-gray-200">
            <thead class="bg-navbar">
              <tr>
                <th class="p-3 text-sm font-semibold text-gray-600">#</th>
                <th class="p-3 text-sm font-semibold text-gray-600">العنوان</th>
                <th class="p-3 text-sm font-semibold text-gray-600">موجه لـ</th>
                <th class="p-3 text-sm font-semibold text-gray-600">التاريخ</th>
                <th class="p-3 text-sm font-semibold text-gray-600">الحالة</th>
                <th class="p-3 text-sm font-semibold text-gray-600 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="ann in filteredAnnouncements" :key="ann.id" class="hover:bg-gray-50 transition">
                <td class="p-3 text-sm">{{ ann.id }}</td>
                <td class="p-3 text-sm font-medium">
                  <div class="font-bold text-gray-800">{{ ann.title }}</div>
                  <div class="text-xs text-gray-500 truncate max-w-[200px]">{{ ann.message }}</div>
                </td>
                <td class="p-3 text-sm">
                  <span v-if="ann.targetAll" class="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs italic">الجميع</span>
                  <span v-else class="text-gray-600">{{ getDepartmentName(ann.targetDepartmentId) }}</span>
                </td>
                <td class="p-3 text-sm text-gray-500">{{ formatDate(ann.createdAt) }}</td>
                <td class="p-3 text-sm">
                  <span :class="ann.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
                        class="px-3 py-1 rounded-full text-xs font-bold">
                    {{ ann.active ? 'نشط' : 'متوقف' }}
                  </span>
                </td>
                <td class="p-3 text-sm flex justify-center gap-3">
                  <button @click="toggleStatus(ann)" :title="ann.active ? 'تعطيل' : 'تفعيل'" class="hover:scale-120 transition">
                   {{ ann.active ? '🚫' : '✅' }}
                  </button>
                  <button @click="editAnnouncement(ann)" class="text-blue-600 hover:scale-120 transition">✏️</button>
                  <button @click="askDelete(ann.id)" class="text-red-600 hover:scale-120 transition">🗑️</button>
                </td>
              </tr>
              <tr v-if="!filteredAnnouncements.length">
                <td colspan="6" class="text-center py-10 text-gray-400 italic">لا توجد إعلانات مسجلة</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal إضافة/تعديل -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex justify-center items-center z-[60] p-4">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h3 class="font-bold text-xl mb-4 text-gray-800">{{ isEdit ? 'تعديل الإعلان' : 'إضافة إعلان جديد' }}</h3>

        <div class="space-y-4 text-right">
          <div>
            <label class="block text-sm font-medium mb-1">عنوان الإعلان</label>
            <input v-model="form.title" type="text" class="input w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary" required />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">المحتوى</label>
            <textarea v-model="form.message" rows="3" class="input w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary" required></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">توجيه الإعلان</label>
            <div class="flex gap-4 p-2 bg-gray-50 rounded-lg">
              <label class="flex items-center gap-2 cursor-pointer text-sm">
                <input type="radio" :value="true" v-model="form.targetAll" @change="form.targetDepartmentId = null" class="accent-primary" /> الجميع
              </label>
              <label class="flex items-center gap-2 cursor-pointer text-sm">
                <input type="radio" :value="false" v-model="form.targetAll" class="accent-primary" /> إدارة محددة
              </label>
            </div>
          </div>

          <div v-if="!form.targetAll">
            <label class="block text-sm font-medium mb-1">اختر الإدارة</label>
            <select v-model="form.targetDepartmentId" class="input w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary">
              <option :value="null">اختر الإدارة المستهدفة</option>
              <option v-for="dept in departments" :key="dept.id" :value="dept.id">{{ dept.name }}</option>
            </select>
          </div>

          <div class="flex items-center gap-2 py-2">
            <input type="checkbox" v-model="form.active" id="activeStatus" class="w-4 h-4 accent-primary" />
            <label for="activeStatus" class="text-sm font-medium cursor-pointer">إعلان نشط (يظهر للموظفين)</label>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-8">
          <button @click="closeModal" class="bg-gray-200 px-5 py-2 rounded-lg font-medium hover:bg-gray-300 transition">إلغاء</button>
          <button @click="saveAnnouncement" class="bg-primary text-white px-8 py-2 rounded-lg font-bold hover:shadow-lg transition">
            {{ isEdit ? 'تحديث' : 'نشر الإعلان' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Confirm Delete Modal -->
    <div v-if="confirmDeleteId !== null" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
      <div class="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm text-center">
        <p class="mb-6 text-gray-700 font-bold">هل أنت متأكد من حذف هذا الإعلان نهائياً؟</p>
        <div class="flex justify-center gap-4">
          <button @click="confirmDeleteId = null" class="px-6 py-2 rounded-lg border border-gray-300">تراجع</button>
          <button @click="deleteAnnouncement(confirmDeleteId)" class="px-6 py-2 bg-red-600 text-white rounded-lg">تأكيد الحذف</button>
        </div>
      </div>
    </div>

    <ToastPage v-if="showToast" :message="toastMessage" :type="toastType" />
  </div>
</template>

<script>
import { ref, onMounted, computed } from "vue";
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

    const form = ref({
      id: null,
      title: "",
      message: "",
      targetAll: true,
      targetDepartmentId: null,
      active: true,
      createdAt: null
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
      if (!form.value.targetAll && !form.value.targetDepartmentId) {
        return toast("يرجى اختيار الإدارة المستهدفة", "error");
      }

      try {
        const payload = {
          title: form.value.title,
          message: form.value.message,
          targetAll: form.value.targetAll,
          targetDepartmentId: form.value.targetAll ? null : form.value.targetDepartmentId,
          active: form.value.active,
          createdAt: form.value.createdAt || new Date().toISOString()
        };

        if (isEdit.value) {
          await api.put(`/Announcements/${form.value.id}`, payload);
          toast("تم تحديث الإعلان بنجاح");
        } else {
          await api.post("/Announcements", payload);
          toast("تم نشر الإعلان بنجاح");
        }

        closeModal();
        fetchData();
      } catch (err) {
        toast("فشل في حفظ البيانات", "error");
      }
    };

    const toggleStatus = async (ann) => {
      try {
        const updatedAnn = { ...ann, active: !ann.active };
        await api.put(`/Announcements/${ann.id}`, updatedAnn);
        toast(`تم ${updatedAnn.active ? 'تفعيل' : 'تعطيل'} الإعلان`);
        fetchData();
      } catch (err) {
        toast("فشل في تغيير الحالة", "error");
      }
    };

    const askDelete = (id) => (confirmDeleteId.value = id);

    const deleteAnnouncement = async (id) => {
      try {
        await api.delete(`/Announcements/${id}`);
        toast("تم حذف الإعلان", "success");
        confirmDeleteId.value = null;
        fetchData();
      } catch (err) {
        toast("خطأ أثناء الحذف", "error");
      }
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
  

  return new Date(dateStr).toLocaleDateString('en-GB', {
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit'
  });
};

    onMounted(fetchData);

    return {
      announcements, departments, form, searchTable, filteredAnnouncements,
      showModal, isEdit, confirmDeleteId, showToast, toastMessage, toastType,
      openAddModal, editAnnouncement, saveAnnouncement, toggleStatus,
      askDelete, deleteAnnouncement, closeModal, formatDate, getDepartmentName
    };
  }
};
</script>

<style scoped>
.input { @apply bg-gray-50; }
</style>