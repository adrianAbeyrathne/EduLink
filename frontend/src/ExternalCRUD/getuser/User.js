import React, { useEffect, useState } from "react";
import "./user.css";
import axios from "axios";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const User = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching users...');
        const response = await axios.get("http://localhost:5000/api/external-users");
        console.log('Users fetched:', response.data);
        setUsers(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error while fetching data", error);
        setLoading(false);
        toast.error("Failed to fetch students", { position: "top-right" });
      }
    };
    fetchData();
  }, []);

  const deleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        console.log('Deleting user with ID:', userId);
        const response = await axios.delete(`http://localhost:5000/api/delete/external-user/${userId}`);
        console.log('Delete response:', response.data);
        
        setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
        toast.success("Student deleted successfully", { position: "top-right" });
      } catch (error) {
        console.error("Error deleting user:", error);
        if (error.response) {
          toast.error(error.response.data.message || "Failed to delete student", { position: "top-right" });
        } else {
          toast.error("Network error occurred", { position: "top-right" });
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="userTable">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="userTable">
      <div className="header">
        <h2>Student Management System</h2>
        <Link to="/external-crud/add" type="button" className="btn btn-primary">
          <i className="fa-solid fa-user-plus"></i> Add New Student
        </Link>
      </div>

      {users.length === 0 ? (
        <div className="no-users">
          <div className="empty-state">
            <i className="fa-solid fa-users fa-3x"></i>
            <p>No students found</p>
            <p>Click "Add New Student" to create the first student record.</p>
          </div>
        </div>
      ) : (
        <div className="table-container">
          <div className="table-info">
            <p>Total Students: <span className="count">{users.length}</span></p>
          </div>
          <table className="table table-bordered">
            <thead>
              <tr>
                <th scope="col">S.No.</th>
                <th scope="col">Name</th>
                <th scope="col">Email</th>
                <th scope="col">Student ID</th>
                <th scope="col">Course</th>
                <th scope="col">Year</th>
                <th scope="col">Phone</th>
                <th scope="col">Created Date</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => {
                return (
                  <tr key={user._id}>
                    <td>{index + 1}</td>
                    <td className="name-cell">
                      <div className="student-avatar">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span>{user.name}</span>
                    </td>
                    <td>{user.email}</td>
                    <td className="student-id">{user.studentId}</td>
                    <td><span className="course-badge">{user.course}</span></td>
                    <td><span className="year-badge">{user.year}</span></td>
                    <td>{user.phoneNumber}</td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="actionButtons">
                      <Link
                        to={`/external-crud/update/${user._id}`}
                        type="button"
                        className="btn btn-info"
                        title="Edit Student"
                      >
                        <i className="fa-solid fa-pen-to-square"></i>
                      </Link>

                      <button
                        onClick={() => deleteUser(user._id)}
                        type="button"
                        className="btn btn-danger"
                        title="Delete Student"
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default User;