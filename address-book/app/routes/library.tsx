import type { Route } from './+types/contact';
import { Form } from 'react-router';

import { datalayer } from '../datalayer';
import type { LibraryDetails } from '../services/LibraryApi';
import { useEffect, useState } from 'react';

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const library = await datalayer.libraryApi.getLibraryByName(params.libraryId);
  if (!library) {
    throw new Response('Not Found', { status: 404 });
  }
  const libraryData = await datalayer.libraryApi.getLibraryDetails(library.key);
  return { libraryData };
}

export default function Library({ loaderData }: Route.ComponentProps) {
  const details: LibraryDetails = loaderData;

  return (
    <div>
      {details.libraryData.map((detail) => (
      <div key={detail.key}>
        {detail.title} - {detail.key} - {detail.type} - {detail.year}
      </div>
      ))}
    </div>
  );
}
