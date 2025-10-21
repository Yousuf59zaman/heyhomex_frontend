<script setup>
definePageMeta({ middleware: ['auth-admin'], layout: 'admin' });
const route = useRoute();

const form = reactive({
    viewPs: [],
    addPs: [],
    editPs: [],
    deletePs: [],
})

const loader = ref(false);
const permissions = ref([]);
const loadData = async () => {
    loader.value = true;
    try {
        const getData = await $fetchAdmin(`admin/role-permissions/show/${route.params.id}`, {
            method: 'POST',
        });
        permissions.value = getData.data;
        permissions.value.forEach(item => {
            if (item.viewP) { form.viewPs.push(item.view); }
            if (item.addP) { form.addPs.push(item.add); }
            if (item.editP) { form.editPs.push(item.edit); }
            if (item.deleteP) { form.deletePs.push(item.delete); }
        })
    } catch (e) {
        console.log('Get Message', e.message);
    } finally {
        loader.value = false;
    }
};

onMounted(() => {
    loadData();
});

const response_modal = ref({});
const isLoading = ref(false);
const updateHandler = async () => {
    isLoading.value = true;
    response_modal.value = {};
    permissions.value.map(perm => {
        if (form.viewPs.includes(perm.view)) {
            perm.viewP = perm.view;
        } else {
            perm.viewP = null;
        }
        if (form.addPs.includes(perm.add)) {
            perm.addP = perm.add;
        } else {
            perm.addP = null;
        }
        if (form.editPs.includes(perm.edit)) {
            perm.editP = perm.edit;
        } else {
            perm.editP = null;
        }
        if (form.deletePs.includes(perm.delete)) {
            perm.deleteP = perm.delete;
        } else {
            perm.deleteP = null;
        }
    });
    // console.log('permission_form', permissions.value);
    try {
        const getData = await $fetchAdmin(`admin/role-permissions/permission-update/${route.params.id}`, {
            method: 'POST',
            body: permissions.value
        });
        if (getData.status == true) {
            response_modal.value = getData;
        }
    } catch (e) {
        // console.log('here 1',e.response);
        if (e.response?.status === 404 || e.response?.status === 409) {
            // console.log('here 2',e.response._data);
            response_modal.value = e.response._data;
        }
    } finally {
        isLoading.value = false;
    }
}

const groupedPermissions = computed(() => {
    const parents = permissions.value.filter(p => p.pid == 0);
    return parents.map(parent => {
        const children = permissions.value.filter(p => p.pid == parent.id);
        return {
            parent,
            children,
            hasChildren: children.length > 0
        };
    });
});

const openAccordions = ref([]);
const toggleAccordion = (id) => {
    const index = openAccordions.value.indexOf(id);
    if (index > -1) {
        openAccordions.value.splice(index, 1);
    } else {
        openAccordions.value.push(id);
    }
}

const isAccordionOpen = (id) => {
    return openAccordions.value.includes(id);
}

