import React, { useState, useEffect, useRef } from "react";

import BazarrIcon from "./img/bazarr.png";
import SonarrIcon from "./img/sonarr.png";
import PlexscanarrIcon from "./img/favicon.png";
import RadarrIcon from "./img/radarr.png";
import ReadarrIcon from "./img/readarr.png";
import LidarIcon from "./img/lidarr.png";
import NoCoverIcon from "./img/no_cover.png";

function Notifications(props) {
  //This in combination of useEffect is how new messages make it into thie component
  const { messageHistory } = props;
  const LoggingEndRef = useRef(null);

  useEffect(() => {});

  function getLocalTime(_message) {
    const dt = new Date(_message["timestamp"]);
    return dt.toLocaleString("en-US");
  }

  function getServiceIcon(_message) {
    if (_message["type"].toLowerCase() === "sonarr") {
      return SonarrIcon;
    } else if (_message["type"].toLowerCase() === "radarr") {
      return RadarrIcon;
    } else if (_message["type"].toLowerCase() === "lidarr") {
      return LidarIcon;
    } else if (_message["type"].toLowerCase() === "readarr") {
      return ReadarrIcon;
    } else if (_message["type"].toLowerCase() === "plexscanarr") {
      return PlexscanarrIcon;
    } else if (_message["type"].toLowerCase() === "bazarr") {
      return BazarrIcon;
    }

    return NoCoverIcon;
  }

  function getPoster(_message) {
    if (_message["cover_art_url"].toLowerCase() !== null) {
      return _message["cover_art_url"];
    }
    return null;
  }

  function getJsonString(_message) {
    return JSON.stringify(_message, null, 2);
  }

    return (
        <div>
            <div className="overflow-hidden hover:resize-y hover:overflow-auto h-full">
                {messageHistory.map((_message) => (
                    <div className="card rounded-box bg-base-300 w-dvw m-2 p-3 flex-row items-center ">


                        <div className="m-1 flex flex-col items-center">
                            <div>
                                <img onClick={()=> window.open(_message["service_link"], "_blank")} className="h-8" src={getServiceIcon(_message)}/>
                            </div>
                            <div className="m-1 font-bold text-sm">{_message["server_name"]}</div>
                        </div>


                        <div className="divider divider-horizontal"></div>

                        <div className="m-1">
                            { _message["cover_art_url"] !== null ? (<img onClick={()=> window.open(_message["content_link"], "_blank")}  className="rounded-box h-24" src={_message["cover_art_url"]}/>) : (<div/>) }
                        </div>
                        <div className="flex flex-col">
                            <div className="font-bold text-orange-400 pl-3" onClick={()=> window.open(_message["content_link"], "_blank")}>
                              {_message["pretty_name"]}
                            </div>
                            <div className="font-mono pl-3">{_message["file_path"]}</div>
                            { _message["release_title"] !== null ? (<div className="font-mono text-xs pl-3">{_message["release_title"]} {_message["file_size"]} </div>) : (<div/>) }
                            <div className="flex flex-row">
                              <div className="text-xs pl-3">{_message["arr_type"]}</div>
                              <div className="text-xs w-full pl-3">{getLocalTime(_message)}</div>
                            </div>
                        </div>
                        <div className="flex-end flex-1"></div> {/* This fills the empty space in the row */}

                        <div className="tooltip tooltip-left pl-3" data-tip="Click to copy event json">
                            <button className="btn text-xs" onClick={() => {navigator.clipboard.writeText(getJsonString(_message))}}>Copy</button>
                        </div>

                    </div>
                ))}
            </div>

        </div>
    );
}

export default Notifications;
