<template>
  <div class="w-full">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="text-gray-500">Loading billing history...</div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12">
      <p class="text-red-500 mb-4">{{ error }}</p>
      <button
        @click="loadBillingData"
        class="px-4 py-2 bg-[#E95E30] text-white rounded-md hover:bg-[#D04E20]"
      >
        Retry
      </button>
    </div>

    <!-- Table -->
    <div v-else-if="billingData.length > 0" class="w-full">
      <div class="overflow-x-auto">
        <table class="w-full">
          <!-- Table Header -->
          <thead>
            <tr class="border-b border-gray-200">
              <th
                v-for="column in columns"
                :key="column.key"
                class="py-3 px-4 text-left text-sm font-normal text-[#18222c] cursor-pointer hover:bg-gray-50"
                :class="column.sortable ? 'select-none' : ''"
                @click="column.sortable ? handleSort(column.key) : null"
              >
                <div class="flex items-center gap-2">
                  <span>{{ column.label }}</span>
                  <div
                    v-if="column.sortable"
                    class="flex flex-col"
                  >
                    <svg
                      class="w-2 h-2"
                      :class="sortBy === column.key && sortOrder === 'asc' ? 'text-[#18222c]' : 'text-gray-400'"
                      fill="currentColor"
                      viewBox="0 0 320 512"
                    >
                      <path d="M182.6 137.4c-12.5-12.5-32.8-12.5-45.3 0l-128 128c-9.2 9.2-11.9 22.9-6.9 34.9s16.6 19.8 29.6 19.8H288c12.9 0 24.6-7.8 29.6-19.8s2.2-25.7-6.9-34.9l-128-128z" />
                    </svg>
                    <svg
                      class="w-2 h-2 mt-1"
                      :class="sortBy === column.key && sortOrder === 'desc' ? 'text-[#18222c]' : 'text-gray-400'"
                      fill="currentColor"
                      viewBox="0 0 320 512"
                    >
                      <path d="M137.4 374.6c12.5 12.5 32.8 12.5 45.3 0l128-128c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8H32c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9l128 128z" />
                    </svg>
                  </div>
                </div>
              </th>
            </tr>
          </thead>

          <!-- Table Body -->
          <tbody>
            <tr
              v-for="(invoice, index) in billingData"
              :key="invoice.id || index"
              class="border-b border-gray-100 hover:bg-gray-50"
            >
              <!-- Status -->
              <td class="py-4 px-4">
                <span
                  class="inline-block px-3 py-1 rounded-md text-sm font-medium"
                  :class="getStatusClass(invoice.status)"
                >
                  {{ invoice.status }}
                </span>
              </td>

              <!-- Due Date -->
              <td class="py-4 px-4 text-sm text-[#18222c]">
                {{ formatDate(invoice.dueDate) }}
              </td>

              <!-- Invoice ID -->
              <td class="py-4 px-4 text-sm text-[#18222c]">
                {{ invoice.invoiceId }}
              </td>

              <!-- Payment Method -->
              <td class="py-4 px-4">
                <div class="flex items-center gap-2">
                  <img
                    v-if="invoice.paymentMethod?.logo"
                    :src="invoice.paymentMethod.logo"
                    :alt="invoice.paymentMethod.type"
                    class="w-8 h-5 object-contain"
                  />
                  <span class="text-sm text-[#18222c]">
                    {{ invoice.paymentMethod?.displayText || 'N/A' }}
                  </span>
                </div>
              </td>

              <!-- Amount -->
              <td class="py-4 px-4 text-sm text-[#18222c]">
                ${{ formatAmount(invoice.amount) }}
              </td>

              <!-- Download/View Invoice -->
              <td class="py-4 px-4">
                <div class="flex items-center gap-3">
                  <!-- Download Button -->
                  <button
                    @click="handleDownload(invoice)"
                    class="text-gray-600 hover:text-[#E95E30] transition-colors"
                    title="Download Invoice"
                  >
                    <i class="fa-solid fa-download text-sm"></i>
                  </button>

                  <!-- View Button -->
                  <button
                    @click="handleView(invoice)"
                    class="text-gray-600 hover:text-[#E95E30] transition-colors"
                    title="View Invoice"
                  >
                    <i class="fa-solid fa-arrow-up-right-from-square text-sm"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="mt-6" v-if="totalPages > 1">
        <LazyPagination
          :current-page="currentPage"
          :total-pages="totalPages"
          :show-text="true"
          :total-results="totalResults"
          :results-per-page="perPage"
        />
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <div class="text-gray-500 text-lg mb-2">No billing history found</div>
      <p class="text-gray-400 text-sm">Your billing history will appear here once you have transactions.</p>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()


