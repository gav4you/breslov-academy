import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PortalGate from '@/components/routing/PortalGate';
import PortalPageResolver from '@/portals/shared/PortalPageResolver';
import AdminLayout from './AdminLayout';

export default function AdminPortal() {
  return (
    <PortalGate
      portalPrefix="/admin"
      intendedAudience="admin"
      allowedAudiences={['admin']}
    >
      <AdminLayout>
        <Routes>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="features" element={<PortalPageResolver portalHome="dashboard" audience="admin" pageKeyOverride="SchoolFeatures" />} />
          <Route path="integrations" element={<PortalPageResolver portalHome="dashboard" audience="admin" pageKeyOverride="IntegrationsMarketplace" />} />
          <Route path="integrations/:appId" element={<PortalPageResolver portalHome="dashboard" audience="admin" pageKeyOverride="IntegrationDetail" />} />
          <Route path="teach/quizzes" element={<PortalPageResolver portalHome="dashboard" audience="admin" pageKeyOverride="TeachQuizzes" />} />
          <Route path="teach/quizzes/new" element={<PortalPageResolver portalHome="dashboard" audience="admin" pageKeyOverride="TeachQuizEditor" />} />
          <Route path="teach/quizzes/:quizId" element={<PortalPageResolver portalHome="dashboard" audience="admin" pageKeyOverride="TeachQuizEditor" />} />
          <Route path="teach/grading" element={<PortalPageResolver portalHome="dashboard" audience="admin" pageKeyOverride="TeachGrading" />} />
          <Route path="quiz/:quizId" element={<PortalPageResolver portalHome="dashboard" audience="admin" pageKeyOverride="QuizTake" />} />
          <Route path=":pageName" element={<PortalPageResolver portalHome="dashboard" audience="admin" />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </AdminLayout>
    </PortalGate>
  );
}
