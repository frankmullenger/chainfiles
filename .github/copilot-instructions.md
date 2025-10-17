---
description: "ReactJS + Monorepo development standards for Digi Downloads"
applyTo: "**/*.{js,jsx,ts,tsx}"
---

# Digi Downloads Copilot Agent Instructions

## Workflow Control

- Do not start dev servers. I run them in iTerm manually.
- Do not open URLs in VSCode's browser. I use Chrome for testing.
- After completing a change, wait for me to manually test in the browser.
- Make small, logical changes, one task at a time.
- Only run Prisma-related commands if I ask. Commands are defined below.
- If you write files for documentation or examples, place them in the appropriate folder in docs/ which is usually docs/architecture
  - we only want to write long lasting documentation, we don't want to document changes that we make
  - we want to compile documentation that describes the system
  - if you want to write new docs, look for a logical place for those docs to sit by assessing the docs/ folder beforehand
  - we want to group docs together into articles that make sense to be together, maybe they cover a vertical aspect of the software
  - if the docs pertain to an app in particular and that app has a docs/ folder, put the docs in there instead of the root docs/ folder
- When we are working on a bug, don't remove all the logging until we have verified the bug is fixed.

## Suggested Nomenclature

For clarity in our instructions, let's use:

- Dashboard App (dashboard) - User management and analytics interface
- Marketing App (marketing) - Public-facing marketing site
- Digital App (digital) - Main digital downloads MVP interface
- Public API App (public-api) - API endpoints

---

## Monorepo Context

This project is a `pnpm` monorepo managed by TurboRepo. The main apps and ports:

- dashboard: 3000
- marketing: 3001
- public-api: 3002
- digital: 3003 (Main MVP app)

Use workspace-specific `pnpm` commands. Examples:

### Development

- `pnpm --filter digital dev`
- `pnpm --filter dashboard dev`
- `pnpm --filter marketing dev`

### Prisma Commands (only run if instructed)

- `pnpm --filter @workspace/database exec prisma migrate dev`
- `pnpm --filter @workspace/database run generate`
- `pnpm --filter @workspace/database exec prisma migrate reset`

---

## Project-Specific Context

### Digital Downloads MVP

This is a Web3 application for selling digital files using:

- **Base blockchain** (Sepolia testnet for development)
- **x402 Payment Protocol** for payment-required HTTP responses
- **USDC payments** on Base network
- **OnchainKit** for wallet integration
- **Temporary signed URLs** for file access after payment

### Key Architecture Principles

- **No user accounts initially** - Just wallet addresses for sellers
- **Generous download policy** - 24h expiry, unlimited downloads for MVP
- **Local file storage** for development (future: cloud storage)
- **x402 middleware** handles payment verification
- **Base Smart Wallet** for easy user onboarding

### App Structure Focus

The **Digital App** (`apps/digital/`) is the main MVP - copied from marketing app, so may need cleanup of unused marketing content later:

```
apps/digital/
├── app/
│   ├── digital/              # Main landing and upload pages
│   ├── download/[id]/        # Product pages (shareable links)
│   └── api/                  # Upload, download, file serving APIs
├── uploads/                  # Private file storage (not in public/)
└── hooks/                    # Form helpers and utilities
```

---

## ReactJS Best Practices

Instructions for building high-quality ReactJS applications with modern patterns, hooks, and best practices following the official React documentation at https://react.dev.

### Project Context

- Latest React version (React 19+)
- TypeScript for type safety (when applicable)
- Functional components with hooks as default
- Follow React's official style guide and best practices
- Use modern build tools (Next.js 15+ with App Router)
- Implement proper component composition and reusability patterns

### Development Standards

#### Architecture

- Use functional components with hooks as the primary pattern
- Implement component composition over inheritance
- Organize components by feature or domain for scalability
- Separate presentational and container components clearly
- Use custom hooks for reusable stateful logic
- Implement proper component hierarchies with clear data flow

#### TypeScript Integration

- Use TypeScript interfaces for props, state, and component definitions
- Define proper types for event handlers and refs
- Implement generic components where appropriate
- Use strict mode in `tsconfig.json` for type safety
- Leverage React's built-in types (`React.FC`, `React.ComponentProps`, etc.)
- Create union types for component variants and states

#### Component Design

- Follow the single responsibility principle for components
- Use descriptive and consistent naming conventions
- Implement proper prop validation with TypeScript or PropTypes
- Design components to be testable and reusable
- Keep components small and focused on a single concern
- Use composition patterns (render props, children as functions)

#### State Management

- Use `useState` for local component state
- Implement `useReducer` for complex state logic
- Leverage `useContext` for sharing state across component trees
- Consider external state management (Redux Toolkit, Zustand) for complex applications
- Implement proper state normalization and data structures
- Use React Query or SWR for server state management

