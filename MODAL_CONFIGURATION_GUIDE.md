# Multi-Step Modal Configuration Guide

## Overview
This multi-step modal system is designed to be developer-friendly with easy configuration options for steps, validation, API endpoints, and UI customization.

## Architecture

### Files Structure
```
app/
├── composables/
│   └── useCitizenModal.ts          # Main logic & configuration
├── components/
│   └── Auth/
│       └── CitizenAuthModalNew.vue # Modal UI component
└── app.vue                         # Global modal integration
```

## Configuration

### 1. Step Configuration (`STEP_CONFIG`)

Each step is configured in the `useCitizenModal.ts` composable:

```typescript
export const STEP_CONFIG = {
  stepName: {
    title: "Step Title",              // Main heading
    subtitle: "Step description",     // Subheading (supports \n for line breaks)
    stepLabel: "Step: 1/3",          // Progress indicator text
    fields: ['field1', 'field2'],    // Form fields for this step
    apiEndpoint: '/api/endpoint',     // API endpoint for saving data
    validation: {                     // Validation rules
      field1: { required: true, email: true },
      field2: { required: true, minLength: 2 }
    }
  }
}
```

### 2. Choice Options (`STEP_OPTIONS`)

Define selectable options for each step:

```typescript
export const STEP_OPTIONS = {
  fieldName: [
    { label: 'Display Text', value: 'stored_value' },
    { label: 'Disabled Option', value: '', disabled: true }
  ]
}
```

### 3. Form Data Interface (`UserFormData`)

Define the complete form structure:

```typescript
export interface UserFormData {
  // Step 1 fields
  fullName: string
  email: string
  priceRange: string
  preferredLocation: string
  
  // Step 2 fields
  motivation: string
  
  // Step 3 fields
  budget: string
  
  // Step 4 fields
  locationType: string
}
```

## Adding New Steps

### 1. Update Types
```typescript
// Add new step to type
export type AuthStep = 'initial' | 'motivation' | 'budget' | 'location' | 'newStep' | 'success'

// Add new fields to interface
export interface UserFormData {
  // ... existing fields
  newField: string
}
```

### 2. Configure Step
```typescript
// Add to STEP_CONFIG
newStep: {
  title: "New Step Title",
  subtitle: "Step description",
  stepLabel: "Step: X/Y",
  fields: ['newField'],
  apiEndpoint: '/api/new-step',
  validation: {
    newField: { required: true }
  }
}

// Add options if needed
export const STEP_OPTIONS = {
  // ... existing options
  newField: [
    { label: 'Option 1', value: 'option1' },
    { label: 'Option 2', value: 'option2' }
  ]
}
```

### 3. Add UI in Component
```vue
<!-- Add new step UI in CitizenAuthModalNew.vue -->
<div v-else-if="currentStep === 'newStep'" class="space-y-6">
  <!-- Your step UI here -->
</div>
```

### 4. Update Step Flow
```typescript
// Update step arrays in composable
const steps: AuthStep[] = ['initial', 'motivation', 'budget', 'location', 'newStep', 'success']
```

## Validation System

### Built-in Validators
- `required: true` - Field must have value
- `email: true` - Valid email format
- `minLength: number` - Minimum character length

### Custom Validation
Add custom validators in the `validationService`:

```typescript
const validationService = {
  validateField(field: string, value: any, rules: any): string | null {
    // ... existing validators
    
    if (rules.customRule && !this.customValidator(value)) {
      return 'Custom error message'
    }
    
    return null
  },
  
  customValidator(value: string): boolean {
    // Your custom validation logic
    return true
  }
}
```

## API Integration

### Current Implementation
The modal uses a simulated API service. Replace with real API calls:

```typescript
const apiService = {
  async saveStepData(step: AuthStep, data: Partial<UserFormData>) {
    const config = STEP_CONFIG[step]
    if (!config.apiEndpoint) return { success: true, data }
    
    // Replace this with your actual API call
    const response = await fetch(config.apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      return { success: false, error: 'API Error' }
    }
    
    return { success: true, data: await response.json() }
  }
}
```

### Error Handling
API errors are automatically handled and displayed in the UI. The modal shows:
- Field-specific errors under each input
- General errors at the top of the modal
- Loading states during API calls

## Usage

### Opening the Modal
```typescript
// In any component
const { openModal } = useCitizenModal()

// Open at specific step
openModal('initial')    // Start at beginning
openModal('motivation') // Jump to specific step
```

### Accessing Modal State
```typescript
const { 
  isOpen,              // Boolean - modal visibility
  currentStep,         // String - current step name
  userData,            // Object - collected form data
  loading,             // Boolean - API call in progress
  errors,              // Object - validation/API errors
  currentStepConfig,   // Object - current step configuration
  currentStepOptions   // Object - current step options
} = useCitizenModal()
```

### Navigation Methods
```typescript
const {
  nextStep,      // Validate & move to next step
  prevStep,      // Move to previous step
  closeModal,    // Close modal
  startOver      // Reset to beginning
} = useCitizenModal()
```

## Customization

### Styling
The modal uses Tailwind CSS classes. Key customization areas:

```vue
<!-- Modal size -->
<div class="w-full max-w-md mx-auto">

<!-- Colors -->
<button class="bg-gray-900 hover:bg-gray-800">

<!-- Progress bar -->
<div class="bg-gray-900 flex-1">
```

### Animation
Transitions are handled with Vue's `<Transition>` component:

```vue
<Transition
  enter-active-class="transition-opacity duration-300 ease-out"
  enter-from-class="opacity-0"
  enter-to-class="opacity-100"
>
```

### Icons
Uses Nuxt Icon with Lucide icons. Change icons:

```vue
<Icon name="lucide:x" class="w-5 h-5" />
<Icon name="lucide:check" class="w-8 h-8" />
<Icon name="lucide:loader-2" class="animate-spin" />
```

## Best Practices

1. **Keep Steps Focused**: Each step should have a single purpose
2. **Validate Early**: Show validation errors immediately 
3. **Save Progress**: Each step saves data to prevent loss
4. **Clear Navigation**: Always provide back/next options
5. **Error Handling**: Show clear, actionable error messages
6. **Loading States**: Indicate when API calls are in progress
7. **Mobile First**: Design works on all screen sizes

## Debugging

### Console Logs
The composable includes debugging information:

```typescript
console.log('Current step:', currentStep.value)
console.log('Form data:', userData.value)
console.log('Errors:', errors.value)
```

### Vue DevTools
Use Vue DevTools to inspect:
- Modal state in the composable
- Reactive form data
- Computed properties

## Performance

### Optimizations Included
- Lazy loading with `ClientOnly`
- Debounced form updates
- Efficient re-renders with computed properties
- Proper cleanup on unmount
- Memory leak prevention

### Bundle Size
- Minimal dependencies
- Tree-shakable configuration
- Efficient Vue 3 Composition API usage