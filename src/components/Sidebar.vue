<template>
  <aside
    dir="rtl"
    class="fixed top-0 right-0 z-[50] flex h-screen flex-col border-l border-white/10 bg-gradient-to-b from-primary via-[#165a40] to-primary shadow-xl transition-transform duration-300 ease-out lg:translate-x-0"
    :class="[
      isMobileOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0',
      'w-[min(18rem,88vw)] lg:w-60',
    ]"
  >
    <Teleport to="body">
      <div
        v-if="isMobileOpen"
        class="fixed inset-0 z-[45] bg-slate-900/50 backdrop-blur-sm lg:hidden"
        aria-hidden="true"
        @click="closeMobile"
      />
    </Teleport>

    <div class="flex flex-col items-center border-b border-white/10 px-3 py-4">
      <div
        class="mb-2 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-white/30 bg-white/10 shadow-lg sm:h-20 sm:w-20"
      >
        <img src="@/assets/image.png" alt="شعار" class="h-full w-full object-cover" />
      </div>
      <h2 class="w-full border-b border-white/20 pb-2 text-center text-xs font-bold tracking-wide text-white sm:text-sm">
        هيئة الرقابة الإدارية
      </h2>
      <button
        type="button"
        class="mt-3 flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-white/90 hover:bg-white/10 lg:hidden"
        @click="closeMobile"
      >
        <XMarkIcon class="h-5 w-5" />
        إغلاق
      </button>
    </div>

    <nav class="flex-1 overflow-y-auto px-2 py-3">
      <ul class="flex flex-col gap-0.5">
        <li v-for="link in normalLinks" :key="link.path" class="w-full">
          <router-link
            :to="link.path"
            class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
            :class="[
              $route.path === link.path
                ? 'bg-white/20 text-white'
                : 'text-white/90 hover:bg-white/10',
            ]"
            @click="closeMobile"
          >
            <component :is="link.icon" class="h-5 w-5 shrink-0 opacity-95" aria-hidden="true" />
            <span class="leading-snug">{{ link.name }}</span>
          </router-link>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script>
import {
  HomeIcon,
  UsersIcon,
  PaperAirplaneIcon,
  DocumentTextIcon,
  BuildingOffice2Icon,
  UserPlusIcon,
  AcademicCapIcon,
  FolderIcon,
  ChatBubbleLeftRightIcon,
  MegaphoneIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  ClipboardDocumentCheckIcon,
  BriefcaseIcon,
  ArrowPathRoundedSquareIcon,
  ChartBarIcon,
  DocumentDuplicateIcon,
  BookOpenIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/vue/24/outline";
import { XMarkIcon } from "@heroicons/vue/24/solid";

const TOGGLE = "hrms:toggle-sidebar";
const CLOSE = "hrms:close-sidebar";

export default {
  name: "SidebarPage",

  components: { XMarkIcon },

  data() {
    return {
      roles: [],
      isMobileOpen: false,
      sidebarToggleHandler: null,
      sidebarCloseHandler: null,
    };
  },

  computed: {
    normalLinks() {
      const links = [
        { name: "الرئيسية", path: "/dashboard", icon: HomeIcon, roles: [1, 2, 3, 4, 5, 6] },
        { name: "الموظفين", path: "/employees", icon: UsersIcon, roles: [1] },
        { name: "الإجازات", path: "/leaves", icon: PaperAirplaneIcon, roles: [5, 4, 6] },
        { name: "الطلبات", path: "/requests", icon: DocumentTextIcon, roles: [1, 2, 3, 4, 5, 6] },
        { name: "إدارة الإدارات", path: "/departments", icon: BuildingOffice2Icon, roles: [1] },
        { name: "تعيين المدراء", path: "/assign-managers", icon: UserPlusIcon, roles: [1] },
        { name: "المؤهل العلمي", path: "/employee-qualification", icon: AcademicCapIcon, roles: [1] },
        { name: "إدارة الإجازات", path: "/manager/leaves", icon: FolderIcon, roles: [2, 3, 4, 5] },
        { name: "الشكاوى", path: "/complaints", icon: ChatBubbleLeftRightIcon, roles: [3, 4, 5, 6] },
        { name: "ادارة الشكاوي", path: "/manager/complaints", icon: ClipboardDocumentListIcon, roles: [3, 4, 5] },
        { name: "الإعلانات", path: "/announcements", icon: MegaphoneIcon, roles: [1] },
        { name: "طلبات الإدارة", path: "/department-requests", icon: ClipboardDocumentCheckIcon, roles: [2, 5, 6] },
        { name: "إعدادات توجيه الطلبات", path: "/request-settings", icon: Cog6ToothIcon, roles: [1] },
        { name: "سجلات التدقيق", path: "/audit-logs", icon: ClipboardDocumentListIcon, roles: [1] },
        { name: "إدارة المهام", path: "/manager-tasks", icon: BriefcaseIcon, roles: [5] },
        { name: "مهامي", path: "/my-tasks", icon: ClipboardDocumentListIcon, roles: [6] },
        { name: "التكليف الإداري", path: "/delegation", icon: ArrowPathRoundedSquareIcon, roles: [5, 3, 4] },
        { name: "التقارير", path: "/reports", icon: ChartBarIcon, roles: [3, 4, 5] },
        { name: "النماذج", path: "/company-forms", icon: DocumentDuplicateIcon, roles: [6] },
        { name: "إدارة النماذج", path: "/company-forms/manage", icon: DocumentTextIcon, roles: [1, 2, 3, 4, 5] },
        { name: "الاسئلة الشائعة", path: "/knowledge", icon: BookOpenIcon, roles: [1, 2, 3, 4, 5, 6] },
        { name: "إدارة الاسئلة الشائعة", path: "/faq-mangement", icon: QuestionMarkCircleIcon, roles: [1, 2] },
      ];

      return links.filter((link) => this.roles.some((role) => link.roles.includes(role)));
    },
  },

  watch: {
    $route() {
      this.closeMobile();
    },
  },

  mounted() {
    this.loadRoles();
    window.addEventListener("storage", this.loadRoles);

    this.sidebarToggleHandler = () => {
      this.isMobileOpen = !this.isMobileOpen;
    };
    this.sidebarCloseHandler = () => {
      this.isMobileOpen = false;
    };
    window.addEventListener(TOGGLE, this.sidebarToggleHandler);
    window.addEventListener(CLOSE, this.sidebarCloseHandler);
  },

  beforeUnmount() {
    window.removeEventListener("storage", this.loadRoles);
    if (this.sidebarToggleHandler) window.removeEventListener(TOGGLE, this.sidebarToggleHandler);
    if (this.sidebarCloseHandler) window.removeEventListener(CLOSE, this.sidebarCloseHandler);
  },

  methods: {
    loadRoles() {
      const storedRoles = JSON.parse(localStorage.getItem("roles") || "[]");
      this.roles = storedRoles.map(Number);
    },
    closeMobile() {
      this.isMobileOpen = false;
    },
  },
};
</script>
