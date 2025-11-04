<script setup>
    const activeIndex = ref(0)
    const props = defineProps({
        isOpenStartModal: Boolean,
    })
    const visible = ref(props.isOpenStartModal)

    watch(
        () => props.isOpenStartModal,
        (newVal) => {
            visible.value = newVal
        }
    )

    watch(visible, (newVal) => {
        emit("update:isOpenStartModal", newVal)
    })

    const emit = defineEmits(["isOpenStartModal"])
</script>

<template>
    <Dialog
        v-model:visible="visible"
        modal
        :closable="true"
        :draggable="false"
        :resizable="false"
        class="citizen-verify-otp-modal"
        :style="{width: 'min(32rem, 95vw)', maxWidth: '95vw'}"
        :pt="{
            root: 'border-0 rounded-2xl shadow-2xl m-4',
            header: 'border-0 pb-4',
            content: 'border-0 pt-0 pb-6',
            closeButton:
                'absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors duration-200',
        }">
      

        <!-- Content -->
        <div >
            <AuthCitizenGetStartedModal v-if="activeIndex === 0"  @go-to-email="activeIndex = 1"/>
        </div>
    </Dialog>
</template>

<style lang="scss" scoped></style>
