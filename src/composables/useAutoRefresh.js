import { ref, watch, onBeforeUnmount } from "vue";

// Menjalankan `callback` tiap `seconds` detik selama `enabled` aktif.
export function useAutoRefresh(callback, seconds = 30) {
  const enabled = ref(false);
  const countdown = ref(seconds);
  let timer;

  const reset = () => (countdown.value = seconds);

  watch(enabled, (on) => {
    clearInterval(timer);
    reset();
    if (on) {
      timer = setInterval(() => {
        if (--countdown.value <= 0) callback();
      }, 1000);
    }
  });

  onBeforeUnmount(() => clearInterval(timer));

  return { enabled, countdown, reset, seconds };
}
