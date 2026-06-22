import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import './main.css';
import "./services/firebase";

createApp(App).use(router).mount("#app");
