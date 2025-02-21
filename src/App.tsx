import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthForm } from './components/AuthForm';
import { ClientDashboard } from './components/ClientDashboard';
import { TrainerDashboard } from './components/TrainerDashboard';
import { ClientProfile } from './components/ClientProfile';
import { ExercisesView } from './components/ExercisesView';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* Публичные маршруты */}
        <Route path="/login" element={<AuthForm />} />

        {/* Маршруты для клиентов */}
        <Route path="/client" element={
          <ProtectedRoute allowedRole="client">
            <ClientDashboard />
          </ProtectedRoute>
        } />

        {/* Маршруты для тренеров */}
        <Route path="/trainer" element={
          <ProtectedRoute allowedRole="trainer">
            <TrainerDashboard defaultView="calendar" />
          </ProtectedRoute>
        } />
        <Route path="/trainer/clients" element={
          <ProtectedRoute allowedRole="trainer">
            <TrainerDashboard defaultView="clients" />
          </ProtectedRoute>
        } />
        <Route path="/trainer/calendar" element={
          <ProtectedRoute allowedRole="trainer">
            <TrainerDashboard defaultView="calendar" />
          </ProtectedRoute>
        } />
        <Route path="/trainer/clients/:clientId" element={
          <ProtectedRoute allowedRole="trainer">
            <ClientProfile />
          </ProtectedRoute>
        } />
        <Route path="/trainer/exercises" element={
          <ProtectedRoute allowedRole="trainer">
            <ExercisesView />
          </ProtectedRoute>
        } />

        {/* Редирект с корневого маршрута */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;