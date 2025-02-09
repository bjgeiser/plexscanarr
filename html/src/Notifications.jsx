import React, { useState, useEffect, useRef  } from 'react';


function Notifications(props) {

    //This in combination of useEffect is how new messages make it into thie component
    const {messageHistory} = props;



    const [checked, setChecked] = React.useState(true);

    const LoggingEndRef = useRef(null)
    const LoggingMaxIndexRef = useRef(0)

    const scrollToBottom = () => {
        LoggingEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {

        if (checked && messageHistory.length > 0) {
            const lastIndex = messageHistory[messageHistory.length - 1].index;
            if (lastIndex > LoggingMaxIndexRef.current) {
                LoggingMaxIndexRef.current = lastIndex;
                // Scroll if the autoscroll check box is checked and
                // new log entries have been added since the last update.
                scrollToBottom();
            }
        }

    });


    const handleChange = () => {
        setChecked(!checked);
    };

    function getLocalTime(_message) {
        const dt = new Date(_message["timestamp"]);
        return dt.toLocaleString("en-US")
    }


    return (
        <div className="h-dvh">
            <div className="overflow-hidden hover:resize-y hover:overflow-auto">
                {messageHistory.map((_message) => (
                    <div className="card rounded-box bg-base-300 w-dvw m-2 p-3 flex flex-row">
                        <div className="flex flex-col">
                            <div>{_message["type"]}</div>
                            <div>{_message["server_name"]}</div>
                        </div>
                        <div className="p-3">Time: { getLocalTime(_message)}</div>
                        <div className="p-3">Title: {_message["pretty_name"]}</div>
                    </div>
                ))}
                <div ref={LoggingEndRef} />
            </div >
            <div className="form-control">
                <label className="label cursor-pointer">
                    <span className="label-text">Autoscroll</span>
                    <input name="autoscroll" type="checkbox" className="checkbox" checked={checked} onChange={handleChange} />
                </label>
            </div>
        </div>
    );
}

export default Notifications;