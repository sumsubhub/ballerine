import dayjs from 'dayjs';
import React from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { BusinessReportStatus, TBusinessReport } from '@/domains/business-reports/fetchers';
import { titleCase } from 'string-ts';

import { ctw } from '@/common/utils/ctw/ctw';
import { getSeverityFromRiskScore } from '@ballerine/common';
import { Badge, severityToClassName, TextWithNAFallback } from '@ballerine/ui';
import { useEllipsesWithTitle } from '@/common/hooks/useEllipsesWithTitle/useEllipsesWithTitle';
import { CopyToClipboardButton } from '@/common/components/atoms/CopyToClipboardButton/CopyToClipboardButton';

const columnHelper = createColumnHelper<TBusinessReport>();

export const columns = [
  columnHelper.accessor('id', {
    cell: info => {
      // eslint-disable-next-line react-hooks/rules-of-hooks -- ESLint doesn't like `cell` not being `Cell`.
      const { ref, styles } = useEllipsesWithTitle<HTMLSpanElement>();

      const id = info.getValue();

      return (
        <div className={`ml-[10px] flex w-full max-w-[12ch] items-center space-x-2`}>
          <TextWithNAFallback style={{ ...styles, width: '70%' }} ref={ref}>
            {id}
          </TextWithNAFallback>

          <CopyToClipboardButton textToCopy={id ?? ''} />
        </div>
      );
    },
    header: 'Report ID',
  }),
  columnHelper.accessor('createdAt', {
    cell: info => {
      const createdAt = info.getValue();

      if (!createdAt) {
        return <TextWithNAFallback>{createdAt}</TextWithNAFallback>;
      }

      const date = dayjs(createdAt).format('MMM DD, YYYY');
      const time = dayjs(createdAt).format('hh:mm');

      return (
        <div className={`flex flex-col space-y-0.5`}>
          <span className={`font-semibold`}>{date}</span>
          <span className={`text-xs text-[#999999]`}>{time}</span>
        </div>
      );
    },
    header: 'Created At',
  }),
  columnHelper.accessor('updatedAt', {
    cell: info => {
      const updatedAt = info.getValue();

      if (!updatedAt) {
        return <TextWithNAFallback>{updatedAt}</TextWithNAFallback>;
      }

      const date = dayjs(updatedAt).format('MMM DD, YYYY');
      const time = dayjs(updatedAt).format('hh:mm');

      return (
        <div className={`flex flex-col space-y-0.5`}>
          <span className={`font-semibold`}>{date}</span>
          <span className={`text-xs text-[#999999]`}>{time}</span>
        </div>
      );
    },
    header: 'Updated At',
  }),
  columnHelper.accessor('website', {
    cell: info => {
      const website = info.getValue();

      return <TextWithNAFallback>{website}</TextWithNAFallback>;
    },
    header: 'Website',
  }),
  columnHelper.accessor('companyName', {
    cell: info => {
      const companyName = info.getValue();

      return <TextWithNAFallback>{companyName}</TextWithNAFallback>;
    },
    header: 'Company Name',
  }),
  columnHelper.accessor('business.country', {
    cell: info => {
      const companyName = info.getValue();

      return <TextWithNAFallback>{companyName}</TextWithNAFallback>;
    },
    header: 'Country',
  }),
  columnHelper.accessor('riskScore', {
    cell: info => {
      const riskScore = info.getValue();
      const severity = getSeverityFromRiskScore(riskScore);

      return (
        <div className="flex items-center gap-2">
          {!riskScore && riskScore !== 0 && <TextWithNAFallback className={'py-0.5'} />}
          {(riskScore || riskScore === 0) && (
            <Badge
              className={ctw(
                severityToClassName[
                  (severity?.toUpperCase() as keyof typeof severityToClassName) ?? 'DEFAULT'
                ],
                'w-20 py-0.5 font-bold',
              )}
            >
              {titleCase(severity ?? '')}
            </Badge>
          )}
        </div>
      );
    },
    header: 'Risk Score',
  }),
  columnHelper.accessor('status', {
    cell: info => {
      const status = info.getValue();
      const statusToDisplayStatus = {
        [BusinessReportStatus.COMPLETED]: 'Manual Review',
      } as const;

      return (
        <TextWithNAFallback
          className={ctw('font-semibold', {
            'text-slate-400': status === BusinessReportStatus.COMPLETED,
          })}
        >
          {titleCase(statusToDisplayStatus[status as keyof typeof statusToDisplayStatus] ?? status)}
        </TextWithNAFallback>
      );
    },
    header: 'Status',
  }),
];
