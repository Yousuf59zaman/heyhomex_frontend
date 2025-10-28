<script setup lang="ts">
interface RegisterFormData {
    fullName: string;
    email: string;
    password: string;
    priceRange: string;
    preferredLocation: string;
}

// Props
const props = defineProps<{
    modelValue: boolean;
}>();

// Emits
const emit = defineEmits<{
    'update:modelValue': [value: boolean];
    'register-success': [data: RegisterFormData];
    'show-login': [];
    close: [];
}>();

// Computed for two-way binding
const visible = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emit('update:modelValue', value)
});

// State
const loading = ref(false);
const errorMessage = ref('');

// Form data
const formData = reactive<RegisterFormData>({
    fullName: '',
    email: '',
    password: '',
    priceRange: '',
    preferredLocation: '',
});

// Static options
const priceRangeOptions = [
    { label: 'Select price range', value: '', disabled: true },
    { label: '$0 - $300K', value: '0-300k' },
    { label: '$300K - $600K', value: '300k-600k' },
    { label: '$600K - $1M', value: '600k-1m' },
    { label: '$1M+', value: '1m+' },
];

const preferredLocationOptions = [
    { label: 'Select Preferred location', value: '', disabled: true },
    { label: 'Urban', value: 'urban' },
    { label: 'Suburban', value: 'suburban' },
    { label: 'Rural', value: 'rural' },
    { label: 'Coastal', value: 'coastal' },
];

// Methods
const closeModal = () => {
    emit('update:modelValue', false);
    emit('close');
    setTimeout(() => {
        resetForm();
    }, 300);
};

const resetForm = () => {
    formData.fullName = '';
    formData.email = '';
    formData.password = '';
    formData.priceRange = '';
    formData.preferredLocation = '';
    errorMessage.value = '';
};

const handleRegister = async () => {
    loading.value = true;
    errorMessage.value = '';

    try {
        // TODO: Replace with actual API call
        // const response = await $fetchCitizen('/citizen/register', {
        //     method: 'POST',
        //     body: formData
        // });

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Store user data temporarily
        if (import.meta.client) {
            localStorage.setItem('citizen_needs_onboarding', 'true');
            localStorage.setItem('citizen_temp_email', formData.email);
        }

        emit('register-success', { ...formData });
        closeModal();
        
        // Show login modal after registration
        setTimeout(() => {
            emit('show-login');
        }, 300);

    } catch (error: any) {
        errorMessage.value = error?.response?._data?.message || 'Registration failed. Please try again.';
    } finally {
        loading.value = false;
    }
};

const showLogin = () => {
    closeModal();
    setTimeout(() => {
        emit('show-login');
    }, 300);
};

// Prevent body scroll when modal is open
watch(
    () => props.modelValue,
    (newValue) => {
        if (import.meta.client) {
            document.body.style.overflow = newValue ? 'hidden' : '';
        }
    }
);

// Cleanup on unmount
onUnmounted(() => {
    if (import.meta.client) {
        document.body.style.overflow = '';
    }
});
</script>

<template>
    <Dialog
        v-model:visible="visible"
        modal
        :closable="true"
        :draggable="false"
        :resizable="false"
        class="citizen-register-modal"
        :style="{ width: 'min(45rem, 95vw)', maxWidth: '95vw' }"
        :pt="{
            root: 'border-0 rounded-2xl shadow-2xl m-4',
            header: 'border-0 pb-0',
            content: 'border-0 pt-0 pb-6',
            closeButton:
                'absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-sm transition-colors duration-200',
        }">
        <template #header>
            <div class="w-full text-center px-4 sm:px-6 pt-6 sm:pt-8 pb-4 sm:pb-6">
                <h1 class="text-2xl sm:text-3xl max-w-sm mx-auto font-semibold text-[#121A22] mb-2 leading-tight">
                    You bring the dream. We'll map the way. ✨
                </h1>
                <p class="text-sm text-[#121A22]">
                    Create your account to start your home journey
                </p>
            </div>
        </template>

        <!-- Content -->
        <div class="px-4 sm:px-6 pb-6">
            <form @submit.prevent="handleRegister" class="space-y-4">
                <div v-if="errorMessage" class="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p class="text-sm text-red-600">{{ errorMessage }}</p>
                </div>

                <div class="flex flex-col gap-2">
                    <label for="fullName" class="text-sm font-medium text-gray-700">Full Name</label>
                    <InputText
                        id="fullName"
                        v-model="formData.fullName"
                        placeholder="Enter your full name"
                        required
                        :pt="{
                            root: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
                        }" />
                </div>

                <div class="flex flex-col gap-2">
                    <label for="email" class="text-sm font-medium text-gray-700">Email Address</label>
                    <InputText
                        id="email"
                        v-model="formData.email"
                        type="email"
                        placeholder="Enter your email address"
                        required
                        :pt="{
                            root: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
                        }" />
                </div>

                <div class="flex flex-col gap-2">
                    <label for="password" class="text-sm font-medium text-gray-700">Password</label>
                    <InputText
                        id="password"
                        v-model="formData.password"
                        type="password"
                        placeholder="Create a password"
                        required
                        :pt="{
                            root: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
                        }" />
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="flex flex-col gap-2">
                        <label for="priceRange" class="text-sm font-medium text-gray-700">Price Range</label>
                        <Dropdown
                            id="priceRange"
                            v-model="formData.priceRange"
                            :options="priceRangeOptions"
                            optionLabel="label"
                            optionValue="value"
                            optionDisabled="disabled"
                            placeholder="Select price range"
                            required
                            :pt="{
                                root: 'w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
                                input: 'px-4 py-3',
                            }" />
                    </div>

                    <div class="flex flex-col gap-2">
                        <label for="preferredLocation" class="text-sm font-medium text-gray-700">Preferred Location</label>
                        <Dropdown
                            id="preferredLocation"
                            v-model="formData.preferredLocation"
                            :options="preferredLocationOptions"
                            optionLabel="label"
                            optionValue="value"
                            optionDisabled="disabled"
                            placeholder="Select location"
                            required
                            :pt="{
                                root: 'w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
                                input: 'px-4 py-3',
                            }" />
                    </div>
                </div>

                <Button
                    type="submit"
                    :disabled="loading"
                    :loading="loading"
                    loadingIcon="pi pi-spin pi-spinner"
                    class="w-full"
                    :pt="{
                        root: 'w-full mb-3 px-6 py-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center',
                    }">
                    {{ loading ? 'Creating Account...' : 'Create Account' }}
                </Button>

                <div class="text-center">
                    <p class="text-sm text-gray-600">
                        Already have an account?
                        <button
                            type="button"
                            @click="showLogin"
                            class="text-blue-600 hover:text-blue-700 font-medium">
                            Sign In
                        </button>
                    </p>
                </div>
            </form>
        </div>
    </Dialog>
</template>

<style scoped>
.citizen-register-modal .p-dialog {
    border-radius: 1rem;
}

.citizen-register-modal .p-dialog-header {
    border: none;
    padding-bottom: 0;
}

.citizen-register-modal .p-dialog-content {
    border: none;
    padding-top: 0;
    padding-bottom: 1.5rem;
}
</style>
