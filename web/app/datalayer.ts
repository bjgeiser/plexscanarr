import { createDataLayerService } from './services/DataLayer';
import * as process from 'node:process';

export function getBaseUrl(): {
  plexUrl: URL;
  plexWS: URL;
} {
  const plexIp = 'localhost';
  const plexPort = '5002';
  var rest_url = ""
  var ws_url = ""


  if(document.location.protocol === 'https:')
  {
      rest_url = document.location.protocol + "//" + document.location.host + "/";
      ws_url =  "wss://" + document.location.host + "/ws";
  }
  else if(document.location.protocol === 'http:')
  {
      rest_url = document.location.protocol + "//" + document.location.host + "/";
      ws_url =  "ws://" + document.location.host + "/ws";
  }
  else if(import.meta.env.VITE_WEB_SERVER_ADDR !== undefined)
  {
    rest_url =  `http://${import.meta.env.VITE_WEB_SERVER_ADDR}:${import.meta.env.VITE_WEB_SERVER_PORT}/`;
    ws_url =  `ws://${import.meta.env.VITE_WEB_SERVER_ADDR}:${import.meta.env.VITE_WEB_SERVER_PORT}/ws`;
  }
  else if(document.location.protocol === 'file:')
  {
      rest_url =  `http://${plexIp}:${plexPort}/`;
      ws_url =  `ws://${plexIp}:${plexPort}/ws`;
  }

  if(import.meta.env.VITE_FORCE_ENV)
  {
    rest_url =  `http://${import.meta.env.VITE_WEB_SERVER_ADDR}:${import.meta.env.VITE_WEB_SERVER_PORT}/`;
    ws_url =  `ws://${import.meta.env.VITE_WEB_SERVER_ADDR}:${import.meta.env.VITE_WEB_SERVER_PORT}/ws`;
  }

  // const plexIp = process.env.PLEX_IP || 'localhost';
  // const plexPort = process.env.PLEX_PORT || '5000';
  return { plexUrl: new URL(rest_url), plexWS: new URL(ws_url) };
}

export const datalayer = createDataLayerService();
