import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "react-query";
import { HashRouter, Route, Routes, Link } from "react-router-dom";
import Main, { fetchLibraries, toRoutePath } from "./main";
import Library from "./Library";
import { useNavigate } from "react-router-dom";
import Details from "./Details";

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
      {/* The main page route at "/" passing the categories list */}
      <Route path="/" element={<Main libraries={libraries} />} />
      <Route path="details" element={<Details />} />
      {/* For each category, create a dynamic child page route. */}
      {libraries.map((library) => (
        <Route key={library.name} path={toRoutePath(library.name)} element={<Library name={library.name} />} />
        // <Route key={name} path={`/${toRoutePath(name)}`} element={<ChildPage name={name} />} />
      ))}
      {/* Optional: a catch-all route if the URL doesn't match any defined route */}
      <Route path="*" element={<Main libraries={libraries} />} />
    </Routes>
  );
};

function Libraries({ libraries, rest_url }) {
  console.log("Libraries - Libraries:", libraries);
  // const [libraries, setLibraries] = useState([]);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // const fetchLibraries = async () => {
  //   const response = await fetch(rest_url + "plex/libraries");
  //   return response.json();
  // };

  // const { data, isLoading } = useQuery("libraries", fetchLibraries, {
  //   refetchInterval: 5000, // Poll every 5 seconds
  //   onSuccess: (data) => {
  //     console.log("Libraries fetched:", data);
  //     setLibraries(data);
  //     setLoading(false);
  //   },
  //   onError: (error) => {
  //     console.error("Error fetching libraries:", error);
  //     setLoading(false);
  //   },
  // });

  const handleScanClick = (library) => {
    console.log("Scan clicked for", library);

    fetch(`${rest_url}plex/libraries?key=${library.key}`, { method: "POST" })
      .then((response) => response.json())
      .then((data) => {
        console.log("Scan started:", data);
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
    const response = await fetch(`${rest_url}plex/libraries`);
    return response.json();
  };

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

  return (
    <div className="overflow-x-auto">
      {libraries.length === 0 ? (
        <div>No libraries available.</div>
      ) : (
        <table className="table-sm">
          <thead>
            <tr>
              <th>Library Name</th>
              <th>Type</th>
              <th>Locations</th>
              <th>Scan</th>
            </tr>
          </thead>
          <tbody>
            {libraries.map((library) => {
              console.log("Library:", library);
              return (
                <tr key={library.key}>
                  <td>
                    <div className="font-bold">
                      <button id={"detail_" + library.key} className="text-sm font-bold" onClick={() => handleLibraryDetailClick(library)}>
                        {library.name}
                      </button>
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
                      <div>
                        <div id={"active_" + library.key + "_scanning"} className="text-sm font-bold text-orange-600">
                          Scanning
                        </div>
                        <button id={"active_" + library.key + "_stop_scanning"} className="text-sm font-bold">
                          Stop
                        </button>
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
