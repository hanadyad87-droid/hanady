import { reactive } from "vue";

function normalize(n) {
  return {
    id: n.id,
    title: n.title ?? "",
    message: n.message ?? "",
    createdAt: n.createdAt,
    isRead: Boolean(n.isRead),
  };
}

export const notificationStore = reactive({
  items: [],

  setFromApi(list) {
    this.items = Array.isArray(list) ? list.map(normalize) : [];
  },

  /** إشعار فوري من SignalR */
  prependFromHub(payload) {
    const row = normalize({
      id: payload.id,
      title: payload.title,
      message: payload.message,
      createdAt: payload.createdAt,
      isRead: payload.isRead ?? false,
    });
    const idx = this.items.findIndex((x) => x.id === row.id);
    if (idx >= 0) {
      this.items[idx] = { ...this.items[idx], ...row };
      return;
    }
    this.items.unshift(row);
  },

  markReadLocal(id) {
    const n = this.items.find((x) => x.id === id);
    if (n) n.isRead = true;
  },
});
