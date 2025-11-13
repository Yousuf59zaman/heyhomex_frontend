<script setup>
    const props = defineProps({
        isOpenModal: Boolean,
        modalTitle: String,
        item: Object,
    })

    const emit = defineEmits(['add_emit', 'close'])

    const visible = ref(props.isOpenModal)
    watch(
        () => props.isOpenModal,
        (newVal) => {
            visible.value = newVal
        }
    )

    // Question groups for dropdown
    const questionGroups = ref([])
    const loadQuestionGroups = async () => {
        try {
            const getData = await $fetchAdmin(
                `admin/question-banks/group/list`,
                {
                    method: 'GET',
                }
            )
            questionGroups.value = getData.data.data
        } catch (e) {
            console.log('Get Question Groups Message', e.message)
        }
    }

    // Main form data
    const formData = ref({
        id: null,
        question_group_id: '',
        question_text: '',
        is_active: true,
        answers: [],
    })

    const isChecked = ref(true)

    // Dynamic answer fields based on question group type
    const answerFields = ref([
        {
            answer_text: '',
            user_type_id: '',
            minimum_amount: '',
            maximum_amount: '',
            area: '',
            is_active: true,
        },
    ])

    // Watch for question group changes to update form structure
    watch(
        () => formData.value.question_group_id,
        (newGroupId) => {
            // Reset answers when group changes
            answerFields.value = [
                {
                    answer_text: '',
                    user_type_id: '',
                    minimum_amount: '',
                    maximum_amount: '',
                    area: '',
                    is_active: true,
                },
            ]

            // If editing and group matches existing item, populate answers
            if (
                props.item &&
                props.item.question_group &&
                props.item.question_group.id == newGroupId
            ) {
                populateAnswersFromItem()
            }
        }
    )

    // Populate form when item prop changes (for editing)
    watch(
        () => props.item,
        (value) => {
            if (value && Object.keys(value).length > 0) {
                validations_errors.value = {}
                formData.value = {
                    id: value.id,
                    question_group_id: value.question_group?.id,
                    question_text: value.question_text,
                    is_active: value.is_active,
                    answers: value.answers || [],
                }
                isChecked.value = value.is_active

                // Populate answer fields based on existing data
                populateAnswersFromItem()
            } else {
                formData.value = {
                    id: null,
                    question_group_id: '',
                    question_text: '',
                    is_active: true,
                    answers: [],
                }
                answerFields.value = [
                    {
                        answer_text: '',
                        user_type_id: '',
                        minimum_amount: '',
                        maximum_amount: '',
                        area: '',
                        is_active: true,
                    },
                ]
                isChecked.value = true
            }
        }
    )

    const populateAnswersFromItem = () => {
        if (props.item.answers && props.item.answers.length > 0) {
            answerFields.value = props.item.answers.map((answer) => ({
                answer_text: answer.answer_text,
                user_type_id: answer.user_type_id || '',
                minimum_amount: answer.minimum_amount || '',
                maximum_amount: answer.maximum_amount || '',
                area: answer.area || '',
                is_active: answer.is_active,
            }))
        }
    }

    const handleCheckboxChange = () => {
        formData.value.is_active = isChecked.value
    }

    // Add new answer field
    const addAnswerField = () => {
        if (answerFields.value.length < 3) {
            answerFields.value.push({
                answer_text: '',
                user_type_id: '',
                minimum_amount: '',
                maximum_amount: '',
                area: '',
                is_active: true,
            })
        }
    }

    // Remove answer field
    const removeAnswerField = (index) => {
        if (answerFields.value.length > 1) {
            answerFields.value.splice(index, 1)
        }
    }

    // Get current question group name for field display
    const getCurrentQuestionGroup = () => {
        return questionGroups.value.find(
            (group) => group.id == formData.value.question_group_id
        )
    }

    // Check which fields to show based on question group
    const showUserTypeFields = computed(() => {
        const group = getCurrentQuestionGroup()
        return group && group.name === 'user-type'
    })

    const showPriceRangeFields = computed(() => {
        const group = getCurrentQuestionGroup()
        return group && group.name === 'price-range'
    })

    const showAreaFields = computed(() => {
        const group = getCurrentQuestionGroup()
        return group && group.name === 'area'
    })

    const validations_errors = ref({})
    const skip_validations = ref(['id', 'is_active', 'answers'])

    const isLoading = ref(false)
    const response_modal = ref({})

    // Prepare form data for submission
    const prepareFormData = () => {
        const preparedData = {
            question_group_id: formData.value.question_group_id,
            question_text: formData.value.question_text,
            is_active: formData.value.is_active ? 1 : 0,
            answers: [],
            user_type_id: [],
            minimum_amount: [],
            maximum_amount: [],
            area: [],
        }

        // Add answer fields based on question group type
        answerFields.value.forEach((field, index) => {
            preparedData.answers.push(field.answer_text)

            if (showUserTypeFields.value) {
                preparedData.user_type_id.push(field.user_type_id || '')
            }

            if (showPriceRangeFields.value) {
                preparedData.minimum_amount.push(field.minimum_amount || '')
                preparedData.maximum_amount.push(field.maximum_amount || '')
            }

            if (showAreaFields.value) {
                preparedData.area.push(field.area || '')
            }
        })

        // Remove empty arrays to avoid null issues
        if (!showUserTypeFields.value) {
            delete preparedData.user_type_id
        }
        if (!showPriceRangeFields.value) {
            delete preparedData.minimum_amount
            delete preparedData.maximum_amount
        }
        if (!showAreaFields.value) {
            delete preparedData.area
        }

        return preparedData
    }

    const updateHandler = async () => {
        validations_errors.value = {}

        // Basic validation
        const errors = Object.keys(formData.value).filter(
            (item) =>
                !formData.value[item] &&
                !skip_validations.value.includes(item) &&
                item !== 'answers'
        )

        if (errors.length > 0) {
            errors.map((item) => {
                validations_errors.value[item] = `${item.replaceAll(
                    '_',
                    ' '
                )} is required`
            })
            return
        }

        // Validate answer fields
        let hasAnswerErrors = false
        answerFields.value.forEach((field, index) => {
            if (!field.answer_text) {
                validations_errors.value[`answers_${index}`] = `Answer ${
                    index + 1
                } is required`
                hasAnswerErrors = true
            }

            if (showUserTypeFields.value && !field.user_type_id) {
                validations_errors.value[`user_type_${index}`] = `User Type ${
                    index + 1
                } is required`
                hasAnswerErrors = true
            }

            if (
                showPriceRangeFields.value &&
                (!field.minimum_amount || !field.maximum_amount)
            ) {
                validations_errors.value[
                    `price_range_${index}`
                ] = `Price Range ${index + 1} is required`
                hasAnswerErrors = true
            }

            if (showAreaFields.value && !field.area) {
                validations_errors.value[`area_${index}`] = `Area ${
                    index + 1
                } is required`
                hasAnswerErrors = true
            }
        })

        if (hasAnswerErrors) return

        try {
            isLoading.value = true
            const submitData = prepareFormData()

            const getData = await $fetchAdmin(
                `admin/question-banks/question/${props.item.id}/update`,
                {
                    method: 'PATCH',
                    body: submitData,
                }
            )

            response_modal.value = {
                status: true,
                message: getData.message,
            }
            if (getData) {
                emit('add_emit', getData.data)
            }
        } catch (e) {
            console.log('Get Message', e.message)
            if (e.response?.status === 404 || e.response?.status === 422) {
                if (e.response._data?.data) {
                    for (const key in e.response._data.data) {
                        if (e.response._data.data.hasOwnProperty(key)) {
                            const value = e.response._data.data[key][0]
                            validations_errors.value[key] = value
                        }
                    }
                }
            } else if (!e.response?.status) {
                response_modal.value = {
                    status: false,
                    message: 'Something went wrong. Please try again later.',
                }
            } else {
                response_modal.value = {
                    status: e.response._data.status,
                    message: e.response._data.message,
                }
            }
        } finally {
            isLoading.value = false
        }
    }

    const createHandler = async () => {
        validations_errors.value = {}

        // Basic validation
        const errors = Object.keys(formData.value).filter(
            (item) =>
                !formData.value[item] &&
                !skip_validations.value.includes(item) &&
                item !== 'answers'
        )

        if (errors.length > 0) {
            errors.map((item) => {
                validations_errors.value[item] = `${item.replaceAll(
                    '_',
                    ' '
                )} is required`
            })
            return
        }

        // Validate answer fields
        let hasAnswerErrors = false
        answerFields.value.forEach((field, index) => {
            if (!field.answer_text) {
                validations_errors.value[`answers_${index}`] = `Answer ${
                    index + 1
                } is required`
                hasAnswerErrors = true
            }

            if (showUserTypeFields.value && !field.user_type_id) {
                validations_errors.value[`user_type_${index}`] = `User Type ${
                    index + 1
                } is required`
                hasAnswerErrors = true
            }

            if (
                showPriceRangeFields.value &&
                (!field.minimum_amount || !field.maximum_amount)
            ) {
                validations_errors.value[
                    `price_range_${index}`
                ] = `Price Range ${index + 1} is required`
                hasAnswerErrors = true
            }

            if (showAreaFields.value && !field.area) {
                validations_errors.value[`area_${index}`] = `Area ${
                    index + 1
                } is required`
                hasAnswerErrors = true
            }
        })

        if (hasAnswerErrors) return

        try {
            isLoading.value = true
            const submitData = prepareFormData()

            const getData = await $fetchAdmin(
                `admin/question-banks/question/store`,
                {
                    method: 'POST',
                    body: submitData,
                }
            )

            response_modal.value = {
                status: true,
                message: getData.message,
            }
            if (getData) {
                emit('add_emit', getData.data)
            }
        } catch (e) {
            console.log('Get Message', e.message)
            if (e.response?.status === 404 || e.response?.status === 422) {
                if (e.response._data?.data) {
                    for (const key in e.response._data.data) {
                        if (e.response._data.data.hasOwnProperty(key)) {
                            const value = e.response._data.data[key][0]
                            validations_errors.value[key] = value
                        }
                    }
                }
            } else if (!e.response?.status) {
                response_modal.value = {
                    status: false,
                    message: 'Something went wrong. Please try again later.',
                }
            } else {
                response_modal.value = {
                    status: e.response._data.status,
                    message: e.response._data.message,
                }
            }
        } finally {
            isLoading.value = false
        }
    }

    // Load question groups on component mount
    onMounted(() => {
        loadQuestionGroups()
    })
