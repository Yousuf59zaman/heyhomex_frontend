# Citizen Authentication System

This system consists of three separate modals that handle the complete user authentication and onboarding flow.

## Components

### 1. CitizenRegisterModal
**File:** `components/Auth/CitizenRegisterModal.vue`

Handles new user registration with:
- Full name
- Email
- Password
- Price range
- Preferred location

**Events:**
- `@register-success` - Emitted after successful registration
- `@show-login` - Emitted when user clicks "Sign In" link
- `@close` - Emitted when modal closes

### 2. CitizenLoginModal
**File:** `components/Auth/CitizenLoginModal.vue`

Handles user login with:
- Email
- Password
- Remember me option
- Forgot password link

**Events:**
- `@login-success(needsOnboarding: boolean)` - Emitted after successful login
  - `needsOnboarding = true` if user needs to complete onboarding
  - `needsOnboarding = false` if user can go directly to dashboard
- `@show-register` - Emitted when user clicks "Create Account" link
- `@close` - Emitted when modal closes

### 3. CitizenOnboardingModal
**File:** `components/Auth/CitizenOnboardingModal.vue`

Handles 3-step onboarding questionnaire:
1. **Motivation** - Why are you searching for a home?
2. **Budget** - What's your price range?
3. **Location** - City, Suburbs, or All?

**Events:**
- `@onboarding-complete(data)` - Emitted when user completes all steps
- `@close` - Emitted when modal closes

## Usage

### Opening Modals from Any Component

```vue
<script setup>
const { $citizenModals } = useNuxtApp();

// Open register modal
const openRegister = () => {
    $citizenModals.openRegister();
};

// Open login modal
const openLogin = () => {
    $citizenModals.openLogin();
};

// Open onboarding modal
const openOnboarding = () => {
    $citizenModals.openOnboarding();
};

// Close all modals
const closeAllModals = () => {
    $citizenModals.closeAll();
};
</script>

<template>
    <button @click="openRegister()">Sign Up</button>
    <button @click="openLogin()">Sign In</button>
</template>
```

## Flow Logic

### Registration → Login → Onboarding → Dashboard

```
1. User clicks "Sign Up"
   ↓
2. CitizenRegisterModal opens
   ↓
3. User fills form and submits
   ↓
4. On success, CitizenLoginModal opens automatically
   ↓
5. User logs in
   ↓
6. Check if user needs onboarding:
   - If YES → CitizenOnboardingModal opens
   - If NO → Redirect to /kamaina/ dashboard
   ↓
7. User completes onboarding questionnaire
   ↓
8. Redirect to /kamaina/ dashboard
```

### Direct Login (Existing User)

```
1. User clicks "Sign In"
   ↓
2. CitizenLoginModal opens
   ↓
3. User logs in
   ↓
4. Check if user completed onboarding before:
   - If YES → Redirect to /kamaina/ dashboard
   - If NO → CitizenOnboardingModal opens
```

## LocalStorage Keys

The system uses these localStorage keys:

- `citizen_needs_onboarding` - Set to `'true'` after registration, removed after onboarding completion
- `citizen_temp_email` - Temporarily stores email during registration flow
- `citizen_user_data` - Stores authenticated user data
- `citizen_token` - Stores authentication token

## Integration Points

### Replace with Actual API Calls

In each modal, replace the TODO comments with actual API calls:

**CitizenRegisterModal.vue:**
```typescript
const response = await $fetchCitizen('/citizen/register', {
    method: 'POST',
    body: formData
});
```

**CitizenLoginModal.vue:**
```typescript
const response = await $fetchCitizen('/citizen/login', {
    method: 'POST',
    body: formData
});

// Check from API response if onboarding is needed
const needsOnboarding = response.data?.needs_onboarding || false;
```

**CitizenOnboardingModal.vue:**
```typescript
await $fetchCitizen('/citizen/onboarding', {
    method: 'POST',
    body: formData
});
```

## Customization

### Changing Routes

Edit the redirect in `CitizenOnboardingModal.vue` and `CitizenLoginModal.vue`:

```typescript
// Change this to your desired dashboard route
navigateTo('/kamaina/');  // or '/investor/' or '/military/'
```

### Styling

Each modal has its own scoped styles. You can customize:
- Colors
- Border radius
- Spacing
- Animations

### Form Fields

Add/remove fields in each modal's `formData` reactive object and template.

## Testing

1. **Register Flow:**
   - Open register modal
   - Fill all fields
   - Submit
   - Should auto-open login modal

2. **Login Flow (New User):**
   - Login with credentials
   - Should open onboarding modal
   - Complete 3 steps
   - Should redirect to dashboard

3. **Login Flow (Existing User):**
   - Login with credentials
   - Should redirect directly to dashboard

## Notes

- All modals prevent body scroll when open
- Modals can be closed with ESC key
- Only one modal can be open at a time
- Form validation is handled by PrimeVue components
- All transitions are smooth (300ms)
