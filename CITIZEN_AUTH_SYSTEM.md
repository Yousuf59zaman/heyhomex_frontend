# Citizen Authentication System

This system consists of seven separate modals that handle the complete user authentication and onboarding flow.

## Components

### 1. CitizenGetStartedModal
**File:** `components/Auth/CitizenGetStartedModal.vue`

Welcome modal that introduces users to the platform with:
- Personalized home recommendations
- Million+ properties showcase
- Free service highlights
- Call to action buttons

**Events:**
- `@show-register` - Emitted when user clicks "Get Started" button
- `@show-login` - Emitted when user clicks "Sign In" link
- `@close` - Emitted when modal closes

### 2. CitizenSendOtpModal
**File:** `components/Auth/CitizenSendOtpModal.vue`

Handles email collection and OTP sending with:
- Email input field
- Email validation
- OTP sending to user's email

**Events:**
- `@next(email: string)` - Emitted when OTP is sent successfully, passes email to next step
- `@close` - Emitted when modal closes

### 3. CitizenVerifyOtpModal
**File:** `components/Auth/CitizenVerifyOtpModal.vue`

Handles OTP verification with:
- 6-digit OTP input boxes
- Auto-focus between input fields
- Paste support for 6-digit codes
- 5-minute countdown timer
- Maximum 3 OTP requests

**Features:**
- Individual input boxes for each digit
- Automatic focus on next input after entering digit
- Backspace navigation to previous input
- Copy-paste support for full 6-digit OTP
- Timer countdown (5:00 minutes)
- Error message display

**Events:**
- `@verify-success` - Emitted after successful OTP verification
- `@close` - Emitted when modal closes

### 4. CitizenAccountTypeModal
**File:** `components/Auth/CitizenAccountTypeModal.vue`

Handles account type selection with:
- Three selectable options: Buyer, Agent, Advertiser
- Visual selection state with dark background for selected option
- Clean grid layout with 3 columns

**Features:**
- Single selection (radio button behavior)
- Default selection: Buyer
- Interactive hover states
- Responsive design

**Events:**
- `@next(accountType: string)` - Emitted when user clicks "Next", passes selected account type ('buyer', 'agent', or 'advertiser')
- `@close` - Emitted when modal closes

### 5. CitizenRegisterModal
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

### 6. CitizenLoginModal
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

### 7. CitizenOnboardingModal
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

// Open get started modal
const openGetStarted = () => {
    $citizenModals.openGetStarted();
};

// Open send OTP modal
const openSendOtp = () => {
    $citizenModals.openSendOtp();
};

// Open verify OTP modal
const openVerifyOtp = () => {
    $citizenModals.openVerifyOtp();
};

// Open account type modal
const openAccountType = () => {
    $citizenModals.openAccountType();
};

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
    <button @click="openGetStarted()">Get Started</button>
    <button @click="openLogin()">Sign In</button>
</template>
```

## Flow Logic

### New User Registration Flow: Get Started → Send OTP → Verify OTP → Account Type → Register → Login → Onboarding → Dashboard

```
1. User clicks "Get Started"
   ↓
2. CitizenGetStartedModal opens (Welcome screen)
   ↓
3. User clicks "Get Started" in the modal
   ↓
4. CitizenSendOtpModal opens (Email collection)
   ↓
5. User enters email and clicks "Next"
   ↓
6. OTP is sent to user's email
   ↓
7. CitizenVerifyOtpModal opens (OTP verification)
   ↓
8. User enters 6-digit OTP within 5 minutes
   ↓
9. On successful verification, CitizenAccountTypeModal opens
   ↓
10. User selects account type (Buyer, Agent, or Advertiser) and clicks "Next"
   ↓
11. CitizenRegisterModal opens
   ↓
12. User fills registration form (name, password, price range, location)
   ↓
13. On success, CitizenLoginModal opens automatically
   ↓
14. User logs in with credentials
   ↓
15. Check if user needs onboarding:
    - If YES → CitizenOnboardingModal opens
    - If NO → Redirect to /kamaina/ dashboard
   ↓
16. User completes 3-step onboarding questionnaire
   ↓
17. Redirect to /kamaina/ dashboard
```

### Direct Login (Existing User)

```
1. User clicks "Sign In" (from Get Started modal or anywhere)
   ↓
2. CitizenLoginModal opens
   ↓
3. User logs in with email and password
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

**CitizenSendOtpModal.vue:**
```typescript
const response = await $fetchCMS('/send-otp', {
    method: 'POST',
    body: { email: formData.email }
});
```

**CitizenVerifyOtpModal.vue:**
```typescript
const response = await $fetchCMS('/verify-otp', {
    method: 'POST',
    body: {
        email: props.email,
        otp: otpDigits.value.join('')
    }
});
```

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

1. **Complete Registration Flow:**
   - Open get started modal
   - Click "Get Started" button
   - Enter email in send OTP modal
   - Click "Next" - should receive OTP email
   - Enter 6-digit OTP in verify modal
   - Should auto-open account type modal
   - Select account type (Buyer, Agent, or Advertiser)
   - Click "Next"
   - Should auto-open register modal
   - Fill all registration fields
   - Submit registration
   - Should auto-open login modal

2. **OTP Verification Features:**
   - Test auto-focus between input fields
   - Test backspace navigation
   - Test paste functionality with 6-digit code
   - Verify timer countdown (5:00 to 0:00)
   - Test error message display for invalid OTP

3. **Account Type Selection:**
   - Verify default selection is "Buyer"
   - Test clicking on each account type option
   - Verify visual feedback (selected option has dark background)
   - Verify only one option can be selected at a time
   - Test clicking "Next" button passes correct account type

4. **Login Flow (New User):**
   - Login with credentials
   - Should open onboarding modal
   - Complete 3 steps
   - Should redirect to dashboard

5. **Login Flow (Existing User):**
   - Login with credentials
   - Should redirect directly to dashboard

6. **Modal Navigation:**
   - Test back button in verify OTP modal
   - Test back button in account type modal
   - Test switching between login and register
   - Verify only one modal open at a time
   - Test ESC key closes modal

## Notes

- All modals prevent body scroll when open
- Modals can be closed with ESC key
- Only one modal can be open at a time
- Form validation is handled by PrimeVue components
- All transitions are smooth (300ms)
- OTP verification includes a 5-minute timer
- OTP inputs support numeric input only
- Paste functionality works for 6-digit codes
- Timer automatically starts when verify OTP modal opens
- Email is passed between modals through event parameters
- Account type defaults to "Buyer" when modal opens
- Selected account type is logged to console and can be used for API calls
- Account type modal uses a grid layout with 3 columns for responsive design
