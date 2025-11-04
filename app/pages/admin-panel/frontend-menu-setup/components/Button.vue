<script setup>
    const LoadingButton = defineAsyncComponent(() => import('./LoadingButton'));

    const props = defineProps({
        type: String,
        name: String,
        url: String,
        loading: Boolean,
        icon: String,
        class: String,
        isDraft: Boolean,
        method: { type: Function },
    })
</script>

<template>
    <Link class="btn-indigo" :href="url" v-if="type == 'index'">
        <i class="fa fa-plus-circle"></i>
        <span>Create</span>
        <span class="hidden md:inline">&nbsp;{{ name }}</span>
    </Link>
    <div v-else-if="type == 'create'" class="flex items-center justify-end px-8 py-4 bg-gray-50 border-t border-gray-100 gap-3">
        <template v-if="isDraft">
            <LoadingButton :loading="loading" class="btn-indigo" type="submit" :data-id="1">
                <i class="fa fa-check-circle"></i> Draft {{ name }}
            </LoadingButton>
        </template>

        <LoadingButton :loading="loading" class="btn-indigo" type="submit">
            <i class="fa fa-check-circle"></i> Create {{ name }}
        </LoadingButton>
    </div>

    <div v-else-if="type == 'createReset'"
        class="flex items-center justify-end px-8 py-4 bg-gray-50 border-t border-gray-100">
        <LoadingButton :loading="loading" class="btn-orange m-r-10" type="button" @click="method">
            <i class="fa-solid fa-repeat"></i> Reset {{ name }}
        </LoadingButton>
        <LoadingButton :loading="loading" class="btn-indigo" type="submit">
            <i class="fa fa-check-circle"></i> Create {{ name }}
        </LoadingButton>
    </div>
    <LoadingButton :loading="loading" class="btn-indigo ml-auto" type="submit" v-else-if="type == 'edit'"><i
            class="fa fa-check-circle"></i> Update {{ name }}</LoadingButton>

    <LoadingButton v-else :loading="loading" class="gap-1 ml-auto text-[11px] font-semibold"
        type="button" @click="method">
        <i :class="icon"></i> {{ name }}
    </LoadingButton>
</template>
