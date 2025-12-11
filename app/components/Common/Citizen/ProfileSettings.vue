<template>
    <div class="flex flex-col gap-5 w-full max-w-[672px]">
        <!-- Success Message -->
        <div 
            v-if="successMessage"
            class="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2 animate-fade-in">
            <i class="fa-solid fa-circle-check text-green-600"></i>
            <span class="text-sm font-medium">{{ successMessage }}</span>
        </div>

        <!-- Error Message -->
        <div 
            v-if="errorMessage"
            class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2 animate-fade-in">
            <i class="fa-solid fa-circle-exclamation text-red-600"></i>
            <span class="text-sm font-medium">{{ errorMessage }}</span>
        </div>

        <!-- Profile Photo Section -->
        <div class="flex flex-col gap-0">
            <label class="text-[#121a22] text-base font-medium leading-6 pb-2">
                Profile photo
            </label>
            <div class="flex gap-2 items-center">
                <!-- Photo Preview -->
                <div class="bg-[#f0f1f3] w-[163px] h-[130px] rounded-lg flex items-center justify-center p-[15px] overflow-hidden">
                    <img 
                        v-if="profileForm.photo" 
                        :src="profileForm.photo" 
                        alt="Profile" 
                        class="w-full h-full object-cover rounded-lg"
                    />
                    <i v-else class="fa-regular fa-user text-[40px] text-[#121a22]"></i>
                </div>
                
                <!-- Upload Controls -->
                <div class="flex flex-col gap-2 justify-center">
                    <div class="flex flex-col h-[52px] items-center pb-2">
                        <p class="text-[#121a22] text-base font-bold leading-6 text-center w-full">
                            Upload your photo
                        </p>
                        <p class="text-[#121a22] text-xs font-normal leading-normal text-center w-full">
                            Your photo should be in PNG or JPG format (up to 5mb)
                        </p>
                    </div>
                    
                    <input 
                        ref="fileInput"
                        type="file" 
                        accept="image/png, image/jpeg, image/jpg"
                        @change="handleFileUpload"
                        class="hidden"
                    />
                    
                    <button 
                        @click="$refs.fileInput.click()"
                        type="button"
                        class="bg-[#121a22] text-white text-sm font-semibold leading-5 px-5 py-1.5 rounded-lg w-[246.5px] hover:bg-[#2a3440] transition-colors">
                        Choose image
                    </button>
                    
                    <button 
                        v-if="profileForm.photo"
                        @click="removeImage"
                        type="button"
                        class="text-[#ea4335] text-sm font-medium leading-5 text-center hover:text-[#d32f2f] transition-colors">
                        Remove image
                    </button>
                </div>
            </div>
            <p v-if="errors.photo" class="text-[#ea4335] text-sm mt-1">{{ errors.photo }}</p>
        </div>

        <!-- First Name & Last Name -->
        <div class="flex gap-5">
            <div class="flex flex-col flex-1">
                <label class="text-[#121a22] text-base font-medium leading-6 pb-2">
                    First name
                </label>
                <input 
                    v-model="profileForm.first_name"
                    type="text"
                    class="bg-white border border-[#cfdbe8] rounded-lg h-14 px-4 text-[#121a22] text-base font-normal leading-6 focus:outline-none focus:border-[#121a22] transition-colors"
                    placeholder="Enter first name"
                />
                <p v-if="errors.first_name" class="text-[#ea4335] text-sm mt-1">{{ errors.first_name }}</p>
            </div>
            
            <div class="flex flex-col flex-1">
                <label class="text-[#121a22] text-base font-medium leading-6 pb-2">
                    Last name
                </label>
                <input 
                    v-model="profileForm.last_name"
                    type="text"
                    class="bg-white border border-[#cfdbe8] rounded-lg h-14 px-4 text-[#121a22] text-base font-normal leading-6 focus:outline-none focus:border-[#121a22] transition-colors"
                    placeholder="Enter last name"
                />
                <p v-if="errors.last_name" class="text-[#ea4335] text-sm mt-1">{{ errors.last_name }}</p>
            </div>
        </div>

        <!-- Email -->
        <div class="flex flex-col">
            <label class="text-[#121a22] text-base font-medium leading-6 pb-2">
                Email
            </label>
            <input 
                v-model="profileForm.email"
                type="email"
                disabled
                class="bg-gray-100 border border-[#cfdbe8] rounded-lg h-14 px-4 text-[#121a22] text-base font-normal leading-6 focus:outline-none focus:border-[#121a22] transition-colors cursor-not-allowed"
                placeholder="Enter email address"
            />
            <p v-if="errors.email" class="text-[#ea4335] text-sm mt-1">{{ errors.email }}</p>
        </div>

        <!-- Phone Number -->
        <div class="flex flex-col">
            <label class="text-[#121a22] text-base font-medium leading-6 pb-2">
                Phone number
            </label>
            <input 
                v-model="profileForm.mobile"
                type="tel"
                class="bg-white border border-[#cfdbe8] rounded-lg h-14 px-4 text-[#121a22] text-base font-normal leading-6 focus:outline-none focus:border-[#121a22] transition-colors"
                placeholder="Enter phone number"
            />
            <p v-if="errors.mobile" class="text-[#ea4335] text-sm mt-1">{{ errors.mobile }}</p>
        </div>

        <!-- Location -->
        <div class="flex flex-col">
            <label class="text-[#121a22] text-base font-medium leading-6 pb-2">
                Location
            </label>
            <input 
                v-model="profileForm.pre_city"
                type="text"
                class="bg-white border border-[#cfdbe8] rounded-lg h-14 px-4 text-[#121a22] text-base font-normal leading-6 focus:outline-none focus:border-[#121a22] transition-colors"
                placeholder="Enter city"
            />
            <p v-if="errors.pre_city" class="text-[#ea4335] text-sm mt-1">{{ errors.pre_city }}</p>
        </div>

        <!-- Role -->
        <div class="flex flex-col">
            <label class="text-[#121a22] text-base font-medium leading-6 pb-2">
                Role
            </label>
            <input 
                v-model="profileForm.role"
                type="text"
                disabled
                class="bg-gray-100 border border-[#cfdbe8] rounded-lg h-14 px-4 text-[#121a22] text-base font-normal leading-6 focus:outline-none focus:border-[#121a22] transition-colors cursor-not-allowed"
                placeholder="Enter role"
            />
            <p v-if="errors.role" class="text-[#ea4335] text-sm mt-1">{{ errors.role }}</p>
        </div>

        <!-- Change Password Button -->
        <button 
            @click="$emit('changePassword')"
            type="button"
            class="bg-[#121a22] text-white text-sm font-semibold leading-5 px-5 py-1.5 rounded-lg w-[246.5px] hover:bg-[#2a3440] transition-colors">
            Change password
        </button>

        <!-- Save Button -->
        <div class="flex gap-4 mt-4">
            <button 
                @click="handleSave"
                :disabled="loading"
                type="button"
                class="bg-[#121a22] text-white text-sm font-semibold leading-5 px-5 py-3 rounded-lg hover:bg-[#2a3440] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {{ loading ? 'Saving...' : 'Save Changes' }}
            </button>
            
            <button 
                @click="handleCancel"
                :disabled="loading"
                type="button"
                class="bg-gray-100 text-gray-900 text-sm font-semibold leading-5 px-5 py-3 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                Cancel
            </button>
        </div>
    </div>
