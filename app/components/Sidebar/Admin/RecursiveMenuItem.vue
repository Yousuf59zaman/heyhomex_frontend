<script setup>
    const props = defineProps({
        item: {
            type: Object,
            required: true,
        },
        currentPath: {
            type: String,
            required: true,
        },
        isExpanded: {
            type: Boolean,
            required: true,
        },
        level: {
            type: Number,
            default: 0,
        },
    });

    const emit = defineEmits(['toggleMenu']);
    const isMobile = ref(false);

    onMounted(() => {
        isMobile.value = window.innerWidth < 768;
        window.addEventListener('resize', () => {
            isMobile.value = window.innerWidth < 768;
            if (isMobile.value && !props.isExpanded && props.item.is_open) {
                closeDropdown();
            }
        });
    });

    const handleClick = (item) => {
        if (item.child?.length) {
            if (isMobile.value && !props.isExpanded) {
                return;
            }
            emit('toggleMenu', item);
        }
    };

    const closeDropdown = () => {
        if (!props.isExpanded && props.item.is_open) {
            emit('toggleMenu', props.item);
        }
    };

    const handleLinkClick = (event) => {
        event.preventDefault();
        closeDropdown();
        const href = event.currentTarget.getAttribute('href');
        if (href) {
            navigateTo(href);
        }
    };

    const menuRef = ref(null);
    const dropdownRef = ref(null);
    const dropdownPosition = ref({ top: 0 });

    onMounted(() => {
        const handleClickOutside = (event) => {
            if (
                !props.isExpanded &&
                props.item.is_open &&
                menuRef.value &&
                !menuRef.value.contains(event.target)
            ) {
                closeDropdown();
            }
        };
        document.addEventListener('click', handleClickOutside);

        onUnmounted(() => {
            document.removeEventListener('click', handleClickOutside);
        });
        if (isMobile.value && !props.isExpanded && props.item.is_open) {
            nextTick(() => {
                closeDropdown();
            });
        }
    });

    watch(
        () => props.item.is_open,
        (newValue) => {
            if (
                newValue &&
                !props.isExpanded &&
                menuRef.value &&
                !isMobile.value
            ) {
                nextTick(() => {
                    const rect = menuRef.value.getBoundingClientRect();
                    dropdownPosition.value.top = rect.top;

                    if (dropdownRef.value) {
                        const dropdownHeight = dropdownRef.value.offsetHeight;
                        const windowHeight = window.innerHeight;
                        if (rect.top + dropdownHeight > windowHeight) {
                            dropdownPosition.value.top =
                                windowHeight - dropdownHeight - 10;
                        }
                    }
                });
            }
        }
    );
</script>

