<script setup>
	defineProps({
		modelValue: {
			type: String,
			required: true
		}
	});

	defineEmits(['update:modelValue']);

	const input = ref(null);

	onMounted(() => {
		if (input.value.hasAttribute('autofocus')) {
			input.value.focus();
		}
	});

	defineExpose({ focus: () => input.value.focus() });
</script>

<template>
	<input
		class="flex w-full focus:border-blue-500 focus:ring-blue-500 mt-1 items-center border-[1px] border-[solid] border-gray-300 [box-shadow:0px_1px_3px_0px_rgba(0,_0,_0,_0.05)]"
		:value="modelValue"
		@input="$emit('update:modelValue', $event.target.value)"
		ref="input" />
</template>
