import { useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [auth, setAuth] = useState(!!localStorage.getItem("token"));

  if (!auth)
    return (
      <>
        <Login setAuth={setAuth} />
        <Register />
      </>
    );

  return <Dashboard />;
}
