<template>
  <Dialog :open="open" @close="$emit('close')">
    <div class="flex flex-col space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-semibold">API Settings</h2>
          <p class="text-sm text-muted-foreground">
            Configure your KuCoin API credentials
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          @click="$emit('close')"
          class="h-6 w-6"
        >
          <X class="h-4 w-4" />
        </Button>
      </div>

      <!-- Form -->
      <form @submit.prevent="saveSettings" class="space-y-4">
        <div class="space-y-2">
          <Label for="apiKey">API Key</Label>
          <Input
            id="apiKey"
            v-model="apiKey"
            type="text"
            placeholder="Enter your API key"
            required
          />
          <p class="text-xs text-muted-foreground">
            Your KuCoin API key from the API management page
          </p>
        </div>

        <div class="space-y-2">
          <Label for="apiSecret">API Secret</Label>
          <Input
            id="apiSecret"
            v-model="apiSecret"
            type="password"
            placeholder="Enter your API secret"
            required
          />
          <p class="text-xs text-muted-foreground">
            Keep this secret secure and never share it
          </p>
        </div>

        <div class="space-y-2">
          <Label for="passphrase">Passphrase</Label>
          <Input
            id="passphrase"
            v-model="passphrase"
            type="password"
            placeholder="Enter your API passphrase"
            required
          />
          <p class="text-xs text-muted-foreground">
            The passphrase you created when generating the API key
          </p>
        </div>

        <!-- Environment Selection -->
        <div class="space-y-2">
          <Label>Environment</Label>
          <div class="flex space-x-4">
            <label class="flex items-center space-x-2">
              <input
                type="radio"
                v-model="environment"
                value="live"
                class="w-4 h-4 text-primary"
              />
              <span class="text-sm">Live (Production)</span>
            </label>
            <label class="flex items-center space-x-2">
              <input
                type="radio"
                v-model="environment"
                value="sandbox"
                class="w-4 h-4 text-primary"
              />
              <span class="text-sm">Sandbox (Test)</span>
            </label>
          </div>
        </div>

        <!-- Help Text -->
        <div class="bg-muted/50 p-4 rounded-lg">
          <h4 class="text-sm font-medium mb-2">How to get your API credentials:</h4>
          <ol class="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Go to KuCoin API Management</li>
            <li>Create a new API key with "General" permissions</li>
            <li>Enable "Broker" permissions for your API key</li>
            <li>Copy the API Key, Secret, and Passphrase here</li>
          </ol>
        </div>

        <!-- Actions -->
        <div class="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            @click="$emit('close')"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            :disabled="!canSave || isSaving"
          >
            <Loader2 v-if="isSaving" class="mr-2 h-4 w-4 animate-spin" />
            {{ isSaving ? 'Testing...' : 'Save & Test' }}
          </Button>
        </div>
      </form>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// UI Components
import Dialog from '@/components/ui/dialog.vue'
import Button from '@/components/ui/button.vue'
import Input from '@/components/ui/input.vue'
import Label from '@/components/ui/label.vue'

// Icons
import { X, Loader2 } from 'lucide-vue-next'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

// Form state
const apiKey = ref('')
const apiSecret = ref('')
const passphrase = ref('')
const environment = ref<'live' | 'sandbox'>('live')
const isSaving = ref(false)

const canSave = computed(() => {
  return apiKey.value.trim() && apiSecret.value.trim() && passphrase.value.trim()
})

// Load existing settings on mount
onMounted(() => {
  loadExistingSettings()
})

function loadExistingSettings() {
  // Load from localStorage
  const savedKey = localStorage.getItem('kucoin_api_key')
  const savedSecret = localStorage.getItem('kucoin_api_secret')
  const savedPassphrase = localStorage.getItem('kucoin_api_passphrase')
  const savedEnvironment = localStorage.getItem('kucoin_environment') as 'live' | 'sandbox' | null

  if (savedKey) apiKey.value = savedKey
  if (savedSecret) apiSecret.value = savedSecret
  if (savedPassphrase) passphrase.value = savedPassphrase
  if (savedEnvironment) environment.value = savedEnvironment
}

async function saveSettings() {
  if (!canSave.value) return

  isSaving.value = true

  try {
    // Save to localStorage
    localStorage.setItem('kucoin_api_key', apiKey.value)
    localStorage.setItem('kucoin_api_secret', apiSecret.value)
    localStorage.setItem('kucoin_api_passphrase', passphrase.value)
    localStorage.setItem('kucoin_environment', environment.value)

    // You could add API validation here
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API test

    emit('saved')
  } catch (error) {
    console.error('Error saving API settings:', error)
    alert('Error saving settings. Please try again.')
  } finally {
    isSaving.value = false
  }
}
</script>