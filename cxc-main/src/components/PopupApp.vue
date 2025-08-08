<template>
  <div :class="[
    'w-80 transition-all duration-500 ease-out overflow-hidden',
    currentTheme === 'dark' 
      ? 'bg-neutral-900 text-white' 
      : 'bg-neutral-50 text-black'
  ]" :style="containerStyle">
    
    <!-- Loading State -->
    <Transition
      name="fade"
      mode="out-in"
    >
      <div v-if="isLoading" 
        key="loading"
        class="p-5 flex items-center justify-center"
        style="height: 160px;"
      >
        <div class="flex flex-col items-center space-y-3">
          <!-- Loading Spinner -->
          <div :class="[
            'w-8 h-8 border-2 border-t-transparent rounded-full animate-spin',
            currentTheme === 'dark' 
              ? 'border-neutral-400' 
              : 'border-neutral-600'
          ]"></div>
          
          <!-- Loading Text -->
          <div :class="[
            'text-sm font-medium',
            currentTheme === 'dark' ? 'text-neutral-300' : 'text-neutral-700'
          ]">
            Loading settings...
          </div>
        </div>
      </div>

      <!-- Main Content or Reset Skeleton -->
      <div v-else 
        key="content"
        class="p-5"
      >
        <!-- Header -->
        <div class="mb-5">
          <div class="flex justify-between items-center">
            <!-- Title Section -->
            <div class="flex-1 text-center">
              <h1 class="text-blue-500 font-bold text-base">
                Chrono X Chroma Settings
              </h1>
            </div>
            
            <!-- Theme Toggle Section -->
            <div 
              :class="[
                'cursor-pointer p-1 rounded transition-colors',
                currentTheme === 'dark' 
                  ? 'hover:bg-neutral-700' 
                  : 'hover:bg-neutral-200',
                isResetting ? 'opacity-50 pointer-events-none' : ''
              ]"
              @click="toggleTheme"
              :title="currentTheme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'"
            >
              <MoonIcon v-if="currentTheme === 'light'" class="w-5 h-5" />
              <SunIcon v-else class="w-5 h-5" />
            </div>
          </div>
        </div>

        <!-- Settings Card with Scrolling or Skeleton -->
        <div :class="[
          'rounded-lg shadow-sm border overflow-hidden',
          currentTheme === 'dark' 
            ? 'bg-neutral-800 border-neutral-700' 
            : 'bg-white border-neutral-200'
        ]">
          <!-- Reset Skeleton State -->
          <div v-if="isResetting" :class="[
            'max-h-96 overflow-y-auto',
            currentTheme === 'dark' ? 'scrollbar-dark' : 'scrollbar-light'
          ]">
            <!-- Skeleton for Color Mode Setting -->
            <div class="p-4">
              <div :class="[
                'setting-label',
                currentTheme === 'dark' ? 'text-white' : 'text-black'
              ]">
                <div :class="[
                  'h-5 rounded animate-pulse',
                  currentTheme === 'dark' ? 'bg-neutral-600' : 'bg-neutral-300'
                ]" style="width: 80px;"></div>
              </div>
              <div :class="[
                'setting-description',
                currentTheme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'
              ]">
                <div :class="[
                  'h-3 rounded animate-pulse',
                  currentTheme === 'dark' ? 'bg-neutral-700' : 'bg-neutral-200'
                ]" style="width: 100%;"></div>
              </div>
              <div class="mt-3">
                <!-- Skeleton for ColorModeToggle - matches the exact component structure -->
                <div class="flex bg-neutral-100 dark:bg-neutral-700 rounded-lg p-1 relative">
                  <div :class="[
                    'w-16 h-8 rounded animate-pulse',
                    currentTheme === 'dark' ? 'bg-neutral-600' : 'bg-neutral-300'
                  ]"></div>
                  <div :class="[
                    'w-16 h-8 rounded animate-pulse ml-1',
                    currentTheme === 'dark' ? 'bg-neutral-600' : 'bg-neutral-300'
                  ]"></div>
                  <div :class="[
                    'w-16 h-8 rounded animate-pulse ml-1',
                    currentTheme === 'dark' ? 'bg-neutral-600' : 'bg-neutral-300'
                  ]"></div>
                  <div :class="[
                    'w-12 h-8 rounded animate-pulse ml-1',
                    currentTheme === 'dark' ? 'bg-neutral-600' : 'bg-neutral-300'
                  ]"></div>
                </div>
              </div>
            </div>

            <!-- Skeleton Divider -->
            <div :class="[
              'border-t',
              currentTheme === 'dark' ? 'border-neutral-700' : 'border-neutral-200'
            ]"></div>

            <!-- Skeleton for Show Legend Setting -->
            <div class="p-4">
              <div :class="[
                'setting-label',
                currentTheme === 'dark' ? 'text-white' : 'text-black'
              ]">
                <div :class="[
                  'h-5 rounded animate-pulse',
                  currentTheme === 'dark' ? 'bg-neutral-600' : 'bg-neutral-300'
                ]" style="width: 90px;"></div>
                <!-- Skeleton for ToggleSwitch - matches exact dimensions -->
                <div :class="[
                  'w-12 h-6 rounded-full animate-pulse',
                  currentTheme === 'dark' ? 'bg-neutral-600' : 'bg-neutral-300'
                ]"></div>
              </div>
              <div :class="[
                'setting-description',
                currentTheme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'
              ]">
                <div :class="[
                  'h-3 rounded animate-pulse',
                  currentTheme === 'dark' ? 'bg-neutral-700' : 'bg-neutral-200'
                ]" style="width: 100%;"></div>
              </div>
            </div>

            <!-- Skeleton Divider -->
            <div :class="[
              'border-t',
              currentTheme === 'dark' ? 'border-neutral-700' : 'border-neutral-200'
            ]"></div>

            <!-- Skeleton for Remove CSS Setting -->
            <div class="p-4">
              <div :class="[
                'setting-label',
                currentTheme === 'dark' ? 'text-white' : 'text-black'
              ]">
                <div :class="[
                  'h-5 rounded animate-pulse',
                  currentTheme === 'dark' ? 'bg-neutral-600' : 'bg-neutral-300'
                ]" style="width: 160px;"></div>
                <!-- Skeleton for ToggleSwitch - matches exact dimensions -->
                <div :class="[
                  'w-12 h-6 rounded-full animate-pulse',
                  currentTheme === 'dark' ? 'bg-neutral-600' : 'bg-neutral-300'
                ]"></div>
              </div>
              <div :class="[
                'setting-description',
                currentTheme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'
              ]">
                <div :class="[
                  'h-3 rounded animate-pulse',
                  currentTheme === 'dark' ? 'bg-neutral-700' : 'bg-neutral-200'
                ]" style="width: 100%;"></div>
              </div>
            </div>
          </div>

          <!-- Actual Content -->
          <div v-else :class="[
            'max-h-96 overflow-y-auto',
            currentTheme === 'dark' ? 'scrollbar-dark' : 'scrollbar-light'
          ]">
            <!-- Color Mode Setting -->
            <div class="p-4">
              <div :class="[
                'setting-label',
                currentTheme === 'dark' ? 'text-white' : 'text-black'
              ]">
                <span>Color Mode</span>
              </div>
              <div :class="[
                'setting-description',
                currentTheme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'
              ]">
                Choose how posts are color-coded based on their age
              </div>
              <div class="mt-3">
                <ColorModeToggle 
                  v-model="settings.colorMode" 
                  :theme="currentTheme"
                  @change="saveSettings"
                />
              </div>
            </div>

            <!-- Divider -->
            <div :class="[
              'border-t',
              currentTheme === 'dark' ? 'border-neutral-700' : 'border-neutral-200'
            ]"></div>

            <!-- Show Legend Setting -->
            <div class="p-4">
              <div :class="[
                'setting-label',
                currentTheme === 'dark' ? 'text-white' : 'text-black'
              ]">
                <span>Show Legend</span>
                <ToggleSwitch 
                  v-model="settings.showLegend" 
                  :theme="currentTheme"
                  @change="saveSettings"
                />
              </div>
              <div :class="[
                'setting-description',
                currentTheme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'
              ]">
                Show/hide the circular legend button in the top-left corner
              </div>
            </div>

            <!-- Divider -->
            <div :class="[
              'border-t',
              currentTheme === 'dark' ? 'border-neutral-700' : 'border-neutral-200'
            ]"></div>

            <!-- Remove CSS Setting -->
            <div class="p-4">
              <div :class="[
                'setting-label',
                currentTheme === 'dark' ? 'text-white' : 'text-black'
              ]">
                <span>Remove All CSS Styling</span>
                <ToggleSwitch 
                  v-model="settings.removeCss" 
                  :theme="currentTheme"
                  @change="saveSettings"
                />
              </div>
              <div :class="[
                'setting-description',
                currentTheme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'
              ]">
                Completely disable all visual styling (emergency override)
              </div>
            </div>

            <!-- Divider -->
            <div :class="[
              'border-t',
              currentTheme === 'dark' ? 'border-neutral-700' : 'border-neutral-200'
            ]"></div>

            <!-- Smart Contract Highlighting Setting -->
            <div class="p-4">
              <div :class="[
                'setting-label',
                currentTheme === 'dark' ? 'text-white' : 'text-black'
              ]">
                <span>Highlight Smart Contracts</span>
                <ToggleSwitch 
                  v-model="settings.highlightContracts" 
                  :theme="currentTheme"
                  @change="saveSettings"
                />
              </div>
              <div :class="[
                'setting-description',
                currentTheme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'
              ]">
                Highlight Ethereum and Solana contract addresses in posts
              </div>
            </div>

            <!-- Contract Highlight Mode Setting -->
            <div v-if="settings.highlightContracts" class="p-4">
              <div :class="[
                'setting-label',
                currentTheme === 'dark' ? 'text-white' : 'text-black'
              ]">
                <span>Contract Highlight Mode</span>
              </div>
              <div :class="[
                'setting-description',
                currentTheme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'
              ]">
                Choose how contract addresses are highlighted
              </div>
              <div class="mt-3">
                <ColorModeToggle 
                  v-model="settings.contractHighlightMode" 
                  :theme="currentTheme"
                  @change="saveSettings"
                  :is-contract-mode="true"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Reset Button -->
        <button 
          :class="[
            'w-full px-4 py-2 rounded transition-colors text-sm mt-3',
            isResetting 
              ? (currentTheme === 'dark' 
                ? 'bg-neutral-700 text-neutral-400 cursor-not-allowed' 
                : 'bg-neutral-300 text-neutral-500 cursor-not-allowed')
              : (currentTheme === 'dark' 
                ? 'bg-red-700 hover:bg-red-800 text-white' 
                : 'bg-red-600 hover:bg-red-700 text-white')
          ]"
          @click="resetSettings"
          :disabled="isResetting"
        >
          {{ isResetting ? 'Resetting...' : 'Reset to Defaults' }}
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import ToggleSwitch from './ToggleSwitch.vue'
import ColorModeToggle from './ColorModeToggle.vue'
import MoonIcon from './icons/MoonIcon.vue'
import SunIcon from './icons/SunIcon.vue'

