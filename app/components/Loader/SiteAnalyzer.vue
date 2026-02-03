<script setup>
const emit = defineEmits(['complete'])
const progress = ref(0)

// Simulate progress
onMounted(() => {
    const interval = setInterval(() => {
        if (progress.value < 100) {
            progress.value += Math.random() * 15
            if (progress.value > 100) {
                progress.value = 100
            }
        } else {
            clearInterval(interval)
            setTimeout(() => {
                emit('complete')
            }, 500)
        }
    }, 300)
})
</script>

<style scoped>

</style>


<template>
    <div class="flex items-center justify-center min-h-screen bg-white">
        <div class="text-center">
            <!-- HeyHomeX Branding -->
            <div class=" flex justify-center">
                <ApplicationIconLogo width="80" height="80" class="mx-auto " />
            </div>
            
            <div class="mb-8 relative">
                <div class="bg-gradient-to-b from-blue-100 to-blue-50 rounded-lg shadow-md p-8 w-[360px] h-[240px] mx-auto relative overflow-hidden">
                   
                    <div class="absolute top-0 left-0 right-0 h-8 bg-blue-200 rounded-t-lg flex items-center px-3 gap-1.5">
                        <div class="w-2 h-2 rounded-full bg-red-400"></div>
                        <div class="w-2 h-2 rounded-full bg-yellow-400"></div>
                        <div class="w-2 h-2 rounded-full bg-green-400"></div>
                        <div class="ml-4 flex-1 h-4 bg-white rounded-sm opacity-70"></div>
                    </div>
                    
                  
                    <div class="mt-10 grid grid-cols-4 gap-3 px-4">
                      
                        <div class="col-span-1 bg-blue-200 h-16 rounded animate-pulse"></div>
                       
                        <div class="col-span-1 bg-blue-200 h-16 rounded animate-pulse"></div>
                        <div class="col-span-1 bg-blue-200 h-16 rounded animate-pulse"></div>
                        
                        <div class="col-span-1 bg-blue-200 h-16 rounded animate-pulse flex items-end justify-around p-2">
                            <div class="w-1 h-6 bg-blue-300 rounded-t"></div>
                            <div class="w-1 h-10 bg-blue-300 rounded-t"></div>
                            <div class="w-1 h-8 bg-blue-300 rounded-t"></div>
                            <div class="w-1 h-12 bg-blue-300 rounded-t"></div>
                        </div>
                    </div>
                    
                  
                    <div class="mt-6 px-4 space-y-2">
                        <div class="flex gap-4">
                            <div class="w-4 h-4 bg-blue-200 rounded animate-pulse"></div>
                            <div class="flex-1 h-3 bg-blue-200 rounded animate-pulse"></div>
                        </div>
                        <div class="flex gap-4">
                            <div class="w-4 h-4 bg-blue-200 rounded animate-pulse"></div>
                            <div class="flex-1 h-3 bg-blue-200 rounded animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>
            
         
            <div class="space-y-4">
                <h2 class="text-2xl font-semibold text-gray-800">
                    Analyzing Your Information
                </h2>
                <p class="text-gray-600">
                    Our AI is processing your data to provide personalized recommendations
                </p>
                
                <!-- Progress Bar -->
                <div class="w-96 mx-auto mt-8">
                    <div class="h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                            class="h-full bg-blue-500 rounded-full transition-all duration-300 ease-linear"
                            :style="{ width: progress + '%' }"
                        ></div>
                    </div>
                    <p class="text-sm text-gray-500 mt-2">{{ progress }}% Complete</p>
                </div>
            </div>
        </div>
    </div>
</template>


