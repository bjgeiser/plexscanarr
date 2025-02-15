import { useEffect, useRef, useState } from 'react';
import { usePlexMessage, type PlexMessageContextType } from '../modules/PlexMessageContext';
import Notification from '../layouts/Notification';

export default function Home() {
  const { plexMessage, setPlexMessage } = usePlexMessage();
  const logIndexRef = useRef(0);
  const [messageHistory, setMessageHistory] = useState<PlexMessageContextType[]>([]);
  const notificationRef = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const updateHeight = () => {
      setHeight(window.innerHeight - notificationRef.current.offsetTop - 10);
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  useEffect(() => {
    console.log('Home useEffect', plexMessage);
    if (plexMessage != null) {
      try {
        console.log('home Rx: ', plexMessage);
        if (plexMessage.hasOwnProperty('type')) {
          const type = plexMessage.type;
          const notification = plexMessage.notification;

          // if (plexMessage['type'] === 'plex_event') {
          //   setScanStatus(notification.pretty_name);
          // }

          if (type === 'arr_event' || type === 'plex_event') {
            logIndexRef.current += 1;
            plexMessage.index = logIndexRef.current;
            setMessageHistory((history) => {
              if (
                (history.length === 1 && history[0].notification.pretty_name === 'Welcome to Plexscanarr') ||
                notification['pretty_name'] === 'Welcome to Plexscanarr'
              ) {
                history.length = 0;
              }
              while (history.length > 500) {
                // Drop last message to reduce size by 1
                history.pop();
              }
              return [plexMessage, ...history];
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
  }, [plexMessage]);

  return (
    <div
      ref={notificationRef}
      style={{ height: height }}
      className="card bg-neutral ml-5 overflow-x-auto rounded-box grow "
    >
      <div className="overflow-hidden hover:resize-y hover:overflow-auto h-full">
        {messageHistory.map((message, index) => (
          <li key={index}>
            <Notification notification={message.notification} />
          </li>
        ))}
      </div>
    </div>
  );
}
