import React, { useState, useEffect, useRef  } from 'react';


function Logging(props) {

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

    const levels = {
        warn: "bg-warning text-warning-content",
        error: "bg-error text-error-content",
        info: ""
    };

    return (
        <div>
            <div className="mockup-code overflow-hidden hover:resize-y hover:overflow-auto h-96">
                {messageHistory.map((_message) => (
                    <pre className={_message ? levels[_message["params"]["level"]] : ""}>
                        <code key={ _message["index"]}>{_message ? _message["params"]["message"] : null}</code>
                    </pre>

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

export default Logging;