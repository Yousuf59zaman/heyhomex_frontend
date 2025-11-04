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
		options: {
			type: Array,
			default: () => [],
		},
	});

	const emit = defineEmits(['update:modelValue']);
</script>

<template>
	<div class="flex flex-col">
		<label v-if="label" class="form-label" :for="id">{{ label }} 
			<span class="custom-error" v-if="required">*</span>
		</label>
		<Select
			class="w-full h-8"
			:id="id"
			optionLabel="name"
			optionValue="id"
			:modelValue="modelValue"
			@update:modelValue="emit('update:modelValue', $event)"
			:options="options"
			:required="required"
			@focus="validations_errors && (validations_errors.linktype = '')"
			v-bind="$attrs"
		/>
		<div v-if="error" class="form-error">{{ error }}</div>
	</div>
</template>

<style scoped>
:deep(.p-select-label) {
	font-size: 14px;
	padding: .3rem .5rem;
}
</style>
