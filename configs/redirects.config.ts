import type { NextConfig } from "next";

import { legacyRedirects } from "#/configs/legacy-redirects.config.ts";

type Redirects = Awaited<ReturnType<NonNullable<NextConfig["redirects"]>>>;

export const redirects: Redirects = [...legacyRedirects];
