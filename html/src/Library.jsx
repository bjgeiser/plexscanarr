import { useLocation, Link } from "react-router-dom";

const Library = ({ name }) => {
  // Optional: useLocation() can be used if you need more info about the URL.
  const location = useLocation();
  console.log("Library - Location:", location);

  return (
    <div>
      <h2>{name} Child Page</h2>
      <p>
        This page has been loaded at <code>{location.pathname}</code>
      </p>
    </div>
  );
};

export default Library;
