<template>
  <div class="flex flex-col space-y-3">
    <!-- Mode Selection -->
    <div :class="[
      'grid rounded-lg p-1 relative transition-colors gap-0',
      isContractMode ? 'grid-cols-3' : 'grid-cols-4',
      theme === 'dark' 
        ? 'bg-neutral-700 border border-neutral-600' 
        : 'bg-neutral-200 border border-neutral-300'
    ]">
      <!-- Background slider -->
      <div 
        :class="[
          'absolute top-1 bottom-1 rounded-md transition-all duration-300 ease-in-out',
          theme === 'dark' ? 'bg-neutral-600' : 'bg-white'
        ]"
        :style="sliderStyle"
      ></div>
      
      <!-- Option buttons -->
      <button
        v-for="(option, index) in displayOptions"
        :key="option.value"
        @click="selectOption(option.value)"
        :class="[
          'relative z-10 px-2 py-2 text-xs font-medium rounded-md transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
          'flex items-center justify-center text-center',
          selectedValue === option.value
            ? theme === 'dark' 
              ? 'text-white' 
              : 'text-neutral-900'
            : theme === 'dark' 
              ? 'text-neutral-300 hover:text-white' 
              : 'text-neutral-600 hover:text-neutral-900'
        ]"
        :title="option.description"
      >
        {{ option.label }}
      </button>
    </div>
    
    <!-- Visual Preview -->
    <div class="flex gap-2 justify-center">
      <div 
        v-for="(color, index) in displayPreviewColors"
        :key="index"
        :class="[
          'w-4 h-4 rounded transition-all duration-200',
          getPreviewStyle(color)
        ]"
        :title="color.title"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: 'both' // 'both', 'border', 'overlay', 'off'
  },
  theme: {
    type: String,
    default: 'light'
  },
  isContractMode: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const options = [
  { 
    value: 'both', 
    label: 'Both', 
    description: 'Show both colored borders and background overlay' 
  },
  { 
    value: 'border', 
    label: 'Border', 
    description: 'Show only colored borders' 
  },
  { 
    value: 'overlay', 
    label: 'Overlay', 
    description: 'Show only background overlay' 
  },
  { 
    value: 'off', 
    label: 'Off', 
    description: 'Disable all color coding' 
  }
]

const contractOptions = [
  { 
    value: 'both', 
    label: 'Both', 
    description: 'Show both colored borders and background overlay' 
  },
  { 
    value: 'border', 
    label: 'Border', 
    description: 'Show only colored borders' 
  },
  { 
    value: 'overlay', 
    label: 'Overlay', 
    description: 'Show only background overlay' 
  }
]

const previewColors = [
  { name: 'green', title: 'Very Recent (< 5 min)' },
  { name: 'yellow', title: 'Recent (5 min - 1 hour)' },
  { name: 'orange', title: 'Moderate (1 - 6 hours)' },
  { name: 'red', title: 'Old (6 - 24 hours)' },
  { name: 'purple', title: 'Very Old (> 1 day)' }
]

const contractPreviewColors = [
  { name: 'ethereum', title: 'Ethereum Address' },
  { name: 'solana', title: 'Solana Address' }
]

const selectedValue = computed(() => props.modelValue)

const displayOptions = computed(() => {
  return props.isContractMode ? contractOptions : options
})

const displayPreviewColors = computed(() => {
  return props.isContractMode ? contractPreviewColors : previewColors
})

const sliderStyle = computed(() => {
  const index = displayOptions.value.findIndex(option => option.value === selectedValue.value)
  const width = `${100 / displayOptions.value.length}%`
  const left = `${(index * 100) / displayOptions.value.length}%`
  
  return {
    width,
    left
  }
})

const selectOption = (value) => {
  emit('update:modelValue', value)
  emit('change', value)
}

const getPreviewStyle = (color) => {
  if (props.isContractMode) {
    // Contract mode colors
    const borderColors = {
      ethereum: 'border-fuchsia-500',
      solana: 'border-cyan-500'
    }
    
    const backgroundColors = {
      ethereum: 'bg-fuchsia-500/30',
      solana: 'bg-cyan-500/30'
    }
    
    if (selectedValue.value === 'off') {
      return 'border-2 border-neutral-300 bg-transparent'
    } else if (selectedValue.value === 'border') {
      return `border-2 ${borderColors[color.name]} bg-transparent`
    } else if (selectedValue.value === 'overlay') {
      return `border-2 border-transparent ${backgroundColors[color.name]}`
    } else if (selectedValue.value === 'both') {
      return `border-2 ${borderColors[color.name]} ${backgroundColors[color.name]}`
    }
  } else {
    // Post age mode colors
    const borderColors = {
      green: 'border-green-500',
      yellow: 'border-yellow-500', 
      orange: 'border-orange-500',
      red: 'border-red-500',
      purple: 'border-purple-500'
    }
    
    const backgroundColors = {
      green: 'bg-green-500/30',
      yellow: 'bg-yellow-500/30',
      orange: 'bg-orange-500/30', 
      red: 'bg-red-500/30',
      purple: 'bg-purple-500/30'
    }
    
    if (selectedValue.value === 'off') {
      return 'border-2 border-neutral-300 bg-transparent'
    } else if (selectedValue.value === 'border') {
      return `border-2 ${borderColors[color.name]} bg-transparent`
    } else if (selectedValue.value === 'overlay') {
      return `border-2 border-transparent ${backgroundColors[color.name]}`
    } else if (selectedValue.value === 'both') {
      return `border-2 ${borderColors[color.name]} ${backgroundColors[color.name]}`
    }
  }
  
  return 'border-2 border-neutral-300 bg-transparent'
}
</script>

<style scoped>
@reference "../style.css";
</style> 