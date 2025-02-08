import React, { useState, useEffect, useRef  } from 'react';

function LibraryRow(props) {

}



function Libraries(props) {

    const {rest_url} = props;

    const [libraries, setLibraries] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setLoading(true)
        fetch(rest_url + "plex/libraries")
            .then(response => response.json())
            .then(json => {
                setLibraries(json)
                console.log(json)
            })
            .finally(() => {
                setLoading(false)
            })
    }, [])

    const handleScanClick = (library) => {
        console.log('Scan button clicked for library:', library);
        // Set a breakpoint on the line below
        debugger;
    };


    return (
        <div className="overflow-x-auto">
            {loading ? (
                <div>Loading...</div>
            ) : (
            <table className="table">
                {/* head */}
                <thead>
                <tr>
                    <th>Library Name</th>
                    <th>Type</th>
                    <th>Locations</th>
                    <th>Scan</th>
                </tr>
                </thead>
                <tbody>
                {libraries.map(library => (

                    <tr>
                        <td><div>
                            <div className="font-bold">{library["name"]}</div>
                            </div>
                        </td>
                        <td>
                            <div className="font-medium">{library["type"]}</div>
                        </td>
                        <td>{library["locations"].map(loc => (
                            <div className="text-sm opacity-50">{loc}</div>
                        ))}</td>
                        <td>
                            {library["scan_active"] ?
                                (<div>
                                    <div id={"active_" + library["key"]+"_scanning"} className="text-sm font-bold text-orange-600">Scanning</div>
                                    <button id={"active_" + library["key"]+"_stop_scanning"} className="text-sm font-bold">Stop</button>
                                </div>)
                                :
                                (<button id={"active_" + library["key"]+"_not_scanning"} className="text-sm font-bold" onClick={() => handleScanClick(library)}>Scan</button>)
                            }
                        </td>
                    </tr>
                ))}
                </tbody>

            </table>
            )}
        </div>
   );
}

export default Libraries;

