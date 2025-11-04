<script setup>
    import { ref, watch } from 'vue'
    
    const activeIndex = ref(0)
    const getStartedModalRef = ref(null)
    const props = defineProps({
        isOpenStartModal: Boolean,
    })
    
    const visible = ref(props.isOpenStartModal)

    watch(
        () => props.isOpenStartModal,
        (newVal) => {
            visible.value = newVal
            if (getStartedModalRef.value) {
                getStartedModalRef.value.visible = newVal
            }
        }
    )

    watch(visible, (newVal) => {
        emit('update:isOpenStartModal', newVal)
    })

    const emit = defineEmits(['update:isOpenStartModal'])

   
</script>

<template>
    <div>    
        <AuthCitizenGetStartedModal 
            v-if="activeIndex === 0"
            ref="getStartedModalRef"
            @go-to-email="activeIndex = 1"
        />
    </div>
</template>

<style lang="scss" scoped></style>
