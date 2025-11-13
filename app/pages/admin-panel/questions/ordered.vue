<script setup>
    import { VueDraggableNext as draggable } from 'vue-draggable-next'

    definePageMeta({ layout: 'admin' })

    const route = useRoute()
    const isLoading = ref(false)
    const data = ref([])
    const response_modal = ref({})

    const loadData = async () => {
        isLoading.value = true
        try {
            const response = await $fetchAdmin(
                `admin/question-banks/question/show-to-user/list`,
                {
                    method: 'GET',
                    params: {
                        page: route.query.page ? route.query.page : 1,
                    },
                }
            )

            console.log('Ordered Questions Response:', response)

            if (response.status === 'success') {
                data.value = Array.isArray(response.data) ? response.data : []
            }

            console.log('Ordered Data:', data.value)
        } catch (e) {
            console.log('Error:', e.message)
            data.value = []
        } finally {
            isLoading.value = false
        }
    }

    onMounted(() => {
        loadData()
    })

    watch(
        () => route.query,
        () => {
            loadData()
        }
    )

    // Drag and drop functionality
    const isDragging = ref(false)

    const onDragStart = () => {
        isDragging.value = true
    }

    const onDragEnd = async (event) => {
        isDragging.value = false

        // Get the moved item
        const movedItem = data.value[event.newIndex]
        const newOrder = event.newIndex + 1 // 1-based index

        console.log('Drag ended:', {
            item: movedItem,
            oldIndex: event.oldIndex,
            newIndex: event.newIndex,
            newOrder,
        })

        // Call API to update order
        await updateQuestionOrder(movedItem, newOrder)
    }

    const updateQuestionOrder = async (orderedQuestion, showOrder) => {
        response_modal.value = {}
        try {
            const getData = await $fetchAdmin(
                `admin/question-banks/question/assign`,
                {
                    method: 'POST',
                    body: {
                        question_bank_id: orderedQuestion.question_bank?.id,
                        show_order: showOrder,
                        is_active: 1,
                    },
                }
            )

            if (getData.status === 'success') {
                response_modal.value = {
                    status: true,
                    message: getData.message || 'Order updated successfully',
                }
            }
        } catch (e) {
            console.error('Order update error:', e)
            response_modal.value = {
                status: false,
                message:
                    e.response?._data?.message ||
                    'Failed to update question order',
            }
            // Reload data to restore correct order
            loadData()
        }
    }

    // Remove from order
    const removeFromOrder = async (orderedQuestion) => {
        response_modal.value = {}
        try {
            const getData = await $fetchAdmin(
                `admin/question-banks/question/${orderedQuestion.id}/assign/remove`,
                {
                    method: 'PATCH',
                    body: {
                        question_bank_id: orderedQuestion.question_bank?.id,
                        show_order: orderedQuestion.show_order,
                        is_active: 1,
                    },
                }
            )

            if (getData.status === 'success') {
                response_modal.value = {
                    status: true,
                    message:
                        getData.message ||
                        'Question removed from order successfully',
                }
                // Reload data to refresh the list
                loadData()
            }
        } catch (e) {
            console.error('Remove from order error:', e)
            response_modal.value = {
                status: false,
                message:
                    e.response?._data?.message ||
                    'Failed to remove question from order',
            }
        }
    }

    const goBack = () => {
        navigateTo('/admin-panel/questions')
    }
</script>

