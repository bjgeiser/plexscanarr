import React from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { DataGrid } from "@mui/x-data-grid"; // Assuming you are using Material-UI DataGrid

const Details = () => {
  const socketUrl = "ws://your-websocket-url";
  const { lastMessage } = useWebSocket(socketUrl, {
    share: true,
    onOpen: () => {
      console.log("WebSocket connection established.");
    },
    shouldReconnect: (closeEvent) => true,
  });

  const [rows, setRows] = React.useState([]);

  React.useEffect(() => {
    if (lastMessage !== null) {
      const data = JSON.parse(lastMessage.data);
      setRows((prevRows) => [...prevRows, data]);
    }
  }, [lastMessage]);

  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "name", headerName: "Name", width: 150 },
    { field: "value", headerName: "Value", width: 150 },
    // Add more columns as needed
  ];

  return (
    <div style={{ height: 400, width: "100%" }}>
      <DataGrid rows={rows} columns={columns} pageSize={5} />
    </div>
  );
};

export default Details;
