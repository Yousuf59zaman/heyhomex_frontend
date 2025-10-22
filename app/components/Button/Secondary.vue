<script setup>
    const props = defineProps({
		name: {
			type: String,
			required: true
		},
		border: {
			type: Boolean,
            default: false
		},
        disabled: {
			// type: Boolean,
            default: false
		}
	});
</script>
<template>
    <!-- {{ disabled }} -->
    <button class="rounded-xl bg-[#125374] max-w-[325px] w-full max-h-[130px] p-1 h-full text-white font-semibold text-[14px] text-[20px] md:text-[25px]" :disabled="disabled" :class="disabled ? 'cursor-not-allowed bg-[#546C78]' : 'cursor-pointer'">
        <div :class="border ? 'justify-between' : 'justify-center'" class="w-full h-full p-2 flex items-center rounded-xl rounded-[20px] border-[2px] border-[solid] border-[rgba(255,255,255,0.81)]">
            <span v-if="border" class="w-[5px] h-full bg-[#FFF] rounded-xl"></span> {{ name }} <span v-if="border" class="w-[5px] h-full bg-[#FFF] rounded-xl"></span>
        </div>
    </button>
</template>