"use client";

import { cn } from "@acdh-oeaw/style-variants";
import { LaptopIcon, MoonIcon, SunIcon } from "lucide-react";
import type { Key, ReactNode } from "react";
import { Button, ListBox, ListBoxItem, Popover, Select, SelectValue } from "react-aria-components";

import type { ColorScheme } from "@/lib/color-scheme-script";
import { useColorScheme } from "@/lib/use-color-scheme";

interface ColorSchemeSelectProps {
	items: Record<ColorScheme | "system", string>;
	label: string;
}

export function ColorSchemeSelect(props: Readonly<ColorSchemeSelectProps>): ReactNode {
	const { items, label } = props;

	const { colorSchemeState, setColorScheme } = useColorScheme();

	function onSelectionChange(key: Key) {
		const value = key as keyof ColorSchemeSelectProps["items"];

		setColorScheme(value === "system" ? null : value);
	}

	const selectedKey = colorSchemeState.kind === "system" ? "system" : colorSchemeState.colorScheme;

	const icons = {
		dark: MoonIcon,
		light: SunIcon,
		system: LaptopIcon,
	};

	const Icon = icons[colorSchemeState.colorScheme];

	return (
		<Select
			aria-label={label}
			name="color-scheme"
			onSelectionChange={onSelectionChange}
			selectedKey={selectedKey}
		>
			<Button
				className={cn(
					"grid place-content-center rounded-2 p-3",
					"interactive focus-visible:focus-outline focus-visible:focus-outline-offset-0 hover:hover-overlay pressed:press-overlay",
				)}
			>
				<Icon aria-hidden={true} className="size-6 shrink-0 text-icon-neutral" />
				<SelectValue className="sr-only" />
			</Button>
			<Popover
				className={cn(
					"min-w-[var(--trigger-width)] rounded-2 border border-stroke-weak bg-background-overlay shadow-overlay",
					"placement-bottom:translate-y-1 placement-bottom:slide-in-from-top-2 entering:animate-in entering:fade-in-0 exiting:animate-out exiting:fade-out-0 exiting:zoom-out-95",
				)}
				placement="bottom"
			>
				<ListBox className="max-h-[inherit] min-w-40 overflow-auto py-2">
					{Object.entries(items).map(([id, label]) => {
						const Icon = icons[id as keyof typeof items];

						return (
							<ListBoxItem
								key={id}
								className={cn(
									"relative flex cursor-default select-none items-center gap-x-3 px-4 py-3 text-small text-text-strong",
									"interactive focus-visible:focus-outline focus-visible:-focus-outline-offset-2 hover:hover-overlay pressed:press-overlay selected:hover-overlay selected:select-overlay",
								)}
								id={id}
								textValue={label}
							>
								<Icon aria-hidden={true} className="size-5 text-icon-neutral" />
								{label}
							</ListBoxItem>
						);
					})}
				</ListBox>
			</Popover>
		</Select>
	);
}
