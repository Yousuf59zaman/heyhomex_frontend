<script setup>
// <Pagination :config="pagination_config" @loadData="loadData" />
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/20/solid'

const props = defineProps({
    config: Object
})

const emit = defineEmits(['loadData'])

const route = useRoute()
const allow_lang = ref({
    'en': true,
    'bn': true
})
const sel_lang = ref('en')
const pg_list = ref({})
const pg_display_limit = ref(7)
const center_pg_pos = ref(3)
const first_page_display = ref('')
const last_page_display = ref('')

const data = computed(() => {
    return props.config.data
})
const lang = computed(() => {
    return props.config.lang
})
const align = computed(() => {
    return props.config.align
})
const action = computed(() => {
    return props.config.action
})
const current_pg = ref(route.query.page ? Number(route.query.page) : 1);

watch(() => route.query.page, (currentPg) => {
    // alert(currentPg)
    // console.log('currentPg', currentPg);
    current_pg.value = parseInt(currentPg ? currentPg : 1)
    pg_list.value = {}
    init_pg_data()
})

onMounted(() => {
    init_pg_data()
})

const init_pg_data = () => {
    // alert(current_pg.value)
    if ((current_pg.value - center_pg_pos.value) > center_pg_pos.value) first_page_display.value = true

    if ((current_pg.value + center_pg_pos.value) < (data.value.last_page - center_pg_pos.value)) last_page_display.value = true
    else if ((current_pg.value + center_pg_pos.value) >= data.value.last_page) last_page_display.value = false

    if (first_page_display.value && last_page_display.value) {
        // console.log(parseInt(current_pg.value) + '-' + center_pg_pos.value + '<=' + parseInt(current_pg.value) + '+' + center_pg_pos.value)
        for (var i = parseInt(current_pg.value) - center_pg_pos.value; i <= parseInt(current_pg.value) + center_pg_pos.value; i++) {
            pg_list.value[i] = true
        }
    } else if (first_page_display.value) {
        for (var i = parseInt(data.value.last_page) - pg_display_limit.value + 1; i <= parseInt(data.value.last_page); i++) {
            pg_list.value[i] = true
        }
    } else if (last_page_display.value) {
        for (var i = 1; i <= parseInt(pg_display_limit.value); i++) {
            pg_list.value[i] = true
        }
    }

    if (lang.value != '' && allow_lang.value[lang.value]) {
        sel_lang.value = lang.value
    }

    if (route.query.page == 1) navigateTo({ query: {} })
    else if (route.query.page > data.value.last_page) load_content(data.value.last_page)
}
const go_previous = () => {
    if (current_pg.value > 1) load_content(current_pg.value - 1)
}
const go_next = () => {
    if (current_pg.value < data.value.last_page) load_content(current_pg.value + 1)
}
const pg_num_display = (pg) => {
    let str = '';
    str = pg
    return str;
}
const load_content = async (pg) => {
    if (current_pg.value !== pg) {
        if (action.value == 'ajax') emit('loadData', pg, true)
        else if (pg == 1) {
            let query = Object.assign({}, route.query);
            delete query['page'];
            await navigateTo({ query });
        } else {
            let obj = {}; obj['page'] = pg;
            await navigateTo({ query: Object.assign({}, route.query, obj) });
        }
    }
}    
</script>
<template>
    <div class="flex items-center justify-between border-t border-gray-200 py-3">
        <div v-if="data.last_page > 1" class="flex flex-1 justify-between sm:hidden">
            <div class="relative inline-flex items-center rounded-md border border-gray-300 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                @click="go_previous()">Previous</div>
            <div class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                @click="go_next()">Next</div>
        </div>
        <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
                <p class="text-sm text-gray-700 dark:text-gray-200">
                    Showing
                    {{ ' ' }}
                    <span class="font-medium">{{ data.from }}</span>
                    {{ ' ' }}
                    to
                    {{ ' ' }}
                    <span class="font-medium">{{ data.to }}</span>
                    {{ ' ' }}
                    of
                    {{ ' ' }}
                    <span class="font-medium">{{ data.total }}</span>
                    {{ ' ' }}
                    results
                </p>
            </div>
            <div>
                <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <div class="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white dark:bg-gray-800 px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20 cursor-pointer"
                        @click="go_previous()">
                        <span class="sr-only">Previous</span>
                        <ChevronLeftIcon class="h-5 w-5" aria-hidden="true" />
                    </div>
                    <!-- Current: "z-10 bg-sky-50 dark:bg-gray-800 border-sky-500 text-sky-600", Default: "bg-white dark:bg-gray-800 border-gray-300 text-gray-500 hover:bg-gray-50" -->
                    <template v-if="pg_display_limit >= data.last_page">
                        <div :aria-current="[data.current_page == pg ? 'page' : '']"
                            :class="['relative z-10 inline-flex items-center px-4 py-2 text-sm font-medium focus:z-20 cursor-pointer', data.current_page == pg ? 'border border-sky-500 bg-sky-50 dark:bg-gray-800 text-sky-600' : 'border border-l-0']"
                            v-for="(pg, index) in data.last_page" :key="index" @click="load_content(pg)"
                            v-html="pg_num_display(pg)"></div>
                    </template>
                    <template v-else>

                        <template v-if="first_page_display">
                            <div :aria-current="[data.current_page == 1 ? 'page' : '']"
                                :class="['relative z-10 inline-flex items-center px-4 py-2 text-sm font-medium focus:z-20 cursor-pointer', data.current_page == 1 ? 'border border-sky-500 bg-sky-50 dark:bg-gray-800 text-sky-600' : 'border-t border-b border-gray-300']"
                                @click="load_content(1)" v-html="pg_num_display(1)"></div>
                            <div
                                class="relative inline-flex items-center border border-gray-300 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700">
                                ...</div>
                        </template>

                        <template v-if="pg_list">
                            <div :aria-current="[data.current_page == pg ? 'page' : '']"
                                :class="['relative z-10 inline-flex items-center px-4 py-2 text-sm font-medium focus:z-20 cursor-pointer', data.current_page == pg ? 'border border-sky-500 bg-sky-50 dark:bg-gray-800 text-sky-600' : 'border-t border-b border-r border-gray-300']"
                                v-for="(status, pg) in pg_list" :key="pg" @click="load_content(pg)"
                                v-html="pg_num_display(pg)"></div>
                        </template>

                        <template v-if="last_page_display">
                            <div
                                class="relative inline-flex items-center border border-gray-300 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700">
                                ...</div>
                            <div :aria-current="[data.current_page == data.last_page ? 'page' : '']"
                                :class="['relative z-10 inline-flex items-center px-4 py-2 text-sm font-medium focus:z-20 cursor-pointer', data.current_page == data.last_page ? 'border border-sky-500 bg-sky-50 dark:bg-gray-800 text-sky-600' : 'border-t border-b border-gray-300']"
                                @click="load_content(data.last_page)" v-html="pg_num_display(data.last_page)"></div>
                        </template>

                    </template>

                    <div class="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white dark:bg-gray-800 px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20 cursor-pointer"
                        @click="go_next()">
                        <span class="sr-only">Next</span>
                        <ChevronRightIcon class="h-5 w-5" aria-hidden="true" />
                    </div>
                </nav>
            </div>
        </div>
    </div>
</template>
