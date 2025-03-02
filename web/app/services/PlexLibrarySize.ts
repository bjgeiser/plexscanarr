import { useQuery } from '@tanstack/react-query';
import { getBaseUrl } from '../datalayer';

const fetchLibraryDetailData = async (options: { key: string }) => {
  const response = await fetch(`${getBaseUrl().plexUrl.toString()}plex/libraries?key=${options.key}`);
  if (!response.ok) {
    throw new Error('Failed to fetch initial data');
  }
  return response.json();
};

const useInitialData = (options: { key: string }) => {
  return useQuery({ queryKey: ['initialData'], queryFn: fetchLibraryDetailData(options) });
};

export default useInitialData;