</template>

<script setup>
import { citizenAuth } from '~/composables/citizenAuth'

// Get citizen user data
const { citizen_user } = citizenAuth()

// Props
const props = defineProps({
    userRole: {
        type: String,
        default: 'Buyer'
    }
})

// Emits
const emit = defineEmits(['changePassword', 'profileUpdated'])

// State
const loading = ref(false)
const errors = ref({})
const fileInput = ref(null)
const successMessage = ref('')
const errorMessage = ref('')

// Form Data
const profileForm = ref({
    photo: null,
    photoFile: null, // Store the actual file for upload
    first_name: '',
    last_name: '',
    email: '',
    mobile: '',
    ccode: '+880',
    dob: '',
    gender: '',
    nationality_id: '',
    pre_country: '',
    pre_city: '',
    pre_street_address: '',
    pre_province: '',
    zip_code: '',
    profession_id: '',
    license_number: '',
    broker_id: '',
    question_minimum_price: '',
    question_maximum_price: '',
    question_location: '',
    role: props.userRole
})

// Methods
const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.match(/^image\/(png|jpeg|jpg)$/)) {
        errors.value.photo = 'Please upload a PNG or JPG image'
        return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
        errors.value.photo = 'Image size should not exceed 5MB'
        return
    }

    // Clear error
    errors.value.photo = null

    // Store the file for upload
    profileForm.value.photoFile = file

    // Create preview URL
    const reader = new FileReader()
    reader.onload = (e) => {
        profileForm.value.photo = e.target.result
    }
    reader.readAsDataURL(file)
}

const removeImage = () => {
    profileForm.value.photo = null
    profileForm.value.photoFile = null
    if (fileInput.value) {
        fileInput.value.value = ''
    }
}

const validateForm = () => {
    errors.value = {}
    let isValid = true

    if (!profileForm.value.first_name?.trim()) {
        errors.value.first_name = 'First name is required'
        isValid = false
    }

    if (!profileForm.value.last_name?.trim()) {
        errors.value.last_name = 'Last name is required'
        isValid = false
    }

    // Email is optional, but if provided must be valid
    if (profileForm.value.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.value.email)) {
        errors.value.email = 'Please enter a valid email address'
        isValid = false
    }

    // Phone number is optional
    // No validation needed

    return isValid
}