const stopPropagation = (event) => {
    event.stopPropagation();
}
</script>
<template>
    <div class="h-full mx-auto max-w-7xl px-2 sm:px-6 lg:px-8 my-6">
        <div class="h-full w-full overflow-auto">
            <div class="pb-2 flex flex-col justify-between w-full">
                <div class="mt-4 border border-gray-200 rounded-lg bg-white dark:bg-gray-800">
                    <div class="border-b border-gray-200">
                        <h4 class="text-lg font-semibold text-gray-800 dark:text-gray-200 py-2 px-4">Role Permission
                        </h4>
                    </div>
                    <div class="p-3">
                        <div v-if="loader">
                            <div class="space-y-2">
                                <div v-for="i in 5" :key="i"
                                    class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                    <div class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700">
                                        <Skeleton width="15rem" height="1.5rem" class="mb-0"></Skeleton>
                                        <div class="flex items-center">
                                            <div class="flex items-center mr-3">
                                                <span class="mr-1 text-sm text-gray-300 dark:text-gray-600">View</span>
                                                <Skeleton size="1.5rem" class="ml-1"></Skeleton>
                                            </div>
                                            <Skeleton size="1.2rem" class="ml-1"></Skeleton>
                                        </div>
                                    </div>

                                    <div
                                        class="p-2 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                                        <div v-for="j in 3" :key="j" class="px-2 mb-2 rounded-lg">
                                            <div class="flex flex-wrap items-center">
                                                <div class="w-full md:w-1/2 mb-1 md:mb-0 pl-1">
                                                    <Skeleton width="10rem" height="1.2rem"></Skeleton>
                                                </div>
                                                <div class="w-full md:w-1/2 flex flex-wrap justify-end gap-3">
                                                    <div class="flex items-center">
                                                        <span
                                                            class="mr-1 text-sm text-gray-300 dark:text-gray-600">View</span>
                                                        <Skeleton size="1.2rem"></Skeleton>
                                                    </div>
                                                    <div class="flex items-center">
                                                        <span
                                                            class="mr-1 text-sm text-gray-300 dark:text-gray-600">Add</span>
                                                        <Skeleton size="1.2rem"></Skeleton>
                                                    </div>
                                                    <div class="flex items-center">
                                                        <span
                                                            class="mr-1 text-sm text-gray-300 dark:text-gray-600">Edit</span>
                                                        <Skeleton size="1.2rem"></Skeleton>
                                                    </div>
                                                    <div class="flex items-center">
                                                        <span
                                                            class="mr-1 text-sm text-gray-300 dark:text-gray-600">Delete</span>
                                                        <Skeleton size="1.2rem"></Skeleton>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div v-else>
                            <div class="space-y-2">
                                <div v-for="(group, groupIndex) in groupedPermissions" :key="groupIndex"
                                    class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                    <div v-if="group.hasChildren" @click="toggleAccordion(group.parent.id)"
                                        class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-600">
                                        <h3 class="font-semibold text-gray-800 dark:text-gray-200">
                                            {{ group.parent.node_name }}
                                        </h3>
                                        <div class="flex items-center">
                                            <div class="flex items-center mr-3" @click.stop>
                                                <span class="mr-1 text-sm text-gray-600 dark:text-gray-300">View</span>
                                                <Checkbox :id="'p_view-' + group.parent.view" v-model="form.viewPs"
                                                    :value="group.parent.view" @click="stopPropagation($event)" />
                                            </div>
                                            <svg xmlns="http://www.w3.org/2000/svg"
                                                :class="{ 'transform rotate-180': isAccordionOpen(group.parent.id) }"
                                                class="h-5 w-5 transition-transform duration-200 text-gray-500 dark:text-gray-400"
                                                viewBox="0 0 20 20" fill="currentColor">
                                                <path fill-rule="evenodd"
                                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                    clip-rule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div v-else 
                                        class="flex flex-wrap items-center justify-between p-2 bg-gray-50 dark:bg-gray-700">
                                        <h3 class="font-semibold text-gray-800 dark:text-gray-200">
                                            {{ group.parent.node_name }}
                                        </h3>
                                        <div class="flex flex-wrap justify-end gap-3">
                                            <div v-if="group.parent.view" class="flex items-center">
                                                <span class="mr-1 text-sm text-gray-600 dark:text-gray-300">View</span>
                                                <Checkbox :id="'p_view-' + group.parent.view" v-model="form.viewPs"
                                                    :value="group.parent.view" />
                                            </div>
                                            <div v-if="group.parent.add" class="flex items-center">
                                                <span class="mr-1 text-sm text-gray-600 dark:text-gray-300">Add</span>
                                                <Checkbox :id="'p_add-' + group.parent.add" v-model="form.addPs"
                                                    :value="group.parent.add" />
                                            </div>
                                            <div v-if="group.parent.edit" class="flex items-center">
                                                <span class="mr-1 text-sm text-gray-600 dark:text-gray-300">Edit</span>
                                                <Checkbox :id="'p_edit-' + group.parent.edit" v-model="form.editPs"
                                                    :value="group.parent.edit" />
                                            </div>
                                            <div v-if="group.parent.delete" class="flex items-center">
                                                <span class="mr-1 text-sm text-gray-600 dark:text-gray-300">Delete</span>
                                                <Checkbox :id="'p_delete-' + group.parent.delete"
                                                    v-model="form.deletePs" :value="group.parent.delete" />
                                            </div>
                                        </div>
                                    </div>

                                    <div v-if="group.hasChildren && isAccordionOpen(group.parent.id)"
                                        class="p-2 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                                        <div v-for="(child, childIndex) in group.children" :key="childIndex"
                                            class="px-2 mb-2 rounded-lg">
                                            <div class="flex flex-wrap items-center">
                                                <div
                                                    class="w-full md:w-1/2 mb-1 md:mb-0 text-gray-800 dark:text-gray-200 pl-1">
                                                    {{ child.node_name }}
                                                </div>
                                                <div class="w-full md:w-1/2 flex flex-wrap justify-end gap-3">
                                                    <div v-if="child.view" class="flex items-center">
                                                        <span
                                                            class="mr-1 text-sm text-gray-600 dark:text-gray-300">View</span>
                                                        <Checkbox :id="'p_view-' + child.view" v-model="form.viewPs"
                                                            :value="child.view" />
                                                    </div>
                                                    <div v-if="child.add" class="flex items-center">
                                                        <span
                                                            class="mr-1 text-sm text-gray-600 dark:text-gray-300">Add</span>
                                                        <Checkbox :id="'p_add-' + child.add" v-model="form.addPs"
                                                            :value="child.add" />
                                                    </div>
                                                    <div v-if="child.edit" class="flex items-center">
                                                        <span
                                                            class="mr-1 text-sm text-gray-600 dark:text-gray-300">Edit</span>
                                                        <Checkbox :id="'p_edit-' + child.edit" v-model="form.editPs"
                                                            :value="child.edit" />
                                                    </div>
                                                    <div v-if="child.delete" class="flex items-center">
                                                        <span
                                                            class="mr-1 text-sm text-gray-600 dark:text-gray-300">Delete</span>
                                                        <Checkbox :id="'p_delete-' + child.delete"
                                                            v-model="form.deletePs" :value="child.delete" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="flex justify-end gap-2 pt-3 mt-3">
                                <Button v-if="isLoading" severity="secondary" style="cursor: not-allowed; width: 80px;">
                                    <ProgressSpinner style="width: 25px; height: 25px" strokeWidth="8"
                                        animationDuration=".5s" />
                                </Button>
                                <template v-else>
                                    <Button type="button" label="Update" @click="updateHandler()"></Button>
                                </template>
                            </div>
                        </div>
                    </div>
                    <LazyResponseModal :response_modal="response_modal" />
                </div>
            </div>
        </div>
    </div>
</template>