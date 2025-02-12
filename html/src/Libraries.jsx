import React, { useState, useEffect } from "react";
import { fetchLibraries, toRoutePath, REST_URL } from "./main";
import { useNavigate } from "react-router-dom";
import { useLibrary } from "./LibraryContext";

function Libraries({ scanStatus }) {
  const { libraryState, setLibraryState } = useLibrary();

  const navigate = useNavigate();

  useEffect(() => {
    console.log("Updating library list: " + libraryState);
  }, [libraryState]);

  const handleScanClick = (library) => {
    console.log("Scan clicked for", library);

    fetch(`${REST_URL}plex/libraries/${library.key}/scan`, { method: "POST" })
      .then((response) => response.json())
      .then((data) => {
        console.log("Scan started:", data);
      })
      .catch((error) => {
        console.error("Error starting scan:", error);
      });
  };

  const handleCanelScanClick = (library) => {
    console.log("Cancel clicked for", library);

    fetch(`${REST_URL}plex/libraries/${library.key}/scan`, { method: "DELETE" })
      .then((response) => response.json())
      .then((data) => {
        console.log("Scan canceled:", library.name);
      })
      .catch((error) => {
        console.error("Error starting scan:", error);
      });
  };

  const handleLibraryDetailClick = (library) => {
    console.log("Detail clicked for", library);
    navigate(toRoutePath(library.name));
  };

  const fetchScanStatus = async () => {
    const response = await fetch(`${REST_URL}plex/libraries`);
    return response.json();
  };

  useEffect(() => {
    console.log("Libraries scanStatus:", scanStatus);
    fetchScanStatus().then((data) => {
      console.log("Scan status fetched:", data);
      setLibraryState(data);
    });
  }, [scanStatus]);

  // useQuery("scanActive", fetchScanStatus, {
  //   refetchInterval: 5000, // Poll every 5 seconds
  //   onSuccess: (statusData) => {
  //     setLibraries((prevLibraries) =>
  //       prevLibraries.map((lib) => {
  //         const status = statusData.find((status) => status.key === lib.key);
  //         return status ? { ...lib, scan_active: status.scan_active } : lib;
  //       }),
  //     );
  //   },
  //   onError: (error) => {
  //     console.error("Error fetching scan status:", error);
  //   },
  // });

  console.log("Libraries:", libraryState);

  return (
    <div>
      {Array.isArray(libraryState) && libraryState.length > 0 ? (
        <table className="table-sm">
          <thead>
            <tr className="text-left text-orange-300 text-sm">
              <th>Library Name</th>
              <th>Type</th>
              <th>Locations</th>
              <th>Scan</th>
            </tr>
          </thead>
          <tbody>
            {libraryState.map((library) => {
              //console.log("Library:", library);
              return (
                <tr key={library.key}>
                  <td>
                    <div className="dropdown dropdown-hover font-bold">
                      <div tabIndex={0} role="button" className="">
                        {library.name}
                      </div>
                      <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
                        <li>
                          <button id={"detail_" + library.key} className="text-sm font-bold" onClick={() => handleLibraryDetailClick(library)}>
                            Open Details
                          </button>
                        </li>
                        <li>
                          <a onClick={() => window.open(library.server_link, "_blank")}>Open on Plex Server</a>
                        </li>
                      </ul>
                    </div>
                  </td>
                  <td>
                    <div className="font-medium">{library.type}</div>
                  </td>
                  <td>
                    {library.locations.map((loc, index) => (
                      <div key={index} className="text-sm opacity-50">
                        {loc}
                      </div>
                    ))}
                  </td>
                  <td>
                    {library.scan_active ? (
                      <div className="dropdown dropdown-hover">
                        <div tabIndex={0} role="button" id={"active_" + library.key + "_scanning"} className="text-sm font-bold text-orange-600">
                          Scanning
                        </div>
                        <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
                          <li>
                            <button id={"active_" + library.key + "_stop_scanning"} onClick={() => handleCanelScanClick(library)} className="text-sm font-bold">
                              Stop
                            </button>
                          </li>
                        </ul>
                      </div>
                    ) : (
                      <button id={"active_" + library.key + "_not_scanning"} className="text-sm font-bold" onClick={() => handleScanClick(library)}>
                        Scan
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <div>No libraries available.</div>
      )}
    </div>
  );
}

export default Libraries;