const handleSave = async () => {
    if (!validateForm()) {
        return
    }

    loading.value = true
    successMessage.value = ''
    errorMessage.value = ''
    
    try {
        // Prepare FormData for file upload
        const formData = new FormData()
        
        // Add profile picture if a new one was uploaded
        if (profileForm.value.photoFile) {
            formData.append('profile_pic', profileForm.value.photoFile)
        }
        
        // Add other fields
        if (profileForm.value.mobile) formData.append('mobile', profileForm.value.mobile)
        if (profileForm.value.ccode) formData.append('ccode', profileForm.value.ccode)
        if (profileForm.value.first_name) formData.append('first_name', profileForm.value.first_name)
        if (profileForm.value.last_name) formData.append('last_name', profileForm.value.last_name)
        if (profileForm.value.dob) formData.append('dob', profileForm.value.dob)
        if (profileForm.value.gender) formData.append('gender', profileForm.value.gender)
        if (profileForm.value.nationality_id) formData.append('nationality_id', profileForm.value.nationality_id)
        if (profileForm.value.pre_country) formData.append('pre_country', profileForm.value.pre_country)
        if (profileForm.value.pre_city) formData.append('pre_city', profileForm.value.pre_city)
        if (profileForm.value.pre_street_address) formData.append('pre_street_address', profileForm.value.pre_street_address)
        if (profileForm.value.pre_province) formData.append('pre_province', profileForm.value.pre_province)
        if (profileForm.value.zip_code) formData.append('zip_code', profileForm.value.zip_code)
        if (profileForm.value.profession_id) formData.append('profession_id', profileForm.value.profession_id)
        if (profileForm.value.license_number) formData.append('license_number', profileForm.value.license_number)
        if (profileForm.value.broker_id) formData.append('broker_id', profileForm.value.broker_id)
        if (profileForm.value.question_minimum_price) formData.append('question_minimum_price', profileForm.value.question_minimum_price)
        if (profileForm.value.question_maximum_price) formData.append('question_maximum_price', profileForm.value.question_maximum_price)
        if (profileForm.value.question_location) formData.append('question_location', profileForm.value.question_location)
        
        const response = await $fetchCitizen('/v1/profile/update', {
            method: 'POST',
            body: formData
        })
        
        if (response.status === 'success') {
            // Update citizen_user with new data
            if (citizen_user.value && response.data) {
                citizen_user.value.data = {
                    ...citizen_user.value.data,
                    ...response.data
                }
            }
            
            // Update local form with response data
            if (response.data.profile_pic) {
                profileForm.value.photo = response.data.profile_pic
                profileForm.value.photoFile = null // Clear the file after successful upload
            }
            
            emit('profileUpdated', response.data)
            successMessage.value = response.message || 'Profile updated successfully!'
            
            // Hide success message after 5 seconds
            setTimeout(() => {
                successMessage.value = ''
            }, 5000)
        }
        
    } catch (error) {
        console.error('Error saving profile:', error)
        
        // Handle validation errors
        if (error.data?.errors) {
            errors.value = error.data.errors
            errorMessage.value = 'Please fix the validation errors'
        } else {
            errorMessage.value = error.data?.message || 'Failed to save profile. Please try again.'
        }
        
        // Hide error message after 5 seconds
        setTimeout(() => {
            errorMessage.value = ''
        }, 5000)
    } finally {
        loading.value = false
    }
}

const handleCancel = () => {
    // Reset form or navigate back
    loadProfileData()
}

const loadProfileData = async () => {
    loading.value = true
    try {
        // Get user data from citizenUser
        if (citizen_user.value?.data) {
            const userData = citizen_user.value.data
            
            profileForm.value = {
                photo: userData.profile_pic || userData.photo,
                first_name: userData.first_name || userData.name?.split(' ')[0] || '',
                last_name: userData.last_name || userData.name?.split(' ').slice(1).join(' ') || '',
                email: userData.email || '',
                mobile: userData.mobile || '',
                ccode: userData.ccode || '+880',
                dob: userData.dob || '',
                gender: userData.gender || '',
                nationality_id: userData.nationality_id || '',
                pre_country: userData.pre_country || '',
                pre_city: userData.pre_city || '',
                pre_street_address: userData.pre_street_address || '',
                pre_province: userData.pre_province || '',
                zip_code: userData.zip_code || '',
                profession_id: userData.profession_id || '',
                license_number: userData.license_number || '',
                broker_id: userData.broker_id || '',
                question_minimum_price: userData.question_minimum_price || '',
                question_maximum_price: userData.question_maximum_price || '',
                question_location: userData.question_location || '',
                role: props.userRole
            }
        }
    } catch (error) {
        console.error('Error loading profile:', error)
        errorMessage.value = 'Failed to load profile data'
        setTimeout(() => errorMessage.value = '', 5000)
    } finally {
        loading.value = false
    }
}

// Lifecycle
onMounted(() => {
    loadProfileData()
})
</script>

<style scoped>
/* Custom styles if needed */
</style>
