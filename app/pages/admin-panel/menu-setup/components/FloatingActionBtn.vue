<script setup>
const props = defineProps({
    position: String,
    loader: Boolean,
    icon: String,
    message: String
});

const emit = defineEmits(['dataSubmit', 'removeMessage']);

const getInterval = ref(null);

const content_submit = () => {
    if (!props.loader) {
        emit('dataSubmit');
    }
};

const remove_msg = () => {
    emit('removeMessage');
};

// Optionally handle message auto-remove
onMounted(() => {
    getInterval.value = setTimeout(() => {
        emit('removeMessage');
        clearTimeout(getInterval.value);
    }, 2000);
});
</script>

<template>
    <div class="w-full flex justify-end mt-3">
        <Button v-if="loader" severity="secondary" style="width: 50px; height: 50px; border-radius: 50%;"
            class="p-0 shadow-lg" disabled>
            <ProgressSpinner style="width: 25px; height: 25px" strokeWidth="8" animationDuration=".5s" />
        </Button>
        <Button v-else severity="success" raised :class="['transition-all duration-300 hover:scale-105 shadow-lg', 
            { 'fixed bottom-4 right-4': position === 'fixed' }]" style="width: 50px; height: 50px; border-radius: 50%;"
            class="p-0" @click="content_submit">
            <template #icon="{ class: iconClass }">
                <i :class="[icon, iconClass]"></i>
            </template>
        </Button>
    </div>
    <Toast position="bottom-right" />
    <transition name="fade">
        <div v-if="message" class="fixed bottom-4 right-[10%] z-50 flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg">
            <i class="pi pi-check mr-2"></i>
            <span>{{ message }}</span>
            <Button severity="success" text icon="pi pi-times" style="width: 24px; height: 24px"
                class="p-0 absolute -top-2 -right-2 bg-green-600 hover:bg-green-700 rounded-full"
                @click="remove_msg" />
        </div>
    </transition>
</template>

<style lang="scss" scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
