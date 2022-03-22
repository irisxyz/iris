import React from "react";
import { Link, Outlet } from "react-router-dom";

function User() {
    return (
      <>
        <main>
          <h2>Welcome to the users page!</h2>
          <p>You can do this, I believe in you.</p>
        </main>
        <Outlet />
        <nav>
          <Link to="/">Home</Link>
        </nav>
      </>
    );
  }

export default User