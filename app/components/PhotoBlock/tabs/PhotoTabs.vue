<template>
    <div>
      <div class="sm:hidden">
        <label for="tabs" class="sr-only">Select a tab</label>
        <!-- Use an "onChange" listener to redirect the user to the selected tab URL. -->
        <select id="tabs" name="tabs" class="block w-full rounded-md border-gray-300 focus:border-sky-500 focus:ring-sky-500" v-model="sel_tab_index">
          <option v-for="(tab,index) in tabs" :key="tab.name" :selected="tab.current" :value="index">{{ tab.name }}</option>
        </select>
      </div>
      <div class="hidden sm:block">
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex space-x-8" aria-label="Tabs">
            <a v-for="(tab,index) in tabs" :key="tab.name" :href="tab.href" :class="[tab.current ? 'border-sky-500 text-sky-600' : 'border-transparent text-gray-500 dark:text-gray-200 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-400', 'group inline-flex items-center border-b-2 py-4 px-2 text-sm font-medium']" :aria-current="tab.current ? 'page' : undefined" @click="sel_tab_item(index)">
              <component :is="tab.icon" :class="[tab.current ? 'text-sky-500' : 'text-gray-400 group-hover:text-gray-500', '-ml-0.5 mr-2 h-5 w-5']" />
              <span>{{ tab.name }}</span>
            </a>
          </nav>
        </div>
      </div>
    </div>
</template>
  
<script setup>
    import { ref, watch} from 'vue'
    import { SignalIcon, CloudArrowUpIcon } from '@heroicons/vue/20/solid'
    const emit = defineEmits(['selTabIndex'])
    const tabs = ref([
        // { name: 'Instant Photoshot', href: '', icon: SignalIcon, current: true },
        { name: 'Upload Existing Photo', href: '', icon: CloudArrowUpIcon, current: false }
    ])
    const sel_tab_index = ref(0)    
    watch( () => sel_tab_index.value, (update_value, old_value) => {
        tabs.value[old_value].current = false
        tabs.value[update_value].current = true
        emit('selTabIndex', update_value)
    })
    const sel_tab_item = (index) => {
        sel_tab_index.value = index
    }
</script>