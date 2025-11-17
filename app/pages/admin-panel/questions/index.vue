<script setup>
    const AddEdit = defineAsyncComponent(() =>
        import('./components/AddEdit.vue')
    )
    definePageMeta({ layout: 'admin' })

    const { $optionsList } = useNuxtApp()

    const optionsList = $optionsList()
    const route = useRoute()
    const status = ref(optionsList[0])
    const search = ref('')

    const paginationConfig = ref({
        data: [],
        lang: 'en',
        align: 'center',
        action: '',
    })
    const isLoading = ref(false)
    const data = ref([])
    const permissions = ref({})
    const orderedQuestions = ref([])

    // Fetch ordered questions list
    const loadOrderedQuestions = async () => {
        try {
            const response = await $fetchAdmin(
                `admin/question-banks/question/show-to-user/list`,
                {
                    method: 'GET',
                }
            )

            if (response.status === 'success') {
                orderedQuestions.value = response.data || []
            }
        } catch (e) {
            console.log('Error loading ordered questions:', e.message)
            orderedQuestions.value = []
        }
    }

    // Check if question is in order
    const isQuestionOrdered = (questionId) => {
        return orderedQuestions.value.some(
            (oq) => oq.question_bank?.id === questionId
        )
    }

    // Get order number for a question
    const getQuestionOrder = (questionId) => {
        const ordered = orderedQuestions.value.find(
            (oq) => oq.question_bank?.id === questionId
        )
        return ordered ? ordered.show_order : null
    }

    const loadData = async () => {
        isLoading.value = true
        permissions.value = {}
        try {
            const response = await $fetchAdmin(
                `admin/question-banks/question/list`,
                {
                    method: 'GET',
                    params: {
                        page: route.query.page ? route.query.page : 1,
                        search: search.value,
                        status:
                            status.value.key == 'status'
                                ? status.value.value
                                : '',
                        trashed: status.value.key == 'trashed' ? 'only' : '',
                    },
                }
            )

            console.log('API Response:', response)

            // The API returns data inside response.data.data array
            data.value = Array.isArray(response.data?.data) ? response.data.data : []
            permissions.value = response.data?.permissions || {}

            // For pagination, pass the meta object
            paginationConfig.value.data = response.data?.meta || {}

            console.log('Data array:', data.value)
            console.log('Data length:', data.value.length)
            console.log('Is Array:', Array.isArray(data.value))

            // Load ordered questions to check status
            await loadOrderedQuestions()
        } catch (e) {
            console.log('Get Message', e.message)
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
        (to) => {
            console.log('to', to)
            loadData()
        }
    )

    const isOpenModal = ref(false)
    const item = ref({})
    const modalTitle = ref('')
    const editHandler = (i) => {
        modalTitle.value = 'Edit'
        isOpenModal.value = true
        item.value = i
        console.log('editHandler', item)
    }

    const addNew = () => {
        item.value = {}
        modalTitle.value = 'Create'
        isOpenModal.value = true
    }

    const receivedData = (d) => {
        console.log('receivedData', d)
        isOpenModal.value = false
        modalTitle.value == 'Create'
            ? data.value.push(d)
            : (data.value = data.value.map((item) =>
                  item.id == d.id ? d : item
              ))
    }
    const cancelModal = () => {
        item.value = {}
        isOpenModal.value = false
        console.log('isOpenModal', isOpenModal.value)
    }

    // Delete
    const isOpenConModal = ref(false)
    const response_modal = ref({})
    const deleteId = ref(null)

    const openDeleteModal = (id) => {
        deleteId.value = id
        isOpenConModal.value = true
    }
    const deleteHandler = async () => {
        response_modal.value = {}
        try {
            const getData = await $fetchAdmin(
                `admin/question-banks/question/${deleteId.value}/delete`,
                {
                    method: 'DELETE',
                }
            )
            if (getData) {
                response_modal.value = {
                    status: true,
                    message: getData.message,
                }
                data.value = data.value.filter(
                    (item) => item.id !== deleteId.value
                )
            }
        } catch (e) {
            if (e.response?.status === 404 || e.response?.status === 409) {
                response_modal.value = e.response._data
            }
        } finally {
            isOpenConModal.value = false
        }
    }

    const restoreHandler = async (id) => {
        response_modal.value = {}
        try {
            const getData = await $fetchAdmin(
                `admin/question-banks/question/restore/${id}`,
                {
                    method: 'POST',
                }
            )
            if (getData.status == true) {
                response_modal.value = getData
                data.value = data.value.filter((item) => item.id !== id)
            }
        } catch (e) {
            if (e.response?.status === 404 || e.response?.status === 409) {
                response_modal.value = e.response._data
            }
        } finally {
            isOpenConModal.value = false
        }
    }

    const resetPagination = () => {
        const query = { ...route.query }
        delete query.page
        navigateTo({ query }, { replace: true })
    }

    const onChangeHandler = () => {
        loadData()
        resetPagination()
    }

    // Add to order functionality
    const isOrderModalOpen = ref(false)
    const selectedQuestionForOrder = ref(null)
    const orderInput = ref(1)
    const maxOrder = ref(3)

    const openAddToOrderModal = (question) => {
        selectedQuestionForOrder.value = question
        orderInput.value = 1 // Reset to 1
        isOrderModalOpen.value = true
    }

    const addToOrder = async () => {
        if (!selectedQuestionForOrder.value) return

        if (orderInput.value < 1 || orderInput.value > maxOrder.value) {
            response_modal.value = {
                status: false,
                message: `Order must be between 1 and ${maxOrder.value}`,
            }
            return
        }

        response_modal.value = {}
        try {
            const getData = await $fetchAdmin(
                `admin/question-banks/question/assign`,
                {
                    method: 'POST',
                    body: {
                        question_bank_id: selectedQuestionForOrder.value.id,
                        show_order: orderInput.value,
                        is_active: 1,
                    },
                }
            )

            if (getData.status === 'success') {
                response_modal.value = {
                    status: true,
                    message:
                        getData.message ||
                        'Question added to order successfully',
                }
                isOrderModalOpen.value = false
                selectedQuestionForOrder.value = null
                // Reload data to refresh the list
                loadData()
            }
        } catch (e) {
            console.error('Add to order error:', e)
            response_modal.value = {
                status: false,
                message:
                    e.response?._data?.message ||
                    'Failed to add question to order',
            }
        }
    }

    const cancelOrderModal = () => {
        isOrderModalOpen.value = false
        selectedQuestionForOrder.value = null
        orderInput.value = 1
    }

    // Remove from order (using order ID from ordered questions list)
    const removeFromOrder = async (questionId) => {
        const orderedQuestion = orderedQuestions.value.find(
            (oq) => oq.question_bank?.id === questionId
        )
        if (!orderedQuestion) return

        response_modal.value = {}
        try {
            const getData = await $fetchAdmin(
                `admin/question-banks/question/${orderedQuestion.id}/assign/remove`,
                {
                    method: 'PATCH',
                    body: {
                        question_bank_id: questionId,
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
</script>

<template>
    <div class="h-full mx-auto max-w-7xl px-2 sm:px-6 lg:px-8 my-6">
        <div class="h-full w-full overflow-auto">
            <div
                class="w-full flex flex-wrap md:flex-nowrap justify-between items-center gap-4 mb-4">
                <div class="w-full md:w-auto flex flex-wrap gap-4">
                    <div
                        class="flex flex-wrap md:flex-nowrap items-center gap-4 w-full md:w-auto">
                        <div class="flex items-center gap-2 w-full md:w-auto">
                            <label
                                for="search"
                                class="text-gray-800 dark:text-gray-200"
                                >Search</label
                            >
                            <InputText
                                type="text"
                                v-model="search"
                                @input="loadData"
                                @keyup.enter="loadData"
                                class="w-full md:w-auto" />
                        </div>
                        <div class="flex items-center gap-3 w-full md:w-auto">
                            <label
                                for="status"
                                class="text-gray-800 dark:text-gray-200"
                                >Status</label
                            >
                            <Select
                                v-model="status"
                                :options="optionsList"
                                optionLabel="name"
                                @change="onChangeHandler"
                                placeholder="Select"
                                class="w-full md:w-auto" />
                        </div>
                    </div>
                </div>
                <Skeleton
                    v-if="isLoading"
                    width="8rem"
                    height="2.5rem"
                    borderRadius="10px"></Skeleton>
                <div
                    v-else
                    class="flex gap-2">
                    <Button
                        label="View Ordered Questions"
                        @click="navigateTo('/admin-panel/questions/ordered')"
                        severity="info"
                        icon="fa-solid fa-list-ol"
                        class="text-xs" />
                    <Button
                        label="Create Question"
                        @click="addNew"
                        class="text-xs" />
                </div>
            </div>

            <div class="pb-2 flex flex-col justify-between w-full">
                <div
                    class="mt-4 border border-gray-200 rounded-lg bg-white dark:bg-gray-800">
                    <div class="border-b border-gray-200">
                        <h4
                            class="text-lg font-semibold text-gray-800 dark:text-gray-200 py-2 px-4">
                            Questions
                        </h4>
                    </div>
                    <div class="p-4">
                        <div
                            class="custom_table overflow-auto border-b border-gray-200">
                            <table class="table table-auto">
                                <thead class="sticky z-10 top-0">
                                    <tr>
                                        <!-- <th width="5%">
                                            <div class="flex flex-row items-center justify-start gap-2 text-gray-800 dark:text-gray-200">
                                                <span>ID</span>
                                            </div>
                                        </th> -->
                                        <th width="15%">
                                            <div
                                                class="flex flex-row items-center justify-start gap-2 text-gray-800 dark:text-gray-200">
                                                <span>Question Group</span>
                                            </div>
                                        </th>
                                        <th width="25%">
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
                                        <th width="10%">
                                            <div
                                                class="flex flex-row items-center justify-center gap-2 text-gray-800 dark:text-gray-200">
                                                <span>Order Status</span>
                                            </div>
                                        </th>
                                        <th width="15%">
                                            <div
                                                class="flex flex-row items-center justify-center gap-2 text-gray-800 dark:text-gray-200">
                                                <span>Created At</span>
                                            </div>
                                        </th>
                                        <th width="12%">
                                            <div
                                                class="flex flex-row items-center justify-center gap-2 text-gray-800 dark:text-gray-200">
                                                <span>Action</span>
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody
                                    v-if="isLoading"
                                    class="">
                                    <tr
                                        v-for="index in 10"
                                        :key="index">
                                        <!-- <td class="text-gray-800 dark:text-gray-200">
                                            <Skeleton width="3rem" class="mb-2"></Skeleton>
                                        </td> -->
                                        <td
                                            class="text-gray-800 dark:text-gray-200">
                                            <Skeleton
                                                width="8rem"
                                                class="mb-2"></Skeleton>
                                        </td>
                                        <td
                                            class="text-gray-800 dark:text-gray-200">
                                            <Skeleton
                                                width="12rem"
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
                                                <Skeleton
                                                    size="1.5rem"></Skeleton>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                                <tbody
                                    v-else-if="
                                        Array.isArray(data) && data.length > 0
                                    ">
                                    <tr
                                        v-for="element in data"
                                        :key="element.id">
                                        <!-- <td class="text-gray-800 dark:text-gray-200">{{ element.id }}</td> -->
                                        <td
                                            class="text-gray-800 dark:text-gray-200">
                                            {{ element.question_group?.name }}
                                        </td>
                                        <td
                                            class="text-gray-800 dark:text-gray-200">
                                            {{ element.question_text }}
                                        </td>
                                        <td
                                            class="text-gray-800 dark:text-gray-200 text-center">
                                            {{ element.answers?.length || 0 }}
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
                                        <td>
                                            <div
                                                class="flex justify-center items-center">
                                                <span
                                                    v-if="
                                                        isQuestionOrdered(
                                                            element.id
                                                        )
                                                    "
                                                    class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold flex items-center gap-1">
                                                    <i
                                                        class="fa-solid fa-list-ol"></i>
                                                    Order #{{
                                                        getQuestionOrder(
                                                            element.id
                                                        )
                                                    }}
                                                </span>
                                                <Button
                                                    v-else
                                                    @click="
                                                        openAddToOrderModal(
                                                            element
                                                        )
                                                    "
                                                    label="Add to Order"
                                                    size="small"
                                                    severity="success"
                                                    class="text-xs px-2 py-1" />
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
                                                        editHandler(element)
                                                    "
                                                    class="fa-solid fa-pen-to-square text-gray-800 dark:text-gray-200 hover:text-green-500 cursor-pointer transition duration-150 ease-in-out"
                                                    title="Edit"></i>
                                                <i
                                                    v-if="
                                                        isQuestionOrdered(
                                                            element.id
                                                        )
                                                    "
                                                    @click="
                                                        removeFromOrder(
                                                            element.id
                                                        )
                                                    "
                                                    class="fa-solid fa-list-slash text-orange-500 hover:text-orange-700 cursor-pointer transition duration-150 ease-in-out"
                                                    title="Remove from Order"></i>
                                                <i
                                                    @click="
                                                        openDeleteModal(
                                                            element.id
                                                        )
                                                    "
                                                    class="fa-solid fa-trash text-red-500 hover:text-red-800 cursor-pointer transition duration-150 ease-in-out"
                                                    title="Delete"></i>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                                <tbody v-else>
                                    <tr>
                                        <td
                                            colspan="8"
                                            class="text-center text-gray-500 py-8">
                                            No questions found
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <AddEdit
                        :isOpenModal="isOpenModal"
                        :item="item"
                        :modalTitle="modalTitle"
                        @close="cancelModal"
                        @add_emit="receivedData" />
                    <LazyPagination
                        v-if="!isLoading"
                        class="px-4"
                        :config="paginationConfig" />
                    <LazyConfirmModal
                        :isOpenConModal="isOpenConModal"
                        @confirm="deleteHandler"
                        @update:isOpenConModal="isOpenConModal = $event" />
                    <LazyResponseModal :response_modal="response_modal" />

                    <!-- Add to Order Modal -->
                    <Dialog
                        v-model:visible="isOrderModalOpen"
                        modal
                        :header="`Add Question to Order`"
                        :style="{ width: '30rem' }">
                        <div class="flex flex-col gap-4">
                            <div>
                                <p
                                    class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                    Question:
                                    <span
                                        class="font-semibold text-gray-800 dark:text-gray-200"
                                        >{{
                                            selectedQuestionForOrder?.question_text
                                        }}</span
                                    >
                                </p>
                            </div>
                            <div class="flex flex-col gap-2">
                                <label
                                    for="orderInput"
                                    class="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Order Number (1-{{ maxOrder }})
                                </label>
                                <InputNumber
                                    id="orderInput"
                                    v-model="orderInput"
                                    :min="1"
                                    :max="maxOrder"
                                    :step="1"
                                    showButtons
                                    buttonLayout="horizontal"
                                    class="w-full"
                                    :pt="{
                                        input: { class: 'text-center' },
                                    }" />
                                <small class="text-gray-500 dark:text-gray-400">
                                    Maximum order allowed is {{ maxOrder }}
                                </small>
                            </div>
                        </div>
                        <template #footer>
                            <div class="flex justify-end gap-2">
                                <Button
                                    label="Cancel"
                                    severity="secondary"
                                    @click="cancelOrderModal" />
                                <Button
                                    label="Add to Order"
                                    severity="success"
                                    @click="addToOrder" />
                            </div>
                        </template>
                    </Dialog>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
