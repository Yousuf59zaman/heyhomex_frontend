# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.


## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Authentication System

### Modal Flow

The authentication system uses a multi-step modal flow managed by `CitizenAuthModals.vue`:

**Step Navigation:**
- `activeIndex = 0`: CitizenGetStartedModal (registration entry point)
- `activeIndex = 1`: CitizenSendEmailModal
- `activeIndex = 2`: CitizenVerifyOtpModal
- `activeIndex = 3`: CitizenAccountTypeModal
- `activeIndex = 4`: CitizenRegisterModal
- `activeIndex = 5`: CitizenProfessionalModal
- `activeIndex = 6`: CitizenLoginModal
- `activeIndex = 7`: CitizenOnboardingModal
- `activeIndex = 8`: CitizenForgotPasswordModal

**Key Features:**
- Clicking "Create Account" in CitizenLoginModal navigates to CitizenGetStartedModal (step 0)
- Clicking "Get Started" in the header opens CitizenGetStartedModal
- Clicking "Sign In" in the header opens CitizenLoginModal (step 6)
- Clicking "Forgot password?" in CitizenLoginModal navigates to CitizenForgotPasswordModal (step 8)
- Modal transitions are handled smoothly without closing and reopening

**Forgot Password Flow:**
The forgot password feature allows users to reset their password by receiving a reset link via email.

**Components:**
- `CitizenForgotPasswordModal.vue`: Dedicated modal for password reset
  - Email validation (required field and valid email format)
  - API integration with `forgot-password` endpoint
  - Success state with automatic redirect back to login
  - "Back to Sign in" button to return to login modal

**Files Modified:**
- `app/components/Auth/CitizenLoginModal.vue`:
  - Updated `showRegister()` to emit event without closing modal
  - Added `showForgotPassword()` function and "show-forgot-password" emit event
  - Connected "Forgot password?" button to emit the event
- `app/components/Auth/CitizenAuthModals.vue`:
  - Updated `handleShowRegisterFromLogin()` to navigate to step 0
  - Added `handleShowForgotPasswordFromLogin()` to navigate to step 8
  - Added `handleBackToLoginFromForgotPassword()` to navigate back to step 6
  - Integrated CitizenForgotPasswordModal component

**Files Created:**
- `app/components/Auth/CitizenForgotPasswordModal.vue`: New forgot password modal component based on Figma design
