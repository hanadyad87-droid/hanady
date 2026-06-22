<template>
  <div class="flex min-h-screen bg-gray-100 font-cairo" dir="rtl">
    <SidebarPage />

    <div class="flex-1 w-full min-w-0 p-4 sm:p-6 mr-0 lg:mr-60">
      <Navbar />

      <div class="bg-white rounded-2xl shadow-lg p-6 mt-4">
        <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 class="text-xl font-bold text-gray-800">المؤهل العلمي</h2>
          <button
            @click="openAddModal"
            class="bg-primary hover:bg-green-700 text-white px-4 py-2 rounded-xl shadow transition-all"
          >
            + إضافة مؤهل
          </button>
        </div>

        <input
          v-model="searchTable"
          placeholder="بحث في الجدول (اسم الموظف، المؤهل، المؤسسة)..."
          class="input w-full mb-4 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
        />

        <div class="overflow-x-auto rounded-lg border border-gray-200">
          <table class="min-w-full text-right divide-y divide-gray-200">
            <thead class="bg-navbar">
              <tr>
                <th class="p-3 text-sm font-semibold text-gray-600">الموظف</th>
                <th class="p-3 text-sm font-semibold text-gray-600">المؤهل</th>
                <th class="p-3 text-sm font-semibold text-gray-600">التخصص</th>
                <th class="p-3 text-sm font-semibold text-gray-600">المؤسسة</th>
                <th class="p-3 text-sm font-semibold text-gray-600">التاريخ</th>
                <th class="p-3 text-sm font-semibold text-gray-600">الإجراءات</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="edu in paginatedEducations" :key="edu.id || edu.Id" class="hover:bg-gray-50 transition">
                <td class="p-3 text-sm">{{ edu.employee || edu.Employee }}</td>
                <td class="p-3 text-sm">
                  {{ edu.qualification || edu.Qualification }}
                  <span v-if="edu.file || edu.File">
                    <a :href="edu.file || edu.File" target="_blank" class="mr-2 text-blue-500">📎</a>
                  </span>
                </td>
                <td class="p-3 text-sm">
                  <span :class="(edu.type || edu.Type) === 'Public' ? 'text-green-600' : 'text-purple-600'">
                    {{ (edu.type || edu.Type) === 'Public' ? 'عام' : 'خاص' }}
                  </span>
                </td>
                <td class="p-3 text-sm">{{ edu.institution || edu.Institution }}</td>
                <td class="p-3 text-sm text-gray-500">{{ formatDate(edu.createdAt || edu.CreatedAt) }}</td>
                <td class="p-3 text-sm flex gap-3">
                  <button @click="editEducation(edu)" class="text-blue-600 hover:scale-110 transition">✏️</button>
                  <button @click="askDelete(edu.id || edu.Id)" class="text-red-600 hover:scale-110 transition">🗑️</button>
                </td>
              </tr>
              <tr v-if="!paginatedEducations.length">
                <td colspan="6" class="text-center py-10 text-gray-400 italic">لا توجد بيانات متاحة</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex justify-between items-center mt-6">
          <button
            @click="changePage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-4 py-2 border rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium text-gray-700"
          >
            السابق
          </button>

          <span class="text-sm font-medium text-gray-600">
            صفحة <span class="text-primary font-bold">{{ currentPage }}</span> من {{ totalPages }}
          </span>

          <button
            @click="changePage(currentPage + 1)"
            :disabled="currentPage >= totalPages"
            class="px-4 py-2 border rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium text-gray-700"
          >
            التالي
          </button>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex justify-center items-center z-[60] p-4">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h3 class="font-bold text-xl mb-4 text-gray-800">{{ isEdit ? 'تعديل المؤهل العلمي' : 'إضافة مؤهل جديد' }}</h3>

        <div class="space-y-4">
          <div class="relative">
            <label class="block text-sm font-medium mb-1">الموظف</label>
            <div class="flex gap-2">
              <input 
                v-model="search" 
                :placeholder="form.employeeId ? 'تم اختيار الموظف' : 'ابحث عن موظف...'" 
                class="input w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                :disabled="form.employeeId !== null" 
              />
              <button v-if="form.employeeId" @click="resetEmployeeSelection" class="text-red-500 text-xs underline">تغيير</button>
            </div>
            <ul v-if="filteredEmployees.length && search.length > 0 && !form.employeeId" 
                class="absolute bg-white border w-full mt-1 rounded-lg shadow-xl max-h-40 overflow-y-auto z-[70]">
              <li v-for="emp in filteredEmployees" :key="emp.id"
                  @click="selectEmployee(emp)"
                  class="p-2 hover:bg-gray-100 cursor-pointer border-b last:border-0">
                {{ emp.fullName }}
              </li>
            </ul>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">المؤهل الدراسي</label>
            <select v-model="form.qualificationId" class="input w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary">
              <option :value="null">اختر المؤهل</option>
              <option v-for="q in qualifications" :key="q.id" :value="q.id">{{ q.name }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">نوع التخصص</label>
            <div class="flex gap-6 p-2 bg-gray-50 rounded-lg">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" value="Public" v-model="form.type" class="w-4 h-4 accent-primary" /> عام
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" value="Private" v-model="form.type" class="w-4 h-4 accent-primary" /> خاص
              </label>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">المؤسسة / الجامعة</label>
            <input v-model="form.institution" type="text" class="input w-full p-2 border rounded-lg" required />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">إرفاق الشهادة (اختياري)</label>
            <input type="file" @change="e => form.file = e.target.files[0]" class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-primary file:text-white cursor-pointer"/>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-8">
          <button @click="closeModal" class="bg-gray-200 px-5 py-2 rounded-lg font-medium hover:bg-gray-300 transition">إلغاء</button>
          <button @click="saveEducation" class="bg-primary text-white px-8 py-2 rounded-lg font-bold hover:shadow-lg transition">
            {{ isEdit ? 'تحديث' : 'حفظ' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="confirmDeleteId !== null" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
      <div class="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm text-center">
        <p class="mb-6 text-gray-700 font-bold">هل أنت متأكد من الحذف؟</p>
        <div class="flex justify-center gap-4">
          <button @click="confirmDeleteId = null" class="px-6 py-2 rounded-lg border border-gray-300">تراجع</button>
          <button @click="deleteEducation(confirmDeleteId)" class="px-6 py-2 bg-red-600 text-white rounded-lg">حذف</button>
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
  components: { SidebarPage, Navbar, ToastPage },

  setup() {
    const educations = ref([]);
    const employees = ref([]);
    const qualifications = ref([]);
    const showModal = ref(false);
    const isEdit = ref(false);
    const search = ref("");
    const searchTable = ref("");
    const confirmDeleteId = ref(null);

    // Pagination State
    const currentPage = ref(1);
    const itemsPerPage = ref(10);

    const form = ref({
      id: null,
      employeeId: null,
      qualificationId: null,
      type: "Public",
      institution: "",
      file: null
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
    const [edu, emp, qual] = await Promise.all([
      api.get("/EmployeeEducation/all"),
      api.get("/Employee/all"),
      api.get("/EmployeeEducation/qualifications")
    ]);

    educations.value = edu.data;
    employees.value = emp.data.employees || [];
    qualifications.value = qual.data;

  } catch (e) {
    toast("خطأ في تحميل البيانات", "error");
  }
};

    // 1. تصفية البيانات أولاً بناءً على محرك البحث
    const filteredEducations = computed(() => {
      const s = searchTable.value.toLowerCase();
      return educations.value.filter(e => 
        (e.employee || e.Employee || "").toLowerCase().includes(s) ||
        (e.qualification || e.Qualification || "").toLowerCase().includes(s) ||
        (e.institution || e.Institution || "").toLowerCase().includes(s)
      ).sort((a, b) => (b.id || 0) - (a.id || 0));
    });

    // 2. حساب إجمالي الصفحات بناءً على النتائج المفلترة
    const totalPages = computed(() => 
      Math.ceil(filteredEducations.value.length / itemsPerPage.value) || 1
    );

    // 3. استخراج بيانات الصفحة الحالية فقط
    const paginatedEducations = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value;
      const end = start + itemsPerPage.value;
      return filteredEducations.value.slice(start, end);
    });

    const changePage = (newPage) => {
      if (newPage < 1 || newPage > totalPages.value) return;
      currentPage.value = newPage;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // تصفير الصفحة عند البحث
    watch(searchTable, () => {
      currentPage.value = 1;
    });

    const filteredEmployees = computed(() =>
      employees.value.filter(e => e.fullName?.toLowerCase().includes(search.value.toLowerCase()))
    );

    const selectEmployee = (emp) => {
      form.value.employeeId = emp.id;
      search.value = emp.fullName;
    };

    const resetEmployeeSelection = () => {
      form.value.employeeId = null;
      search.value = "";
    };

    const openAddModal = () => {
      isEdit.value = false;
      resetForm();
      showModal.value = true;
    };

    const editEducation = (edu) => {
      isEdit.value = true;
      const empName = edu.employee || edu.Employee;
      const emp = employees.value.find(e => e.fullName === empName);
      const qualName = edu.qualification || edu.Qualification;
      const qual = qualifications.value.find(q => q.name === qualName);

      form.value = {
        id: edu.id || edu.Id,
        employeeId: emp ? emp.id : null,
        qualificationId: qual ? qual.id : null,
        type: edu.type || edu.Type || "Public",
        institution: edu.institution || edu.Institution || "",
        file: null
      };
      search.value = empName || "";
      showModal.value = true;
    };

    const saveEducation = async () => {
      if (!form.value.employeeId || !form.value.qualificationId || !form.value.institution) {
        return toast("يرجى ملء كافة الحقول الإجبارية", "error");
      }

      try {
        const formData = new FormData();
        formData.append("employeeId", Number(form.value.employeeId));
        formData.append("qualificationId", Number(form.value.qualificationId));
        formData.append("type", form.value.type);
        formData.append("institution", form.value.institution.trim());

        if (form.value.file && form.value.file instanceof File) {
          formData.append("file", form.value.file);
        }

        if (isEdit.value) {
          await api.put(`/EmployeeEducation/${form.value.id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        } else {
          await api.post("/EmployeeEducation", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }

        toast("تم حفظ البيانات بنجاح!");
        closeModal();
        fetchData();
      } catch (err) {
        const errors = err.response?.data?.errors;
        if (errors) {
          const firstErrorKey = Object.keys(errors)[0];
          const firstErrorMessage = errors[firstErrorKey][0];
          toast(`${firstErrorKey}: ${firstErrorMessage}`, "error");
        } else {
          toast("خطأ في الاتصال بالسيرفر", "error");
        }
      }
    };

    const askDelete = (id) => (confirmDeleteId.value = id);

    const deleteEducation = async (id) => {
      try {
        await api.delete(`/EmployeeEducation/${id}`);
        toast("تم الحذف");
        confirmDeleteId.value = null;
        fetchData();
      } catch (err) {
        toast("فشل الحذف", "error");
      }
    };

    const resetForm = () => {
      form.value = { id: null, employeeId: null, qualificationId: null, type: "Public", institution: "", file: null };
      search.value = "";
    };

    const closeModal = () => {
      showModal.value = false;
      resetForm();
    };

    const formatDate = (d) => d ? d.split("T")[0] : "---";

    onMounted(fetchData);

    return {
      educations, qualifications, employees, form, search, searchTable,
      filteredEmployees, showModal, isEdit, confirmDeleteId,
      selectEmployee, resetEmployeeSelection, openAddModal, editEducation, 
      saveEducation, askDelete, deleteEducation, closeModal, formatDate,
      showToast, toastMessage, toastType,
      currentPage, totalPages, paginatedEducations, changePage
    };
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
.font-cairo { font-family: 'Cairo', sans-serif; }
.input { @apply bg-gray-50; }
</style>