<template>
    <div
        class="menu-item"
        ref="menuRef">
        <!-- Menu item header -->
        <div
            v-if="item.route !== '#' || !item.child?.length"
            class="menu-item-header"
            :class="[
                'text-gray-600 dark:text-white text-base font-medium leading-normal cursor-pointer',
                currentPath === item.route ? 'rounded-md' : '',
                level > 0 ? 'relative pl-2' : '',
            ]">
            <!-- Tree connector for child items - just horizontal line for leaf nodes -->
            <div
                v-if="level > 0"
                class="absolute left-0 top-0 h-full">
                <!-- Just the horizontal connector for leaf nodes -->
                <div
                    class="absolute left-0 top-[1.1rem] w-3 h-[1px] bg-gray-300 dark:bg-gray-600"></div>
            </div>

            <NuxtLink
                :to="item.route === '#' ? '' : item.route"
                class="flex items-center px-2 pt-1">
                <div
                    class="px-2 mb-0.5 flex w-full rounded-md"
                    :class="[
                        currentPath === item.route
                            ? 'bg-gray-200 dark:bg-gray-700 border-l-4 border-l-cyan-600'
                            : '',
                        isExpanded
                            ? 'justify-between py-1'
                            : 'justify-center py-2',
                    ]">
                    <div class="flex items-center min-w-0">
                        <i
                            class="text-base"
                            :class="[
                                item.icon,
                                currentPath === item.route
                                    ? 'text-cyan-600'
                                    : 'text-gray-600 dark:text-white',
                            ]">
                        </i>
                        <span
                            v-if="isExpanded"
                            class="text-gray-600 dark:text-white text-base ml-3">
                            {{ item.name }}
                        </span>
                    </div>
                </div>
            </NuxtLink>
        </div>

        <!-- Parent menu item with children -->
        <div
            v-else
            class="menu-item-parent px-2 pt-1"
            :class="[
                'text-gray-600 dark:text-white text-base font-medium leading-normal cursor-pointer',
                currentPath === item.route ||
                item.child.some((child) => currentPath === child.route)
                    ? 'rounded-md'
                    : '',
                level > 0 ? 'relative pl-4' : '',
            ]"
            @click="handleClick(item)">
            <!-- Tree connector for child items - just horizontal line for parent nodes -->
            <div
                v-if="level > 0"
                class="absolute left-0 top-0 h-full">
                <!-- Just the horizontal connector for parent nodes -->
                <div
                    class="absolute left-0 top-[1.1rem] w-3 h-[1px] bg-gray-300 dark:bg-gray-600"></div>
            </div>

            <div
                class="px-2 mb-0.5 flex w-full rounded-md"
                :class="[
                    {
                        'bg-gray-200 dark:bg-gray-700':
                            item.is_open ||
                            currentPath === item.route ||
                            item.child.some(
                                (child) => currentPath === child.route
                            ),
                    },
                    currentPath === item.route
                        ? 'border-l-4 border-l-cyan-600'
                        : '',
                    isExpanded ? 'justify-between py-1' : 'justify-center py-2',
                ]">
                <div class="flex items-center min-w-0">
                    <i
                        class="text-base"
                        :class="[
                            item.icon,
                            currentPath === item.route
                                ? 'text-cyan-600'
                                : 'text-gray-600 dark:text-white',
                        ]">
                    </i>
                    <span
                        v-if="isExpanded"
                        class="text-gray-600 dark:text-white text-base ml-3">
                        {{ item.name }}
                    </span>
                </div>
                <span
                    v-if="item.child?.length && isExpanded"
                    class="ml-auto pl-1">
                    <i
                        :class="
                            item.is_open
                                ? 'fas fa-chevron-up'
                                : 'fas fa-chevron-down'
                        "></i>
                </span>
            </div>
        </div>

        <!-- Recursive children with vertical line that spans ALL children -->
        <div
            v-if="item.child?.length && item.is_open && isExpanded"
            class="menu-item-children ml-3 relative">
            <!-- Vertical line connecting all children AND parent if level > 0 -->
            <div
                v-if="item.child.length > 0"
                class="tree-vertical-line"></div>

            <RecursiveMenuItem
                v-for="(child, index) in item.child"
                :key="child.id"
                :item="child"
                :current-path="currentPath"
                :is-expanded="isExpanded"
                :level="level + 1"
                class="relative my-0.5"
                @toggle-menu="$emit('toggleMenu', $event)" />
        </div>

        <!-- Collapsed state dropdown -->
        <transition name="fade">
            <div
                v-if="
                    item.child?.length &&
                    !isExpanded &&
                    item.is_open &&
                    !isMobile
                "
                ref="dropdownRef"
                class="fixed left-[70px] min-w-[220px] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-[9999] p-2 overflow-y-auto"
                style="max-height: 70vh"
                :style="{ top: `${dropdownPosition.top}px` }"
                @mouseleave="closeDropdown">
                <SidebarAdminRecursiveDropdown
                    v-for="child in item.child"
                    :key="child.id"
                    :item="child"
                    :current-path="currentPath"
                    :level="0"
                    @toggle-menu="$emit('toggleMenu', $event)"
                    @link-click="handleLinkClick" />
            </div>
        </transition>
    </div>
</template>

<style scoped>
    /* Full height vertical line for children container - adjusted positioning */
    .tree-vertical-line {
        position: absolute;
        left: 0;
        top: 0;
        width: 1px;
        height: calc(
            100% - 0.6rem
        ); /* Adjust height to match the starting point */
        background-color: rgb(209 213 219);
        z-index: 1;
    }

    .dark .tree-vertical-line {
        background-color: rgb(75 85 99);
    }

    .menu-item-children {
        position: relative;
        padding-top: 0;
        padding-bottom: 0;
    }

    .fade-enter-active,
    .fade-leave-active {
        transition: opacity 0.2s ease;
    }

    .fade-enter-from,
    .fade-leave-to {
        opacity: 0;
    }

    /* Make tree design more consistent */
    .menu-item {
        margin-bottom: 0.125rem;
    }
</style>
