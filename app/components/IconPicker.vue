<script setup>
    import fontLibrary from '~/assets/json/fonts';

    const props = defineProps({
        label: {
            type: String,
            default: 'Pick Your Icon',
        },
        modelValue: {
            type: String,
            default: 'fas fa-circle',
        },
        isOpenPicker: Boolean,
    });

    const emit = defineEmits(['update:modelValue', 'close']);

    // States
    const filterText = ref('');
    const activeGlyph = ref(props.modelValue);
    const isVisible = ref(false);

    // Tabs Data
    const tabs = [
        {
            id: 'all',
            title: 'All Icons',
            icon: 'fas fa-star-of-life',
            link: 'all',
        },
        {
            id: 'far',
            title: 'Font Awesome Regular',
            icon: 'fab fa-font-awesome-alt',
            link: fontLibrary.fontAwesome.variants.regular,
        },
        {
            id: 'fas',
            title: 'Font Awesome Solid',
            icon: 'fab fa-font-awesome',
            link: fontLibrary.fontAwesome.variants.solid,
        },
        {
            id: 'fab',
            title: 'Font Awesome Brands',
            icon: 'fab fa-font-awesome-flag',
            link: fontLibrary.fontAwesome.variants.brands,
        },
        {
            id: 'social',
            title: 'Social Icons',
            icon: 'fab fa-facebook',
            link: fontLibrary.fontAwesome.variants.social,
        },
    ];

    const activeTab = ref(tabs[0]);

    // Glyphs Calculation
    const allGlyphs = [].concat(
        tabs[1].link.icons,
        tabs[2].link.icons,
        tabs[3].link.icons
    );

    const glyphs = computed(() => {
        let _glyphs = [];
        if (activeTab.value.id !== 'all') {
            _glyphs = activeTab.value.link.icons;
        } else {
            _glyphs = allGlyphs;
        }

        if (filterText.value !== '') {
            const _filterText = filterText.value.toLowerCase();
            _glyphs = _glyphs.filter(
                (item) => item.substr(7, filterText.value.length) === _filterText
            );
        }
        return _glyphs;
    });

    // Methods
    const setActiveGlyph = (glyph) => {
        activeGlyph.value = glyph;
    };

    const isActiveGlyph = (glyph) => activeGlyph.value === glyph;

    const isActiveTab = (tab) => tab === activeTab.value.id;

    const setActiveTab = (tab) => {
        activeTab.value = tab;
    };

    const getGlyphName = (glyph) =>
        glyph.replace(/f.. fa-/g, '').replace('-', ' ');

    const findAndSetTabForIcon = (iconClass) => {
        for (let i = 1; i < tabs.length; i++) {
            const tab = tabs[i];
            if (tab.link.icons && tab.link.icons.includes(iconClass)) {
                activeTab.value = tab;
                nextTick(() => {
                    scrollToSelectedIcon(iconClass);
                });
                return;
            }
        }
        activeTab.value = tabs[0];
        nextTick(() => {
            scrollToSelectedIcon(iconClass);
        });
    };

    const scrollToSelectedIcon = (iconClass) => {
        const container = document.querySelector('.aim-modal--icon-preview-inner');
        const selectedIcon = document.querySelector(`[data-glyph="${iconClass}"]`);
        
        if (container && selectedIcon) {
            const containerRect = container.getBoundingClientRect();
            const iconRect = selectedIcon.getBoundingClientRect();
            
            const scrollTop = selectedIcon.offsetTop - container.offsetTop - (containerRect.height / 2) + (iconRect.height / 2);
            
            container.scrollTo({
                top: scrollTop,
                behavior: 'smooth'
            });
        }
    };

    const handleSidebarPreviewClick = () => {
        if (activeGlyph.value) {
            scrollToSelectedIcon(activeGlyph.value);
        }
    };

    const insert = () => {
        emit('update:modelValue', activeGlyph.value);
        emit('close');
        isVisible.value = false;
    };

    const togglePicker = () => {
        isVisible.value = !isVisible.value;
    };

    const closePicker = () => {
        emit('close');
        isVisible.value = false;
    };

    watch(() => props.isOpenPicker, (newVal) => {
        isVisible.value = newVal;
        if (newVal && props.modelValue) {
            findAndSetTabForIcon(props.modelValue);
        }
    });

    watch(() => props.modelValue, (newVal) => {
        activeGlyph.value = newVal;
        if (newVal && isVisible.value) {
            findAndSetTabForIcon(newVal);
        }
    });
</script>

<template>
    <!-- <span v-bind="$attrs" @click="togglePicker">
        <i class="vue3-icon-picker" :class="modelValue"></i>
    </span> -->

    <div class="aim-modal aim-open" v-if="isVisible">
        <div class="aim-modal--content">
            <div class="aim-modal--header">
                <div class="aim-modal--header-logo-area">
                    <span class="aim-modal--header-logo-title">
                        {{ label }}
                    </span>
                </div>
                <div class="aim-modal--header-close-btn" @click="closePicker">
                    <i class="fas fa-times" title="Close"></i>
                </div>
            </div>
            <div class="aim-modal--body">
                <div class="aim-modal--sidebar">
                    <div class="aim-modal--sidebar-tabs">
                        <div class="aim-modal--sidebar-tab-item" data-library-id="all" v-for="tab in tabs" :key="tab.id"
                            :class="{ 'aesthetic-active': isActiveTab(tab.id) }" @click="setActiveTab(tab)">
                            <i :class="tab.icon"></i>
                            <span>{{ tab.title }}</span>
                        </div>
                    </div>
                    <div class="aim-sidebar-preview" @click="handleSidebarPreviewClick" style="cursor: pointer;">
                        <div class="aim-icon-item ">
                            <div class="aim-icon-item-inner">
                                <i :class="activeGlyph"></i>
                                <div class="aim-icon-item-name">
                                    {{ activeGlyph }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="aim-modal--icon-preview-wrap">
                    <div class="aim-modal--icon-search">
                        <input v-model="filterText" placeholder="Filter by name..." />
                        <i class="fas fa-search"> </i>
                    </div>
                    <div class="aim-modal--icon-preview-inner">
                        <div class="aim-modal--icon-preview">
                            <div class="aim-icon-item" v-for="glyph in glyphs" :key="glyph"
                                :class="{ 'aesthetic-selected': isActiveGlyph(glyph) }" 
                                :data-glyph="glyph"
                                @click="setActiveGlyph(glyph)">
                                <div class="aim-icon-item-inner">
                                    <i :class="glyph"></i>
                                    <div class="aim-icon-item-name">
                                        {{ getGlyphName(glyph) }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="aim-modal--footer">
                <button class="aim-insert-icon-button" @click="insert">Insert</button>
            </div>
        </div>
    </div>
</template>
<style scoped>
    @import '@/assets/css/icon-style.css';
</style>
