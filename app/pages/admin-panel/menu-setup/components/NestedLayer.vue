<script setup>
import { VueDraggableNext as draggable } from 'vue-draggable-next'
const NestedLayer = defineAsyncComponent(() => import('./NestedLayer'));

// Props
const props = defineProps({
	menus: Array,
	fromData: Object,
	handleClick: Function
})

// Emit
const emit = defineEmits(['event', 'deleteMenu', 'updateMenu'])

// Refs
const { menus, fromData } = toRefs(props)

// Delete
const isOpenConModal = ref(false);
const response_modal = ref({});
const deleteId = ref(null);
const deleteStatus = ref(null);

const openDeleteModal = (id, status) => {
	deleteId.value = id;
	deleteStatus.value = status;
	isOpenConModal.value = true;
};

const deleteHandler = async () => {
	response_modal.value = {};
	try {
		const getData = await $fetchAdmin(`admin/tree-entity/delete-menu`, {
			method: 'POST',
			body: { id: deleteId.value, status: deleteStatus.value }
		});
		if (getData.status == true) {
			response_modal.value = getData;
			setTimeout(() => {
				emit('deleteMenu', deleteId.value);
			}, 2000);
		}
	} catch (e) {
		// console.log('here 1',e.response);
		if (e.response?.status === 404 || e.response?.status === 409) {
			// console.log('here 2',e.response._data);
			response_modal.value = e.response._data;
		}
	} finally {
		isOpenConModal.value = false;
	}
};

// Form state
const form = ref({
	id: null,
	node_name: '',
	route_name: '',
	route_location: '',
	pid: null,
	icon: 'fas fa-upload',
	status: false,
	serials: null,
});

