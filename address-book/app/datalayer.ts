import { createDataLayerService } from './services/DataLayer';

export function getBaseUrl(): {
  plexUrl: URL;
} {
  const plexIp = 'localhost';
  const plexPort = '5002';
  // const plexIp = process.env.PLEX_IP || 'localhost';
  // const plexPort = process.env.PLEX_PORT || '5000';
  return { plexUrl: new URL(`http://${plexIp}:${plexPort}/`) };
}

export const datalayer = createDataLayerService();
