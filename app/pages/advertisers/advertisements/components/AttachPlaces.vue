<script setup>
const props = defineProps({
    isOpenModal: {
        type: Boolean,
        default: false
    },
    advertisement: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['close']);

const visible = computed({
    get: () => props.isOpenModal,
    set: (value) => {
        if (!value) emit('close');
    }
});

const availablePlaces = ref([]);
const attachedPlaces = ref([]);
const isLoading = ref(false);
const errors = ref({});

const newPlace = ref({
    ads_place_id: '',
    display_order: 1,
    is_active: true
});

const loadAvailablePlaces = async () => {
    try {
        const response = await $fetchCitizen('advertiser/advertisements/ads-places/list', {
            method: 'GET'
        });
        if (response.data?.data) {
            availablePlaces.value = response.data.data;
        }
    } catch (e) {
        console.error('Error loading places:', e.message);
    }
};

const loadAttachedPlaces = async () => {
    if (!props.advertisement?.id) return;
    
    isLoading.value = true;
    try {
        const response = await $fetchCitizen(`advertiser/advertisements/${props.advertisement.id}/show`, {
            method: 'GET'
        });
        // Get ads_places from API response
        attachedPlaces.value = response.data?.ads_places || [];
    } catch (e) {
        console.error('Error loading attached places:', e.message);
    } finally {
        isLoading.value = false;
    }
};

watch(() => props.isOpenModal, (newVal) => {
    if (newVal && props.advertisement?.id) {
        loadAvailablePlaces();
        loadAttachedPlaces();
    }
});

onMounted(() => {
    if (props.isOpenModal && props.advertisement?.id) {
        loadAvailablePlaces();
        loadAttachedPlaces();
    }
});

const attachPlace = async () => {
    if (!newPlace.value.ads_place_id) {
        return;
    }

    isLoading.value = true;
    errors.value = {};

    try {
        // Build array of all places to attach (existing + new)
        const placesToAttach = [
            ...attachedPlaces.value.map(p => ({
                ads_place_id: p.id,
                display_order: p.display_order,
                is_active: p.is_active ? 1 : 0
            })),
            {
                ads_place_id: newPlace.value.ads_place_id,
                display_order: newPlace.value.display_order,
                is_active: newPlace.value.is_active ? 1 : 0
            }
        ];

        // Create FormData to properly send nested array structure
        const formData = new FormData();
        placesToAttach.forEach((place, index) => {
            formData.append(`ads_places[${index}][ads_place_id]`, place.ads_place_id);
            formData.append(`ads_places[${index}][display_order]`, place.display_order);
            formData.append(`ads_places[${index}][is_active]`, place.is_active);
        });

        const response = await $fetchCitizen(
            `advertiser/advertisements/${props.advertisement.id}/attach-place`,
            {
                method: 'POST',
                body: formData
            }
        );

        if (response.status === 'success') {
            // Reload attached places to get updated data
            await loadAttachedPlaces();

            // Reset form
            newPlace.value = {
                ads_place_id: '',
                display_order: 1,
                is_active: true
            };
        }
    } catch (e) {
        if (e.response?.status === 422) {
            errors.value = e.response._data.errors || {};
        }
        console.error('Error:', e.message);
    } finally {
        isLoading.value = false;
    }
};

const editingPlace = ref(null);

const startEdit = (place) => {
    editingPlace.value = {
        id: place.id,
        display_order: place.display_order,
        is_active: place.is_active
    };
};

const cancelEdit = () => {
    editingPlace.value = null;
};

const updatePlace = async (place) => {
    if (!editingPlace.value) return;
    
    isLoading.value = true;
    errors.value = {};

    try {
        // Build array with all placements including the updated one
        const placesToUpdate = attachedPlaces.value.map(p => ({
            ads_place_id: p.id,
            display_order: p.id === place.id ? editingPlace.value.display_order : p.display_order,
            is_active: p.id === place.id ? (editingPlace.value.is_active ? 1 : 0) : (p.is_active ? 1 : 0)
        }));

        // Create FormData to properly send nested array structure
        const formData = new FormData();
        placesToUpdate.forEach((place, index) => {
            formData.append(`ads_places[${index}][ads_place_id]`, place.ads_place_id);
            formData.append(`ads_places[${index}][display_order]`, place.display_order);
            formData.append(`ads_places[${index}][is_active]`, place.is_active);
        });

        const response = await $fetchCitizen(
            `advertiser/advertisements/${props.advertisement.id}/attach-place`,
            {
                method: 'POST',
                body: formData
            }
        );

        if (response.status === 'success') {
            await loadAttachedPlaces();
            editingPlace.value = null;
        }
    } catch (e) {
        if (e.response?.status === 422) {
            errors.value = e.response._data.errors || {};
        }
        console.error('Error:', e.message);
    } finally {
        isLoading.value = false;
    }
};

const detachPlace = async (placeId) => {
    isLoading.value = true;

    try {
        const response = await $fetchCitizen(
            `advertiser/advertisements/${props.advertisement.id}/detach-place/${placeId}`,
            {
                method: 'POST',
                body: {
                    _method: 'DELETE'
                }
            }
        );

        if (response.status === 'success') {
            await loadAttachedPlaces();
        }
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        isLoading.value = false;
    }
};

const close = () => {
    emit('close');
};

const getAvailablePlacesForSelection = computed(() => {
    const attachedIds = attachedPlaces.value.map(p => p.ads_place_id || p.id);
    return availablePlaces.value.filter(p => !attachedIds.includes(p.id));
});
</script>

<template>
    <Dialog v-model:visible="visible" modal :closable="false" :style="{ width: '60rem' }"
        @update:visible="$emit('close')">
        <template #header>
            <div class="flex items-center justify-center w-full gap-2">
                <h4 class="text-xl font-semibold">Manage Ad Placements</h4>
            </div>
        </template>
        
        <div class="mb-4">
            <p class="text-sm text-gray-500 dark:text-gray-400">
                Advertisement: <strong>{{ advertisement.title }}</strong>
            </p>
        </div>

        <!-- Add New Placement -->
        <div class="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 class="font-semibold mb-3">Attach New Placement</h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="flex items-center gap-4">
                    <div class="flex-auto">
                        <label class="font-semibold text-sm">Placement</label>
                        <Dropdown v-model="newPlace.ads_place_id" :options="getAvailablePlacesForSelection"
                            optionLabel="name" optionValue="id" placeholder="Select placement" class="w-full"
                            :class="errors.ads_place_id ? 'border-[#f44336!important]' : ''"
                            @focus="errors.ads_place_id = ''" />
                    </div>
                </div>
                <div class="flex items-center gap-4">
                    <div class="flex-auto">
                        <label class="font-semibold text-sm">Display Order</label>
                        <InputText v-model="newPlace.display_order" type="number" min="1" class="w-full" />
                    </div>
                </div>
                <div class="flex items-end">
                    <Button type="button" label="Attach" severity="success" raised
                        :disabled="!newPlace.ads_place_id || isLoading" @click="attachPlace" class="w-full">
                        <template #icon>
                            <i class="pi pi-plus-circle mr-2"></i>
                        </template>
                    </Button>
                </div>
            </div>
            <div class="mt-3 flex items-center gap-4">
                <label class="font-semibold text-sm">Active</label>
                <ToggleSwitch v-model="newPlace.is_active" />
            </div>
        </div>

        <!-- Attached Placements List -->
        <div>
            <h4 class="font-semibold mb-3">Attached Placements</h4>

            <LoaderDataFetch v-if="isLoading && attachedPlaces.length === 0" />

            <div v-else-if="attachedPlaces.length === 0"
                class="text-center py-8 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg">
                No placements attached yet.
            </div>

            <div v-else class="space-y-2">
                <div v-for="place in attachedPlaces" :key="place.id"
                    class="p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <!-- View Mode -->
                    <div v-if="editingPlace?.id !== place.id" class="flex items-center justify-between">
                        <div class="flex-1">
                            <div class="flex items-center gap-2">
                                <h5 class="text-sm font-medium text-gray-900 dark:text-white">
                                    {{ place.name }}
                                </h5>
                                <span
                                    :class="place.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'"
                                    class="px-2 py-0.5 text-xs font-semibold rounded">
                                    {{ place.is_active ? 'Active' : 'Inactive' }}
                                </span>
                            </div>
                            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {{ place.slug }} • Order: {{ place.display_order }}
                            </p>
                        </div>
                        <div class="flex items-center gap-2">
                            <Button type="button" severity="info" text rounded :disabled="isLoading"
                                @click="startEdit(place)" title="Edit">
                                <i class="pi pi-pencil"></i>
                            </Button>
                            <Button type="button" severity="danger" text rounded :disabled="isLoading"
                                @click="detachPlace(place.id)" title="Remove">
                                <i class="pi pi-trash"></i>
                            </Button>
                        </div>
                    </div>

                    <!-- Edit Mode -->
                    <div v-else class="space-y-3">
                        <div>
                            <h5 class="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                {{ place.name }}
                            </h5>
                            <div class="grid grid-cols-2 gap-3">
                                <div class="flex items-center gap-4">
                                    <div class="flex-auto">
                                        <label class="font-semibold text-sm">Display Order</label>
                                        <InputText v-model="editingPlace.display_order" type="number" min="1"
                                            class="w-full" />
                                    </div>
                                </div>
                                <div class="flex items-end">
                                    <div class="flex items-center gap-4 h-10">
                                        <label class="font-semibold text-sm">Active</label>
                                        <ToggleSwitch v-model="editingPlace.is_active" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="flex gap-2">
                            <Button type="button" label="Save" severity="success" raised :disabled="isLoading"
                                @click="updatePlace(place)" class="flex-1">
                                <template #icon>
                                    <i class="pi pi-check-circle mr-2"></i>
                                </template>
                            </Button>
                            <Button type="button" label="Cancel" severity="secondary" outlined :disabled="isLoading"
                                @click="cancelEdit" class="flex-1">
                                <template #icon>
                                    <i class="pi pi-times-circle mr-2"></i>
                                </template>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <template #footer class="flex justify-end gap-2 border-gray-200">
            <div class="flex justify-end items-center gap-3 border-gray-200">
                <Button type="button" label="Done" severity="success" raised
                    class="transition-all duration-300 hover:scale-105 hover:shadow-lg" @click="close">
                    <template #icon>
                        <i class="pi pi-check-circle mr-2"></i>
                    </template>
                </Button>
            </div>
        </template>
    </Dialog>
</template>
