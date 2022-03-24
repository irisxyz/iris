import React from "react";
import { Link, Outlet } from "react-router-dom";

function User() {
    return (
      <>
        <Outlet />
        <nav>
          <Link to="/">Home</Link>
        </nav>
      </>
    );
  }

export default User