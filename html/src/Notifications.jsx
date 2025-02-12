import React, { useState, useEffect, useRef } from "react";


import Notification from "./Notification";

function Notifications(props) {
  const { messageHistory } = props;
  useEffect(() => {});

  return (
    <div>
      <div className="overflow-hidden hover:resize-y hover:overflow-auto h-full">
        {messageHistory.map((message) => {
          const notification = message.notification;
          return (
            <Notification notification={notification} />
          )})}
      </div>
    </div>
  );
}

export default Notifications;
