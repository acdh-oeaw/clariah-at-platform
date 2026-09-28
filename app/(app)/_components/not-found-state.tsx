import type { ReactNode } from "react";

import { Main } from "#/components/main.tsx";

interface NotFoundStateProps {
	codeLabel: string;
	description: string;
	homeHref: string;
	homeLabel: string;
	logoLabel: string;
	title: string;
}

export function NotFoundState(props: Readonly<NotFoundStateProps>): ReactNode {
	const { codeLabel, description, title } = props;

	return (
		<Main className="relative isolate flex items-center justify-center overflow-hidden px-6 py-10 min-block-full sm:px-8">
			<div
				aria-hidden={true}
				className="absolute inset-s-1/2 inset-bs-0 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl block-80 inline-2xl"
			/>
			<div
				aria-hidden={true}
				className="absolute inset-s-0 inset-be-0 rounded-full bg-secondary/70 blur-3xl block-72 inline-72"
			/>

			<section className="relative overflow-hidden border border-border/70 bg-bg/90 shadow-lg shadow-black/5 backdrop-blur-sm inline-full max-inline-3xl">
				<div className="absolute inset-x-0 inset-bs-0 bg-linear-to-r from-primary/10 via-primary/70 to-primary/10 block-1" />

				<div className="grid gap-8 p-8 sm:p-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12 lg:p-12">
					<div className="flex flex-col gap-6">
						<div className="space-y-3">
							<p className="text-sm font-medium tracking-[0.24em] text-primary-subtle-fg uppercase">{codeLabel}</p>
							<h1 className="text-3xl font-semibold text-balance max-inline-lg sm:text-4xl">{title}</h1>
							<p className="text-base text-muted-fg max-inline-xl sm:text-lg">{description}</p>
						</div>
					</div>
				</div>
			</section>
		</Main>
	);
}
