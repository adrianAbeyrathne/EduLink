import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './Components/ProtectedRoute';
import HomePage from "./pages/HomePage";
import UserManagementPage from "./pages/UserManagementPage";
import OnboardingPage from "./pages/OnboardingPage";
import DashboardPage from "./pages/DashboardPage";
import HelpPage from "./pages/HelpPage";
import AcademicsPage from "./pages/AcademicsPage";
import SessionsPage from "./pages/SessionsPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import CoursesPage from "./pages/CoursesPage";
import SignIn from "./Components/auth/SignIn";
import SignUp from "./Components/auth/SignUp";
import UserProfilePage from "./pages/UserProfilePage";
import ProfilePage from "./pages/ProfilePage";
import ResetPassword from "./Components/auth/ResetPassword";
import GoogleCallback from "./Components/auth/GoogleCallback";
import TwoFactorAuth from "./Components/auth/TwoFactorAuth";

// Import External CRUD components
import ExternalUserList from "./ExternalCRUD/getuser/User";
import AddExternalUser from "./ExternalCRUD/adduser/AddUser";
import UpdateExternalUser from "./ExternalCRUD/updateuser/Update";

function App() {
  return (
    <AuthProvider>
      <div className="font-sans antialiased text-gray-900">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/mainhome" element={<HomePage />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/user-management" element={
            <ProtectedRoute>
              <UserManagementPage />
            </ProtectedRoute>
          } />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/academics" element={<AcademicsPage />} />
          <Route path="/sessions" element={<SessionsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:courseId" element={<CoursesPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/auth/callback" element={<GoogleCallback />} />
          <Route path="/auth/2fa" element={<TwoFactorAuth />} />
          
          {/* Admin-only user management */}
          <Route path="/external-crud" element={
            <ProtectedRoute requireRole="admin">
              <UserManagementPage />
            </ProtectedRoute>
          } />
          
          {/* Keep old CRUD routes for reference/backup */}
          <Route path="/old-external-crud" element={<ExternalUserList />} />
          <Route path="/old-external-crud/add" element={<AddExternalUser />} />
          <Route path="/old-external-crud/update/:id" element={<UpdateExternalUser />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