// State
const loading = ref(false)
const error = ref('')
const billingData = ref([])
const sortBy = ref('dueDate')
const sortOrder = ref('desc')
const currentPage = ref(1)
const totalPages = ref(1)
const totalResults = ref(0)
const perPage = ref(10)

// Table columns configuration
const columns = [
  { key: 'status', label: 'Status', sortable: true },
  { key: 'dueDate', label: 'Due Date', sortable: true },
  { key: 'invoiceId', label: 'Invoice ID', sortable: true },
  { key: 'paymentMethod', label: 'Payment Method', sortable: true },
  { key: 'amount', label: 'Amount', sortable: true },
  { key: 'actions', label: 'Download or View Invoice', sortable: false }
]

// Load billing data
const loadBillingData = async () => {
  loading.value = true
  error.value = ''

  try {
    // TODO: Replace with actual API call
    // const response = await $fetchCitizen('/billing/history', {
    //   params: {
    //     page: currentPage.value,
    //     perPage: perPage.value,
    //     sortBy: sortBy.value,
    //     sortOrder: sortOrder.value
    //   }
    // })

    // Mock data for demonstration
    await new Promise(resolve => setTimeout(resolve, 500))

    const mockData = [
      {
        id: 1,
        status: 'Pending',
        dueDate: '2026-01-26',
        invoiceId: '632123',
        paymentMethod: {
          type: 'Visa',
          logo: 'https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg',
          displayText: 'ending in 7223'
        },
        amount: 10.00
      },
      {
        id: 2,
        status: 'Paid',
        dueDate: '2026-12-26',
        invoiceId: '632123',
        paymentMethod: {
          type: 'Visa',
          logo: 'https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg',
          displayText: 'ending in 7223'
        },
        amount: 10.00
      },
      {
        id: 2,
        status: 'Paid',
        dueDate: '2026-12-26',
        invoiceId: '632123',
        paymentMethod: {
          type: 'Visa',
          logo: 'https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg',
          displayText: 'ending in 7223'
        },
        amount: 10.00
      },
      {
        id: 2,
        status: 'Paid',
        dueDate: '2026-12-26',
        invoiceId: '632123',
        paymentMethod: {
          type: 'Visa',
          logo: 'https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg',
          displayText: 'ending in 7223'
        },
        amount: 10.00
      },
      {
        id: 2,
        status: 'Paid',
        dueDate: '2026-12-26',
        invoiceId: '632123',
        paymentMethod: {
          type: 'Visa',
          logo: 'https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg',
          displayText: 'ending in 7223'
        },
        amount: 10.00
      },
      {
        id: 2,
        status: 'Paid',
        dueDate: '2026-12-26',
        invoiceId: '632123',
        paymentMethod: {
          type: 'Visa',
          logo: 'https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg',
          displayText: 'ending in 7223'
        },
        amount: 10.00
      },
      {
        id: 2,
        status: 'Paid',
        dueDate: '2026-12-26',
        invoiceId: '632123',
        paymentMethod: {
          type: 'Visa',
          logo: 'https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg',
          displayText: 'ending in 7223'
        },
        amount: 10.00
      },
      {
        id: 2,
        status: 'Paid',
        dueDate: '2026-12-26',
        invoiceId: '632123',
        paymentMethod: {
          type: 'Visa',
          logo: 'https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg',
          displayText: 'ending in 7223'
        },
        amount: 10.00
      },
      {
        id: 2,
        status: 'Paid',
        dueDate: '2026-12-26',
        invoiceId: '632123',
        paymentMethod: {
          type: 'Visa',
          logo: 'https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg',
          displayText: 'ending in 7223'
        },
        amount: 10.00
      },
      {
        id: 2,
        status: 'Paid',
        dueDate: '2026-12-26',
        invoiceId: '632123',
        paymentMethod: {
          type: 'Visa',
          logo: 'https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg',
          displayText: 'ending in 7223'
        },
        amount: 10.00
      },
      {
        id: 2,
        status: 'Paid',
        dueDate: '2026-12-26',
        invoiceId: '632123',
        paymentMethod: {
          type: 'Visa',
          logo: 'https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg',
          displayText: 'ending in 7223'
        },
        amount: 10.00
      },
      {
        id: 2,
        status: 'Paid',
        dueDate: '2026-12-26',
        invoiceId: '632123',
        paymentMethod: {
          type: 'Visa',
          logo: 'https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg',
          displayText: 'ending in 7223'
        },
        amount: 10.00
      },
      {
        id: 2,
        status: 'Paid',
        dueDate: '2026-12-26',
        invoiceId: '632123',
        paymentMethod: {
          type: 'Visa',
          logo: 'https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg',
          displayText: 'ending in 7223'
        },
        amount: 10.00
      },
      {
        id: 2,
        status: 'Paid',
        dueDate: '2026-12-26',
        invoiceId: '632123',
        paymentMethod: {
          type: 'Visa',
          logo: 'https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg',
          displayText: 'ending in 7223'
        },
        amount: 10.00
      },
      {
        id: 2,
        status: 'Paid',
        dueDate: '2026-12-26',
        invoiceId: '632123',
        paymentMethod: {
          type: 'Visa',
          logo: 'https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg',
          displayText: 'ending in 7223'
        },
        amount: 10.00
      },
      {
        id: 2,
        status: 'Paid',
        dueDate: '2026-12-26',
        invoiceId: '632123',
        paymentMethod: {
          type: 'Visa',
          logo: 'https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg',
          displayText: 'ending in 7223'
        },
        amount: 10.00
      },
    ]

    billingData.value = mockData
    totalResults.value = mockData.length
    totalPages.value = Math.ceil(mockData.length / perPage.value)

    // TODO: Use actual API response
    // billingData.value = response.data
    // totalResults.value = response.total
    // totalPages.value = response.totalPages
  } catch (err) {
    error.value = err.message || 'Failed to load billing history'
    console.error('Error loading billing data:', err)
  } finally {
    loading.value = false
  }
}

