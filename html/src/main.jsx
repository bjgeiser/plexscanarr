import React, { useState, useCallback, useEffect, useRef  } from 'react';
import Button from "./Button"
import Logging, { log }from "./Logging";
import useWebSocket, { ReadyState } from 'react-use-websocket';
import Libraries from "./Libraries";

//const WS_URL = "ws://" + window.location.host + "/ws";
const WS_URL = "ws://" + (window.location.href.startsWith("file")? "localhost:5000" : window.location.host) + "/ws";
const REST_URL = (window.location.href.startsWith("file")? "http://localhost:5000/" : window.location.protocol+ "//" +window.location.host + "/");

const Main = (props) =>
{
    const [startBtnDisabled, setStartBtnDisabled] = useState(false)
    const [reprintBtnDisabled, setReprintBtnDisabled] = useState(true)
    const [socketUrl, setSocketUrl] = useState(WS_URL);
    const [messageHistory, setMessageHistory] = useState([]);
    const [deviceInfo, setDeviceInfo] = useState("Not found")
    const [testTitle, setTestTile] = useState("")
    const [testResult, setTestResult] = useState("None")

    const [availableRecords, setAvailableRecords] = useState()
    const [progress, setProgress] = useState(0)
    const [serverConnectionStatus, setServerConnectionStatus] = useState("Disconnected")

    const [version, setVersion] = useState("Unknown")
    const [os, setOs] = useState("Unknown")
    const [server, setServer] = useState("Unknown")
    const [scanActive, setScanActive] = useState(false)

    const logIndexRef = useRef(0)

    const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl, {
        share: true,
        onOpen: () => {
            console.log('WebSocket connection established.');
        },
        shouldReconnect: (closeEvent) => true,
    });

    const connectionStatus = {
        [ReadyState.CONNECTING]: 'Connecting',
        [ReadyState.OPEN]: 'Connected',
        [ReadyState.CLOSING]: 'Closing',
        [ReadyState.CLOSED]: 'Closed',
        [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
    }[readyState];

    useEffect(() => {

        const getServerInfo = async () => {
            try {
                const response = await fetch(REST_URL+"plex/info");
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const json = await response.json();
                setOs(json["platform"]);
                setServer(json["server"]);
                setVersion(json["version"]);
                setScanActive(json["scan_active"]);
                console.log(json);
            }
            catch (e) {
                console.error(e);
            }
        }
        getServerInfo();

        if(lastMessage != null)
        {
            console.log("Main Rx: " + lastMessage)
            try {
                const msgJson = JSON.parse(lastMessage.data);
                if (msgJson.hasOwnProperty("type"))
                {
                    if (msgJson["type"] === "log")
                    {
                        logIndexRef.current += 1
                        msgJson.index = logIndexRef.current
                        setMessageHistory((history) => {
                            while(history.length > 500) {
                                // Drop first message to reduce size by 1
                                history.shift()
                            }
                            return [...history, msgJson]
                        })
                    }
                    else if (msgJson["type"] === "progress")
                    {
                        if (msgJson["params"]["id"] === "flash_progress")
                        {
                            setProgress(msgJson["params"]["value"])
                        }
                    }
                    else if (msgJson["type"] === "label")
                    {
                        if (msgJson["params"]["id"] === "device_info")
                        {
                            setDeviceInfo(msgJson["params"]["value"])
                        }
                        else if (msgJson["params"]["id"] === "test_title")
                        {
                            setTestTile(msgJson["params"]["value"])
                        }
                        else if (msgJson["params"]["id"] === "available_records")
                        {
                            setAvailableRecords(msgJson["params"]["value"])
                        }
                        else if (msgJson["params"]["id"] === "test_result")
                        {
                            const val = msgJson["params"]["value"]
                            setTestResult(val)
                            if(val === "Success")
                            {
                                setTestResultBadge("badge badge-success")
                            }
                            else if(val === "Failed" || val === "Exception")
                            {
                                setTestResultBadge("badge badge-error")
                            }
                            else
                            {
                                setTestResultBadge("badge badge-outline")
                            }
                        }
                        else if (msgJson["params"]["id"] === "customer_code")
                        {
                            setCustomerCode(msgJson["params"]["value"])
                        }
                        else if (msgJson["params"]["id"] === "product_id")
                        {
                            setProductID(msgJson["params"]["value"])
                        }
                        else if (msgJson["params"]["id"] === "region")
                        {
                            setRegion(msgJson["params"]["value"])
                        }
                        else if (msgJson["params"]["id"] === "major_revision")
                        {
                            setMajorRevision(msgJson["params"]["value"])
                        }
                        else if (msgJson["params"]["id"] === "manufacturer")
                        {
                            setManufacturer(msgJson["params"]["value"])
                        }
                        else if (msgJson["params"]["id"] === "tester_id")
                        {
                            setTesterID(msgJson["params"]["value"])
                        }
                        else if (msgJson["params"]["id"] === "full_serial_number")
                        {
                            setFullSerialNUmber(msgJson["params"]["value"])
                        }
                        else if (msgJson["params"]["id"] === "server_connection_status")
                        {
                            setServerConnectionStatus(msgJson["params"]["value"])
                        }
                    }
                    else if (msgJson["type"] === "disabled")
                    {
                        if (msgJson["params"]["id"] === "start_btn")
                        {
                            setStartBtnDisabled(msgJson["params"]["value"]);
                        }
                        else if (msgJson["params"]["id"] === "reprint_btn")
                        {
                            setReprintBtnDisabled(msgJson["params"]["value"]);
                        }
                    }

                }

            } catch (e) {
                //do nothing
            }
        }
    }, [lastMessage]);



    //const handleClickSendMessage = useCallback(() => sendMessage('{"type": "command", "params": {"action": "start_flash"}'), []);
    const handleStartClick = useCallback(() => sendMessage('{"type": "command", "params": {"action": "start"}}'), []);
    const handleReprintClick = useCallback(() => sendMessage('{"type": "command", "params": {"action": "reprint"}}'), []);

    return (
        <div>

            <div className="navbar bg-base-200">
                <div className="flex-1">
                    <a className="btn btn-ghost text-xl">Plexscanarr</a>
                </div>
                <div className="flex-none">
                    <div></div>
                </div>
                <div className="flex-none">
                    <ul className="menu menu-horizontal px-1">
                        <li><h1>Server: {server}</h1></li>
                        <li><h1>Server Platform: {os}</h1></li>
                        <li><h1>Version: {version}</h1></li>
                        <li className="flex flex-row">
                            <h1>Scan Active: </h1>
                            {scanActive ?
                                (<div>
                                    <div id="active_scan_scanning" className="text-sm font-bold text-orange-600">Scanning</div>
                                    <button id="active_stop_scanning" className="text-sm font-bold">Stop</button>
                                </div>)
                                :
                                (<div id="active_scan_not_scanning" className="text-sm font-bold">Scan</div>)
                            }
                        </li>
                    </ul>
                </div>
            </div>

            <div className="flex w-full pt-3 px-3">
                <div className="card bg-base-300 rounded-box grid shrink place-items-center">
                    <Libraries rest_url={REST_URL}></Libraries>
                </div>
                <div className="divider divider-horizontal"></div>
                <div className="card bg-neutral rounded-box grid flex-grow place-items-center">content</div>
            </div>

        </div>


    );
}


export default Main;