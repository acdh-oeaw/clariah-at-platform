import type { ReactNode } from "react";

const dataAttribute = "uiColorScheme";
const storageKey = "ui-color-scheme";

export function ColorSchemeScript(): ReactNode {
	return (
		<script
			dangerouslySetInnerHTML={{
				__html: `(${String(createColorSchemeScript)})("${dataAttribute}", "${storageKey}");`,
			}}
			defer={true}
			id="color-scheme-script"
		/>
	);
}

export type ColorScheme = "dark" | "light";

export type ColorSchemeState =
	| { kind: "system"; colorScheme: ColorScheme }
	| { kind: "user"; colorScheme: ColorScheme };

declare global {
	interface Window {
		__colorScheme: {
			get: () => ColorSchemeState;
			set: (colorScheme: ColorScheme | null) => void;
			subscribe: (listener: () => void) => () => void;
			sync: () => void;
		};
	}
}

function createColorSchemeScript(dataAttribute: string, storageKey: string): void {
	function isValidColorScheme(value: string): value is ColorScheme {
		return value === "dark" || value === "light";
	}

	const storage = {
		get(): string | null {
			try {
				return window.localStorage.getItem(storageKey);
			} catch {
				return null;
			}
		},
		set(value: string | null): void {
			try {
				if (value == null) {
					window.localStorage.removeItem(storageKey);
				} else {
					window.localStorage.setItem(storageKey, value);
				}
			} catch {
				/** noop */
			}
		},
	};

	const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

	function setDataAttribute(colorScheme: ColorScheme): void {
		document.documentElement.dataset[dataAttribute] = colorScheme;
	}

	const userColorScheme = {
		get(): ColorScheme | null {
			const value = storage.get();
			if (value != null && isValidColorScheme(value)) {
				return value;
			}
			return null;
		},
		set(value: string | null): void {
			if (value != null && isValidColorScheme(value)) {
				storage.set(value);
			} else {
				storage.set(null);
			}
		},
	};

	const systemColorScheme = {
		get(): ColorScheme {
			return mediaQuery.matches ? "dark" : "light";
		},
	};

	const colorSchemeState = {
		get(): ColorSchemeState {
			const colorScheme = userColorScheme.get();
			if (colorScheme) {
				return { kind: "user", colorScheme };
			} else {
				return { kind: "system", colorScheme: systemColorScheme.get() };
			}
		},
	};

	function disableTransitions() {
		const element = document.createElement("style");
		element.append(
			document.createTextNode("*, *::before, *::after { transition: none !important; }"),
		);
		document.head.append(element);

		return function enableTransitions() {
			window.requestAnimationFrame(() => {
				element.remove();
			});
		};
	}

	let cachedColorSchemeState: ColorSchemeState;

	function update(shouldDisableTransitions = true) {
		const state = colorSchemeState.get();
		cachedColorSchemeState = state;
		const enableTransitions = shouldDisableTransitions ? disableTransitions() : null;
		setDataAttribute(state.colorScheme);
		onUpdate();
		enableTransitions?.();
	}

	const listeners = new Set<() => void>();

	function subscribe(listener: () => void) {
		listeners.add(listener);

		return () => {
			listeners.delete(listener);
		};
	}

	function onUpdate() {
		listeners.forEach((listener) => {
			listener();
		});
	}

	mediaQuery.addEventListener("change", () => {
		update();
	});

	window.addEventListener("storage", (event) => {
		if (event.key === storageKey && event.storageArea === window.localStorage) {
			const colorScheme = event.newValue;
			userColorScheme.set(colorScheme);
			update();
		}
	});

	window.__colorScheme = {
		get(): ColorSchemeState {
			return cachedColorSchemeState;
		},
		set(colorScheme: ColorScheme | null): void {
			userColorScheme.set(colorScheme);
			update();
		},
		subscribe(listener: () => void): () => void {
			return subscribe(listener);
		},
		sync(): void {
			setDataAttribute(cachedColorSchemeState.colorScheme);
		},
	};

	update(false);
}
