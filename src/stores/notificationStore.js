import { reactive } from "vue";

function normalize(n) {
  const rawMessage = n.message ?? "";
  const routeMatch = rawMessage.match(/\[\[route:(.+?)\]\]/);
  const route = routeMatch ? routeMatch[1]?.trim() : null;
  const cleanMessage = rawMessage.replace(/\s*\[\[route:.+?\]\]\s*/g, " ").trim();

  return {
    id: n.id,
    title: n.title ?? "",
    message: cleanMessage,
    route,
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
