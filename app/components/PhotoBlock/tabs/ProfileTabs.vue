<template>
    <div>
      <div class="sm:hidden">
        <label for="tabs" class="sr-only">Select a tab</label>
        <!-- Use an "onChange" listener to redirect the user to the selected tab URL. -->
        <select v-model="cur_tab_index" id="tabs" name="tabs" class="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-yellow-400 dark:focus:border-orange-400 focus:outline-none focus:ring-gray-500 sm:text-sm">
          <option v-for="(tab,index) in tabs" :key="tab.name" :selected="index==sel_tab_index" :value="index">{{ tab.name }}</option>
        </select>
      </div>
      <div class="hidden sm:block">
        <div class="border-b border-gray-200 dark:border-gray-700">
          <nav class="-mb-px flex space-x-8" aria-label="Tabs">
            <a v-for="(tab,index) in tabs" :key="tab.name" :href="tab.href" :class="[index==sel_tab_index ? 'border-yellow-400 dark:border-orange-400 text-gray-800 dark:text-orange-200 font-semibold' : 'border-transparent text-gray-600 dark:text-gray-200 hover:border-gray-300 hover:text-gray-700', 'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium']" @click="sel_tab(index)">{{ tab.name }}</a>
          </nav>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
    import { ref, watch } from 'vue'
    const emit = defineEmits(['selTabIndex'])
    const props = defineProps({
        sel_tab_index: Number
    })
    const tabs = [
        { name: 'Citizen Profile', href: '#' },
        { name: 'Govt. Employee Information', href: '#' }
    ]
    const cur_tab_index = ref(0)
    const sel_tab = (index) => {
        emit('selTabIndex', index)
    }    

    watch( () => cur_tab_index.value, (updateVal) => {
        sel_tab(updateVal)
    })
  </script>