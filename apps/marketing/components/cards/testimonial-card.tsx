import * as React from 'react';
import { QuoteIcon, StarIcon, TrendingUpIcon } from 'lucide-react';

import { Badge } from '@workspace/ui/components/badge';
import {
  Card,
  CardContent,
  CardFooter,
  type CardProps
} from '@workspace/ui/components/card';
import { cn } from '@workspace/ui/lib/utils';

function CreatorAvatar(): React.JSX.Element {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-purple-600 text-white font-semibold text-sm">
      TE
    </div>
  );
}

export function TestimonialCard({
  className,
  ...props
}: CardProps): React.JSX.Element {
  return (
    <Card
      className={cn('pb-0', className)}
      {...props}
    >
      <CardContent className="pt-6">
        <div className="mb-4 flex items-start gap-3">
          <CreatorAvatar />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-sm">@tiktokeditor</h3>
              <Badge variant="secondary" className="text-xs px-2 py-0">
                {/* <StarIcon className="w-3 h-3 mr-1 fill-current" /> */}
                Demo content
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">Content Creator</p>
          </div>
        </div>

        <div className="relative">
          {/* <QuoteIcon className="absolute -top-1 -left-1 h-4 w-4 text-muted-foreground/30" /> */}
          <blockquote className="pl-6 text-sm leading-relaxed">
            "Sold my editing presets to 50+ followers in one day. No waiting for payouts, just instant crypto payments!"
          </blockquote>
        </div>
      </CardContent>

      <CardFooter className="flex-col items-start space-y-3 rounded-b-xl bg-neutral-50 py-4 dark:bg-neutral-900">
        <div className="flex items-center gap-4 w-full">
          <div className="flex items-center gap-1">
            <TrendingUpIcon className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">127 downloads</span>
          </div>
          <div className="text-sm font-semibold text-green-600">
            $635 earned
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          First month results
        </div>
      </CardFooter>
    </Card>
  );
}
