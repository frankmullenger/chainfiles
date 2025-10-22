# Cross-App Navigation Refactoring Plan

## Overview
This document tracks the comprehensive refactoring to implement seamless navigation between the Marketing app (localhost:3001) and Digital app (localhost:3005) using a centralized routes system.

## Context
- **Marketing App**: Public-facing marketing site promoting digital download functionality
- **Digital App**: Main MVP for digital downloads with x402 payment system
- **Goal**: Create seamless user experience with type-safe, environment-flexible navigation

## Progress Status

### ✅ Phase 1: Environment & Routes Infrastructure (COMPLETED)
- [x] Added `NEXT_PUBLIC_DIGITAL_URL` to routes package validation schema (`packages/routes/keys.ts`)
- [x] Updated all app `.env` files with `NEXT_PUBLIC_DIGITAL_URL=http://localhost:3005`
- [x] Updated all app `.env.example` files with digital URL
- [x] Added comprehensive digital routes structure to routes package:
  ```typescript
  digital: {
    Api: `${baseUrl.Digital}/api`,
    Index: `${baseUrl.Digital}/digital`,
    Upload: `${baseUrl.Digital}/digital/upload`,
    download: {
      Index: `${baseUrl.Digital}/digital/download/[id]`,
      success: {
        Index: `${baseUrl.Digital}/digital/download/success/[token]`
      }
    },
    product: {
      Index: `${baseUrl.Digital}/digital/product/[id]`
    }
  }
  ```

### ✅ Phase 2: Replace Hardcoded URLs in Digital App (COMPLETED)
- [x] **Product Page**: Replaced `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3005'}` with routes system
- [x] **Landing Page**: Updated test download link to use `routes.digital.download.Index`
- [x] **Server Actions**: Updated redirects in `create-product-with-file.ts`
- [x] **Success Page**: Updated bookmark link to use routes system
- [x] **Middleware**: Fixed URL construction in `dynamicMiddleware.ts` (resolved double URL issue)

### 🔄 Phase 3: Cross-App Navigation Implementation (IN PROGRESS)

#### 3.1 Marketing App Updates (COMPLETED)
- [x] **Navbar Components**: Updated marketing app navbar - commented out Product/Resources/Blog/Story, added Upload link to digital app
- [ ] **CTA Sections**: Update call-to-action buttons to link to `routes.digital.Upload` (DEFERRED - content review needed)
- [ ] **Hero Sections**: Update primary action buttons to link to digital functionality (DEFERRED - content review needed)
- [ ] **Landing Pages**: Replace any hardcoded references to digital functionality (DEFERRED - content review needed)

#### 3.2 Digital App Updates (COMPLETED)
- [x] **Navbar Components**: Updated digital app navbar - commented out Product/Resources/Blog/Story, added Upload (current app) and Pricing (back to marketing)
- [ ] **Footer Links**: Add navigation back to marketing pages (pricing, about, etc.) (FUTURE)
- [ ] **Success Pages**: Add "Share Your Product" links back to marketing content (FUTURE)
- [ ] **Upload Flow**: Add contextual links to marketing resources (FUTURE)

#### 3.3 Component Cleanup (PARTIALLY COMPLETED)
- [x] **Remove Marketing Routes**: Removed blog, careers, contact, docs, pricing, privacy-policy, story, terms-of-use, cookie-policy app routes
- [x] **Remove Content Folder**: Removed content/ folder (MDX content for blog/docs)
- [x] **Remove Unused Components**: Removed components/docs/ and components/blog/ folders
- [ ] **Shared Components**: Move truly shared components to `@workspace/ui` package (FUTURE)
- [ ] **App-Specific Components**: Consider replacing homepage sections with digital-focused content (FUTURE)

### 🚀 Phase 4: Production Considerations (FUTURE)

#### 4.1 Environment Configuration
- [ ] **Production URLs**: Update `.env.example` files with production URL patterns
- [ ] **Environment Validation**: Ensure routes package works with production domains
- [ ] **SSL/HTTPS**: Verify routes work with HTTPS in production

#### 4.2 SEO & Performance
- [ ] **Meta Tags**: Ensure cross-app navigation doesn't break SEO
- [ ] **Preloading**: Consider preloading critical routes for better UX
- [ ] **Analytics**: Track cross-app navigation patterns

