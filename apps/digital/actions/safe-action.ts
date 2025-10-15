import {
  createSafeActionClient,
  DEFAULT_SERVER_ERROR_MESSAGE
} from 'next-safe-action';
import { z } from 'zod';

import {
  NotFoundError,
  PreConditionError,
  ValidationError
} from '@workspace/common/errors';

export const actionClient = createSafeActionClient({
  handleServerError(e: Error) {
    if (
      e instanceof ValidationError ||
      e instanceof NotFoundError ||
      e instanceof PreConditionError
    ) {
      return e.message;
    }

    console.error('Server error:', e);
    return DEFAULT_SERVER_ERROR_MESSAGE;
  },
  defineMetadataSchema() {
    return z.object({
      actionName: z.string()
    });
  }
});
