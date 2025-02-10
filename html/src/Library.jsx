import React, { useState, useEffect } from 'react';
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
    { field: "name", headerName: "Name", flex: 1, minWidth: 100, },
    { field: "locations", headerName: "File", flex: 1, minWidth: 100 },
    { field: "key", headerName: "Key", flex: 0.2, minWidth: 10 },
    // Add more columns as needed
  ];
  function getRowId(row) {
    return row.key;
  }

  useEffect(() => {
    console.log("Library component mounted or updated");
    fetch(`${REST_URL}plex/libraries/${library.key}/details`)
      .then((response) => response.json())
      .then((data) => {
      console.log(library.name, data);
      setRows(data.map(item => ({ ...item, id: item.key })));
      // setLibraryList(data);
      })
      .catch((error) => {
      console.error("Error fetching library details:", error);
      });
  }, []);

  console.log("Rows:", rows);
  return (
    <div style={{width: "100%" }}>
      <DataGrid rows={rows} columns={columns} components={{ Toolbar: GridToolbar }} 
        sx={{
          boxShadow: 2,
          border: 2,
          borderColor: 'primary.light',
          '& .MuiDataGrid-cell:hover': {
            color: 'primary.main',
          },
        }}
      />
    </div>
  );
};

export default Library;
