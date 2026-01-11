<template>
  <div class="flex min-h-screen bg-gray-100">

    <!-- Sidebar -->
    <SidebarPage class="fixed top-0 right-0 h-screen w-24 md:w-64 z-50" />

    <!-- المحتوى الرئيسي -->
    <div class="flex-1 p-6 mr-24 md:mr-64 text-right">

      <div class="card p-6 bg-white rounded-xl shadow-lg" dir="rtl">
        <h3 class="text-xl font-bold text-blue-800 mb-4">الطلبات</h3>

        <!-- اختيار نوع الطلب -->
        <div class="mb-6">
          <select v-model="selectedRequest" class="w-full md:w-1/2 p-2 border rounded-lg border-gray-300">
            <option value="">كل الطلبات</option>
            <option value="update">طلب تعديل بيانات</option>
            <option value="transfer">طلب نقل قسم</option>
            <option value="permission">طلب إذن خروج</option>
            <option value="training">طلب دورة تدريبية</option>
            <option value="marriage">طلب زواج</option>
            <option value="internet">طلب إنترنت</option>
            <option value="maintenance">طلب صيانة</option>
          </select>
        </div>

        <!-- عرض المكون حسب الاختيار -->
        <UpdateInfo v-if="selectedRequest === 'update'" :employee="employee" />
        <TransferRequest v-if="selectedRequest === 'transfer'" :employee="employee" />
        <PermissionRequest v-if="selectedRequest === 'permission'" :employee="employee" />
        <TrainingRequest v-if="selectedRequest === 'training'" :employee="employee" />
        <MarriageRequest v-if="selectedRequest === 'marriage'" :employee="employee" />
        <InternetRequest v-if="selectedRequest === 'internet'" :employee="employee" />
        <MaintenanceRequest v-if="selectedRequest === 'maintenance'" :employee="employee" />

        <!-- الجدول العام لبقية الطلبات -->
        <div class="overflow-x-auto mt-6" v-if="!selectedRequest">
          <table class="min-w-full divide-y divide-gray-200 text-right">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-2 text-sm font-medium text-gray-700">رقم الطلب</th>
                <th class="px-4 py-2 text-sm font-medium text-gray-700">التاريخ</th>
                <th class="px-4 py-2 text-sm font-medium text-gray-700">نوع الطلب</th>
                <th class="px-4 py-2 text-sm font-medium text-gray-700">الحالة</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="req in allRequests" :key="req.id" class="hover:bg-gray-50">
                <td class="px-4 py-2 text-sm text-gray-700">{{ req.id }}</td>
                <td class="px-4 py-2 text-sm text-gray-700">{{ req.date }}</td>
                <td class="px-4 py-2 text-sm text-gray-700">{{ req.typeName }}</td>
                <td class="px-4 py-2 text-sm" 
                    :class="{
                      'text-green-600': req.status==='مقبول',
                      'text-red-600': req.status==='مرفوض',
                      'text-yellow-600': req.status==='تحت المراجعة'
                    }">
                  {{ req.status }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>

  </div>
</template>

<script>
import SidebarPage from "../components/Sidebar.vue";
import UpdateInfo from "../components/requests/UpdateInfo.vue";
import TransferRequest from "../components/requests/TransferRequest.vue";
import PermissionRequest from "../components/requests/PermissionRequest.vue";
import TrainingRequest from "../components/requests/TrainingRequest.vue";
import MarriageRequest from "../components/requests/MarriageRequest.vue";
import InternetRequest from "../components/requests/InternetRequest.vue";
import MaintenanceRequest from "../components/requests/MaintenanceRequest.vue";

export default {
  name: "RequestsPage",
  components: {
    SidebarPage,
    UpdateInfo,
    TransferRequest,
    PermissionRequest,
    TrainingRequest,
    MarriageRequest,
    InternetRequest,
    MaintenanceRequest
  },
  data() {
    return {
      selectedRequest: "",
      employee: {
        FullName: "هند عبدالله",
        NationalId: "12345678",
        BirthDate: "1995-01-01",
        Gender: "أنثى",
        Department: "الموارد البشرية",
        JobTitle: "موظف"
      },
      allRequests: [
        { id: 1, type: "update", typeName:"طلب تعديل بيانات", date: "2026-01-05", status: "مقبول" },
        { id: 2, type: "transfer", typeName:"طلب نقل قسم", date: "2026-01-06", status: "تحت المراجعة" },
        { id: 3, type: "permission", typeName:"طلب إذن خروج", date: "2026-01-07", status: "مرفوض" },
        { id: 4, type: "training", typeName:"طلب دورة تدريبية", date: "2026-01-08", status: "مقبول" },
        { id: 5, type: "marriage", typeName:"طلب زواج", date: "2026-01-09", status: "مقبول" },
        { id: 6, type: "internet", typeName:"طلب إنترنت", date: "2026-01-10", status: "تحت المراجعة" },
        { id: 7, type: "maintenance", typeName:"طلب صيانة", date: "2026-01-11", status: "تحت المراجعة" }
      ]
    };
  }
};
</script>
