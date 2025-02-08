import React, { useState, useEffect, useRef } from "react";

function LibraryRow(props) {}

function Libraries(props) {
  const { rest_url } = props;

  const [libraries, setLibraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pollingIntervals, setPollingIntervals] = useState({});

  const handleScanClick = (library) => {
    console.log("Scan clicked for", library);

    fetch(`${rest_url}plex/libraries?key=${library.key}`, { method: "POST" })
      .then((response) => response.json())
      .then((data) => {
        console.log("Scan started:", data);
        // Start polling
        const intervalId = setInterval(() => {
          fetch(`${rest_url}plex/libraries?key=${library.key}`)
            .then((response) => response.json())
            .then((status) => {
              setLibraries((prevLibraries) => prevLibraries.map((lib) => (lib.key === library.key ? { ...lib, scan_active: status.scan_active } : lib)));
              if (!status.scan_active) {
                clearInterval(intervalId);
                setPollingIntervals((prevIntervals) => {
                  const { [library.key]: _, ...rest } = prevIntervals;
                  return rest;
                });
              }
            })
            .catch((error) => {
              console.error("Error fetching scan status:", error);
            });
        }, 5000); // Poll every 5 seconds

        setPollingIntervals((prevIntervals) => ({
          ...prevIntervals,
          [library.key]: intervalId,
        }));
      })
      .catch((error) => {
        console.error("Error starting scan:", error);
      });
  };

  useEffect(() => {
    setLoading(true);
    console.log("Loading state set to true");

    fetch(rest_url + "plex/libraries")
      .then((response) => response.json())
      .then((json) => {
        setLibraries(json);
        console.log(json);
      })
      .finally(() => {
        setLoading(false);
        console.log("Loading state set to false");
      });
    return () => {
      // Clear all intervals when component unmounts
      Object.values(pollingIntervals).forEach(clearInterval);
    };
  }, [rest_url, pollingIntervals]);

  return (
    <div className="overflow-x-auto">
      {loading ? (
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
                        Scan-{library.name}
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