// Reactive state
const settings = ref({
  colorMode: 'both', // 'both', 'border', 'overlay', 'off'
  showLegend: true,
  removeCss: false,
  highlightContracts: false,
  contractHighlightMode: 'border' // 'border', 'overlay', 'off'
})

const currentTheme = ref('light')
const isLoading = ref(true)
const isResetting = ref(false)

// Computed style for smooth container transitions
const containerStyle = computed(() => {
  if (isLoading.value) {
    return {
      height: '160px',
      minHeight: '160px'
    }
  } else {
    return {
      height: 'auto',
      minHeight: '400px'
    }
  }
})

// Default settings
const defaultSettings = {
  colorMode: 'both',
  showLegend: true,
  removeCss: false,
  highlightContracts: false,
  contractHighlightMode: 'border'
}

// Theme detection
const getSystemTheme = () => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// Migrate old settings format to new format
const migrateOldSettings = (items) => {
  let colorMode = 'both' // default
  
  // Convert old enableColorCoding + borderOnly to new colorMode
  if (items.enableColorCoding === false) {
    colorMode = 'off'
  } else if (items.borderOnly === true) {
    colorMode = 'border'
  } else if (items.enableColorCoding === true && items.borderOnly === false) {
    colorMode = 'both'
  }
  
  return {
    colorMode,
    showLegend: items.showLegend !== undefined ? items.showLegend : defaultSettings.showLegend,
    removeCss: items.removeCss !== undefined ? items.removeCss : defaultSettings.removeCss,
    highlightContracts: items.highlightContracts !== undefined ? items.highlightContracts : defaultSettings.highlightContracts,
    contractHighlightMode: items.contractHighlightMode !== undefined ? items.contractHighlightMode : defaultSettings.contractHighlightMode
  }
}

