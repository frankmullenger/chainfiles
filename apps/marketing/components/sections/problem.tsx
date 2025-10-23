import * as React from 'react';
import { BarChartIcon, UserPlusIcon, WorkflowIcon } from 'lucide-react';

import { BlurFade } from '~/components/fragments/blur-fade';
import { GridSection } from '~/components/fragments/grid-section';
import { TextGenerateWithSelectBoxEffect } from '~/components/fragments/text-generate-with-select-box-effect';

const DATA = [
  {
    icon: <UserPlusIcon className="size-5 shrink-0" />,
    title: 'Friction to start selling',
    description:
      'Creators face long signups, store setup steps, and plugin installs before they can sell a single file. Simple products shouldn’t need a full e-commerce stack.'
  },
  {
    icon: <BarChartIcon className="size-5 shrink-0" />,
    title: 'Fees cut deep into earnings',
    description:
      'High platform and payment fees make small digital sales barely worth the effort, especially for creators selling low-cost items.'
  },
  {
    icon: <WorkflowIcon className="size-5 shrink-0" />,
    title: 'Slow payouts and chargebacks',
    description:
      'Weekly or delayed payouts make cash flow slow, and chargebacks on digital goods are common and hard to fight.'
  }
];

export function Problem(): React.JSX.Element {
  return (
    <GridSection>
      <div className="px-4 py-20 text-center">
        <h2 className="text-3xl font-semibold md:text-5xl">
          Selling digital files shouldn't be this hard
        </h2>
      </div>
      <div className="grid divide-y border-t border-dashed md:grid-cols-3 md:divide-x md:divide-y-0">
        {DATA.map((statement, index) => (
          <BlurFade
            key={index}
            inView
            delay={0.2 + index * 0.2}
            className="border-dashed px-8 py-12"
          >
            <div className="mb-7 flex size-12 items-center justify-center rounded-2xl border bg-background shadow">
              {statement.icon}
            </div>
            <h3 className="mb-3 text-lg font-semibold">{statement.title}</h3>
            <p className="text-muted-foreground">{statement.description}</p>
          </BlurFade>
        ))}
      </div>
    </GridSection>
  );
}
