import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Segments from "./pages/Segments";
import Campaigns from "./pages/Campaigns";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
        />
        <Route
          path="/customers"
          element={<ProtectedRoute><Customers /></ProtectedRoute>}
        />
        <Route
          path="/segments"
          element={<ProtectedRoute><Segments /></ProtectedRoute>}
        />
        <Route
          path="/campaigns"
          element={<ProtectedRoute><Campaigns /></ProtectedRoute>}
        />
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
};

export default App;
