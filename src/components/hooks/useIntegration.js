import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSession } from '@/components/hooks/useSession';
import { buildCacheKey, scopedFilter } from '@/components/api/scoped';

export function useIntegration(providerKey) {
  const { activeSchoolId } = useSession();

  const { data = [], isLoading, refetch } = useQuery({
    queryKey: buildCacheKey('integration-connection', activeSchoolId, providerKey),
    queryFn: () => scopedFilter(
      'IntegrationConnection',
      activeSchoolId,
      { provider: providerKey },
      '-updated_at',
      1,
      { fields: ['id', 'provider', 'status', 'connected_at', 'updated_at'] }
    ),
    enabled: !!activeSchoolId && !!providerKey,
  });

  const connection = data?.[0] || null;
  const isConnected = connection?.status === 'connected';

  return { connection, isConnected, isLoading, refetch };
}

export function useIntegrationConnections({ providers = [] } = {}) {
  const { activeSchoolId } = useSession();
  const providerList = Array.isArray(providers) ? providers.filter(Boolean) : [];

  const { data = [], isLoading, refetch } = useQuery({
    queryKey: buildCacheKey('integration-connections', activeSchoolId, providerList.join('|')),
    queryFn: () => scopedFilter(
      'IntegrationConnection',
      activeSchoolId,
      providerList.length > 0 ? { provider: { $in: providerList } } : {},
      '-updated_at',
      200,
      { fields: ['id', 'provider', 'status', 'connected_at', 'updated_at'] }
    ),
    enabled: !!activeSchoolId,
  });

  const map = useMemo(() => {
    return (data || []).reduce((acc, row) => {
      if (row?.provider) acc[row.provider] = row;
      return acc;
    }, {});
  }, [data]);

  return { connections: data, map, isLoading, refetch };
}
