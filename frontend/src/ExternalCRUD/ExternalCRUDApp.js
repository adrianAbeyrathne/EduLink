import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import User from "./getuser/User";
import AddUser from "./adduser/AddUser";
import UpdateUser from "./updateuser/Update";

const ExternalCRUDApp = () => {
  return (
    <div className="external-crud-app">
      <Routes>
        <Route path="/external-crud" element={<User />} />
        <Route path="/external-crud/add" element={<AddUser />} />
        <Route path="/external-crud/update/:id" element={<UpdateUser />} />
      </Routes>
    </div>
  );
};

export default ExternalCRUDApp;