import { useRouteLoaderData } from '@remix-run/react';
import { $routeId } from 'remix-routes';

import { type loader } from '~/root';

import { type loader as appDasboardLayoutLoader } from '~/routes/app+/workplace+/$workplaceId+/_layout';

export const useRootData = () => {
  return useRouteLoaderData<typeof loader>('root');
};

export const useAppDashboardData = () => {
  const data = useRouteLoaderData<typeof appDasboardLayoutLoader>(
    $routeId('routes/app+/workplace+/$workplaceId+/_layout')
  );
  if (data) {
    return data.workplaceData;
  }
};
