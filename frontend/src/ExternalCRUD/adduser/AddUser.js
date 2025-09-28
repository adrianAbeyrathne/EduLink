import React, { useState } from "react";
import "./adduser.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const AddUser = () => {
  const initialUser = {
    name: "",
    email: "",
    studentId: "",
    course: "",
    year: "",
    phoneNumber: ""
  };
  
  const [user, setUser] = useState(initialUser);
  const navigate = useNavigate();

  const courses = [
    'Computer Science', 'Engineering', 'Mathematics', 'Physics', 
    'Chemistry', 'Biology', 'Business', 'Arts', 'Medicine', 'Law'
  ];

  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate'];

  const inputHandler = (e) => {
    const { name, value } = e.target;
    console.log(name, value);
    setUser({ ...user, [name]: value });
  };

  const submitForm = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!user.name || !user.email || !user.studentId || !user.course || !user.year || !user.phoneNumber) {
      toast.error('Please fill in all fields', { position: "top-right" });
      return;
    }

    try {
      console.log('Submitting user data:', user);
      const response = await axios.post("http://localhost:5000/api/external-user", user);
      console.log('Response received:', response);
      
      toast.success("Student added successfully!", { position: "top-right" });
      setUser(initialUser); // Reset form
      navigate("/external-crud");
    } catch (error) {
      console.error('Full error:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        toast.error(error.response.data.message || "Failed to create student", { position: "top-right" });
      } else if (error.request) {
        console.error('No response received:', error.request);
        toast.error("No response from server. Please check if the server is running.", { position: "top-right" });
      } else {
        console.error('Error setting up request:', error.message);
        toast.error("Network error occurred", { position: "top-right" });
      }
    }
  };

  return (
    <div className="addUser">
      <Link to="/external-crud" type="button" className="btn btn-secondary">
        <i className="fa-solid fa-backward"></i> Back
      </Link>

      <h3>Add New Student</h3>
      <form className="addUserForm" onSubmit={submitForm}>
        <div className="inputGroup">
          <label htmlFor="name">Full Name:</label>
          <input
            type="text"
            id="name"
            onChange={inputHandler}
            name="name"
            value={user.name}
            autoComplete="off"
            placeholder="Enter student's full name"
            required
          />
        </div>
        
        <div className="inputGroup">
          <label htmlFor="email">Email Address:</label>
          <input
            type="email"
            id="email"
            onChange={inputHandler}
            name="email"
            value={user.email}
            autoComplete="off"
            placeholder="Enter email address"
            required
          />
        </div>
        
        <div className="inputGroup">
          <label htmlFor="studentId">Student ID:</label>
          <input
            type="text"
            id="studentId"
            onChange={inputHandler}
            name="studentId"
            value={user.studentId}
            autoComplete="off"
            placeholder="Enter student ID"
            required
          />
        </div>
        
        <div className="inputGroup">
          <label htmlFor="course">Course:</label>
          <select
            id="course"
            name="course"
            value={user.course}
            onChange={inputHandler}
            required
          >
            <option value="">Select a course</option>
            {courses.map((course, index) => (
              <option key={index} value={course}>{course}</option>
            ))}
          </select>
        </div>
        
        <div className="inputGroup">
          <label htmlFor="year">Academic Year:</label>
          <select
            id="year"
            name="year"
            value={user.year}
            onChange={inputHandler}
            required
          >
            <option value="">Select year</option>
            {years.map((year, index) => (
              <option key={index} value={year}>{year}</option>
            ))}
          </select>
        </div>
        
        <div className="inputGroup">
          <label htmlFor="phoneNumber">Phone Number:</label>
          <input
            type="tel"
            id="phoneNumber"
            onChange={inputHandler}
            name="phoneNumber"
            value={user.phoneNumber}
            autoComplete="off"
            placeholder="Enter phone number"
            required
          />
        </div>
        
        <div className="inputGroup">
          <button type="submit" className="btn btn-primary submit-btn">
            Add Student
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUser;