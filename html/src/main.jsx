import React, { useState, useCallback, useEffect, useRef } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import Libraries from "./Libraries";
import JobLog from "./Notifications";
import Notifications from "./Notifications";
import { useNavigate } from "react-router-dom";
import { useLibrary } from "./LibraryContext";


const SERVER_ADDR = process.env.WEB_SERVER_ADDR || "localhost";
const SERVER_PORT = process.env.WEB_SERVER_PORT || "5000";
const _SERVER_ADDR_PORT =  SERVER_ADDR + ":" + SERVER_PORT;
const SERVER_ADDR_PORT = (window.location.href.startsWith("file") || process.env.FORCE_ENV === "true") ? _SERVER_ADDR_PORT :  window.location.host
const WEBSOCKET_PROTOCOL=window.location.protocol.startsWith("https") ? "wss:" : "ws:";
const HTTP_PROTOCOL = window.location.protocol.startsWith("file") ? "http:" : window.location.protocol;
export const WS_URL = WEBSOCKET_PROTOCOL + "//" + SERVER_ADDR_PORT + "/ws";
export const REST_URL= HTTP_PROTOCOL + "//" + SERVER_ADDR_PORT + "/";


export const fetchLibraries = async () => {
  const response = await fetch(`${REST_URL}plex/libraries`);
  return response.json();
};