<template>
    <div class="h-full mx-auto max-w-7xl px-2 sm:px-6 lg:px-8 my-6">
        <div class="h-full w-full overflow-auto">
            <div
                class="w-full flex flex-wrap md:flex-nowrap justify-between items-center gap-4 mb-4">
                <div class="flex items-center gap-3">
                    <Button
                        icon="fa-solid fa-arrow-left"
                        severity="secondary"
                        @click="goBack"
                        label="Back to Questions"
                        class="text-xs" />
                    <h2
                        class="text-xl font-semibold text-gray-800 dark:text-gray-200">
                        Ordered Questions
                    </h2>
                </div>
            </div>

            <div class="pb-2 flex flex-col justify-between w-full">
                <div
                    class="mt-4 border border-gray-200 rounded-lg bg-white dark:bg-gray-800">
                    <div class="border-b border-gray-200">
                        <h4
                            class="text-lg font-semibold text-gray-800 dark:text-gray-200 py-2 px-4">
                            Questions Ordered for Users (Drag to Reorder)
                        </h4>
                    </div>
                    <div class="p-4">
                        <div
                            class="custom_table overflow-auto border-b border-gray-200">
                            <table class="table table-auto">
                                <thead class="sticky z-10 top-0">
                                    <tr>
                                        <th width="3%">
                                            <div
                                                class="flex flex-row items-center justify-center gap-2 text-gray-800 dark:text-gray-200">
                                                <i
                                                    class="fa-solid fa-grip-vertical"></i>
                                            </div>
                                        </th>
                                        <th width="5%">
                                            <div
                                                class="flex flex-row items-center justify-center gap-2 text-gray-800 dark:text-gray-200">
                                                <span>Order</span>
                                            </div>
                                        </th>
                                        <th width="5%">
                                            <div
                                                class="flex flex-row items-center justify-start gap-2 text-gray-800 dark:text-gray-200">
                                                <span>ID</span>
                                            </div>
                                        </th>
                                        <th width="15%">
                                            <div
                                                class="flex flex-row items-center justify-start gap-2 text-gray-800 dark:text-gray-200">
                                                <span>Question Group</span>
                                            </div>
                                        </th>
                                        <th width="30%">
                                            <div
                                                class="flex flex-row items-center justify-start gap-2 text-gray-800 dark:text-gray-200">
                                                <span>Question Text</span>
                                            </div>
                                        </th>
                                        <th width="10%">
                                            <div
                                                class="flex flex-row items-center justify-center gap-2 text-gray-800 dark:text-gray-200">
                                                <span>Answers Count</span>
                                            </div>
                                        </th>
                                        <th width="10%">
                                            <div
                                                class="flex flex-row items-center justify-center gap-2 text-gray-800 dark:text-gray-200">
                                                <span>Status</span>
                                            </div>
                                        </th>
                                        <th width="12%">
                                            <div
                                                class="flex flex-row items-center justify-center gap-2 text-gray-800 dark:text-gray-200">
                                                <span>Created At</span>
                                            </div>
                                        </th>
                                        <th width="8%">
                                            <div
                                                class="flex flex-row items-center justify-center gap-2 text-gray-800 dark:text-gray-200">
                                                <span>Action</span>
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody v-if="isLoading">
                                    <tr
                                        v-for="index in 5"
                                        :key="index">
                                        <td
                                            class="text-gray-800 dark:text-gray-200 text-center">
                                            <Skeleton size="1.5rem"></Skeleton>
                                        </td>
                                        <td
                                            class="text-gray-800 dark:text-gray-200 text-center">
                                            <Skeleton
                                                width="2rem"
                                                class="mb-2"></Skeleton>
                                        </td>
                                        <td
                                            class="text-gray-800 dark:text-gray-200">
                                            <Skeleton
                                                width="3rem"
                                                class="mb-2"></Skeleton>
                                        </td>
                                        <td
                                            class="text-gray-800 dark:text-gray-200">
                                            <Skeleton
                                                width="8rem"
                                                class="mb-2"></Skeleton>
                                        </td>
                                        <td
                                            class="text-gray-800 dark:text-gray-200">
                                            <Skeleton
                                                width="15rem"
                                                class="mb-2"></Skeleton>
                                        </td>
                                        <td
                                            class="text-gray-800 dark:text-gray-200 text-center">
                                            <Skeleton
                                                width="4rem"
                                                class="mb-2"></Skeleton>
                                        </td>
                                        <td>
                                            <div
                                                class="flex justify-center items-center gap-2">
                                                <Skeleton
                                                    size="1.5rem"></Skeleton>
                                            </div>
                                        </td>
                                        <td
                                            class="text-gray-800 dark:text-gray-200 text-center">
                                            <Skeleton
                                                width="6rem"
                                                class="mb-2"></Skeleton>
                                        </td>
                                        <td>
                                            <div
                                                class="flex justify-center items-center gap-2">
                                                <Skeleton
                                                    size="1.5rem"></Skeleton>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                                <draggable
                                    v-else-if="
                                        Array.isArray(data) && data.length > 0
                                    "
                                    tag="tbody"
                                    :list="data"
                                    handle=".drag-handle"
                                    :group="{ name: 'ordered-questions' }"
                                    @start="onDragStart"
                                    @end="onDragEnd">
                                    <template
                                        v-for="element in data"
                                        :key="element.id">
                                        <tr>
                                            <td
                                                class="text-gray-800 dark:text-gray-200 text-center">
                                                <div
                                                    class="drag-handle cursor-move hover:text-blue-600 transition-colors">
                                                    <i
                                                        class="fa-solid fa-grip-vertical text-xl"></i>
                                                </div>
                                            </td>
                                            <td
                                                class="text-gray-800 dark:text-gray-200 text-center">
                                                <span
                                                    class="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                                                    {{ element.show_order }}
                                                </span>
                                            </td>
                                            <td
                                                class="text-gray-800 dark:text-gray-200">
                                                {{
                                                    element.question_bank?.id ||
                                                    'N/A'
                                                }}
                                            </td>
                                            <td
                                                class="text-gray-800 dark:text-gray-200">
                                                {{
                                                    element.question_bank
                                                        ?.question_group
                                                        ?.name || 'N/A'
                                                }}
                                            </td>
                                            <td
                                                class="text-gray-800 dark:text-gray-200">
                                                {{
                                                    element.question_bank
                                                        ?.question_text ||
                                                    'Question not available'
                                                }}
                                            </td>
                                            <td
                                                class="text-gray-800 dark:text-gray-200 text-center">
                                                {{
                                                    element.question_bank
                                                        ?.answers?.length || 0
                                                }}
                                            </td>
                                            <td>
                                                <div
                                                    class="flex justify-center items-center">
                                                    <span
                                                        v-if="element.is_active"
                                                        class="text-green-600">
                                                        <i
                                                            class="fa fa-power-off"
                                                            aria-hidden="true"></i>
                                                    </span>
                                                    <span
                                                        v-else
                                                        class="text-red-500">
                                                        <i
                                                            class="fa fa-power-off"
                                                            aria-hidden="true"></i>
                                                    </span>
                                                </div>
                                            </td>
                                            <td
                                                class="text-gray-800 dark:text-gray-200 text-center">
                                                {{
                                                    new Date(
                                                        element.created_at
                                                    ).toLocaleDateString()
                                                }}
                                            </td>
                                            <td>
                                                <div
                                                    class="flex justify-center items-center gap-2">
                                                    <i
                                                        @click="
                                                            removeFromOrder(
                                                                element
                                                            )
                                                        "
                                                        class="fa-solid fa-trash text-red-500 hover:text-red-800 cursor-pointer transition duration-150 ease-in-out"
                                                        title="Remove from Order"></i>
                                                </div>
                                            </td>
                                        </tr>
                                    </template>
                                </draggable>
                                <tbody v-else>
                                    <tr>
                                        <td
                                            colspan="9"
                                            class="text-center text-gray-500 py-8">
                                            No ordered questions found
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <LazyResponseModal :response_modal="response_modal" />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
    /* Drag handle styling */
    .drag-handle {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.25rem;
        border-radius: 0.25rem;
        transition: all 0.2s ease-in-out;
    }

    .drag-handle:hover {
        background-color: rgba(59, 130, 246, 0.1);
        transform: scale(1.1);
    }

    /* Ghost element while dragging */
    .ghost {
        opacity: 0.4;
        background: #f7fafc;
        border: 2px dashed #3b82f6;
    }

    /* Element being dragged */
    .drag {
        opacity: 1;
        background: #ffffff;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
            0 4px 6px -2px rgba(0, 0, 0, 0.05);
        cursor: grabbing !important;
    }

    /* Row styling during drag */
    tr.dragging {
        cursor: grab;
    }

    /* Smooth transition for reordering */
    tbody tr {
        transition: transform 0.2s ease;
    }

    /* Make drag handle more visible */
    .fa-grip-vertical {
        color: #94a3b8;
    }

    .drag-handle:hover .fa-grip-vertical {
        color: #3b82f6;
    }
</style>
