import * as React from 'react';
import Link from 'next/link';

import { APP_NAME } from '@workspace/common/app';
import { routes } from '@workspace/routes';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@workspace/ui/components/accordion';

import { GridSection } from '~/components/fragments/grid-section';

const DATA = [
  {
    question: 'Do I need to know anything about crypto to use this?',
    answer:
      'No. You just need a wallet — it takes about a minute to set up. Once you\'ve added your wallet address, you can start selling right away.'
  },
  {
    question: 'How do I get a wallet?',
    answer:
      'You can use the free Coinbase Wallet app or browser extension. It\'s easy to set up and lets you receive payments directly when someone buys your file.'
  },
  {
    question: 'How do buyers pay me?',
    answer:
      'Buyers use their own wallets to make payments. Once they confirm a purchase, the payment is sent to your wallet automatically, and the download unlocks instantly.'
  },
  {
    question: 'What will I get paid in?',
    answer:
      'You\'ll receive payments in USDC — a digital dollar that\'s always equal in value to USD. It\'s easy to hold, transfer, or convert back to your local currency if you want.'
  },
  {
    question: 'What kinds of files can I sell?',
    answer:
      'Right now you can sell PDFs, photos, and text-based files. More formats will be supported soon.'
  },
  {
    question: 'Are there any fees?',
    answer:
      'There are simple transaction fees, but no monthly costs or hidden platform charges. You keep what you earn, paid directly to your wallet.'
  },
  {
    question: 'Can buyers request refunds?',
    answer:
      'You stay in control. Payments are final once made, but you can choose to issue refunds manually if you want to help a buyer.'
  },
  {
    question: 'Do I need a business or store account?',
    answer:
      'No. You don\'t need to set up a business, a store, or any complicated account. Just upload your file, paste in your wallet address, and share your link.'
  },
  {
    question: 'Is it safe?',
    answer:
      'Yes — payments are handled securely on the Base blockchain and sent directly to your wallet. Files only become available to download after a successful payment.'
  }
];

export function FAQ(): React.JSX.Element {
  return (
    <GridSection>
      <div className="container py-20">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
          <div className="text-center lg:text-left">
            <h2 className="mb-2.5 text-3xl font-semibold md:text-5xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-6 hidden text-muted-foreground md:block lg:max-w-[75%]">
              Haven't found what you're looking for? Try{' '}
              <Link
                href={routes.marketing.Contact}
                className="font-normal text-inherit underline hover:text-foreground"
              >
                contacting
              </Link>{' '}
              us, we are glad to help.
            </p>
          </div>
          <div className="mx-auto flex w-full max-w-xl flex-col">
            <Accordion
              type="single"
              collapsible
            >
              {DATA.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={index.toString()}
                >
                  <AccordionTrigger className="text-left text-base">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-base">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </GridSection>
  );
}
