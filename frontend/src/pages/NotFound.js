import React from "react";
import { Link } from "react-router-dom";

function NotFound() {
    return (
      <>
        <main style={{ padding: "1rem" }}>
            <p>404. There's nothing here!</p>
            <Link to="/">Go Home</Link>
        </main>
      </>
    );
  }

export default NotFound