import { Suspense, lazy } from "react";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { AnalyticsScripts } from "@/components/analytics/AnalyticsScripts";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Spinner } from "@/components/ui/spinner";
import { MarketingLayout } from "@/layouts/MarketingLayout";
import { AppLayout } from "@/layouts/AppLayout";
import { NotFoundPage } from "@/pages/NotFoundPage";

// Eager load critical pages
import { HomePage } from "@/pages/marketing/HomePage";
import { AppHomePage } from "@/pages/app/AppHomePage";
import { AppLoginPage } from "@/pages/app/AppLoginPage";

// Lazy load secondary pages
const PricingPage = lazy(() =>
  import("@/pages/marketing/PricingPage").then((m) => ({
    default: m.PricingPage,
  })),
);
const GetStartedPage = lazy(() =>
  import("@/pages/marketing/GetStartedPage").then((m) => ({
    default: m.GetStartedPage,
  })),
);
const ProductRpaPage = lazy(() =>
  import("@/pages/marketing/ProductRpaPage").then((m) => ({
    default: m.ProductRpaPage,
  })),
);
const ProductWebScrapingPage = lazy(() =>
  import("@/pages/marketing/ProductWebScrapingPage").then((m) => ({
    default: m.ProductWebScrapingPage,
  })),
);
const ProductRemoteSupportPage = lazy(() =>
  import("@/pages/marketing/ProductRemoteSupportPage").then((m) => ({
    default: m.ProductRemoteSupportPage,
  })),
);
const UseCasesIndexPage = lazy(() =>
  import("@/pages/marketing/UseCasesIndexPage").then((m) => ({
    default: m.UseCasesIndexPage,
  })),
);
const UseCaseAmazonSellersPage = lazy(() =>
  import("@/pages/marketing/use-cases/UseCaseAmazonSellersPage").then((m) => ({
    default: m.UseCaseAmazonSellersPage,
  })),
);
const UseCaseDataCollectionPage = lazy(() =>
  import("@/pages/marketing/use-cases/UseCaseDataCollectionPage").then((m) => ({
    default: m.UseCaseDataCollectionPage,
  })),
);
const UseCaseEnterpriseItPage = lazy(() =>
  import("@/pages/marketing/use-cases/UseCaseEnterpriseItPage").then((m) => ({
    default: m.UseCaseEnterpriseItPage,
  })),
);
const CompareAnyDeskPage = lazy(() =>
  import("@/pages/marketing/compare/CompareAnyDeskPage").then((m) => ({
    default: m.CompareAnyDeskPage,
  })),
);
const CompareChromeRemoteDesktopPage = lazy(() =>
  import("@/pages/marketing/compare/CompareChromeRemoteDesktopPage").then(
    (m) => ({ default: m.CompareChromeRemoteDesktopPage }),
  ),
);
const CompareOctoparsePage = lazy(() =>
  import("@/pages/marketing/compare/CompareOctoparsePage").then((m) => ({
    default: m.CompareOctoparsePage,
  })),
);
const CompareParsehubPage = lazy(() =>
  import("@/pages/marketing/compare/CompareParsehubPage").then((m) => ({
    default: m.CompareParsehubPage,
  })),
);
const CompareTeamViewerPage = lazy(() =>
  import("@/pages/marketing/compare/CompareTeamViewerPage").then((m) => ({
    default: m.CompareTeamViewerPage,
  })),
);
const BlogIndexPage = lazy(() =>
  import("@/pages/marketing/BlogIndexPage").then((m) => ({
    default: m.BlogIndexPage,
  })),
);
const BlogCategoryPage = lazy(() =>
  import("@/pages/marketing/blog/BlogCategoryPage").then((m) => ({
    default: m.BlogCategoryPage,
  })),
);
const ResourcesGuidesPage = lazy(() =>
  import("@/pages/marketing/resources/ResourcesGuidesPage").then((m) => ({
    default: m.ResourcesGuidesPage,
  })),
);
const ResourcesDocumentationPage = lazy(() =>
  import("@/pages/marketing/resources/ResourcesDocumentationPage").then(
    (m) => ({ default: m.ResourcesDocumentationPage }),
  ),
);
const ResourcesApiReferencePage = lazy(() =>
  import("@/pages/marketing/resources/ResourcesApiReferencePage").then((m) => ({
    default: m.ResourcesApiReferencePage,
  })),
);
const ResourcesVideoTutorialsPage = lazy(() =>
  import("@/pages/marketing/resources/ResourcesVideoTutorialsPage").then(
    (m) => ({ default: m.ResourcesVideoTutorialsPage }),
  ),
);
const PrivacyPage = lazy(() =>
  import("@/pages/legal/PrivacyPage").then((m) => ({ default: m.PrivacyPage })),
);
const TermsPage = lazy(() =>
  import("@/pages/legal/TermsPage").then((m) => ({ default: m.TermsPage })),
);
const DevicesPage = lazy(() =>
  import("@/pages/app/DevicesPage").then((m) => ({ default: m.DevicesPage })),
);
const SessionPage = lazy(() =>
  import("@/pages/app/SessionPage").then((m) => ({ default: m.SessionPage })),
);