const Main = () => {
  const { libraryState, setLibraryState } = useLibrary();

  useEffect(() => {
    const fetchAndSetLibraries = async () => {
      const libraries = await fetchLibraries();
      console.log("Main - Libraries fetched:", libraries);
      setLibraryState(libraries);
    };

    fetchAndSetLibraries();
  }, [setLibraryState]);

  console.log("Main - Libraries:", libraryState);

  const [startBtnDisabled, setStartBtnDisabled] = useState(false);
  const [reprintBtnDisabled, setReprintBtnDisabled] = useState(true);
  const [socketUrl, setSocketUrl] = useState(WS_URL);
  const [messageHistory, setMessageHistory] = useState([]);
  const [deviceInfo, setDeviceInfo] = useState("Not found");
  const [testTitle, setTestTile] = useState("");
  const [testResult, setTestResult] = useState("None");
  const [scanStatus, setScanStatus] = useState("Unknown");

  const [availableRecords, setAvailableRecords] = useState();
  const [progress, setProgress] = useState(0);
  const [serverConnectionStatus, setServerConnectionStatus] = useState("Disconnected");

  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const logIndexRef = useRef(0);

  const notificationRef = useRef(null);
  const [height, setHeight] = useState(0);

  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl, {
    share: true,
    onOpen: () => {
      console.log("WebSocket connection established.");
    },
    shouldReconnect: (closeEvent) => true,
  });

  //   const { data, isLoading } = useQuery("scanActive", fetchLibraries, {
  //     onSuccess: (data) => {
  //       setScanActive(data);
  //       setLoading(false);
  //     },
  //     onError: (error) => {
  //       console.error("Error fetching libraryState:", error);
  //       setLoading(false);
  //     },
  //   });

  const fetchScanStatus = async () => {
    const response = await fetch(`${REST_URL}plex/libraries`);
    return response.json();
  };

  //   useQuery("scanActive", fetchScanStatus, {
  //     refetchInterval: 5000, // Poll every 5 seconds
  //     onSuccess: (statusData) => {
  //       const anyScanActive = statusData.some((status) => status.scan_active);
  //       setScanActive(anyScanActive);
  //     },
  //     onError: (error) => {
  //       console.error("Error fetching scan status:", error);
  //     },
  //   });

  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Connected",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  }[readyState];

  useEffect(() => {
    const updateHeight = () => {
      setHeight(window.innerHeight - notificationRef.current.offsetTop - 10);
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  useEffect(() => {
    if (lastMessage != null) {
      try {
        const event = JSON.parse(lastMessage.data);
        console.log(event);
        console.log("Main Rx Json: ", event);
        if (event.hasOwnProperty("type")) {
          const type = event.type;
          const notification = event.notification;

          if (event["type"] === "plex_event") {
            setScanStatus(notification.pretty_name);
          }

          if (type === "arr_event" || type === "plex_event")
          {
            logIndexRef.current += 1;
            event.index = logIndexRef.current;
            setMessageHistory((history) => {

            if ((history.length === 1 && history[0].notification.pretty_name === "Welcome to Plexscanarr") || notification["pretty_name"] === "Welcome to Plexscanarr") {
              history.length = 0;
            }
            while (history.length > 500) {
              // Drop last message to reduce size by 1
              history.pop();
            }
            return [event, ...history];

          });
          }
          /*else if (msgJson["type"] === "progress") {
            if (msgJson["params"]["id"] === "flash_progress") {
              setProgress(msgJson["params"]["value"]);
            }
          } else if (msgJson["type"] === "label") {
            if (msgJson["params"]["id"] === "device_info") {
              setDeviceInfo(msgJson["params"]["value"]);
            } else if (msgJson["params"]["id"] === "test_title") {
              setTestTile(msgJson["params"]["value"]);
            } else if (msgJson["params"]["id"] === "available_records") {
              setAvailableRecords(msgJson["params"]["value"]);
            } else if (msgJson["params"]["id"] === "test_result") {
              const val = msgJson["params"]["value"];
              setTestResult(val);
              if (val === "Success") {
                setTestResultBadge("badge badge-success");
              } else if (val === "Failed" || val === "Exception") {
                setTestResultBadge("badge badge-error");
              } else {
                setTestResultBadge("badge badge-outline");
              }
            } else if (msgJson["params"]["id"] === "customer_code") {
              setCustomerCode(msgJson["params"]["value"]);
            } else if (msgJson["params"]["id"] === "product_id") {
              setProductID(msgJson["params"]["value"]);
            } else if (msgJson["params"]["id"] === "region") {
              setRegion(msgJson["params"]["value"]);
            } else if (msgJson["params"]["id"] === "major_revision") {
              setMajorRevision(msgJson["params"]["value"]);
            } else if (msgJson["params"]["id"] === "manufacturer") {
              setManufacturer(msgJson["params"]["value"]);
            } else if (msgJson["params"]["id"] === "tester_id") {
              setTesterID(msgJson["params"]["value"]);
            } else if (msgJson["params"]["id"] === "full_serial_number") {
              setFullSerialNUmber(msgJson["params"]["value"]);
            } else if (msgJson["params"]["id"] === "server_connection_status") {
              setServerConnectionStatus(msgJson["params"]["value"]);
            }
          } else if (msgJson["type"] === "disabled") {
            if (msgJson["params"]["id"] === "start_btn") {
              setStartBtnDisabled(msgJson["params"]["value"]);
            } else if (msgJson["params"]["id"] === "reprint_btn") {
              setReprintBtnDisabled(msgJson["params"]["value"]);
            }
          }*/
        }
      } catch (e) {
        //do nothing
      }
    }
  }, [lastMessage]);

  //const handleClickSendMessage = useCallback(() => sendMessage('{"type": "command", "params": {"action": "start_flash"}'), []);
  const handleStartClick = useCallback(() => sendMessage('{"type": "command", "params": {"action": "start"}}'), []);
  const handleReprintClick = useCallback(() => sendMessage('{"type": "command", "params": {"action": "reprint"}}'), []);

  console.log("REST URL: ", REST_URL);
  console.log("WS URL: ", WS_URL);

  return (
    <div>
      <div className="w-full flex pt-3 px-3">
        <div className="card bg-base-300 rounded-box h-fit  h-max-fit w-fit place-items-center">
          <Libraries scanStatus={scanStatus} />
        </div>

        <div ref={notificationRef} style={{ height: height }} className="card bg-neutral ml-5 overflow-x-auto rounded-box grow ">
          <Notifications messageHistory={messageHistory} />
        </div>
      </div>
    </div>
  );
};

export default Main;
