
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from "./pages/HomePage";
import AddUserPage from "./pages/AddUserPage";
import UserDetailsPage from "./pages/UserDetailsPage";

function App() {
  return (
    <div className="font-sans antialiased text-gray-900">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/mainhome" element={<HomePage />} />
        <Route path="/adduser" element={<AddUserPage />} />
        <Route path="/userdetails" element={<UserDetailsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