const LoadingFallback = () => (
  <div className="flex min-h-[400px] items-center justify-center">
    <Spinner size="lg" />
  </div>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <MarketingLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: "product/rpa-automation",
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ProductRpaPage />
          </Suspense>
        ),
      },
      {
        path: "product/web-scraping",
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ProductWebScrapingPage />
          </Suspense>
        ),
      },
      {
        path: "product/remote-support",
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ProductRemoteSupportPage />
          </Suspense>
        ),
      },
      {
        path: "pricing",
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <PricingPage />
          </Suspense>
        ),
      },
      {
        path: "use-cases",
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <UseCasesIndexPage />
          </Suspense>
        ),
      },
      {
        path: "use-cases/amazon-sellers",
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <UseCaseAmazonSellersPage />
          </Suspense>
        ),
      },
      {
        path: "use-cases/data-collection",
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <UseCaseDataCollectionPage />
          </Suspense>
        ),
      },
      {
        path: "use-cases/enterprise-it",
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <UseCaseEnterpriseItPage />
          </Suspense>
        ),
      },
      {
        path: "compare/teamviewer-alternative",
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <CompareTeamViewerPage />
          </Suspense>
        ),
      },
      {
        path: "compare/anydesk-alternative",
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <CompareAnyDeskPage />
          </Suspense>
        ),
      },
      {
        path: "compare/chrome-remote-desktop-alternative",
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <CompareChromeRemoteDesktopPage />
          </Suspense>
        ),
      },
      {
        path: "compare/parsehub-alternative",
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <CompareParsehubPage />
          </Suspense>
        ),
      },
      {
        path: "compare/octoparse-alternative",
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <CompareOctoparsePage />
          </Suspense>
        ),
      },
      {
        path: "blog",
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <BlogIndexPage />
          </Suspense>
        ),
      },
      {
        path: "blog/category/:slug",
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <BlogCategoryPage />
          </Suspense>
        ),
      },
      {
        path: "resources/guides",
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ResourcesGuidesPage />
          </Suspense>
        ),
      },
      {
        path: "resources/documentation",
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ResourcesDocumentationPage />
          </Suspense>
        ),
      },
      {
        path: "resources/api-reference",
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ResourcesApiReferencePage />
          </Suspense>
        ),
      },
      {
        path: "resources/video-tutorials",
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ResourcesVideoTutorialsPage />
          </Suspense>
        ),
      },
      {
        path: "get-started",
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <GetStartedPage />
          </Suspense>
        ),
      },
      { path: "trial", element: <Navigate to="/get-started" replace /> },
      {
        path: "privacy",
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <PrivacyPage />
          </Suspense>
        ),
      },
      {
        path: "terms",
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <TermsPage />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: "/app",
    element: <AppLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <AppHomePage /> },
      { path: "login", element: <AppLoginPage /> },
      {
        path: "devices",
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <DevicesPage />
          </Suspense>
        ),
      },
      {
        path: "sessions/:id",
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <SessionPage />
          </Suspense>
        ),
      },
      { path: "*", element: <Navigate to="/app" replace /> },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);

export default function App() {
  return (
    <ErrorBoundary>
      <AnalyticsScripts />
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}
