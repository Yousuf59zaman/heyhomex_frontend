<script setup lang="ts">
const { updateUserData, userData } = useCitizenModal()

const testData = reactive({
  fullName: '',
  email: '',
  priceRange: '',
  preferredLocation: ''
})

const testValidation = () => {
  updateUserData(testData)
  console.log('User Data:', userData.value)
  
  // Test email validation
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testData.email)
  console.log('Email valid:', isValid)
}
</script>

<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-4">Validation Test</h1>
    
    <div class="space-y-4">
      <input 
        v-model="testData.fullName"
        placeholder="Full Name"
        class="border p-2 rounded w-full" />
      
      <input 
        v-model="testData.email"
        placeholder="Email"
        class="border p-2 rounded w-full" />
      
      <button 
        @click="testValidation"
        class="px-4 py-2 bg-green-600 text-white rounded">
        Test Validation
      </button>
      
      <pre class="bg-gray-100 p-4 rounded">{{ userData }}</pre>
    </div>
  </div>
</template>