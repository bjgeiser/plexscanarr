import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { REST_URL } from "./main";
import { Box, useTheme } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";

const Library = ({ library }) => {
  // Optional: useLocation() can be used if you need more info about the URL.
  const location = useLocation();
  const [libraryList, setLibraryList] = useState([]);
  console.log("Library - Location:", location);

  const [rows, setRows] = React.useState([]);
  const columns = [
    { field: "title", headerName: "Title", flex: 1, minWidth: 100 },
    { field: "locations", headerName: "Locations", flex: 1, minWidth: 100 },
    { field: "key", headerName: "Key", flex: 0.2, minWidth: 10 },
    // Add more columns as needed
  ];
  function getRowId(row) {
    return row.key;
  }

  useEffect(() => {
    console.log("Library component mounted or updated");
    const ip_address = process.env.PLEX_IP;
    const plex_token = process.env.PLEX_TOKEN;
    console.log(`Fetching data from: http://${ip_address}:32400/library/sections/${library.key}/all?X-Plex-Token=${plex_token}`);
    // fetch(`${REST_URL}plex/libraries/${library.key}/details`);

    // TODO Add button click to get library details
    // const response = await fetch(`http://${ip_address}:32400/library/metadata/${item.key}?X-Plex-Token=${plex_token}`);
    // this will return location xml to parse

    const fetchData = async () => {
      try {
        const response = await fetch(`http://${ip_address}:32400/library/sections/${library.key}/all?X-Plex-Token=${plex_token}`);
        const data = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data, "application/xml");
        const videos = Array.from(xmlDoc.getElementsByTagName("Video")).map((item) => ({
          title: item.getAttribute("title"),
          locations: item.getElementsByTagName("Part")[0]?.getAttribute("file") || "",
          key: item.getAttribute("ratingKey"),
        }));

        const directories = Array.from(xmlDoc.getElementsByTagName("Directory")).map((item) => ({
          title: item.getAttribute("title"),
          locations: "",
          key: item.getAttribute("ratingKey"),
        }));
        const items = [...videos, ...directories];
        console.log(library.name, items);
        setRows(items.map((item) => ({ ...item, id: item.key })));
      } catch (error) {
        console.error("Error fetching library details:", error);
      }
    };

    fetchData();
  }, []);

  console.log("Rows:", rows);
  return (
    <div className="mt-5 ml-8 mr-8 right-8 min-w-fit">
      <DataGrid
        rows={rows}
        columns={columns}
        components={{ Toolbar: GridToolbar }}
        pageSizeOptions={[25, 50, 75, 100, { value: -1, label: "All" }]}
        initialState={{
          density: "compact",
          pagination: { paginationModel: { pageSize: 100 } },
        }}
        sx={{
          color: "GhostWhite",
          fontWeight: "bold",
          boxShadow: 2,
          border: 2,
          background: "linear-gradient( 90deg,#333b3a,#374141 25%,#40362b 75%,#211a17)",
          borderColor: "#f68f3b",

          "& .MuiDataGrid-cell:hover": {
            color: "#f68f3b",
          },
          "& .MuiDataGrid-columnHeaders, & .MuiDataGrid-columnHeader": {
            color: "Black",
            background: "linear-gradient(90deg, #c17f34, #db961f, #eebd41, #db961f,#c17f34)",
          },
          "& .MuiDataGrid-columnHeaderTitle": {
            fontWeight: "bold !important",
            overflow: "visible !important",
          },
          "& .MuiDataGrid-footerContainer svg": {
            color: "GhostWhite",
          },
          ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows, .MuiTablePagination-select": {
            color: "GhostWhite",
          },
        }}
      />
    </div>
  );
};

export default Library;
