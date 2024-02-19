import { useMemo } from 'react';
import { UseQueryOptions } from '@tanstack/react-query';
import get from 'lodash/get';
import { RaRecord } from '../../types';
import { useRecordContext } from '../record';
import { LinkToType, useCreatePath } from '../../routing';
import { UseReferenceResult, useReference } from '../useReference';
import { useResourceDefinition } from '../../core';

export const useReferenceFieldController = <
    RecordType extends Record<string, any> = Record<string, any>,
    ReferenceRecordType extends RaRecord = RaRecord
>(
    options: UseReferenceFieldControllerOptions<ReferenceRecordType>
): UseReferenceFieldControllerResult<ReferenceRecordType> => {
    const { source, link = 'edit', reference, queryOptions } = options;
    const record = useRecordContext<RecordType>(options);
    const id = get(record, source);
    const referenceRecordQuery = useReference<ReferenceRecordType>({
        reference,
        id,
        options: { ...queryOptions, enabled: id != null },
    });

    const createPath = useCreatePath();
    const resourceDefinition = useResourceDefinition({ resource: reference });

    const result = useMemo(
        () =>
            ({
                ...referenceRecordQuery,
                link:
                    referenceRecordQuery.referenceRecord != null
                        ? link === false ||
                          (link === 'edit' && !resourceDefinition.hasEdit) ||
                          (link === 'show' && !resourceDefinition.hasShow)
                            ? false
                            : createPath({
                                  resource: reference,
                                  id: referenceRecordQuery.referenceRecord.id,
                                  type:
                                      typeof link === 'function'
                                          ? link(
                                                referenceRecordQuery.referenceRecord,
                                                reference
                                            )
                                          : link,
                              })
                        : undefined,
            } as const),
        [createPath, link, reference, referenceRecordQuery, resourceDefinition]
    );
    return result;
};

export interface UseReferenceFieldControllerOptions<
    ReferenceRecordType extends RaRecord = RaRecord
> {
    source: string;
    queryOptions?: UseQueryOptions<ReferenceRecordType[], Error> & {
        meta?: any;
    };
    reference: string;
    link?: LinkToType<ReferenceRecordType>;
}

export interface UseReferenceFieldControllerResult<
    ReferenceRecordType extends RaRecord = RaRecord
> extends UseReferenceResult<ReferenceRecordType> {
    link?: string | false;
}
