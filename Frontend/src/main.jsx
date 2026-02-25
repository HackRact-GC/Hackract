// src/main.jsx
import React, { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { Auth0Provider } from "@auth0/auth0-react";
import { RouterProvider } from "react-router-dom";
import router from "../src/Router/Index";
import { AuthProvider } from "./context/AuthContext.jsx";
// import { Provider } from "react-redux";
// import  store  from "./store/Store.js";

ReactDOM.createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* <Provider store={store}> */}
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        scope: "openid profile email",
      }}
    >
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </Auth0Provider>
    {/* </Provider> */}
  </StrictMode>
);
