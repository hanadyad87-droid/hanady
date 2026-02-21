<template>
  <div class="flex min-h-screen bg-background" dir="rtl">
    <Sidebar class="fixed top-0 right-0 h-screen w-24 md:w-64 bg-primary text-white p-4 z-50" />

    <div class="flex-1 p-6 min-h-screen mr-24 md:mr-64">
      <Navbar />

      <div class="bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
        <h2 class="text-2xl font-bold mb-6 text-right">تعديل بيانات الموظف</h2>

        <form @submit.prevent="updateEmployee">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <label class="block mb-1 font-semibold">الاسم الكامل</label>
              <input v-model="employee.fullName" type="text" class="input" />
            </div>

            <div>
              <label class="block mb-1 font-semibold">رقم الموظف</label>
              <input v-model="employee.employeeNumber" type="text" class="input" />
            </div>

            <div>
              <label class="block mb-1 font-semibold">الهاتف 1</label>
              <input v-model="employee.phone1" type="text" class="input" />
            </div>

            <div>
              <label class="block mb-1 font-semibold">الهاتف 2</label>
              <input v-model="employee.phone2" type="text" class="input" />
            </div>

            <div>
              <label class="block mb-1 font-semibold">اسم الأم</label>
              <input v-model="employee.motherName" type="text" class="input" />
            </div>

            <div>
              <label class="block mb-1 font-semibold">الرقم الوطني</label>
              <input v-model="employee.nationalId" type="text" class="input" />
            </div>

            <div>
              <label class="block mb-1 font-semibold">تاريخ الميلاد</label>
              <input v-model="employee.birthDate" type="date" class="input" />
            </div>

            <div>
  <label class="block mb-1 font-semibold">الجنس</label>

  <div class="flex gap-6 mt-2">
    <label class="flex items-center gap-2">
      <input 
        type="radio" 
        value="ذكر" 
        v-model="employee.gender"
        
      />
      ذكر
    </label>

    <label class="flex items-center gap-2">
      <input 
        type="radio" 
        value="انثى" 
        v-model="employee.gender"
        
      />
      أنثى
    </label>
  </div>
</div>


            <div>
              <label class="block mb-1 font-semibold">الحالة الاجتماعية</label>
              <select v-model="employee.maritalStatusId" class="input">
                <option :value="1">أعزب</option>
                <option :value="2">متزوج</option>
                <option :value="3">مطلق</option>
                <option :value="4">أرمل</option>
              </select>
            </div>

            <div>
              <label class="block mb-1 font-semibold">الصورة</label>
              <input type="file" @change="handleFile" class="input" />
            </div>

          </div>

          <!-- زر الحفظ -->
    <div class="flex justify-center mt-8">
      <button
  type="submit"
  class="bg-primary hover:bg-primaryDark text-white py-2 px-6 rounded-lg transition w-full max-w-xs"
>
  حفظ البيانات الأساسية
</button>

    </div>

        </form>
      </div>
    </div>
  </div>
  <ToastPage
  v-if="showToast"
  :message="toastMessage"
  :type="toastType"
  @close="showToast = false"
/>

</template>

<script>
import axios from "axios";
import Sidebar from "@/components/Sidebar.vue";
import Navbar from "@/components/Navbar.vue";
import ToastPage from "@/components/Toast.vue";

export default {
  components: { Sidebar, Navbar, ToastPage },

  data() {
    return {
      employee: {
        employeeNumber: "",
        fullName: "",
        phone1: "",
        phone2: "",
        motherName: "",
        nationalId: "",
        birthDate: "",
        gender: "",
        maritalStatusId: 1,
        photoFile: null
      },
      originalEmployee: {}, // لتخزين البيانات الأصلية للمقارنة
      toastMessage: "",
      toastType: "success",
      showToast: false
    };
  },

  mounted() {
    this.fetchEmployee();
  },

  methods: {
    async fetchEmployee() {
      try {
        const id = this.$route.params.id;

        const response = await axios.get(
          `http://localhost:5205/api/Employee/details/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          }
        );

        const data = response.data;

        this.employee = {
          employeeNumber: data.employeeNumber,
          fullName: data.fullName,
          phone1: data.phone1,
          phone2: data.phone2,
          motherName: data.motherName,
          nationalId: data.nationalId,
          birthDate: data.birthDate?.substring(0, 10),
          gender: data.gender,
          maritalStatusId: 1,
          photoFile: null
        };

        // تخزين نسخة للمقارنة
        this.originalEmployee = { ...this.employee };

      } catch (error) {
        console.error("خطأ في جلب البيانات", error);
      }
    },

    handleFile(event) {
      this.employee.photoFile = event.target.files[0];
    },

    isChanged() {
      // تحقق من أي تغير في الحقول (باستثناء photoFile لأنها اختيارية)
      for (const key in this.employee) {
        if (key === "photoFile") continue;
        if (this.employee[key] !== this.originalEmployee[key]) return true;
      }
      // إذا تم اختيار صورة جديدة
      if (this.employee.photoFile) return true;
      return false;
    },

    async updateEmployee() {
      if (!this.isChanged()) {
        // لا يوجد تغييرات
        this.toastMessage = "لم يتم تعديل أي شيء ⚠️";
        this.toastType = "info";
        this.showToast = true;
        return;
      }

      try {
        const id = this.$route.params.id;
        const formData = new FormData();

        formData.append("EmployeeNumber", this.employee.employeeNumber);
        formData.append("FullName", this.employee.fullName);
        formData.append("Phone1", this.employee.phone1);
        formData.append("Phone2", this.employee.phone2);
        formData.append("MotherName", this.employee.motherName);
        formData.append("NationalId", this.employee.nationalId);
        formData.append("BirthDate", this.employee.birthDate);
        formData.append("Gender", this.employee.gender);
        formData.append("MaritalStatusId", this.employee.maritalStatusId);

        if (this.employee.photoFile) {
          formData.append("Photo", this.employee.photoFile);
        }

        await axios.put(
          `http://localhost:5205/api/Employee/update-full/${id}`,
          formData,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
          }
        );

        // إشعار نجاح
        this.toastMessage = "تم التحديث بنجاح ✅";
        this.toastType = "success";
        this.showToast = true;

        // تحديث النسخة الأصلية بعد الحفظ
        this.originalEmployee = { ...this.employee };
        this.employee.photoFile = null;

      } catch (error) {
        console.error("خطأ في التحديث", error.response?.data || error);
        this.toastMessage = "فشل في التحديث ❌";
        this.toastType = "error";
        this.showToast = true;
      }
    }
  }
};
</script>


<style scoped>
.input {
  width: 100%;
  border: 1px solid #ccc;
  padding: 8px;
  border-radius: 8px;
}
</style>