#### Hooks and Effects

- Use `useEffect` with proper dependency arrays to avoid infinite loops
- Implement cleanup functions in effects to prevent memory leaks
- Use `useMemo` and `useCallback` for performance optimization when needed
- Create custom hooks for reusable stateful logic
- Follow the rules of hooks (only call at the top level)
- Use `useRef` for accessing DOM elements and storing mutable values

#### Styling

- Use Tailwind CSS with shadcn/ui components (project standard)
- Implement responsive design with mobile-first approach
- Use consistent spacing, typography, and color systems from design tokens
- Ensure accessibility with proper ARIA attributes and semantic HTML
- Follow shadcn/ui patterns for component styling
- Use CSS custom properties (variables) for theming

#### Performance Optimization

- Use `React.memo` for component memoization when appropriate
- Implement code splitting with `React.lazy` and `Suspense`
- Optimize bundle size with tree shaking and dynamic imports
- Use `useMemo` and `useCallback` judiciously to prevent unnecessary re-renders
- Implement virtual scrolling for large lists
- Profile components with React DevTools to identify performance bottlenecks

#### Data Fetching

- Use Next.js App Router patterns for data fetching
- Implement proper loading, error, and success states
- Handle race conditions and request cancellation
- Use optimistic updates for better user experience
- Implement proper caching strategies
- Handle offline scenarios and network errors gracefully

#### Error Handling

- Implement Error Boundaries for component-level error handling
- Use proper error states in data fetching
- Implement fallback UI for error scenarios
- Log errors appropriately for debugging
- Handle async errors in effects and event handlers
- Provide meaningful error messages to users

#### Forms and Validation

- Use react-hook-form with Zod validation (project standard)
- Use the `useZodForm` custom hook for type-safe forms
- Implement proper form validation and error display
- Handle form submission and error states appropriately
- Implement accessibility features for forms (labels, ARIA attributes)
- Use shadcn/ui form components for consistency

#### Web3 Integration

- Use OnchainKit for Base blockchain integration
- Implement proper wallet connection flows
- Handle Web3 errors gracefully (network switches, insufficient funds)
- Use proper loading states for blockchain transactions
- Implement transaction confirmation patterns
- Handle wallet disconnection scenarios

#### File Handling

- Use proper file upload patterns with drag-and-drop
- Implement file validation (type, size limits)
- Handle large file uploads with progress indicators
- Use secure file serving patterns (no direct public access)
- Implement temporary signed URLs for file access
- Handle file storage errors gracefully

#### Security

- Store files outside public directory (uploads/ folder)
- Validate file types and sizes on both client and server
- Sanitize user inputs to prevent XSS attacks
- Use HTTPS for all external API calls
- Implement proper wallet signature verification
- Avoid storing private keys or sensitive data in localStorage

#### Accessibility

- Use semantic HTML elements appropriately
- Implement proper ARIA attributes and roles
- Ensure keyboard navigation works for all interactive elements
- Provide alt text for images and descriptive text for icons
- Implement proper color contrast ratios
- Test with screen readers and accessibility tools

### Web3-Specific Patterns

- Wallet connection state management
- Transaction pending/success/error states
- Network switching and validation
- Gas estimation and fee handling
- Smart contract interaction patterns
- Blockchain event listening and cleanup

### Implementation Process

1. Plan component architecture and data flow
2. Set up project structure with proper folder organization
3. Define TypeScript interfaces and types
4. Implement core components with shadcn/ui styling
5. Add state management and data fetching logic
6. Implement Web3 integration with OnchainKit
7. Add form handling with react-hook-form + Zod
8. Implement file upload and x402 payment flow
9. Add error handling and loading states
10. Optimize performance and bundle size
11. Ensure accessibility compliance
12. Add documentation in docs/architecture/

### Additional Guidelines

- Follow Next.js App Router patterns and conventions
- Use meaningful commit messages and maintain clean git history
- Focus on the digital app as the main MVP development area
- Other apps (marketing, dashboard) may remain for future expansion
- Clean up unused marketing content within the digital app as needed
- Document Web3 integration patterns for future reference
- Use environment variables for blockchain configuration
- Test on Base Sepolia testnet before mainnet deployment
- Implement proper error boundaries for Web3 operations
- Use React Developer Tools and Web3 debugging tools

### Common Patterns

- Custom hooks for Web3 state management
- Form components with Zod validation
- File upload with progress and validation
- Payment flow with x402 middleware
- Temporary URL generation and cleanup
- Wallet connection with error handling

## Summary

Use this file as your instruction set for all Copilot Agent tasks in this repo. Stick to my manual testing + commit flow. Only run commands from the README when prompted. Keep changes small and deliberate. Focus on the Digital App as the main MVP - other apps may remain for future use, but clean up unused marketing content within digital app as needed.
