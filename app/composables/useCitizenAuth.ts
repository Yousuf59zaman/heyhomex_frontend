
export type AuthStep = 'register' | 'verify' | 'success'

interface AuthModalState {
  isOpen: boolean
  step: AuthStep
  userData: {
    email?: string
    firstName?: string
    lastName?: string
    phone?: string
  }
}

// Global reactive state
const modalState = reactive<AuthModalState>({
  isOpen: false,
  step: 'register',
  userData: {}
})

export const useCitizenAuth = () => {
  // Actions
  const openModal = (initialStep: AuthStep = 'register') => {
    modalState.isOpen = true
    modalState.step = initialStep
  }

  const closeModal = () => {
    modalState.isOpen = false
    // Reset step after a delay to avoid visual glitch
    setTimeout(() => {
      modalState.step = 'register'
      modalState.userData = {}
    }, 300)
  }

  const nextStep = () => {
    const steps: AuthStep[] = ['register', 'verify', 'success']
    const currentIndex = steps.indexOf(modalState.step)
    if (currentIndex < steps.length - 1) {
      const nextStepValue = steps[currentIndex + 1]
      if (nextStepValue) {
        modalState.step = nextStepValue
      }
    }
  }

  const setStep = (step: AuthStep) => {
    modalState.step = step
  }

  const updateUserData = (data: Partial<AuthModalState['userData']>) => {
    modalState.userData = { ...modalState.userData, ...data }
  }

  // Computed values
  const isOpen = computed(() => modalState.isOpen)
  const currentStep = computed(() => modalState.step)
  const userData = computed(() => modalState.userData)

  return {
    // State
    isOpen,
    currentStep,
    userData,
    
    // Actions
    openModal,
    closeModal,
    nextStep,
    setStep,
    updateUserData
  }
}