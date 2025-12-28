<template>
    <Dialog
        v-model:visible="isVisible"
        modal
        :draggable="false"
        :closable="false"
        :dismissableMask="true"
        :pt="{
            root: {class: 'max-w-[720px] w-full mx-4'},
            mask: {class: 'bg-black/50'},
            content: {
                class: 'bg-white rounded-[10px] px-6 py-8 flex flex-col gap-12',
            },
        }">
        <!-- Header -->
        <template #container>
            <div
                class="bg-white rounded-[10px] px-6 py-8 flex flex-col gap-12 w-full max-h-[90vh] overflow-y-auto">
                <div class="flex gap-12 items-center w-full">
                    <button
                        @click="closeModal"
                        class="flex items-center justify-center shrink-0 hover:opacity-70 transition-opacity"
                        type="button">
                        <i
                            class="fa-regular fa-chevron-left text-2xl text-[#121a22]"></i>
                    </button>
                    <h2
                        class="flex-1 text-[#121a22] text-[32px] font-medium leading-10 text-center">
                        Change password
                    </h2>
                    <div class="w-[15px] h-6 shrink-0"></div>
                </div>

                <!-- Form Fields -->
                <div class="flex flex-col gap-5">
                    <!-- Current Password -->
                    <div class="flex flex-col w-full">
                        <label
                            class="text-[#121a22] text-base font-medium leading-6 pb-2">
                            Current password
                        </label>
                        <Password
                            v-model="form.old_password"
                            :feedback="false"
                            toggleMask
                            placeholder="Enter your password"
                            inputClass="w-full"
                            :pt="{
                                root: {class: 'w-full'},
                                pcInput: {
                                    class: 'bg-white border border-[#cfdbe8] rounded-lg h-14 px-4 pr-12 w-full text-[#121a22] text-base font-normal leading-6 focus:outline-none focus:border-[#121a22] focus:ring-0 transition-colors placeholder:text-[#566573]',
                                    root: {class: 'w-full'},
                                },
                                maskIcon: {class: 'text-[#121a22] text-base'},
                                unmaskIcon: {class: 'text-[#121a22] text-base'},
                            }" />
                        <small
                            v-if="errors.old_password"
                            class="text-[#ea4335] mt-1"
                            >{{ errors.old_password }}</small
                        >
                    </div>

                    <!-- New Password -->
                    <div class="flex flex-col w-full">
                        <label
                            class="text-[#121a22] text-base font-medium leading-6 pb-2">
                            New password
                        </label>
                        <Password
                            v-model="form.password"
                            :feedback="false"
                            toggleMask
                            placeholder="Enter your password"
                            @input="validatePassword"
                            inputClass="w-full"
                            :pt="{
                                root: {class: 'w-full'},
                                pcInput: {
                                    class: 'bg-white border border-[#cfdbe8] rounded-lg h-14 px-4 pr-12 w-full text-[#121a22] text-base font-normal leading-6 focus:outline-none focus:border-[#121a22] focus:ring-0 transition-colors placeholder:text-[#566573]',
                                    root: {class: 'w-full'},
                                },
                                maskIcon: {class: 'text-[#121a22] text-base'},
                                unmaskIcon: {class: 'text-[#121a22] text-base'},
                            }" />
                        <small
                            v-if="errors.password"
                            class="text-[#ea4335] mt-1"
                            >{{ errors.password }}</small
                        >
                    </div>

                    <!-- Confirm New Password -->
                    <div class="flex flex-col w-full">
                        <label
                            class="text-[#121a22] text-base font-medium leading-6 pb-2">
                            Confirm new password
                        </label>
                        <Password
                            v-model="form.password_confirmation"
                            :feedback="false"
                            toggleMask
                            placeholder="Enter your password"
                            @input="validatePassword"
                            inputClass="w-full"
                            :pt="{
                                root: {class: 'w-full'},
                                pcInput: {
                                    class: 'bg-white border border-[#cfdbe8] rounded-lg h-14 px-4 pr-12 w-full text-[#121a22] text-base font-normal leading-6 focus:outline-none focus:border-[#121a22] focus:ring-0 transition-colors placeholder:text-[#566573]',
                                    root: {class: 'w-full'},
                                },
                                maskIcon: {class: 'text-[#121a22] text-base'},
                                unmaskIcon: {class: 'text-[#121a22] text-base'},
                            }" />
                        <small
                            v-if="errors.password_confirmation"
                            class="text-[#ea4335] mt-1"
                            >{{ errors.password_confirmation }}</small
                        >
                    </div>

                    <!-- Password Requirements -->
                    <div class="flex flex-col gap-3 w-full">
                        <div class="flex gap-2 items-center">
                            <div
                                class="shrink-0 w-3 h-3 rounded-full transition-all duration-200 flex items-center justify-center"
                                :class="
                                    passwordValidation.minLength
                                        ? 'bg-[#121A22]'
                                        : 'border border-[#cfdbe8]'
                                ">
                                <svg
                                    v-if="passwordValidation.minLength"
                                    class="w-2 h-2 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="4"
                                        d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <p
                                :class="[
                                    'flex-1 text-sm leading-normal transition-colors duration-200',
                                    passwordValidation.minLength
                                        ? 'text-[#121A22]'
                                        : 'text-[#566573]',
                                ]">
                                Minimum of 8 characters
                            </p>
                        </div>

                        <div class="flex gap-2 items-center">
                            <div
                                class="shrink-0 w-3 h-3 rounded-full transition-all duration-200 flex items-center justify-center"
                                :class="
                                    passwordValidation.hasSymbol
                                        ? 'bg-[#121A22]'
                                        : 'border border-[#cfdbe8]'
                                ">
                                <svg
                                    v-if="passwordValidation.hasSymbol"
                                    class="w-2 h-2 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="4"
                                        d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <p
                                :class="[
                                    'flex-1 text-sm leading-normal transition-colors duration-200',
                                    passwordValidation.hasSymbol
                                        ? 'text-[#121A22]'
                                        : 'text-[#566573]',
                                ]">
                                Must have at least 1 symbol
                            </p>
                        </div>

                        <div class="flex gap-2 items-center">
                            <div
                                class="shrink-0 w-3 h-3 rounded-full transition-all duration-200 flex items-center justify-center"
                                :class="
                                    passwordValidation.hasCapital
                                        ? 'bg-[#121A22]'
                                        : 'border border-[#cfdbe8]'
                                ">
                                <svg
                                    v-if="passwordValidation.hasCapital"
                                    class="w-2 h-2 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="4"
                                        d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <p
                                :class="[
                                    'flex-1 text-sm leading-normal transition-colors duration-200',
                                    passwordValidation.hasCapital
                                        ? 'text-[#121A22]'
                                        : 'text-[#566573]',
                                ]">
                                Must have at least 1 capital letter
                            </p>
                        </div>

                        <div class="flex gap-2 items-center">
                            <div
                                class="shrink-0 w-3 h-3 rounded-full transition-all duration-200 flex items-center justify-center"
                                :class="
                                    passwordValidation.passwordsMatch
                                        ? 'bg-[#121A22]'
                                        : 'border border-[#cfdbe8]'
                                ">
                                <svg
                                    v-if="passwordValidation.passwordsMatch"
                                    class="w-2 h-2 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="4"
                                        d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <p
                                :class="[
                                    'flex-1 text-sm leading-normal transition-colors duration-200',
                                    passwordValidation.passwordsMatch
                                        ? 'text-[#121A22]'
                                        : 'text-[#566573]',
                                ]">
                                Password and confirm password must be the same
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Submit Button -->
                <div class="flex flex-col w-full">
                    <Button
                        @click="handleSubmit"
                        :disabled="loading || !isFormValid"
                        :loading="loading"
                        label="Change password"
                        class="bg-[#18222c] text-white text-base font-bold leading-6 px-5 py-[14px] rounded-xl h-[52px] w-full hover:bg-[#2a3440] transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-0"
                        :pt="{
                            root: {
                                class: 'bg-[#18222c] hover:bg-[#2a3440] border-0 text-white font-bold text-base h-[52px] rounded-xl',
                            },
                            label: {class: 'font-bold text-base'},
                        }">
                    </Button>
                </div>
            </div>
        </template>
    </Dialog>