// Load settings from Chrome storage
const loadSettings = () => {
  const startTime = Date.now()
  const minLoadingTime = 500 // Minimum 500ms loading time for smooth growing animation
  
  chrome.storage.sync.get(null, (items) => {
    console.log('Loaded settings:', items)
    
    // Check if we have the new colorMode setting or need to migrate
    if (items.colorMode !== undefined) {
      // New format
      settings.value.colorMode = items.colorMode
      settings.value.showLegend = items.showLegend !== undefined ? items.showLegend : defaultSettings.showLegend
      settings.value.removeCss = items.removeCss !== undefined ? items.removeCss : defaultSettings.removeCss
      settings.value.highlightContracts = items.highlightContracts !== undefined ? items.highlightContracts : defaultSettings.highlightContracts
      settings.value.contractHighlightMode = items.contractHighlightMode !== undefined ? items.contractHighlightMode : defaultSettings.contractHighlightMode
    } else {
      // Migrate from old format
      const migratedSettings = migrateOldSettings(items)
      settings.value = { ...migratedSettings }
      
      // Save migrated settings
      saveSettings()
    }
    
    // Handle theme
    if (items.theme) {
      currentTheme.value = items.theme
    } else {
      currentTheme.value = getSystemTheme()
    }
    
    // Ensure minimum loading time for smooth UX
    const elapsedTime = Date.now() - startTime
    const remainingTime = Math.max(0, minLoadingTime - elapsedTime)
    
    setTimeout(() => {
      isLoading.value = false
    }, remainingTime)
  })
}

