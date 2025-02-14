import React, { createContext, useEffect, useState, useContext, type ReactNode } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { getBaseUrl } from '../datalayer';

type PlexMessageNotificationType = {
  arr_type: string;
  // TODO add
};
export type PlexMessageContextType = {
  notification: PlexMessageNotificationType;
  type: string;
  uuid: string;
};

// Create the context
const PlexMessageContext = createContext<{
  plexMessage: PlexMessageContextType[];
  setPlexMessage: React.Dispatch<React.SetStateAction<PlexMessageContextType[]>>;
}>({
  plexMessage: [],
  setPlexMessage: () => [],
});

// LibraryProvider component that wraps children and provides state and updater
export const PlexMessageProvider = ({ children }: { children: ReactNode }) => {
  const [plexMessage, setPlexMessage] = useState<PlexMessageContextType[]>([]);
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
          arr_type: messageData.notification.arr_type,
        },
        type: messageData.type,
        uuid: messageData.uuid,
      };
      setPlexMessage((prev) => [...prev, newMessage]);
    }
  }, [lastMessage]);

  return (
    <PlexMessageContext.Provider value={{ plexMessage: plexMessage, setPlexMessage: setPlexMessage }}>
      {children}
    </PlexMessageContext.Provider>
  );
};

// Custom hook to consume the library context
export const usePlexMessage = (): Promise<PlexMessageContextType> => {
  const context = useContext(PlexMessageContext);
  if (!context) {
    throw new Error('usePlexMessage must be used within a PlexMessageProvider');
  }
  return Promise.resolve(context);
};

export default PlexMessageContext;
