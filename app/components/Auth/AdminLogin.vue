<script setup>
import {
	LockClosedIcon,
	UserIcon
} from "@heroicons/vue/24/outline"

const password_open = ref(false)
const password_view_status = (status) => {
	password_open.value = status
}

const form = reactive({
	login_id: '',
	password: ''
});

const unauthorizedError = ref('');
const { login } = adminAuth();
const isLoading = ref(false);

const submit = async () => {
	isLoading.value = true;
	unauthorizedError.value = '';
	try {
		const response = await login(form);
		console.log(response.data.token);
		if (response) {
			window.location.href = '/admin-panel';
			return;
		}
	} catch (error) {
		if (error) {
			const err = error;
			// console.error('Login error: 1', err?.response?._data?.message);
			unauthorizedError.value = err?.response?._data?.message;
		} else {
			unauthorizedError.value = 'An unexpected error occurred. Please try again later.';
		}
	} finally {
		isLoading.value = false;
	}
}
const admin_user = adminUser();
</script>

<template>
	<div
		class="min-h-screen w-full flex items-center justify-center animate-gradient bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
		<div class="w-full max-w-md p-8 transform perspective-1000">
			<div
				class="bg-white dark:bg-gray-900 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-8 backdrop-blur-xl hover:shadow-[0_8px_40px_rgb(0,0,0,0.16)] transition-all duration-300 ease-in-out">
				<div class="flex justify-center mb-6 scale-animation select-none">
					<NuxtLink to="/">
						<ApplicationLogo :width="'160px'" :height="'55px'" />
					</NuxtLink>
				</div>

				<h2
					class="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
					Admin Portal
				</h2>

				<form @submit.prevent="submit" class="space-y-4">
					<div class="floating-input">
						<div class="relative">
							<UserIcon
								class="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
							<InputText id="login_id" type="text" v-model="form.login_id"
								class="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 dark:bg-gray-800 border-0 focus:ring-2 focus:ring-purple-500 transition-all duration-200"
								required placeholder="User ID" />
						</div>
					</div>

					<div class="floating-input">
						<div class="relative">
							<LockClosedIcon
								class="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
							<InputText id="password" :type="password_open ? 'text' : 'password'" v-model="form.password"
								class="w-full pl-12 pr-12 py-4 rounded-xl bg-gray-50 dark:bg-gray-800 border-0 focus:ring-2 focus:ring-purple-500 transition-all duration-200"
								required placeholder="Password" />
							<button type="button" @click="password_view_status(!password_open)"
								class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
								<i :class="['fa text-lg', password_open ? 'fa-eye' : 'fa-eye-slash']"></i>
							</button>
						</div>
					</div>

					<ButtonPrimary :disabled="isLoading"
						class="w-full py-4 rounded-xl text-[15px] font-semibold bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 transform hover:-translate-y-0.5 transition-all duration-200"
						:class="{ 'opacity-85': isLoading }">
						<span v-if="!isLoading" class="flex items-center justify-center gap-2">
							Sign In <i class="fa fa-arrow-right"></i>
						</span>
						<div v-else class="flex justify-center items-center">
							<div
								class="w-7 h-7 border-[3px] border-white border-t-transparent rounded-full animate-spin">
							</div>
						</div>
					</ButtonPrimary>
					<div class="min-h-4">
						<InputError :message="unauthorizedError" />
					</div>
				</form>
			</div>
		</div>
	</div>
</template>

<style scoped>
.animate-gradient {
	background-size: 400% 400%;
	animation: gradient 15s ease infinite;
}

.scale-animation:hover {
	transform: scale(1.05);
	transition: transform 0.3s ease;
}

.floating-input:focus-within {
	transform: translateY(-2px);
}

@keyframes gradient {
	0% {
		background-position: 0% 50%;
	}

	50% {
		background-position: 100% 50%;
	}

	100% {
		background-position: 0% 50%;
	}
}
</style>