</script>

<template>
    <Dialog
        v-model:visible="visible"
        modal
        :closable="false"
        :style="{ width: '60rem' }"
        @update:visible="$emit('close')">
        <template #header>
            <div class="flex items-center justify-center w-full gap-2">
                <h4 class="text-xl font-semibold">{{ modalTitle }} Question</h4>
            </div>
        </template>

        <div class="grid grid-cols-1 gap-4">
            <!-- Question Group Selection -->
            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Question Group</label>
                    <Select
                        v-model="formData.question_group_id"
                        :options="questionGroups"
                        optionLabel="name"
                        optionValue="id"
                        placeholder="Select Question Group"
                        class="w-full"
                        :class="
                            validations_errors.question_group_id
                                ? 'border-[#f44336!important]'
                                : ''
                        "
                        @change="validations_errors.question_group_id = ''" />
                    <LazyInputError
                        class="text-sm mt-1"
                        :message="validations_errors.question_group_id" />
                </div>
            </div>

            <!-- Question Text -->
            <div class="flex items-center gap-4">
                <div class="flex-auto">
                    <label class="font-semibold">Question Text</label>
                    <InputText
                        v-model="formData.question_text"
                        class="w-full"
                        :class="
                            validations_errors.question_text
                                ? 'border-[#f44336!important]'
                                : ''
                        "
                        autocomplete="off"
                        @focus="validations_errors.question_text = ''"
                        placeholder="Enter your question text" />
                    <LazyInputError
                        class="text-sm mt-1"
                        :message="validations_errors.question_text" />
                </div>
            </div>

            <!-- Dynamic Answer Fields -->
            <div class="border-t pt-4">
                <div class="flex justify-between items-center mb-4">
                    <label class="font-semibold">Answers (Max 3)</label>
                    <Button
                        v-if="answerFields.length < 3"
                        label="Add Answer"
                        icon="pi pi-plus"
                        severity="secondary"
                        size="small"
                        @click="addAnswerField" />
                </div>

                <div
                    v-for="(field, index) in answerFields"
                    :key="index"
                    class="grid grid-cols-1 gap-4 mb-6 p-4 border rounded-lg">
                    <div class="flex justify-between items-center mb-2">
                        <h5 class="font-medium">Answer {{ index + 1 }}</h5>
                        <Button
                            v-if="answerFields.length > 1"
                            icon="pi pi-times"
                            severity="danger"
                            text
                            @click="removeAnswerField(index)" />
                    </div>

                    <!-- Answer Text (Common for all types) -->
                    <div class="flex items-center gap-4">
                        <div class="flex-auto">
                            <label class="font-semibold">Answer Text</label>
                            <InputText
                                v-model="field.answer_text"
                                class="w-full"
                                :class="
                                    validations_errors[`answers_${index}`]
                                        ? 'border-[#f44336!important]'
                                        : ''
                                "
                                autocomplete="off"
                                placeholder="Enter answer text" />
                            <LazyInputError
                                class="text-sm mt-1"
                                :message="
                                    validations_errors[`answers_${index}`]
                                " />
                        </div>
                    </div>

                    <!-- User Type Fields -->
                    <div
                        v-if="showUserTypeFields"
                        class="flex items-center gap-4">
                        <div class="flex-auto">
                            <label class="font-semibold">User Type ID</label>
                            <InputNumber
                                v-model="field.user_type_id"
                                :useGrouping="false"
                                class="w-full"
                                :class="
                                    validations_errors[`user_type_${index}`]
                                        ? 'border-[#f44336!important]'
                                        : ''
                                "
                                placeholder="Enter user type ID" />
                            <LazyInputError
                                class="text-sm mt-1"
                                :message="
                                    validations_errors[`user_type_${index}`]
                                " />
                        </div>
                    </div>

                    <!-- Price Range Fields -->
                    <div
                        v-if="showPriceRangeFields"
                        class="grid grid-cols-2 gap-4">
                        <div class="flex items-center gap-4">
                            <div class="flex-auto">
                                <label class="font-semibold"
                                    >Minimum Amount</label
                                >
                                <InputNumber
                                    v-model="field.minimum_amount"
                                    :useGrouping="false"
                                    class="w-full"
                                    :class="
                                        validations_errors[
                                            `price_range_${index}`
                                        ]
                                            ? 'border-[#f44336!important]'
                                            : ''
                                    "
                                    placeholder="Enter minimum amount" />
                            </div>
                        </div>
                        <div class="flex items-center gap-4">
                            <div class="flex-auto">
                                <label class="font-semibold"
                                    >Maximum Amount</label
                                >
                                <InputNumber
                                    v-model="field.maximum_amount"
                                    :useGrouping="false"
                                    class="w-full"
                                    :class="
                                        validations_errors[
                                            `price_range_${index}`
                                        ]
                                            ? 'border-[#f44336!important]'
                                            : ''
                                    "
                                    placeholder="Enter maximum amount" />
                            </div>
                        </div>
                        <LazyInputError
                            class="text-sm mt-1 col-span-2"
                            :message="
                                validations_errors[`price_range_${index}`]
                            " />
                    </div>

                    <!-- Area Fields -->
                    <div
                        v-if="showAreaFields"
                        class="flex items-center gap-4">
                        <div class="flex-auto">
                            <label class="font-semibold">Area</label>
                            <InputNumber
                                v-model="field.area"
                                :useGrouping="false"
                                class="w-full"
                                :class="
                                    validations_errors[`area_${index}`]
                                        ? 'border-[#f44336!important]'
                                        : ''
                                "
                                placeholder="Enter area" />
                            <LazyInputError
                                class="text-sm mt-1"
                                :message="
                                    validations_errors[`area_${index}`]
                                " />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Status -->
            <div class="flex items-center gap-4">
                <label class="font-semibold w-24">Status</label>
                <div class="flex-auto">
                    <ToggleSwitch
                        v-model="isChecked"
                        @change="handleCheckboxChange"
                        @focus="validations_errors.is_active = ''" />
                    <LazyInputError
                        class="text-sm mt-1"
                        :message="validations_errors.is_active" />
                </div>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-end items-center gap-3 border-gray-200">
                <Button
                    v-if="isLoading"
                    severity="secondary"
                    style="cursor: not-allowed; width: 80px">
                    <ProgressSpinner
                        style="width: 25px; height: 25px"
                        strokeWidth="8"
                        animationDuration=".5s" />
                </Button>
                <template v-else>
                    <Button
                        type="button"
                        label="Cancel"
                        severity="danger"
                        outlined
                        class="transition-all duration-300 hover:scale-105"
                        @click="$emit('close')">
                        <template #icon="{ class: iconClass }">
                            <i
                                class="pi pi-times-circle mr-2"
                                :class="iconClass"></i>
                        </template>
                    </Button>
                    <Button
                        type="button"
                        :label="modalTitle === 'Create' ? 'Create' : 'Update'"
                        severity="success"
                        raised
                        class="transition-all duration-300 hover:scale-105 hover:shadow-lg"
                        @click="
                            modalTitle === 'Create'
                                ? createHandler()
                                : updateHandler()
                        ">
                        <template #icon="{ class: iconClass }">
                            <i
                                :class="
                                    modalTitle === 'Create'
                                        ? 'pi pi-plus-circle mr-2'
                                        : 'pi pi-refresh mr-2'
                                "></i>
                        </template>
                    </Button>
                </template>
            </div>
        </template>
    </Dialog>
    <LazyResponseModal :response_modal="response_modal" />
</template>

<style lang="scss" scoped></style>
