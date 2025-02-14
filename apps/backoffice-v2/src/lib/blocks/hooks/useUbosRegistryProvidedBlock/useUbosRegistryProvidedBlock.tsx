import { createBlocksTyped } from '@/lib/blocks/create-blocks-typed/create-blocks-typed';
import { useCallback, useMemo } from 'react';
import { WarningFilledSvg } from '@ballerine/ui';

export type Ubo = {
  name?: string;
  type?: string;
  level?: number;
  percentage?: number;
};

export const useUbosRegistryProvidedBlock = (
  ubos: Ubo[] | undefined,
  message: string | undefined,
  isRequestTimedOut: string | undefined,
) => {
  const getCell = useCallback(() => {
    if (Array.isArray(ubos) && ubos?.length) {
      return {
        type: 'table',
        value: {
          columns: [
            {
              accessorKey: 'name',
              header: 'Name',
            },
            {
              accessorKey: 'percentage',
              header: 'Percentage (25% or higher)',
            },
            {
              accessorKey: 'type',
              header: 'Type',
            },
            {
              accessorKey: 'level',
              header: 'Level',
            },
          ],
          data: ubos,
        },
      } satisfies Extract<
        Parameters<ReturnType<typeof createBlocksTyped>['addCell']>[0],
        {
          type: 'table';
        }
      >;
    }

    if (message) {
      return {
        type: 'paragraph',
        value: (
          <span className="flex text-sm text-black/60">
            <WarningFilledSvg
              className={'me-2 mt-px text-black/20 [&>:not(:first-child)]:stroke-background'}
              width={'20'}
              height={'20'}
            />
            <span>{message}</span>
          </span>
        ),
      } satisfies Extract<
        Parameters<ReturnType<typeof createBlocksTyped>['addCell']>[0],
        {
          type: 'paragraph';
        }
      >;
    }

    if (isRequestTimedOut) {
      return {
        type: 'paragraph',
        value: (
          <span className="flex text-sm text-black/60">
            <WarningFilledSvg
              className={'me-2 mt-px text-black/20 [&>:not(:first-child)]:stroke-background'}
              width={'20'}
              height={'20'}
            />
            <span>
              The request timed out either because the company was not found in the registry, or the
              information is currently unavailable.
            </span>
          </span>
        ),
      } satisfies Extract<
        Parameters<ReturnType<typeof createBlocksTyped>['addCell']>[0],
        {
          type: 'paragraph';
        }
      >;
    }
  }, [message, ubos, isRequestTimedOut]);

  return useMemo(() => {
    const cell = getCell();

    if (!cell) {
      return [];
    }

    return createBlocksTyped()
      .addBlock()
      .addCell({
        type: 'block',
        value: createBlocksTyped()
          .addBlock()
          .addCell({
            type: 'heading',
            value: 'UBOs',
          })
          .addCell({
            type: 'subheading',
            value: 'Registry-Provided Data',
            props: {
              className: 'mb-4',
            },
          })
          .addCell(cell)
          .build()
          .flat(1),
      })
      .build();
  }, [getCell]);
};
