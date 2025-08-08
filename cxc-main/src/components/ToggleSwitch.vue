<template>
  <label class="relative inline-block w-12 h-6 cursor-pointer">
    <input 
      type="checkbox" 
      :checked="modelValue"
      @change="handleChange"
      class="opacity-0 w-0 h-0"
    >
    <span class="slider bg-neutral-300 dark:bg-neutral-600"></span>
  </label>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  theme: {
    type: String,
    default: 'light'
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const handleChange = (event) => {
  const value = event.target.checked
  emit('update:modelValue', value)
  emit('change', value)
}
</script>

<style scoped>
@reference "../style.css";

.slider {
  @apply absolute cursor-pointer top-0 left-0 right-0 bottom-0 transition-all duration-300 rounded-full;
}

.slider:before {
  @apply absolute content-[''] h-4 w-4 left-1 bottom-1 bg-white transition-all duration-300 rounded-full shadow-md;
}

input:checked + .slider {
  @apply bg-blue-500;
}

input:checked + .slider:before {
  @apply translate-x-6;
}
</style> 