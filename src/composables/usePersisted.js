import { ref, watch } from "vue";

// ref biasa yang otomatis tersimpan di localStorage (favorit, tema).
export function usePersisted(key, fallback) {
  let start = fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw !== null) start = JSON.parse(raw);
  } catch {
    /* localStorage tidak tersedia -> pakai nilai awal */
  }

  const state = ref(start);
  watch(
    state,
    (value) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        /* abaikan */
      }
    },
    { deep: true },
  );
  return state;
}
