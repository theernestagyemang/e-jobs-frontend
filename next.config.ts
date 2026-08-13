import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This app lives inside the (Vite) e-jobs_front_end repo; pin the root so
  // Turbopack does not walk up and infer a lockfile outside the project.
  turbopack: { root: __dirname },
};

export default nextConfig;
