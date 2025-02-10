import React, { useState, useCallback, useEffect, useRef } from "react";
import Button from "./Button";
import Logging, { log } from "./Logging";
import useWebSocket, { ReadyState } from "react-use-websocket";
import Libraries from "./Libraries";
import JobLog from "./Notifications";
import Notifications from "./Notifications";
import { useQuery, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { HashRouter, Routes, Route } from "react-router-dom";
import Banner from "./Banner";

//const WS_URL = "ws://" + window.location.host + "/ws";
const SERVER_ADDR = process.env.WEB_SERVER_ADDR || "localhost";
const SERVER_PORT = process.env.WEB_SERVER_PORT || "5000";
const SERVER_ADDR_PORT = SERVER_ADDR + ":" + SERVER_PORT;
export const WS_URL = "ws://" + (window.location.href.startsWith("file") ? SERVER_ADDR_PORT : window.location.host) + "/ws";
export const REST_URL = window.location.href.startsWith("file") ? "http://" + SERVER_ADDR_PORT + "/" : window.location.protocol + "//" + window.location.host + "/";

export const fetchLibraries = async () => {
  const response = await fetch(`${REST_URL}plex/libraries`);
  return response.json();
};

export const toRoutePath = (name) => "/" + name.replace(/\s+/g, "");

const Main = ({ libraries }) => {
  console.log("Main - Libraries:", libraries);

  const [startBtnDisabled, setStartBtnDisabled] = useState(false);
  const [reprintBtnDisabled, setReprintBtnDisabled] = useState(true);
  const [socketUrl, setSocketUrl] = useState(WS_URL);
  const [messageHistory, setMessageHistory] = useState([]);
  const [deviceInfo, setDeviceInfo] = useState("Not found");
  const [testTitle, setTestTile] = useState("");
  const [testResult, setTestResult] = useState("None");

  const [availableRecords, setAvailableRecords] = useState();
  const [progress, setProgress] = useState(0);
  const [serverConnectionStatus, setServerConnectionStatus] = useState("Disconnected");

  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const logIndexRef = useRef(0);

  const notificationRef = useRef(null);
  const [height, setHeight] = useState(0);

  const queryClient = useQueryClient();

  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl, {
    share: true,
    onOpen: () => {
      console.log("WebSocket connection established.");
    },
    shouldReconnect: (closeEvent) => true,
  });

  const toRoutePath = (name) => "/" + name.replace(/\s+/g, "");

  //   const { data, isLoading } = useQuery("scanActive", fetchLibraries, {
  //     onSuccess: (data) => {
  //       setScanActive(data);
  //       setLoading(false);
  //     },
  //     onError: (error) => {
  //       console.error("Error fetching libraries:", error);
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

    if (lastMessage != null) {
      try {
        const msgJson = JSON.parse(lastMessage.data);
        console.log(msgJson);
        console.log("Main Rx Json: " + msgJson);
        if (msgJson.hasOwnProperty("type")) {
          logIndexRef.current += 1;
          msgJson.index = logIndexRef.current;
          setMessageHistory((history) => {
            if ((history.length === 1 && history[0]["pretty_name"] === "Welcome to Plexscanarr") || msgJson["pretty_name"] === "Welcome to Plexscanarr") {
              history.length = 0;
            }
            while (history.length > 500) {
              // Drop last message to reduce size by 1
              history.pop();
            }
            return [msgJson, ...history];
          });

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

    return () => window.removeEventListener("resize", updateHeight);
  }, [lastMessage]);

  //const handleClickSendMessage = useCallback(() => sendMessage('{"type": "command", "params": {"action": "start_flash"}'), []);
  const handleStartClick = useCallback(() => sendMessage('{"type": "command", "params": {"action": "start"}}'), []);
  const handleReprintClick = useCallback(() => sendMessage('{"type": "command", "params": {"action": "reprint"}}'), []);

  console.log("REST URL: ", REST_URL);

  return (
    <div>
      <div className="w-full flex pt-3 px-3">
        <div className="card bg-base-300 rounded-box h-fit  h-max-fit w-fit place-items-center">
          <Libraries rest_url={REST_URL} libraries={libraries} />
        </div>

        <div ref={notificationRef} style={{ height: height }} className="card bg-neutral ml-5 overflow-x-auto rounded-box grow ">
          <Notifications messageHistory={messageHistory}> </Notifications>
        </div>
      </div>
    </div>
  );
};

export default Main;
