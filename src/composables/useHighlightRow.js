// src/composables/useHighlightRow.js
import { onMounted, watch, nextTick } from "vue";
import { useRoute } from "vue-router";

export function useHighlightRow(itemsRef) {
  const route = useRoute();

  const highlightRow = async () => {
    const highlightId = route.query.highlightId;
    if (!highlightId || !itemsRef.value) return;
    if (itemsRef.value.length === 0) return; // لا يوجد بيانات بعد

    await nextTick(); // ننتظر تحديث DOM

    // نحاول العنصر عدة مرات (حتى لو البيانات بطيئة)
    const tryHighlight = (retries = 5, delay = 200) => {
      let attempt = 0;
      const interval = setInterval(() => {
        const el = document.getElementById(`row-${highlightId}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.classList.add("highlight");
          setTimeout(() => el.classList.remove("highlight"), 3000);
          clearInterval(interval);
        } else if (attempt++ >= retries) {
          clearInterval(interval);
        }
      }, delay);
    };

    tryHighlight();
  };

  onMounted(highlightRow);

  watch(itemsRef, () => highlightRow());
}