const isLoading = ref(false);
const updateHandler = async (data) => {
	// console.log('Storing form data:', data);
	isLoading.value = true;
	try {
		const getData = await $fetchAdmin(`admin/tree-entity/${data.id}`, {
			method: 'PUT',
			body: data
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
};

// Methods
const reset = () => {
	Object.assign(form.value, {
		id: null,
		node_name: '',
		route_name: '',
		route_location: '',
		pid: null,
		icon: 'fas fa-upload',
		status: false,
		serials: null,
	});
};

// Helper function to recursively close all items
const closeAllItems = (items) => {
	items.forEach(item => {
		item.showChild = false;
		if (item.menus && item.menus.length > 0) {
			closeAllItems(item.menus);
		}
	});
};

const edit_item = (fromdata) => {
	// Check if the clicked item is already open
	const isCurrentlyOpen = fromdata.showChild;
	
	// Close all items first
	closeAllItems(menus.value);
	
	// If it wasn't open before, open it now (toggle behavior)
	if (!isCurrentlyOpen) {
		fromdata.showChild = true;
		
		// Set form data
		form.value = {
			...fromdata,
			node_name: fromdata.node_name || '',
			route_name: fromdata.route_name || '',
			route_location: fromdata.route_location || '',
			icon: fromdata.icon || 'fas fa-upload',
		};
	}
}

// Icon picker
const isOpenPicker = ref(false);
const OpenPicker = () => {
	isOpenPicker.value = true;
}
const cancelPicker = () => {
	isOpenPicker.value = false;
}
</script>

<template>
	<draggable :class="['dragArea', { has_child: menus.length > 0 }]" handle=".section_drag_cross" tag="ul"
		:list="menus" :group="{ name: 'g1' }">
		<template v-for="element in menus" :key="element.id">
			<li :class="{ has_child: element.menus.length > 0 }">
				<div :class="element.status == 1
					? 'flex items-center gap-2 bg-white dark:bg-gray-800 input_block border dark:border-gray-300'
					: 'flex items-center gap-2 bg-red-100 input_block border text-red-800 border-red-300'">
					<i :class="element.icon + ' section_checkbox rounded-full'"></i>
					<i class="fa fa-up-down-left-right rounded-full section_drag_cross"></i>
					<span class="node_name">{{ element.node_name }}</span>
					<span class="noderoute ml-auto">{{ element.route_name }}</span>
					<span v-if="element.status == 1"
						class="flex items-center justify-center gap-1 text-[10px] bg-white dark:bg-gray-800 dark:bg-gray-200 border dark:border-gray-300  rounded-[50%] h-[25px] w-[25px]">
						<i class="fa fa-pencil edit_btn text-green-800 " role="button" @click="edit_item(element)"></i>
					</span>
					<!-- Delete / Restore -->
					<span
						class="flex items-center justify-center gap-1 text-[10px] bg-white dark:bg-gray-800 dark:bg-gray-200 border dark:border-gray-300 rounded-[50%] h-[25px] w-[25px]">
						<i v-if="element.status == 1" class="fa fa-trash delete_btn text-red-800" role="button"
							@click="openDeleteModal(element.id, 0)">
						</i>
						<i v-else class="fa fa-undo delete_btn text-green-800" role="button"
							@click="openDeleteModal(element.id, 1)">
						</i>
					</span>
				</div>

				<transition name="expand">
					<ul v-if="element.showChild" class="has_child edit_child">
						<div class="mr-3 p-2 border dark:border-gray-300 rounded-md">
							<form @submit.prevent="updateHandler">
								<div class="grid grid-cols-2 gap-2">
									<div class="w-full">
										<label class="font-semibold">Name</label>
										<LazyInputText v-model="form.node_name" class="w-full" placeholder="i.e Name" />
									</div>
									<div class="w-full">
										<label class="font-semibold">Route</label>
										<LazyInputText v-model="form.route_name" class="w-full" placeholder="i.e Route" />
									</div>
									<div class="w-full">
										<label class="font-semibold">Api Route Permission</label>
										<LazyInputText v-model="form.route_location" class="w-full" placeholder="i.e Api Route Permission" />
									</div>
									<div class="w-full flex items-end gap-2">
										<div class="flex-1">
											<label class="font-semibold">Icon</label>
											<LazyInputText v-model="form.icon" class="w-full" placeholder="i.e Icon" disabled />
										</div>
										<i :class="form.icon" class="text-[25px] cursor-pointer text-[#f88900ef]"
											@click="OpenPicker"></i>
										<LazyIconPicker :isOpenPicker="isOpenPicker" :modelValue="form.icon"
											@close="cancelPicker" @update:modelValue="form.icon = $event" />
									</div>
									<div class="col-span-1 sm:col-span-2 w-full flex items-end justify-end gap-3">
										<Button v-if="isLoading" severity="secondary" style="cursor: not-allowed; width: 80px;">
											<ProgressSpinner style="width: 20px; height: 20px" strokeWidth="8" animationDuration=".5s" />
										</Button>
										<template v-else>
											<Button type="button" label="Reset" severity="danger" outlined size="small"
												class="transition-all duration-300 hover:scale-105 px-2 py-1 text-sm" @click="reset">
												<template #icon="{ class: iconClass }">
													<i class="pi pi-refresh mr-1 text-sm" :class="iconClass"></i>
												</template>
											</Button>
											<Button type="button" label="Submit" severity="success" raised size="small"
												class="transition-all duration-300 hover:scale-105 hover:shadow-lg px-2 py-1 text-sm"
												@click="updateHandler(element)">
												<template #icon="{ class: iconClass }">
													<i class="pi pi-check-circle mr-1 text-sm" :class="iconClass"></i>
												</template>
											</Button>
										</template>
									</div>
								</div>
							</form>
						</div>
					</ul>
				</transition>
				<NestedLayer :menus="element.menus" :fromData="fromData" />
			</li>
		</template>
	</draggable>
	<LazyConfirmModal :isOpenConModal="isOpenConModal" @confirm="deleteHandler"
		@update:isOpenConModal="isOpenConModal = $event" />
	<LazyResponseModal :response_modal="response_modal" />
</template>

<style lang="scss" scoped>
$input_height: 30;

.layer_info_block {
	display: block;
	padding: 15px;

	select {
		width: 100%;
		height: 30px;
		// border: 1px solid #ddd;
		padding: 0 10px;
		border-radius: 5px;
	}
}

li {
	position: relative;
	margin-left: 9px;

	.input_block {
		position: relative;
		height: #{$input_height}px;
		user-select: none;
		margin: 5px 0;
		padding: 0 12px 0 0;
		// border: 1px solid #ddd;
		border-radius: 25px;

		&>i {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 28px;
			height: 28px;
			font-size: 10px;

			&.rounded-full {
				border: 1px solid #999;
			}

			&.section_drag_cross {
				display: none;
				cursor: move;
			}
		}

		&:hover {
			i.section_checkbox {
				display: none;
			}

			i.section_drag_cross {
				display: flex;
			}
		}
	}

	&>ul {
		position: relative;
		padding-left: 24px;

		&>li {
			&::after {
				position: absolute;
				content: "";
				width: 20px;
				height: 5px;
				border-bottom: 1px solid #999;
				// border-left: 1px solid #999;
				// border-radius: 0 0 0 5px;
				left: -18.8px;
				top: 12px;
			}
		}

		&.has_child {
			&::before {
				content: "";
				position: absolute;
				left: 14px;
				top: -5px;
				width: 1px;
				height: calc(100% + 10px);
				border-left: 1px solid #999;
			}
		}
	}
}

/* Smooth expand transition */
.expand-enter-active,
.expand-leave-active {
	transition: max-height 0.4s ease-in-out, opacity 0.3s ease-in-out;
	overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
	max-height: 0;
	opacity: 0;
}

.expand-enter-to,
.expand-leave-from {
	max-height: 500px;
	opacity: 1;
}
</style>