import type { Route } from './+types/library';

import { datalayer } from '../datalayer';
import type { LibraryDetails } from '../services/LibraryApi';
import { useEffect, useState, useReducer } from 'react';

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const library = await datalayer.libraryApi.getLibraryByPath(params.libraryPath);
  if (!library) {
    throw new Response('Not Found', { status: 404 });
  }
  const libraryData = await datalayer.libraryApi.getLibraryDetails(library.key);
  return { libraryData };
}

export default function Library({ loaderData }: Route.ComponentProps) {
  const libraryDetails: LibraryDetails[] = loaderData.libraryData;
  return (
    <>
      <div className="card bg-black p-2 h-fit h-max-fit place-items-center">
        <div>
          {Array.isArray(libraryDetails) && libraryDetails.length > 0 ? (
            <table className="table-sm">
              <thead>
                <tr className="text-left text-orange-300 text-sm">
                  <th>Title</th>
                  <th>Year</th>
                  <th>Locations</th>
                  <th>Size (GB)</th>
                </tr>
              </thead>
              <tbody>
                {libraryDetails.map((detail) => {
                  //console.log("Library:", library);
                  return (
                    <tr key={detail.key}>
                      <td>
                        <div className="dropdown dropdown-hover font-bold">
                          <div tabIndex={0} role="button" className="">
                            {detail.title}
                          </div>
                          <ul
                            tabIndex={0}
                            className="dropdown-content menu bg-base-100 rounded-box z-[1] w-48 p-2 shadow"
                          ></ul>
                        </div>
                      </td>
                      <td>
                        <div className="font-medium">{detail.year}</div>
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
      </div>
    </>
  );
}
