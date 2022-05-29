import React from "react";
import { Outlet } from "react-router-dom";

function OutletPage() {
    return (
      <>
        <Outlet />
      </>
    );
  }

export default OutletPage