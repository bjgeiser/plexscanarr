import React, { useState, useEffect } from "react";
import { useLocation, Link, useParams } from "react-router-dom";
import { REST_URL } from "./main";
import { Box, useTheme } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";

const Library = ({ library }) => {
  const params = useParams();
  console.log("Library - Params:", params);
  // Optional: useLocation() can be used if you need more info about the URL.
  const [libraryList, setLibraryList] = useState([]);
  console.log("Library - Location:", location);

  const [rows, setRows] = React.useState([]);
  const columns = [
    { field: "title", headerName: "Title", flex: 1, minWidth: 100 },
    { field: "key", headerName: "Key", flex: 0.2, minWidth: 10 },
    { field: "type", headerName: "Type", flex: 0.2, minWidth: 10 },
    { field: "year", headerName: "Year", flex: 0.2, minWidth: 10 },
    // Add more columns as needed
  ];

  useEffect(() => {
    console.log("Library component mounted or updated");
    fetch(`${REST_URL}plex/libraries/${library.key}/details`)
      .then((response) => response.json())
      .then((data) => {
        console.log(library.name, data);
        setRows(data.map((item) => ({ ...item, id: item.key })));
        // setLibraryList(data);
      })
      .catch((error) => {
        console.error("Error fetching library details:", error);
      });
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
