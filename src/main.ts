import "./styles.css";
import { createApp } from "vue";
import { createPinia } from "pinia";
import { VueQueryPlugin, QueryClient } from "@tanstack/vue-query";
import App from "./app/App.vue";

async function enableMocks() {
  if (import.meta.env.DEV) {
    const { worker } = await import("./mocks/browser");
    await worker.start({ onUnhandledRequest: "bypass" });
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 10_000, retry: 1 },
  },
});

enableMocks().then(() => {
  createApp(App)
    .use(createPinia())
    .use(VueQueryPlugin, { queryClient })
    .mount("#app");
});