</template>

<script setup>
import Dialog from 'primevue/dialog'
import Password from 'primevue/password'
import Button from 'primevue/button'

// Props
const props = defineProps({
    isOpen: {
        type: Boolean,
        default: false
    }
})

// Emits
const emit = defineEmits(['close', 'success'])

// State
const loading = ref(false)
const errors = ref({})

// Form Data
const form = ref({
    old_password: '',
    password: '',
    password_confirmation: ''
})

// Password Validation
const passwordValidation = ref({
    minLength: false,
    hasSymbol: false,
    hasCapital: false,
    passwordsMatch: false
})

// Computed
const isVisible = computed({
    get: () => props.isOpen,
    set: (value) => {
        if (!value) {
            closeModal()
        }
    }
})

const isFormValid = computed(() => {
    return (
        form.value.old_password &&
        passwordValidation.value.minLength &&
        passwordValidation.value.hasSymbol &&
        passwordValidation.value.hasCapital &&
        passwordValidation.value.passwordsMatch
    )
})

// Methods
const validatePassword = () => {
    const password = form.value.password
    
    // Check minimum length
    passwordValidation.value.minLength = password.length >= 8
    
    // Check for symbol
    passwordValidation.value.hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password)
    
    // Check for capital letter
    passwordValidation.value.hasCapital = /[A-Z]/.test(password)
    
    // Check if passwords match
    passwordValidation.value.passwordsMatch =
        password &&
        form.value.password_confirmation &&
        password === form.value.password_confirmation
}

const closeModal = () => {
    if (!loading.value) {
        resetForm()
        emit('close')
    }
}

const resetForm = () => {
    form.value = {
        old_password: '',
        password: '',
        password_confirmation: ''
    }
    errors.value = {}
    passwordValidation.value = {
        minLength: false,
        hasSymbol: false,
        hasCapital: false,
        passwordsMatch: false
    }
}

const handleSubmit = async () => {
    if (!isFormValid.value) return

    errors.value = {}
    loading.value = true

    try {
        const response = await $fetchCitizen('/v1/profile/update', {
            method: 'POST',
            body: {
                old_password: form.value.old_password,
                password: form.value.password,
                password_confirmation: form.value.password_confirmation
            }
        })

        if (response.status === 'success') {
            emit('success')
            alert(response.message || 'Password changed successfully!')
            closeModal()
        }

    } catch (error) {
        console.error('Error changing password:', error)

        // Handle validation errors
        if (error.data?.errors) {
            errors.value = error.data.errors
        } else if (error.data?.message) {
            // Handle specific error messages
            if (error.data.message.includes('password')) {
                errors.value.old_password = error.data.message
            } else {
                alert(error.data.message)
            }
        } else {
            alert('Failed to change password. Please try again.')
        }
    } finally {
        loading.value = false
    }
}

// Watch for modal open/close
watch(() => props.isOpen, (newVal) => {
    if (newVal) {
        // Reset form when modal opens
        resetForm()
    }
})
</script>

<style scoped>
/* Custom scrollbar for modal content */
.overflow-y-auto::-webkit-scrollbar {
    width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: #555;
}
</style>
