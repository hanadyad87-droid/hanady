<template>
  <div id="app">
    <GlobalSpinner />
    <!-- هذا المكان للـ router -->
    <router-view></router-view>
  </div>
</template>

<script>
import GlobalSpinner from "@/components/GlobalSpinner.vue";

export default {
  name: 'App',
  components: { GlobalSpinner }
}
</script>

<style>
/* أسلوب عام للمشروع */
body {
  margin: 0;
  font-family: "Cairo", sans-serif;
}
</style>
