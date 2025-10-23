import * as React from 'react';
import { CircleCheckBigIcon } from 'lucide-react';

import { APP_NAME } from '@workspace/common/app';

import { AiAdvisorCard } from '~/components/cards/ai-advisor-card';
import { TestimonialCard } from '~/components/cards/testimonial-card';
import { BentoAnalyticsCard } from '~/components/cards/bento-analytics-card';
import { BentoCampaignsCard } from '~/components/cards/bento-campaigns-card';
import { BentoCustomersCard } from '~/components/cards/bento-customers-card';
import { BentoMagicInboxCard } from '~/components/cards/bento-magic-inbox-card';
import { BentoPipelinesCard } from '~/components/cards/bento-pipelines-card';
import { GridSection } from '~/components/fragments/grid-section';

// Solution.tsx (content-only changes)
export function Solution(): React.JSX.Element {
  return (
    <GridSection>
      <div className="bg-diagonal-lines">
        <div className="flex flex-col gap-24 bg-background py-20 lg:mx-12 lg:border-x">
          <div className="container relative space-y-10">
            <div>
              <h2 className="mb-2.5 text-3xl font-semibold md:text-5xl">
                Sell files with a single link — paid straight to your wallet
              </h2>
              <p className="mt-1 max-w-2xl text-muted-foreground md:mt-6">
                {APP_NAME.charAt(0).toUpperCase() + APP_NAME.slice(1)} lets you skip the store setup and endless forms.
                Just upload a file, set a price, and share a link. Buyers pay you
                directly — no chargebacks, no waiting, no middlemen.
              </p>
            </div>

            <div className="-ml-8 w-[calc(100%+64px)] border-t border-dashed sm:-ml-20 sm:w-[calc(100%+160px)]" />

            <div className="grid gap-16 sm:container lg:grid-cols-2 lg:items-center">
              <div className="order-1 lg:order-2">
                <h2 className="mb-2.5 mt-8 text-3xl font-semibold md:text-5xl">
                  Simple, fast, and built for creators
                </h2>
                <p className="mt-1 text-muted-foreground md:mt-6">
                  Get paid instantly when someone buys your digital download —
                  all without the complexity of traditional e-commerce.
                </p>

                <ul className="mt-6 list-none flex-wrap items-center gap-6 space-y-3 md:flex md:space-y-0">
                  {[
                    'Go live in under a minute — upload, set a price, share a link',
                    'No accounts or carts — buyers pay in one click',
                    'Low fees, no hidden cuts',
                    'Instant payout to your wallet when purchased',
                    'No chargebacks — refunds stay in your control',
                    'Secure file unlocks automatically after payment'
                  ].map((feature) => (
                    <li key={feature} className="flex flex-row items-center gap-2">
                      <CircleCheckBigIcon className="size-4 shrink-0 text-primary" />
                      <span className="font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="order-2 md:order-1">
                {/* <AiAdvisorCard className="w-full max-w-md" /> */}
                <TestimonialCard />
                {/* Later replace with a simple “Pay & Download” mock card visual */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </GridSection>
  );
}