// Handle sorting
const handleSort = (columnKey) => {
  if (sortBy.value === columnKey) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = columnKey
    sortOrder.value = 'asc'
  }
  loadBillingData()
}

// Handle download
const handleDownload = async (invoice) => {
  try {
    // TODO: Replace with actual API call to download invoice
    console.log('Downloading invoice:', invoice.invoiceId)
    // const response = await $fetchCitizen(`/billing/invoice/${invoice.id}/download`)
    // Download logic here
  } catch (err) {
    console.error('Error downloading invoice:', err)
    alert('Failed to download invoice. Please try again.')
  }
}

// Handle view
const handleView = async (invoice) => {
  try {
    // TODO: Replace with actual API call to get invoice URL
    console.log('Viewing invoice:', invoice.invoiceId)
    // const response = await $fetchCitizen(`/billing/invoice/${invoice.id}/view`)
    // window.open(response.url, '_blank')
  } catch (err) {
    console.error('Error viewing invoice:', err)
    alert('Failed to view invoice. Please try again.')
  }
}

// Format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}

// Format amount
const formatAmount = (amount) => {
  if (typeof amount !== 'number') return '0.00'
  return amount.toFixed(2)
}

// Get status class
const getStatusClass = (status) => {
  const statusLower = status?.toLowerCase()
  switch (statusLower) {
    case 'paid':
      return 'bg-[#18222c] text-white'
    case 'pending':
      return 'bg-[#f0f1f3] text-[#18222c]'
    case 'failed':
      return 'bg-red-100 text-red-800'
    case 'refunded':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Watch for page changes in route
watch(() => route.query.page, (newPage) => {
  currentPage.value = parseInt(newPage) || 1
  loadBillingData()
})

// Load data on mount
onMounted(() => {
  currentPage.value = parseInt(route.query.page) || 1
  loadBillingData()
})
</script>
