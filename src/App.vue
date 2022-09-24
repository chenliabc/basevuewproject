<script>
import { defineComponent } from 'vue';
import { userStore } from './store';
export default defineComponent({
  name: 'App',
  setup() {
    const user = userStore();
    return {
      user
    }
  },
})
</script>
<template>
  <h1>{{user.userInfo.name}}</h1>
</template>
<style scoped>

</style>