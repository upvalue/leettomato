import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createRouter,
  createRoute,
  createRootRoute,
  RouterProvider,
  Outlet,
  Link,
} from "@tanstack/react-router";
import { HomePage } from "./routes/index";
import { ProblemPage } from "./routes/problem/$id.index";
import { ResultPage } from "./routes/problem/$id.result";
import { SmokePage } from "./routes/smoke";
import "./index.css";

const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-bg-main text-fg-main">
      <header className="border-b border-border bg-bg-surface/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-tn-blue to-tn-purple flex items-center justify-center text-bg-main font-bold text-sm">
            Q
          </div>
          <Link to="/" className="text-lg font-bold text-fg-bright hover:text-tn-blue transition-colors">
            LeetTomato Quiz
          </Link>
          <span className="text-xs text-fg-muted ml-auto">LLM-graded practice</span>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const problemRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/problem/$id",
  component: ProblemPage,
});

const resultRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/problem/$id/result",
  component: ResultPage,
});

const smokeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/smoke",
  component: SmokePage,
});

const routeTree = rootRoute.addChildren([indexRoute, problemRoute, resultRoute, smokeRoute]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
