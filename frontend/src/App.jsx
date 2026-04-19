import React from "react";
import { useAuth } from "./context/AuthContext";
import AuthPage from "./pages/AuthPage";
import ChatDashboard from "./pages/ChatDashboard";

function App() {
  const { user } = useAuth();

  return (
    <div className="app">
      {user ? <ChatDashboard /> : <AuthPage />}
    </div>
  );
}

export default App;
