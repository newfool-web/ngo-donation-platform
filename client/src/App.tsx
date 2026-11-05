import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LangProvider } from './context/LangContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import SchemesPage from './pages/SchemesPage';
import SchemeDetailPage from './pages/SchemeDetailPage';
import EligibilityPage from './pages/EligibilityPage';
import DonatePage from './pages/DonatePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DonorDashboard from './pages/DonorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminSchemesPage from './pages/AdminSchemesPage';
import AdminCampaignsPage from './pages/AdminCampaignsPage';

export default function App() {
  return (
    <BrowserRouter>
      <LangProvider>
        <AuthProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/schemes" element={<SchemesPage />} />
              <Route path="/schemes/:id" element={<SchemeDetailPage />} />
              <Route path="/eligibility" element={<EligibilityPage />} />
              <Route path="/donate" element={<DonatePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/dashboard" element={
                <ProtectedRoute role="DONOR"><DonorDashboard /></ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>
              } />
              <Route path="/admin/schemes" element={
                <ProtectedRoute role="ADMIN"><AdminSchemesPage /></ProtectedRoute>
              } />
              <Route path="/admin/campaigns" element={
                <ProtectedRoute role="ADMIN"><AdminCampaignsPage /></ProtectedRoute>
              } />
            </Route>
          </Routes>
        </AuthProvider>
      </LangProvider>
    </BrowserRouter>
  );
}
