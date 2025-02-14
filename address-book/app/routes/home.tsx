import { use, useEffect } from 'react';
import { usePlexMessage } from '../modules/PlexMessageContext';

export default function Home() {
  const { plexMessage, setPlexMessage } = usePlexMessage();

  useEffect(() => {
    console.log('Home useEffect', plexMessage);
  }, [plexMessage]);

  return <p>{plexMessage ? plexMessage.notification.arr_type : 'None'}</p>;
}
