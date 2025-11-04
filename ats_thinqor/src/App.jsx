import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Login from "./components/Login";
import Signup from "./components/Signup";
import AdminDashboard from "./components/AdminDashboard";
import Logout from "./components/Logout";
import CreateRequirements from "./components/CreateRequirements";
import DmDashboard from "./components/DmDashboard";
import Requirements from "./components/Requirements";
import Clients from "./components/Clients";

export default function App() {
  return (
    <>
      {/* 🌐 Always visible Header for everyone */}
      <Header />

      {/* 🔀 Page routing */}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/dm-dashboard" element={<DmDashboard/>}/>
        <Route path="/create-requirement" element={<CreateRequirements/>}/>
        <Route path="/requirements" element={<Requirements />} />
        <Route path="/clients" element={<Clients />} />



        {/* Add other routes as needed */}
        {/* Example future routes:
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/requirements" element={<Requirements />} />
        <Route path="/reports" element={<Reports />} /> */}
      </Routes>
    </>
  );
}
