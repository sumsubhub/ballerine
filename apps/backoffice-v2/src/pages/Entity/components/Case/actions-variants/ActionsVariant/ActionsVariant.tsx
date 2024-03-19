import { TWorkflowById } from '@/domains/workflows/fetchers';
import {
  checkIsOngoingVariant,
  checkIsWebsiteMonitoringVariant,
} from '@/lib/blocks/variants/variant-checkers';
import { DefaultActions } from '@/pages/Entity/components/Case/actions-variants/DefaultActions/DefaultActions';
import { OngoingActions } from '@/pages/Entity/components/Case/actions-variants/OngoingActions/OngoingActions';
import { WebsiteMonitoringActions } from '@/pages/Entity/components/Case/actions-variants/WebsiteMonitoringCaseActions/WebsiteMonitoringCaseActions';
import { FunctionComponent } from 'react';

export const ActionsVariant: FunctionComponent<{
  workflowDefinition: Pick<TWorkflowById['workflowDefinition'], 'variant' | 'config' | 'version'>;
}> = ({ workflowDefinition }) => {
  const isOngoingVariant = checkIsOngoingVariant(workflowDefinition);
  const isWebsiteMontiroingVariant = checkIsWebsiteMonitoringVariant(workflowDefinition);

  if (isOngoingVariant) {
    return <OngoingActions />;
  }

  if (isWebsiteMontiroingVariant) {
    return <WebsiteMonitoringActions />;
  }

  return <DefaultActions />;
};
