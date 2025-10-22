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
        level: {
            type: Number,
            default: 0,
        },
    });

    const emit = defineEmits(['toggle-menu', 'link-click']);

    // Improved event handling to avoid context issues
    const handleItemClick = () => {
        if (props.item.child?.length) {
            emit('toggle-menu', props.item);
        }
    };

    const emitLinkClick = (event) => {
        emit('link-click', event);
    };

    // Computed property for better reactivity
    const hasActiveChildPath = computed(() => {
        const checkChild = (children) => {
            if (!children || !children.length) return false;

            return children.some((child) => {
                if (props.currentPath === child.route) return true;
                if (child.child?.length) return checkChild(child.child);
                return false;
            });
        };

        return checkChild(props.item.child);
    });
</script>

<template>
    <div class="dropdown-menu-item">
        <div
            class="tree-node"
            :class="level > 0 ? 'pl-4 relative' : ''">
            <!-- Tree connector for child items - fixed positioning -->
            <div
                v-if="level > 0"
                class="tree-connector">
                <div
                    class="absolute left-0 top-0 w-[1px] h-full bg-gray-300 dark:bg-gray-600"></div>
                <div
                    class="absolute left-0 top-[1.1rem] w-4 h-[1px] bg-gray-300 dark:bg-gray-600"></div>
            </div>

            <!-- Item with no children -->
            <NuxtLink
                v-if="!item.child?.length"
                :to="item.route === '#' ? '' : item.route"
                class="flex items-center"
                @click="emitLinkClick">
                <div
                    class="px-2 py-1 flex w-full rounded-md"
                    :class="[
                        currentPath === item.route
                            ? 'bg-gray-200 dark:bg-gray-700 border-l-4 border-l-cyan-600'
                            : 'border-l-4 border-l-transparent',
                    ]">
                    <div class="flex items-center min-w-0">
                        <i
                            class="text-base"
                            :class="[
                                item.icon,
                                currentPath === item.route
                                    ? 'text-cyan-600'
                                    : 'text-gray-600 dark:text-white',
                            ]"></i>
                        <span
                            class="text-gray-600 dark:text-white text-base ml-3 whitespace-nowrap overflow-hidden text-ellipsis"
                            >{{ item.name }}</span
                        >
                    </div>
                </div>
            </NuxtLink>

            <!-- Item with children -->
            <div
                v-else
                class="cursor-pointer"
                @click="handleItemClick">
                <div
                    class="px-2 py-1 flex justify-between w-full rounded-md"
                    :class="[
                        {
                            'bg-gray-200 dark:bg-gray-700':
                                item.is_open ||
                                currentPath === item.route ||
                                hasActiveChildPath,
                        },
                        currentPath === item.route
                            ? 'border-l-4 border-l-cyan-600'
                            : 'border-l-4 border-l-transparent',
                    ]">
                    <div class="flex items-center min-w-0">
                        <i
                            class="text-base"
                            :class="[
                                item.icon,
                                currentPath === item.route
                                    ? 'text-cyan-600'
                                    : 'text-gray-600 dark:text-white',
                            ]"></i>
                        <span
                            class="text-gray-600 dark:text-white text-base ml-3 whitespace-nowrap overflow-hidden text-ellipsis"
                            >{{ item.name }}</span
                        >
                    </div>
                    <span class="ml-auto pl-1">
                        <i
                            :class="
                                item.is_open
                                    ? 'fas fa-chevron-up'
                                    : 'fas fa-chevron-down'
                            "
                            class="text-xs"></i>
                    </span>
                </div>
            </div>

            <!-- Recursive children at any depth -->
            <div
                v-if="item.child?.length && item.is_open"
                class="mt-0.5 ml-2 relative tree-children">
                <!-- Vertical line for children group - improved positioning -->
                <div
                    v-if="item.child.length > 1"
                    class="vertical-line-container">
                    <div
                        class="absolute left-0 top-0 w-[1px] h-full bg-gray-300 dark:bg-gray-600"></div>
                </div>

                <SidebarAdminRecursiveDropdown
                    v-for="(childItem, index) in item.child"
                    :key="childItem.id"
                    :item="childItem"
                    :current-path="currentPath"
                    :level="level + 1"
                    :class="{
                        'first-child': index === 0,
                        'last-child': index === item.child.length - 1,
                    }"
                    @toggle-menu="$emit('toggle-menu', $event)"
                    @link-click="$emit('link-click', $event)" />
            </div>
        </div>
    </div>
</template>

<style scoped>
    .tree-connector {
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        width: 4px;
        z-index: 1;
        pointer-events: none; /* Ensures line doesn't interfere with clicks */
    }

    /* Optimize spacing */
    .dropdown-menu-item {
        position: relative;
        margin-bottom: 0.125rem;
    }

    .tree-children {
        position: relative;
        padding-top: 0.125rem;
        padding-bottom: 0.125rem;
    }

    /* Ensures consistent spacing */
    .dropdown-menu-item:not(:last-child) {
        margin-bottom: 0.125rem;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
        .tree-node.pl-4 {
            padding-left: 0.75rem !important;
        }

        .tree-children {
            margin-left: 0.5rem !important;
        }

        .tree-connector .absolute:last-child {
            width: 3px !important;
        }
    }
</style>
