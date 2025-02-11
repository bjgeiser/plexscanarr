import React, { useState, useEffect, use } from "react";
import { useQuery, useQueryClient } from "react-query";
import { HashRouter, Route, Routes, Link } from "react-router-dom";
import Main, { fetchLibraries, toRoutePath, REST_URL } from "./main";
import Library from "./Library";
import { useNavigate } from "react-router-dom";
import Details from "./Details";
import Layout from "./Layout";
import { useLibrary } from "./LibraryContext";

export const LibraryRoutes = () => {
  const [libraries, setLibraries] = useState([]);

  // Simulate retrieving your list of names from an API when the component mounts.
  useEffect(() => {
    // For example, the API could return: ["Home Movies", "TV Shows", "News"]
    fetchLibraries().then((data) => {
      console.log(data);
      setLibraries(data);
    });
  }, []);

  // Helper function that converts a name to a URL-friendly route path.
  // const toRoutePath = (name) => name.replace(/\s+/g, "");

  return (
    // We define all our routes here.
    <Routes>
      <Route path="/" element={<Layout REST_URL={REST_URL} />}>
        <Route index element={<Main libraries={libraries} />} />
        <Route path="details" element={<Details />} />
        {/* For each category, create a dynamic child page route. */}
        {libraries.map((library) => (
          <Route key={library.name} path={toRoutePath(library.name)} element={<Library library={library} />} />
          // <Route key={name} path={`/${toRoutePath(name)}`} element={<ChildPage name={name} />} />
        ))}
      </Route>
    </Routes>
  );
};

function Libraries({ library_in, scanStatus }) {
  const [libraries, setLibraries] = useState([library_in]);
  const { libraryState, setLibraryState } = useLibrary();

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleScanClick = (library) => {
    console.log("Scan clicked for", library);

    fetch(`${REST_URL}plex/libraries/${library.key}/scan`, { method: "POST" })
      .then((response) => response.json())
      .then((data) => {
        console.log("Scan started:", data);
        setLibraryState(true);
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
    console.log("Libraries component mounted or updated");
    setLibraries(library_in);
  }, [library_in]);

  useEffect(() => {
    console.log("Libraries scanStatus:", scanStatus);
    fetchScanStatus().then((data) => {
      console.log("Scan status fetched:", data);
      setLibraries(data);
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

  console.log("Libraries:", libraries);

  return (
    <div>
      {libraries.length <= 1 ? (
        <div>No libraries available.</div>
      ) : (
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
            {libraries.map((library) => {
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
      )}
    </div>
  );
}

export default Libraries;
