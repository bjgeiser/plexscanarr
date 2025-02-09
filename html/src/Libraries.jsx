import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "react-query";

function Libraries(props) {
  const { rest_url } = props;
  const [libraries, setLibraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  const fetchLibraries = async () => {
    const response = await fetch(rest_url + "plex/libraries");
    return response.json();
  };

  const { data, isLoading } = useQuery("libraries", fetchLibraries, {
    refetchInterval: 5000, // Poll every 5 seconds
    onSuccess: (data) => {
      console.log("Libraries fetched:", data);
      setLibraries(data);
      setLoading(false);
    },
    onError: (error) => {
      console.error("Error fetching libraries:", error);
      setLoading(false);
    },
  });

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

  const fetchScanStatus = async () => {
    const response = await fetch(`${rest_url}plex/libraries`);
    return response.json();
  };

  useQuery("scanActive", fetchScanStatus, {
    refetchInterval: 5000, // Poll every 5 seconds
    onSuccess: (statusData) => {
      setLibraries((prevLibraries) =>
        prevLibraries.map((lib) => {
          const status = statusData.find((status) => status.key === lib.key);
          return status ? { ...lib, scan_active: status.scan_active } : lib;
        }),
      );
    },
    onError: (error) => {
      console.error("Error fetching scan status:", error);
    },
  });

  return (
    <div className="overflow-x-auto">
      {loading || isLoading ? (
        <div>Loading...</div>
      ) : (
        <table className="table">
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
                    <div className="font-bold">{library.name}</div>
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
