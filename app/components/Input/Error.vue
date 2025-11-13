<script setup>
	defineProps({
		message: {
			type: [String, Object, Array]
		},
		text_size: {
			type: String,
			default: 'text-sm'
		}
	});
</script>

<template>
	<div v-show="message">
		<p class="text-red-600 dark:text-red-400" :class="text_size" v-html="message">
		</p>
	</div>
</template>
