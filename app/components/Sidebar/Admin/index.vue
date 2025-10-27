<script setup>
const route = useRoute();
const currentPath = computed(() => route.path);
const menuList = ref([]);
const isMenuLoading = ref(false);

const loadData = async () => {
    isMenuLoading.value = true;
    try {
        const getData = await $fetchAdmin(`admin/tree-entity/main-menu`, {
            method: 'POST',
        });
        menuList.value = getData.data;
    } catch (e) {
        console.log('Get Message', e.message);
    } finally {
        isMenuLoading.value = false;
    }
};

// Automatically open the parent if a child is selected
const updateMenuState = () => {
    const setActiveState = (items) => {
        items.forEach((item) => {
            if (item.child && item.child.length) {
                item.is_open = item.child.some((child) => {
                    if (child.child && child.child.length) {
                        child.is_open = child.child.some((subChild) =>
                            currentPath.value.startsWith(subChild.route)
                        );
                        return (
                            child.is_open ||
                            currentPath.value.startsWith(child.route)
                        );
                    }
                    return currentPath.value.startsWith(child.route);
                });
            }
        });
    };

    setActiveState(menuList.value);
};

watch(currentPath, () => {
    updateMenuState();
});

onMounted(async () => {
    await loadData();
    updateMenuState();
});

const toggleChildMenu = (item) => {
    if (item.child?.length) {
        item.is_open = !item.is_open;
    }
};

const hamburger_button = useState('hamburger_button', () => true);
const isMobile = useState('isMobile', () => false);

const closeSidebar = () => {
    if (isMobile.value) {
        hamburger_button.value = false;
    }
};

onMounted(() => {
    checkWindowSize();
    window.addEventListener('resize', checkWindowSize);
});
onBeforeUnmount(() => {
    window.removeEventListener('resize', checkWindowSize);
});
const checkWindowSize = () => {
    if (window.innerWidth < 768) {
        hamburger_button.value = false;
        isMobile.value = true;
    } else {
        isMobile.value = false;
    }
};
watchEffect(() => {
    checkWindowSize();
});
</script>

<template>
    <div v-if="isMobile && hamburger_button" class="fixed inset-0 bg-black/50 z-10 transition-opacity"
        @click="closeSidebar"></div>

    <div class="fixed admin-layout h-full top-0 left-0 flex flex-col transition-all duration-300 ease-in-out transform dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 bg-white dark:text-white z-20"
        :class="[
            hamburger_button ? 'w-[250px]' : 'w-[70px]',
            !hamburger_button && isMobile
                ? '-translate-x-full'
                : 'translate-x-0',
        ]">
        <div
            class="flex items-center justify-between w-full px-2 sm:px-3 border-b-2 border-gray-200 dark:border-gray-700">
            <NuxtLink :to="'/'" :class="!hamburger_button ? 'hidden' : ''" class="flex items-center gap-2">
                <ApplicationIconLogo :width="'40px'" />
                <span
                    class="pr-3 bg-white dark:bg-gray-900 text-2xl font-semibold leading-6 text-gray-900 dark:text-white">
                    HeyHomex
                </span>
            </NuxtLink>
            <div class="w-full flex h-14" :class="hamburger_button ? 'justify-end' : 'justify-center'">
                <button @click="hamburger_button = !hamburger_button"
                    class="inline-flex items-center justify-center rounded-md text-gray-400 dark:text-gray-500 focus:outline-none transition duration-150 ease-in-out">
                    <svg class="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                        <path v-if="!hamburger_button" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4 6h16M4 12h16M4 18h16" />
                        <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>

        <div v-if="isMenuLoading && hamburger_button" class="overflow-hidden overflow-y-auto py-2">
            <div v-for="index in 20" :key="index" class="w-full">
                <div class="flex items-center w-full pb-3 px-4 gap-2 flex-row">
                    <Skeleton height="2rem" width="3rem" size="1.5rem"></Skeleton>
                    <Skeleton height="1.5rem" class=""></Skeleton>
                    <Skeleton height="2rem" size="1rem"></Skeleton>
                </div>
            </div>
        </div>
        <div v-else-if="isMenuLoading && !hamburger_button" class="overflow-hidden overflow-y-auto py-2">
            <div v-for="index in 20" :key="index" class="w-full">
                <div class="flex items-center w-full py-2 px-4">
                    <div class="w-full flex justify-center items-center">
                        <Skeleton circle width="1.5rem" height="1.5rem"></Skeleton>
                    </div>
                </div>
            </div>
        </div>
        <div v-else class="overflow-hidden overflow-y-auto py-2">
            <div v-for="(item, index) in menuList" :key="index" class="relative">
                <SidebarAdminRecursiveMenuItem :item="item" :current-path="currentPath" :is-expanded="hamburger_button"
                    @toggle-menu="toggleChildMenu" />
            </div>
        </div>
    </div>
</template>

<style scoped>
.admin-layout {
    top: 0;
    left: 0;
    background-image: var(--body-image);
    background-repeat: no-repeat;
    background-image: url('/images/effect-onlight.png');
    transition: width 0.3s ease-in-out;
}
</style>
