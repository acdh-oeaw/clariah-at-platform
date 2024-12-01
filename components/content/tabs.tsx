"use client";

import { Children, isValidElement, type ReactElement, type ReactNode } from "react";
import {
	Tab as AriaTab,
	TabList as AriaTabList,
	TabPanel as AriaTabPanel,
	Tabs as AriaTabs,
} from "react-aria-components";

interface TabsProps {
	children: ReactNode;
}

export function Tabs(props: Readonly<TabsProps>): ReactNode {
	const { children } = props;

	const tabs = getChildrenElements<TabProps>(children);

	return (
		<AriaTabs className="my-4">
			<AriaTabList className="flex flex-wrap items-center gap-x-4 border-b border-stroke-weak">
				{tabs.map((tab, index) => {
					const { title } = tab.props;

					const id = String(index);

					return (
						<AriaTab
							key={id}
							className="-mb-px cursor-default border-b-2 border-transparent py-3 transition selected:border-current selected:font-strong"
							id={id}
						>
							{title}
						</AriaTab>
					);
				})}
			</AriaTabList>

			{tabs.map((tab, index) => {
				const { children } = tab.props;

				const id = String(index);

				return (
					<AriaTabPanel key={id} className="grid" id={id}>
						{children}
					</AriaTabPanel>
				);
			})}
		</AriaTabs>
	);
}

interface TabProps {
	children: ReactNode;
	title: string;
}

export function Tab(_props: Readonly<TabProps>): ReactNode {
	return null;
}

function getChildrenElements<TProps>(children: ReactNode): Array<ReactElement<TProps>> {
	return Children.toArray(children).filter(isValidElement<TProps>);
}
