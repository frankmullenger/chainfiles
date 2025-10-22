# Marketing App Documentation

Documentation for the marketing app at `apps/marketing/` will be organized here.

## Overview

The marketing app serves as the public-facing website for Digi Downloads, providing:

- Landing page and product information
- User acquisition and onboarding flows
- Integration with digital app for seamless user experience

## Development

To run the marketing app:

```bash
pnpm --filter marketing dev
```

Runs on port 3001 by default.

## Cross-App Navigation

The marketing app uses the centralized routes package for navigation to the digital app. See the digital app documentation for implementation details.
