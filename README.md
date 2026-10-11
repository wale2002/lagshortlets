# LAG Shortlets

A Lagos shortlet catalogue and private operations workspace. Built with Next.js, React, Framer Motion, MongoDB Atlas and Cloudinary for Vercel.

## Guest experience

Guests can browse Lagos zones and collections, search by location, dates and capacity, filter amenities and rates, save favourites, view galleries and submit enquiries. Each accepted enquiry receives a durable reference. WhatsApp links include the guest's stay details. Availability and full pricing are confirmed by the LAG team; this application does not take payments or confirm bookings.

## LAG Vault

`/vault` requires an allowlisted staff email, a staff password and a six-digit authenticator code. Staff sessions last 12 hours; Vault verification lasts 30 minutes. Authenticator codes cannot be replayed. Administrators manage supplier details and partners. Operations staff cannot read supplier costs, contacts, permission evidence or partner records. MongoDB transactions pair operational changes with audit entries.

For this initial release, each role uses a separately configured password hash. Share a role password only with authorised staff; individual password accounts and automated account recovery are not implemented. A lost authenticator requires an administrator to remove that user's `staff_mfa` record after verifying their identity.

## Local development

Use Node.js 22. Copy `.env.example` to `.env.local` and configure server values, then run:

```sh
npm ci
npm run dev
```

MongoDB stores properties, enquiries, partners, staff MFA records, audit history, availability history and request limits. Cloudinary stores approved listing photographs. Image uploads require Vault verification, validate file signatures and accept JPEG, PNG and WebP files up to 4 MB.

All credentials stay on the server. Never prefix these secrets with `NEXT_PUBLIC_`, commit `.env.local`, or upload the local `.admin-access.txt` file. Generate a staff password hash using `npm run password:hash` and enter a strong password at the hidden prompt. Generate `LAG_AUTH_SECRET` with at least 40 random characters. Changing it invalidates sessions and requires re-enrolling authenticators because it also encrypts MFA secrets.

## Verification

```sh
npm run typecheck
npm run build
npm test
npm run verify:services
```

Integration tests load `.env.local`, create a uniquely named `lag_verify_...` database and test enquiry persistence, staff authentication, MFA replay prevention, private-field isolation, publishing approval and image validation. They remove only that test database. Cloudinary verification uploads a uniquely named tiny test image and deletes only that image. No customer messages are sent.

## Vercel deployment

Import `wale2002/lagshortlets` into Vercel using the Next.js preset and Node.js 22. Add the keys in `.env.example` as server environment variables for Production and Preview; use separate preview data and credentials where possible. Set `APP_URL` to the final production origin, or let the app use Vercel's production domain. Build with `npm run build`. MongoDB Atlas must permit the deployment's network access; choose an appropriate Atlas network policy for your Vercel hosting configuration.

## Before accepting customers

The six starter listings, prices, specifications and photographs are labelled illustrative. Replace them with accurate, permissioned inventory and approved photos in Vault. Publishing partner inventory requires approved permission evidence and an availability owner. Add your booking, fee, deposit and cancellation terms and approve privacy, data retention, backup and recovery policies.

Enquiries are stored in Vault, but automatic email or WhatsApp notifications are not configured. Establish a response process and notification provider before launch. The website includes `noindex` metadata while the initial inventory is prepared. Real inventory approval, customer-facing policy approval, monitoring, analytics and database backup operations remain business launch tasks.
