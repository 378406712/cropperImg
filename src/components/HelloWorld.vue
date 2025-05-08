<script setup>
const prop = defineProps({
  msg: {
    type: String,
    required: true,
  },
  postFontSize: {
    type: String,
    required: true
  },
  posts: {
    type: Array,
    required: true
  }
})
const emit = defineEmits()
const enLarge = () => {
emit('enlarge-text')
}
</script>

<template>
  <div class="greetings">
    <h1 class="green">{{ msg }}</h1>
    <h3>
      You’ve successfully created a project with
      <a href="https://vitejs.dev/" target="_blank" rel="noopener">Vite</a> +
      <a href="https://vuejs.org/" target="_blank" rel="noopener">Vue 3</a>.
    </h3>
  </div>
  <div :style="{ fontSize: postFontSize + 'em' }">
    <div v-for="post in posts" :key="post.id">{{ post.title }}--- <button @click="enLarge">Enlarge text</button></div>
  </div>
</template>

<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  top: -10px;
}

h3 {
  font-size: 1.2rem;
}

.greetings h1,
.greetings h3 {
  text-align: center;
}

@media (min-width: 1024px) {
  .greetings h1,
  .greetings h3 {
    text-align: left;
  }
}
</style>
