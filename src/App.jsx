import React, { Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, useParams } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { SessionProvider } from '@/components/hooks/useSession';
import TenancyBridge from '@/components/api/TenancyBridge';

const RouteFallback = ({ label = 'Loading…' }) => (
  <div className="fixed inset-0 flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      <div className="text-sm text-slate-500">{label}</div>
    </div>
  </div>
);

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

// Case-insensitive / legacy route support.
// Base44 historically generated PascalCase page routes (e.g. /Dashboard).
// Our feature registry (and command palette) may use lowercase routes (e.g. /dashboard).
// This adapter preserves all deep links without duplicating 40+ Route entries.
const DynamicPageRoute = ({ fallbackLabel = 'Loading page…' }) => {
  const { pageName } = useParams();
  const seg = (pageName || '').trim();
  const matchKey = Object.keys(Pages).find((k) => k.toLowerCase() === seg.toLowerCase());
  if (!matchKey) return <PageNotFound />;
  const Page = Pages[matchKey];
  return (
    <LayoutWrapper currentPageName={matchKey}>
      <Suspense fallback={<RouteFallback label={fallbackLabel} />}>
        <Page />
      </Suspense>
    </LayoutWrapper>
  );
};

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // IMPORTANT: storefront routes must be guest-safe when the app is configured to allow public access.
      // If the backend/app settings currently require auth, show a friendly gate instead of an infinite redirect.
      const pathname = window.location.pathname || '';
      const isStorefront = pathname.startsWith('/s/');
      if (!isStorefront) {
        navigateToLogin();
        return null;
      }
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-md w-full rounded-2xl border border-border bg-background/70 p-6 text-center">
            <div className="text-lg font-semibold">Public storefront is currently locked</div>
            <div className="mt-2 text-sm text-muted-foreground">
              This app appears to be configured to require authentication for all requests.
              To allow guests to browse school landing pages, enable public browsing in the app settings,
              or sign in to continue.
            </div>
            <div className="mt-4">
              <button
                onClick={() => navigateToLogin()}
                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
              >
                Sign in
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  // Render the main app
  return (
    <Routes>
        {/* Canonical quiz routes (v9.0) */}
        <Route path="/my-quizzes" element={<Pages.MyQuizzes />} />
        <Route path="/quiz/:quizId" element={<Pages.QuizTake />} />
        <Route path="/teach/quizzes" element={<Pages.TeachQuizzes />} />
        <Route path="/teach/quizzes/new" element={<Pages.TeachQuizEditor />} />
        <Route path="/teach/quizzes/:quizId" element={<Pages.TeachQuizEditor />} />
      <Route path="/" element={
        <LayoutWrapper currentPageName={mainPageKey}>
          <Suspense fallback={<RouteFallback label="Loading dashboard…" />}>
            <MainPage />
          </Suspense>
        </LayoutWrapper>
      } />
      {Object.entries(Pages).map(([path, Page]) => (
        <Route
          key={path}
          path={`/${path}`}
          element={
            <LayoutWrapper currentPageName={path}>
              <Suspense fallback={<RouteFallback label="Loading page…" />}>
                <Page />
              </Suspense>
            </LayoutWrapper>
          }
        />
      ))}

      {/* Canonical Teachable/Kajabi-style storefront routes (guest-safe) */}
      <Route path="/s/:schoolSlug" element={
        <LayoutWrapper currentPageName="SchoolLanding">
          <Suspense fallback={<RouteFallback label="Loading school…" />}>
            {Pages.SchoolLanding ? <Pages.SchoolLanding /> : <PageNotFound />}
          </Suspense>
        </LayoutWrapper>
      } />
      <Route path="/s/:schoolSlug/courses" element={
        <LayoutWrapper currentPageName="SchoolCourses">
          <Suspense fallback={<RouteFallback label="Loading catalog…" />}>
            {Pages.SchoolCourses ? <Pages.SchoolCourses /> : <PageNotFound />}
          </Suspense>
        </LayoutWrapper>
      } />
      <Route path="/s/:schoolSlug/course/:courseId" element={
        <LayoutWrapper currentPageName="CourseSales">
          <Suspense fallback={<RouteFallback label="Loading course…" />}>
            {Pages.CourseSales ? <Pages.CourseSales /> : <PageNotFound />}
          </Suspense>
        </LayoutWrapper>
      } />
      <Route path="/s/:schoolSlug/pricing" element={
        <LayoutWrapper currentPageName="SchoolPricing">
          <Suspense fallback={<RouteFallback label="Loading pricing…" />}>
            {Pages.SchoolPricing ? <Pages.SchoolPricing /> : <PageNotFound />}
          </Suspense>
        </LayoutWrapper>
      } />
      <Route path="/s/:schoolSlug/checkout" element={
        <LayoutWrapper currentPageName="SchoolCheckout">
          <Suspense fallback={<RouteFallback label="Loading checkout…" />}>
            {Pages.SchoolCheckout ? <Pages.SchoolCheckout /> : <PageNotFound />}
          </Suspense>
        </LayoutWrapper>
      } />
      <Route path="/s/:schoolSlug/thank-you" element={
        <LayoutWrapper currentPageName="SchoolThankYou">
          <Suspense fallback={<RouteFallback label="Loading…" />}>
            {Pages.SchoolThankYou ? <Pages.SchoolThankYou /> : <PageNotFound />}
          </Suspense>
        </LayoutWrapper>
      } />
      <Route path="/s/:schoolSlug/certificate/:certificateId" element={
        <LayoutWrapper currentPageName="CertificateVerify">
          <Suspense fallback={<RouteFallback label="Verifying certificate…" />}>
            {Pages.CertificateVerify ? <Pages.CertificateVerify /> : <PageNotFound />}
          </Suspense>
        </LayoutWrapper>
      } />

      {/* Lowercase / legacy aliases like /dashboard, /vault, /integrity, etc. */}
      <Route path="/:pageName" element={<DynamicPageRoute />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <SessionProvider>
        <TenancyBridge />
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <NavigationTracker />
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </SessionProvider>
    </AuthProvider>
  )
}

export default App
