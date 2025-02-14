import React, { createContext, useEffect, useState, useContext, type ReactNode } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { getBaseUrl } from '../datalayer';
import type { A } from 'node_modules/react-router/dist/development/route-data-Cq_b5feC.mjs';

enum ArrSource {
  PLEXSCANARR = 'PLEXSCANARR',
  RADARR = 'RADARR',
  SONARR = 'SONARR',
  LIDARR = 'LIDARR',
  READARR = 'READARR',
  BAZARR = 'BAZARR',
  PLEX = 'PLEX',
}

export type PlexMessageNotificationType = {
  type: ArrSource;
  arr_type: string;
  timestamp: Date;
  cover_art_url?: string;
  pretty_name: string;
  server_name: string;
  file_path?: string;
  original_json: string;
  scan_started: boolean;
  release_title?: string;
  file_size?: string;
  service_link?: string;
  content_link?: string;
};
export type PlexMessageContextType = {
  notification: PlexMessageNotificationType;
  type: string;
  uuid: string;
  index?: number;
};

// Create the context
const PlexMessageContext = createContext<{
  plexMessage: PlexMessageContextType;
  setPlexMessage: React.Dispatch<React.SetStateAction<PlexMessageContextType>>;
}>({
  plexMessage: {
    notification: {
      type: ArrSource.PLEXSCANARR,
      arr_type: 'initial',
      timestamp: new Date(),
      pretty_name: 'initial',
      server_name: 'initial',
      original_json: 'initial',
      scan_started: false,
    },
    type: 'initial',
    uuid: 'initial-uuid',
  },
  setPlexMessage: () => {
    console.warn('No PlexMessageProvider available');
  },
});

// LibraryProvider component that wraps children and provides state and updater
export const PlexMessageProvider = ({ children }: { children: ReactNode }) => {
  const [plexMessage, setPlexMessage] = useState<PlexMessageContextType>({
    notification: {
      type: ArrSource.PLEXSCANARR,
      arr_type: 'initial',
      timestamp: new Date(),
      pretty_name: 'initial',
      server_name: 'initial',
      original_json: 'initial',
      scan_started: false,
    },
    type: 'initial',
    uuid: 'initial-uuid',
  });
  const { sendMessage, lastMessage, readyState } = useWebSocket(getBaseUrl().plexWS.toString(), {
    share: true,
    onOpen: () => {
      console.log('WebSocket connection established.');
    },
    shouldReconnect: (closeEvent) => true,
  });

  useEffect(() => {
    if (lastMessage !== null) {
      const messageData = JSON.parse(lastMessage.data);
      const newMessage: PlexMessageContextType = {
        notification: {
          type: messageData.notification.type,
          arr_type: messageData.notification.arr_type,
          timestamp: new Date(messageData.notification.timestamp),
          cover_art_url: messageData.notification.cover_art_url,
          pretty_name: messageData.notification.pretty_name,
          server_name: messageData.notification.server_name,
          file_path: messageData.notification.file_path,
          original_json: messageData.notification.original_json,
          scan_started: messageData.notification.scan_started,
          release_title: messageData.notification.release_title,
          file_size: messageData.notification.file_size,
          service_link: messageData.notification.service_link,
          content_link: messageData.notification.content_link,
        },
        type: messageData.type,
        uuid: messageData.uuid,
      };
      if (newMessage) setPlexMessage(newMessage);
    }
  }, [lastMessage]);

  return <PlexMessageContext.Provider value={{ plexMessage, setPlexMessage }}>{children}</PlexMessageContext.Provider>;
};

// Custom hook to consume the library context
export const usePlexMessage = () => {
  const context = useContext(PlexMessageContext);
  if (!context) {
    throw new Error('usePlexMessage must be used within a PlexMessageProvider');
  }
  return context;
};

export default PlexMessageContext;
