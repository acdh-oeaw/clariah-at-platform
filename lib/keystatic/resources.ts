import "server-only";

import { createReaders } from "@acdh-oeaw/keystatic-lib/reader";
import { cache } from "react";

import config from "@/keystatic.config";
import { compileMdx } from "@/lib/compile-mdx";

const {
	createCollectionResource: _createCollectionResource,
	createSingletonResource: _createSingletonResource,
} = createReaders(config, compileMdx);

export const createCollectionResource = cache(_createCollectionResource);
export const createSingletonResource = cache(_createSingletonResource);
