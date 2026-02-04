<template>
  <div class="flex min-h-screen bg-gray-100">
    <!-- Sidebar -->
    <Sidebar class="fixed top-0 right-0 h-screen w-24 md:w-64 z-50" />

    <div class="flex-1 p-6 mr-24 md:mr-64">
      <Navbar />

      <!-- العنوان + زر إضافة -->
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">الإعلانات</h2>
        <button @click="openAddModal"
                class="bg-primary hover:bg-primaryDark text-white px-4 py-2 rounded-lg flex items-center gap-2 transition">
          ➕ إضافة إعلان
        </button>
      </div>

      <!-- البحث -->
      <div class="bg-white p-4 rounded-xl shadow mb-6">
        <input v-model="search"
               placeholder="🔍 بحث بالعنوان أو المحتوى"
               class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" />
      </div>

      <!-- جدول الإعلانات -->
      <div class="bg-white rounded-xl shadow overflow-x-auto">
        <table class="w-full text-right text-sm border-collapse">
          <thead class="bg-gray-50">
            <tr>
              <th class="p-3">#</th>
              <th class="p-3">العنوان</th>
              <th class="p-3">المحتوى</th>
              <th class="p-3">موجه لـ</th>
              <th class="p-3">تاريخ الإنشاء</th>
              <th class="p-3">الحالة</th>
              <th class="p-3 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="announcement in filteredAnnouncements" :key="announcement.id"
                class="border-t hover:bg-gray-50 transition">
              <td class="p-3">{{ announcement.id }}</td>
              <td class="p-3 font-medium">{{ announcement.title }}</td>
              <td class="p-3 max-w-xs truncate">{{ announcement.message }}</td>
              <td class="p-3">
                <span v-if="announcement.targetAll">جميع الموظفين</span>
                <span v-else>{{ getDepartmentName(announcement.targetDepartmentId) }}</span>
              </td>
              <td class="p-3">{{ formatDate(announcement.createdAt) }}</td>
              <td class="p-3">
                <span :class="announcement.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                      class="px-3 py-1 rounded-full text-xs font-medium">
                  {{ announcement.active ? 'نشط' : 'غير نشط' }}
                </span>
              </td>
              <td class="p-3 text-center flex justify-center gap-2">
                <button @click="toggleStatus(announcement)"
                        :title="announcement.active ? 'تعطيل' : 'تفعيل'"
                        class="text-blue-600 hover:text-blue-800">
                  {{ announcement.active ? '⏸️' : '▶️' }}
                </button>
                <button @click="editAnnouncement(announcement)" title="تعديل"
                        class="text-yellow-600 hover:text-yellow-800">✏️</button>
                <button @click="confirmDeleteId = announcement.id" title="حذف"
                        class="text-red-600 hover:text-red-800">🗑️</button>
              </td>
            </tr>
            <tr v-if="(filteredAnnouncements || []).length === 0">
              <td colspan="7" class="p-6 text-center text-gray-500">لا توجد إعلانات</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- مودال إضافة/تعديل إعلان -->
      <div v-if="showAddModal || showEditModal"
           class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-lg">
          <h3 class="text-xl font-bold mb-4 text-gray-800">
            {{ showEditModal ? 'تعديل إعلان' : 'إضافة إعلان جديد' }}
          </h3>
          <form @submit.prevent="saveAnnouncement">
            <div class="space-y-4">
              <div>
                <label class="block text-gray-700 mb-2">العنوان</label>
                <input v-model="form.title" required class="input w-full" placeholder="أدخل عنوان الإعلان" />
              </div>
              <div>
                <label class="block text-gray-700 mb-2">المحتوى</label>
                <textarea v-model="form.message" required rows="4" class="input w-full"
                          placeholder="أدخل محتوى الإعلان"></textarea>
              </div>
              <div>
                <label class="block text-gray-700 mb-2">الموجه لـ</label>
                <div class="space-y-2">
                  <label class="flex items-center gap-2">
                    <input type="radio" v-model="form.targetAll" :value="true" @change="form.targetDepartmentId = null">
                    <span>جميع الموظفين</span>
                  </label>
                  <label class="flex items-center gap-2">
                    <input type="radio" v-model="form.targetAll" :value="false">
                    <span>إدارة محددة</span>
                  </label>
                  <select v-model="form.targetDepartmentId" :disabled="form.targetAll"
                          class="input w-full mt-2" :class="{ 'opacity-50': form.targetAll }">
                    <option value="">اختر الإدارة</option>
                    <option v-for="dept in departments" :key="dept.id" :value="dept.id">{{ dept.name }}</option>
                  </select>
                </div>
              </div>
              <div>
                <label class="flex items-center gap-2">
                  <input type="checkbox" v-model="form.active" class="rounded">
                  <span>إعلان نشط</span>
                </label>
              </div>
            </div>
            <div class="flex justify-end gap-3 mt-6">
              <button type="button" @click="closeModal"
                      class="px-4 py-2 text-gray-600 hover:text-gray-800">إلغاء</button>
              <button type="submit"
                      class="bg-primary hover:bg-primaryDark text-white px-4 py-2 rounded-lg transition">
                {{ showEditModal ? 'حفظ التعديلات' : 'إضافة' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- مودال تأكيد الحذف -->
      <div v-if="confirmDeleteId !== null" 
           class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm text-center">
          <p class="mb-4 text-gray-800">هل أنت متأكد أنك تريد حذف هذا الإعلان؟</p>
          <div class="flex justify-center gap-4">
            <button @click="confirmDeleteId = null" class="px-4 py-2 rounded border border-gray-300">إلغاء</button>
            <button @click="deleteAnnouncement(confirmDeleteId)" class="px-4 py-2 bg-red-600 text-white rounded">حذف</button>
          </div>
        </div>
      </div>

      <!-- توست -->
      <Toast v-if="toastMessage" 
             :key="toastKey"
             :message="toastMessage" 
             :type="toastType" 
             :duration="3000" />
    </div>
  </div>
</template>

<script>
import Sidebar from "../components/Sidebar.vue";
import Navbar from "../components/Navbar.vue";
import api from "../services/api";
import Toast from "../components/Toast.vue";

export default {
  name: "AnnouncementsList",
  components: { Sidebar, Navbar, Toast },
  data() {
    return {
      announcements: [],
      departments: [],
      search: "",
      showAddModal: false,
      showEditModal: false,
      editingId: null,
      confirmDeleteId: null,
      form: {
        title: "",
        message: "",
        targetAll: true,
        targetDepartmentId: null,
        active: true
      },
      toastMessage: "",
      toastType: "success",
      toastKey: 0
    };
  },
  computed: {
    filteredAnnouncements() {
      return (this.announcements || []).filter(ann => {
        return !this.search || ann.title.includes(this.search) || ann.message.includes(this.search);
      });
    }
  },
  mounted() {
    this.fetchDepartments();
    this.fetchAnnouncements();
  },
  methods: {
    async fetchAnnouncements(departmentId = null) {
      try {
        let url = "/Announcements";
        if(departmentId) url += `?departmentId=${departmentId}`;
        const { data } = await api.get(url);
        this.announcements = (data || []).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
      } catch(err) { console.error(err); }
    },
    async fetchDepartments() {
      try {
        const { data } = await api.get("/Department");
        this.departments = data || [];
      } catch(err){ console.error(err); }
    },
    getDepartmentName(id) {
      if(!id) return "غير محدد";
      const dept = (this.departments || []).find(d => d.id == id);
      return dept ? dept.name : "غير محدد";
    },
    formatDate(dateStr) {
      return new Date(dateStr).toLocaleDateString('ar-SA',{year:'numeric',month:'long',day:'numeric'});
    },
    openAddModal() {
      this.resetForm();
      this.showAddModal = true;
    },
    editAnnouncement(a) {
      this.form = { ...a };
      this.editingId = a.id;
      this.showEditModal = true;
    },
    closeModal() { 
      this.showAddModal = false; 
      this.showEditModal = false; 
      this.editingId = null; 
    },
    resetForm() { 
      this.form = { title:"", message:"", targetAll:true, targetDepartmentId:null, active:true }; 
    },
    showToast(msg, type="success") { 
      this.toastMessage = msg; 
      this.toastType = type; 
      this.toastKey++; 
    },
    async saveAnnouncement() {
      if(!this.form.targetAll && !this.form.targetDepartmentId){
        this.showToast('اختر الإدارة إذا كان الإعلان لإدارة محددة', 'error');
        return;
      }
      try {
        const url = this.showEditModal ? `/Announcements/${this.editingId}` : '/Announcements';
        const method = this.showEditModal ? 'put' : 'post';
        const { data } = await api[method](url, this.form);

        if(this.showEditModal){
          const index = this.announcements.findIndex(a => a.id === this.editingId);
          if(index !== -1) this.announcements[index] = data;
          this.showToast('تم تعديل الإعلان بنجاح', 'success');
        } else {
          this.announcements.unshift(data);
          this.showToast('تم إضافة الإعلان بنجاح', 'success');
        }

        this.closeModal();
        this.resetForm();
      } catch(err) {
        console.error(err);
        this.showToast('حدث خطأ أثناء الحفظ', 'error');
      }
    },
    async toggleStatus(a) {
      try {
        const { data } = await api.put(`/Announcements/${a.id}`, { ...a, active: !a.active });
        const index = this.announcements.findIndex(x => x.id === a.id);
        if(index !== -1) this.announcements[index] = data;
        this.showToast('تم تغيير حالة الإعلان', 'success');
      } catch(err) {
        console.error(err);
        this.showToast('خطأ في تغيير الحالة', 'error');
      }
    },
    async deleteAnnouncement(id) {
      try {
        await api.delete(`/Announcements/${id}`);
        this.announcements = (this.announcements || []).filter(a => a.id !== id);
        this.showToast('تم حذف الإعلان', 'error'); // يظهر باللون الأحمر
        this.confirmDeleteId = null;
      } catch(err) {
        console.error(err);
        this.showToast('خطأ أثناء الحذف', 'error');
      }
    }
  }
};
</script>

<style scoped>
.input { @apply p-2 border rounded-lg w-full text-right focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.5s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