// Save settings to Chrome storage
const saveSettings = () => {
  const settingsToSave = {
    ...settings.value,
    theme: currentTheme.value
  }
  
  chrome.storage.sync.set(settingsToSave, () => {
    console.log('Settings saved:', settingsToSave)
    
    // Send message to content script with error handling
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && (tabs[0].url.includes('x.com') || tabs[0].url.includes('twitter.com'))) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'updateSettings',
          settings: settingsToSave
        }, (response) => {
          // Handle response or error
          if (chrome.runtime.lastError) {
            console.log('Content script not available:', chrome.runtime.lastError.message)
          } else {
            console.log('Settings sent to content script successfully')
          }
        })
      }
    })
  })
}

// Toggle theme
const toggleTheme = () => {
  currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light'
  console.log('Theme toggled to:', currentTheme.value)
  saveSettings()
}

// Reset settings
const resetSettings = () => {
  if (isResetting.value) return
  
  isResetting.value = true
  settings.value = { ...defaultSettings }
  currentTheme.value = getSystemTheme()
  
  chrome.storage.sync.clear(() => {
    chrome.storage.sync.set(defaultSettings, () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && (tabs[0].url.includes('x.com') || tabs[0].url.includes('twitter.com'))) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'updateSettings',
            settings: {
              ...defaultSettings,
              theme: currentTheme.value
            }
          }, (response) => {
            // Handle response or error
            if (chrome.runtime.lastError) {
              console.log('Content script not available:', chrome.runtime.lastError.message)
            } else {
              console.log('Reset settings sent to content script successfully')
            }
            
            // Add a minimum delay for better UX
            setTimeout(() => {
              isResetting.value = false
            }, 800)
          })
        } else {
          setTimeout(() => {
            isResetting.value = false
          }, 800)
        }
      })
    })
  })
}

// Initialize on mount
onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
@reference "../style.css";

.setting-label {
  @apply flex justify-between items-center mb-2 font-medium;
}

.setting-description {
  @apply text-xs mb-3;
}

/* Smooth fade transition */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease-in-out;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.fade-enter-to, .fade-leave-from {
  opacity: 1;
}

/* Theme-aware scrollbar styling */
.scrollbar-light, .scrollbar-dark {
  scrollbar-width: thin;
}

/* Light theme scrollbar */
.scrollbar-light::-webkit-scrollbar {
  width: 8px;
}

.scrollbar-light::-webkit-scrollbar-track {
  background: #f5f5f5;
  border-radius: 4px;
}

.scrollbar-light::-webkit-scrollbar-thumb {
  background: #d4d4d8;
  border-radius: 4px;
}

.scrollbar-light::-webkit-scrollbar-thumb:hover {
  background: #a1a1aa;
}

/* Dark theme scrollbar */
.scrollbar-dark::-webkit-scrollbar {
  width: 8px;
}

.scrollbar-dark::-webkit-scrollbar-track {
  background: #404040;
  border-radius: 4px;
}

.scrollbar-dark::-webkit-scrollbar-thumb {
  background: #525252;
  border-radius: 4px;
}

.scrollbar-dark::-webkit-scrollbar-thumb:hover {
  background: #737373;
}

/* Firefox scrollbar */
.scrollbar-light {
  scrollbar-color: #d4d4d8 #f5f5f5;
}

.scrollbar-dark {
  scrollbar-color: #525252 #404040;
}
</style> 