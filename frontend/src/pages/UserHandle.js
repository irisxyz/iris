import React from "react";
import { useParams } from "react-router-dom";
import Follow from "./components/Follow.js"

function User({ wallet, lensHub }) {
    let params = useParams();

    return (
      <>
        <main>
          <h2>@{params.handle}!</h2>
          <Follow wallet={wallet} lensHub={lensHub}/>
        </main>
      </>
    );
  }

export default User