// src/routes/index.jsx or similar

import { createBrowserRouter } from "react-router-dom";
import App from "../App.jsx";
import AuthLayout from "../layouts/AuthLayout.jsx";
import Login from "../pages/Login.jsx";
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          {
            index: true,
            element: <Login />,
          },
          {
            path: "login",
            element: <Login />,
          },
        ]
      },
    ]
  },
]);

export default router;
