import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AuditPortalProvider, useAuditPortal } from './context/AuditPortalContext';
import MobileContainer from './components/layout/MobileContainer';
import PortalLayout from './components/layout/PortalLayout';
import LoginForm from './components/auth/LoginForm';
import DashboardScreen from './components/screens/DashboardScreen';
import AuditListScreen from './components/screens/AuditListScreen';
import { ProductListScreen } from './components/screens/ProductListScreen';
import { ChecklistScreen } from './components/screens/ChecklistScreen';
import { OutcomeSheetScreen } from './components/screens/OutcomeSheetScreen';
import { FilteredAuditsScreen } from './components/screens/FilteredAuditsScreen';
import { MapScreen } from './components/screens/MapScreen';

function PortalScreenRouter() {
  const { activeScreen } = useAuditPortal();

  switch (activeScreen) {
    case 'DASHBOARD':
      return <DashboardScreen />;

    case 'AUDIT_LIST':
      return <AuditListScreen />;

    case 'PRODUCTS':
      return (
        <PortalLayout pageTitle="Product List">
          <ProductListScreen />
        </PortalLayout>
      );

    case 'ADD_CHECKLIST':
      return (
        <PortalLayout pageTitle="Check List">
          <ChecklistScreen mode="add" />
        </PortalLayout>
      );

    case 'VIEW_CHECKLIST':
      return (
        <PortalLayout pageTitle="View Check List">
          <ChecklistScreen mode="view" />
        </PortalLayout>
      );

    case 'ADD_OUTCOME':
      return (
        <PortalLayout pageTitle="Outcome Sheet" bgStyle="bg-[#D5FFD5]">
          <OutcomeSheetScreen mode="add" />
        </PortalLayout>
      );

    case 'VIEW_OUTCOME':
      return (
        <PortalLayout pageTitle="Audit Sheet List">
          <OutcomeSheetScreen mode="view" />
        </PortalLayout>
      );

    case 'PASSED_LIST':
      return (
        <PortalLayout pageTitle="Passed Audits">
          <FilteredAuditsScreen filterType="PASSED" />
        </PortalLayout>
      );

    case 'PENDING_LIST':
      return (
        <PortalLayout pageTitle="Pending">
          <FilteredAuditsScreen filterType="PENDING" />
        </PortalLayout>
      );

    case 'OTHER_FAILED_LIST':
      return (
        <PortalLayout pageTitle="Other Failed">
          <FilteredAuditsScreen filterType="OTHER_FAIL" />
        </PortalLayout>
      );

    case 'L3_LIST':
      return (
        <PortalLayout pageTitle="L3 List">
          <FilteredAuditsScreen filterType="L3_FAIL" />
        </PortalLayout>
      );

    case 'MAP':
      return (
        <PortalLayout pageTitle="Map">
          <MapScreen />
        </PortalLayout>
      );

    default:
      return <DashboardScreen />;
  }
}

function AppContent() {
  const { currentUser } = useAuth();

  if (currentUser) {
    return (
      <AuditPortalProvider>
        <PortalScreenRouter />
      </AuditPortalProvider>
    );
  }

  return (
    <MobileContainer>
      <LoginForm />
    </MobileContainer>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
}
