import { Link } from 'react-router';

import PlexscanarrIcon from '/img/favicon.png';
import SonarrIcon from '/img/sonarr.png';
import RadarrIcon from '/img/radarr.png';
import LidarIcon from '/img/lidarr.png';
import ReadarrIcon from '/img/readarr.png';
import BazarrIcon from '/img/bazarr.png';
import PlexIcon from '/img/plex-logo.svg';
import NoCoverIcon from '/img/no_cover.png';
import type { PlexMessageNotificationType } from '../modules/PlexMessageContext';

function Notification(props: { notification: PlexMessageNotificationType }) {
  const { notification }: { notification: PlexMessageNotificationType } = props;

  function getLocalTime(_message: PlexMessageNotificationType) {
    const dt = new Date(_message['timestamp']);
    return dt.toLocaleString('en-US');
  }

  function getServiceIcon(_message: PlexMessageNotificationType) {
    if (_message['type'].toLowerCase() === 'sonarr') {
      return SonarrIcon;
    } else if (_message['type'].toLowerCase() === 'radarr') {
      return RadarrIcon;
    } else if (_message['type'].toLowerCase() === 'lidarr') {
      return LidarIcon;
    } else if (_message['type'].toLowerCase() === 'readarr') {
      return ReadarrIcon;
    } else if (_message['type'].toLowerCase() === 'plexscanarr') {
      return PlexscanarrIcon;
    } else if (_message['type'].toLowerCase() === 'bazarr') {
      return BazarrIcon;
    } else if (_message['type'].toLowerCase() === 'plex') {
      return PlexIcon;
    }

    return NoCoverIcon;
  }

  function getPoster(_message: PlexMessageNotificationType) {
    if (_message['cover_art_url'] && _message['cover_art_url'].toLowerCase() !== null) {
      return _message['cover_art_url'];
    }
    return null;
  }

  function getJsonString(_message: PlexMessageNotificationType) {
    return JSON.stringify(_message, null, 2);
  }

  return (
    <div className="card rounded-box bg-base-300 m-2 p-3 flex-row items-center ">
      <div className="m-1 flex flex-col items-center">
        <div className="tooltip tooltip-right" data-tip={'Click to open ' + notification['server_name']}>
          <Link to={notification.service_link || '/'} target="_blank">
            <img className="h-8" src={getServiceIcon(notification)} />
          </Link>
        </div>
        <div className="m-1 font-bold text-sm">{notification['server_name']}</div>
      </div>
      <div className="divider divider-horizontal"></div>
      <div
        className="m-1 tooltip tooltip-right"
        data-tip={'Click to open ' + notification['pretty_name'] + ' on  ' + notification['server_name']}
      >
        {notification['cover_art_url'] !== null ? (
          <Link to={notification.content_link || '#'} target="_blank">
            <img className="rounded-box h-24" src={notification['cover_art_url']} />
          </Link>
        ) : null}
      </div>
      <div className="flex flex-col">
        <div className="mb-4">
          <div
            className="tooltip tooltip-right"
            data-tip={'Click to open ' + notification['pretty_name'] + ' on  ' + notification['server_name']}
          >
            <Link className="font-bold text-orange-400 pl-3" to={notification.content_link || '/'} target="_blank">
              {notification['pretty_name']}
            </Link>
          </div>
        </div>

        <div className="font-mono text-xs pl-3">{notification['file_path']}</div>
        {notification['release_title'] !== null ? (
          <div className="font-mono text-xs pl-3">
            {notification['release_title']} {notification['file_size']}{' '}
          </div>
        ) : (
          <div />
        )}
        <div>
          <div className="flex flex-row">
            <div className="text-xs pl-3">{notification['arr_type']}</div>
            <div className="text-xs pl-3">{getLocalTime(notification)}</div>
            {notification.scan_started === true ? (
              <div className=" flex flex-row">
                <div className="text-xs pl-3">Scanned</div>
                <img className="h-3 pl-1" src={PlexscanarrIcon} alt="Plexscanarr Icon" />
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <div className="flex-end flex-1"></div>
      {/* This fills the empty space in the row */}
      <div className="tooltip tooltip-left pl-3" data-tip="Click to copy event json">
        <button
          className="btn text-xs"
          onClick={() => {
            navigator.clipboard.writeText(getJsonString(notification));
          }}
        >
          Copy
        </button>
      </div>
    </div>
  );
}

export default Notification;
