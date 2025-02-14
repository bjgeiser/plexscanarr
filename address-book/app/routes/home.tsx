import { usePlexMessage } from '../modules/PlexMessageContext';

export default function Home() {
  const { plexMessage, setPlexMessage } = usePlexMessage();

  return <p>{plexMessage ? plexMessage.arrType : 'None'}</p>;
}
