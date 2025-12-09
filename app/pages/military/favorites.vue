<script setup>
    useHead({title: "Favorites - Military Panel"})
    definePageMeta({middleware: ["auth-citizen"], layout: "citizen"})

    const route = useRoute()
    const toast = useToast()
    const properties = ref([])
    const pending = ref(false)
    const error = ref(null)
    const showConfirmModal = ref(false)
    const propertyToRemove = ref(null)

    const currentPage = ref(1)
    const totalPages = ref(1)
    const totalResults = ref(0)
    const perPage = ref(12)

    const loadFavoriteProperties = async () => {
        pending.value = true
        error.value = null
        try {
            const params = {
                page: route.query.page ? route.query.page : 1,
            }

            const response = await $fetchCitizen(
                "/v1/favorite-properties/list",
                {
                    method: "GET",
                    params,
                }
            )

            properties.value = response.data.data.map((property) => ({
                id: property.id,
                title: property.name,
                address: property.address,
                price: property.price,
                beds: property.beds,
                baths: property.baths,
                sqft: property.square_feet,
                image: property.image_url,
                isFavorited: property.is_favorite || false,
                coordinates: property.location
                    ? [
                          parseFloat(property.location.latitude),
                          parseFloat(property.location.longitude),
                      ]
                    : null,
            }))

            currentPage.value = response.data.meta.current_page
            totalPages.value = response.data.meta.last_page
            totalResults.value = response.data.meta.total
            perPage.value = response.data.meta.per_page
        } catch (e) {
            console.error("Error loading favorite properties:", e.message)
            error.value = e
            properties.value = []
        } finally {
            pending.value = false
        }
    }

    const toggleFavorite = (property) => {
        propertyToRemove.value = property
        showConfirmModal.value = true
    }

    const confirmRemoveFavorite = async () => {
        if (!propertyToRemove.value) return

        const propertyId = propertyToRemove.value.id
        propertyToRemove.value = null

        try {
            const response = await $fetchCitizen(
                `/v1/favorite-properties/${propertyId}/toggle`,
                {
                    method: "POST",
                }
            )

            if (response.status === "success") {
                // Update UI immediately by removing from list
                properties.value = properties.value.filter(
                    (p) => p.id !== propertyId
                )

                toast.add({
                    severity: "info",
                    summary: "Removed from Favorites",
                    detail: "Property has been removed from your favorite list",
                    life: 3000,
                })

                // Reload to get updated list
                if (properties.value.length === 0) {
                    await loadFavoriteProperties()
                }
            }
        } catch (e) {
            console.error("Error toggling favorite:", e.message)
            toast.add({
                severity: "error",
                summary: "Error",
                detail: "Failed to update favorite status",
                life: 3000,
            })
        }
    }

    const handlePropertyClick = (property) => {
        navigateTo(`/military/property/${property.id}`)
    }

    onMounted(() => {
        loadFavoriteProperties()
    })

    watch(
        () => route.query.page,
        () => {
            loadFavoriteProperties()
        }
    )
</script>

<template>
    <div class="space-y-4 md:space-y-6 p-4 md:p-6 lg:p-8">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-xl md:text-2xl font-semibold text-gray-900">
                    Favorite Properties
                </h1>
                <p class="text-sm text-gray-600 mt-1">
                    Your saved properties for quick access
                </p>
            </div>
            <NuxtLink
                to="/military"
                class="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
                <Icon
                    name="lucide:arrow-left"
                    class="w-4 h-4" />
                Back to Dashboard
            </NuxtLink>
        </div>

        <div
            v-if="pending"
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <CommonCitizenPropertyCardSkeleton
                v-for="n in 8"
                :key="n" />
        </div>

        <div
            v-else-if="error"
            class="text-center py-12">
            <Icon
                name="lucide:alert-circle"
                class="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p class="text-gray-600 mb-4">Failed to load favorite properties</p>
            <button
                @click="loadFavoriteProperties"
                class="px-4 py-2 bg-[#6E9EF3] text-white rounded-lg hover:bg-[#5E8EE3]">
                Retry
            </button>
        </div>

        <div
            v-else-if="properties.length === 0"
            class="text-center py-12">
            <Icon
                name="lucide:heart"
                class="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 class="text-lg font-semibold text-gray-900 mb-2">
                No Favorite Properties
            </h3>
            <p class="text-gray-600 mb-6">
                Start adding properties to your favorites to see them here
            </p>
            <NuxtLink
                to="/military/search"
                class="inline-flex items-center gap-2 px-6 py-3 bg-[#6E9EF3] text-white rounded-lg hover:bg-[#5E8EE3]">
                <Icon
                    name="lucide:search"
                    class="w-4 h-4" />
                Browse Properties
            </NuxtLink>
        </div>

        <div v-else>
            <div
                class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <CommonCitizenPropertyCard
                    v-for="property in properties"
                    :key="property.id"
                    :property="property"
                    @click="handlePropertyClick(property)"
                    @favorite="toggleFavorite" />
            </div>

            <!-- Pagination -->
            <div
                v-if="totalResults > 0"
                class="mt-6">
                <!-- <LazyPagination
                    :current-page="currentPage"
                    :total-pages="totalPages"
                    :show-text="true"
                    :total-results="totalResults"
                    :results-per-page="perPage"
                    @page-change="(page) => navigateTo({ query: { ...route.query, page } })" /> -->
            </div>
        </div>
    </div>

    <Toast position="top-right" />

    <ConfirmModal
        v-model:isOpenConModal="showConfirmModal"
        title="Remove from Favorites?"
        message="This property will be removed from your saved list."
        @confirm="confirmRemoveFavorite" />
</template>
