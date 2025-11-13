<script setup>
	const props = defineProps({
		id: {
			type: String,
		},
		type: {
			type: String,
			default: 'text',
		},
		error: {
			type: String,
			default: null,
		},
		label: {
			type: String,
			default: null,
		},
		modelValue: {
			type: String,
			default: '',
		},
		required: {
			type: Boolean,
			default: false,
		},
	});

	const emit = defineEmits(['update:modelValue']);
</script>

<template>
	<div class="flex flex-col">
		<label v-if="label" class="form-label" :for="id">{{ label }}
			<span class="custom-error" v-if="(required)">*</span>
		</label>sxcs
		<LazyLazyInputText class="form-input h-8" :id="id" ref="input" v-bind="{ ...$attrs, class: null }"
			:class="{ error: error }" :type="type" :value="modelValue"
			@input="$emit('update:modelValue', $event.target.value)" :required="required" />
		<div v-if="error" class="form-error">{{ error }}</div>
	</div>
</template>

<style scoped>
::-webkit-input-placeholder {
   font-style: italic;
   font-size: 14px;
}
</style>