## Technical Implementation Notes

### Route Usage Patterns
```typescript
// For routes with placeholders
const productUrl = routes.digital.download.Index.replace('[id]', productId);
const successUrl = routes.digital.download.success.Index.replace('[token]', token);

// For simple routes
const uploadUrl = routes.digital.Upload;
const marketingHome = routes.marketing.Index;
```

### Environment Variables Required
```bash
# All apps need these in .env
NEXT_PUBLIC_DASHBOARD_URL=http://localhost:3000
NEXT_PUBLIC_MARKETING_URL=http://localhost:3001
NEXT_PUBLIC_DIGITAL_URL=http://localhost:3005
NEXT_PUBLIC_PUBLIC_API_URL=http://localhost:3002
```

### Key Files Modified
- `packages/routes/keys.ts` - Added digital URL validation
- `packages/routes/src/index.ts` - Added digital routes structure
- `apps/marketing/.env` + `.env.example` - Added digital URL
- `apps/dashboard/.env` + `.env.example` - Added digital URL
- `apps/digital/app/digital/product/[id]/page.tsx` - Updated shareable URLs
- `apps/digital/app/digital/page.tsx` - Updated test links
- `apps/digital/actions/create-product-with-file.ts` - Updated redirects
- `apps/digital/app/digital/download/success/[token]/page.tsx` - Updated bookmark links
- `apps/digital/middleware/dynamicMiddleware.ts` - Fixed URL construction

## ✅ Latest Updates (2025-10-21)

**Navbar Refactoring Completed:**
- **Marketing App Navbar**: Simplified to Home (logo) → Upload → Pricing
- **Digital App Navbar**: Simplified to Home (logo) → Upload → Pricing
- **Commented Out**: Product dropdowns, Resources dropdowns, Blog, Story links, Sign In/Sign Up buttons, Theme Toggle
- **Cross-App Navigation**: Upload links correctly route between apps using routes system
- **Theme Configuration**: Default theme set to "light" (day mode), theme toggle still available in footer

**Digital App Cleanup Completed:**
- **Removed Marketing Routes**: blog, careers, contact, docs, pricing, privacy-policy, story, terms-of-use, cookie-policy
- **Removed Content Folder**: MDX content for blog/docs no longer needed
- **Removed Unused Components**: docs/ and blog/ component folders
- **Preserved**: Homepage sections, cards, fragments (still used by current homepage)

**Footer Simplification Completed:**
- **Both Apps**: Commented out Product, Resources, About footer sections for MVP
- **Both Apps**: Commented out newsletter subscription section 
- **Both Apps**: Commented out social media links
- **Preserved**: Legal section (Terms, Privacy, Cookie Policy) and theme switcher
- **All commented code preserved** for future reactivation

**Current Navigation Structure:**
```
Marketing App (localhost:3001):
├── Logo → routes.marketing.Index (marketing home)
├── Upload → routes.digital.Upload (digital app)
└── Pricing → routes.marketing.Pricing (marketing pricing)

Digital App (localhost:3005):
├── Logo → routes.marketing.Index (marketing home) 
├── Upload → routes.digital.Upload (current app)
└── Pricing → routes.marketing.Pricing (marketing app)

Footer (Both Apps):
├── Legal Links (Terms, Privacy, Cookie Policy)
├── Copyright Notice
└── Theme Toggle (Dark/Light Mode)
```

## Next Steps (Priority Order)

1. **Test Cross-App Navigation** - Verify navbar links work between localhost:3001 and localhost:3005
2. **Component Cleanup** - Remove unused marketing components from digital app (future)
3. **Content Review** - Decide which CTA sections need updating (deferred until content strategy finalized)

## Testing Checklist
- [ ] Marketing navbar links to digital upload page
- [ ] Digital navbar links back to marketing pages
- [ ] All routes work in development (localhost)
- [ ] Environment variables properly validated
- [ ] No hardcoded URLs remaining
- [ ] Payment flow redirects correctly
- [ ] Success pages have proper navigation options

## Questions/Decisions Needed
- Which specific marketing content should be linked from digital app?
- Should we add breadcrumb navigation for cross-app flows?
- Do we need shared authentication between apps?
- Should upload success redirect back to marketing with success message?

---

*Last Updated: 2025-10-21*
*Current Phase: Cross-App Navigation Implementation*
