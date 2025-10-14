<script setup>
   

    const router = useRouter();
    const props = defineProps({
    error: Object
    })
    
    const handleError = () => clearError(router.go(-1));
</script>


<template>
    <div class="flex-1">
      <div class="container px-10 py-10 mx-auto">
        <div class="flex flex-col items-center justify-center py-16 text-center">
          <div class="w-full max-w-lg p-8 bg-white rounded-lg shadow-md ">
            <div class="mb-8">
              <img src="/images/home/home_logo.png" @click="handleError"  class="h-10 mx-auto mb-10 cursor-pointer " />
              <h1 class="mt-4 text-4xl font-bold text-gray-800 ">404</h1>
              <h2 class="mt-2 text-2xl font-semibold text-gray-700 ">Page Not Found</h2>
              <p class="mt-4 text-gray-600 ">The page you're looking for doesn't exist or has been moved.</p>
            </div>
            <div class="mt-10 mb-5 space-y-4">
              <button @click="handleError" class="w-1/2 px-6 py-3 text-white transition duration-200 bg-blue-500 rounded-md hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700">
                Go To Previous Page
              </button>
              <!-- <button class="w-full px-6 py-3 text-blue-500 transition duration-200 bg-white border border-blue-500 rounded-md hover:bg-blue-50 dark:bg-gray-800 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-gray-700">
                Contact Support
              </button> -->
            </div>
          </div>
         
        </div>
      </div>
    </div>
  </template>

