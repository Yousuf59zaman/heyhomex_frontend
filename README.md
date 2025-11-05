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

**Key Features:**
- Clicking "Create Account" in CitizenLoginModal navigates to CitizenGetStartedModal (step 0)
- Clicking "Get Started" in the header opens CitizenGetStartedModal
- Clicking "Sign In" in the header opens CitizenLoginModal (step 6)
- Modal transitions are handled smoothly without closing and reopening

**Files Modified:**
- `app/components/Auth/CitizenLoginModal.vue`: Updated `showRegister()` to emit event without closing modal
- `app/components/Auth/CitizenAuthModals.vue`: Updated `handleShowRegisterFromLogin()` to navigate to step 0
