import React from 'react';

if (typeof window !== 'undefined') {
  const g = React as any;
  const clientInternals = g.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS;

  if (!g.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
    g.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = clientInternals || {};
  }

  const secretInternals = g.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;

  if (!secretInternals.ReactCurrentOwner) {
    secretInternals.ReactCurrentOwner = clientInternals?.ReactCurrentOwner || { current: null };
  }
  if (!secretInternals.ReactCurrentDispatcher) {
    secretInternals.ReactCurrentDispatcher = clientInternals?.ReactCurrentDispatcher || { current: null };
  }
  if (!secretInternals.ReactCurrentBatchConfig) {
    secretInternals.ReactCurrentBatchConfig = clientInternals?.ReactCurrentBatchConfig || { transition: null };
  }
}
