import type { Metadata, ResolvingMetadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { Image } from "@/components/image";
import { MainContent } from "@/components/main-content";
import type { Locale } from "@/config/i18n.config";

interface AboutPageProps {
	params: {
		locale: Locale;
	};
}

export async function generateMetadata(
	props: Readonly<AboutPageProps>,
	_parent: ResolvingMetadata,
): Promise<Metadata> {
	const { params } = props;

	const { locale } = params;

	const t = await getTranslations({ locale, namespace: "AboutPage" });

	const metadata: Metadata = {
		title: t("meta.title"),
	};

	return metadata;
}

export default async function AboutPage(props: Readonly<AboutPageProps>): Promise<ReactNode> {
	const { params } = props;

	const { locale } = params;

	setRequestLocale(locale);

	const t = await getTranslations("AboutPage");

	return (
		<MainContent className="layout-grid content-start">
			<section className="layout-subgrid relative bg-fill-weaker py-16 xs:py-20">
				<div className="max-w-text grid gap-y-4">
					<h1 className="text-balance font-heading text-heading-1 font-strong text-text-strong">
						{t("title")}
					</h1>
					<p className="font-heading text-small text-text-weak xs:text-heading-4">
						Veniam adipisicing ut consectetur do esse. Non consequat pariatur eiusmod dolor aliquip
						officia voluptate ut aliquip enim anim duis dolore. Labore aute magna officia ullamco
						adipisicing aute laboris sunt nulla voluptate adipisicing non.
					</p>
				</div>
			</section>

			<section className="layout-subgrid typography content-max-w-text relative border-t border-stroke-weak py-16 xs:py-20">
				<h2>Lorem Ipsum Dolor Sit Amet</h2>
				<p>
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque vehicula metus nec erat
					facilisis, a dapibus nisl lacinia. Praesent fermentum, risus in fermentum faucibus, neque
					lorem scelerisque ipsum, id <a href="https://example.org">convallis libero justo</a> nec
					lorem.
				</p>
				<figure>
					<Image
						alt=""
						height={400}
						/** Preload image because it's the largest contentful paint (lcp) element. */
						priority={true}
						src="https://picsum.photos/600/400"
						unoptimized={true}
						width={600}
					/>
					<figcaption>Mollit officia aliqua dolore ipsum.</figcaption>
				</figure>
				<p>
					Donec nec magna nec nisi sollicitudin fringilla. Morbi venenatis leo sed odio fermentum,
					vitae pulvinar turpis dapibus. Integer ac leo eget orci consectetur venenatis. Duis et
					velit sed est aliquam gravida ut sit amet nisi.
				</p>
				<h3>Vestibulum Elementum</h3>
				<p>
					Curabitur nec vestibulum felis, id euismod lectus. Mauris at nulla a mi scelerisque
					lacinia a ut mi. Sed ac eros non sapien congue mollis non vitae enim.
				</p>
				<ul>
					<li>Aliquam tincidunt nunc et dolor tristique, at tincidunt ipsum laoreet.</li>
					<li>Praesent pulvinar eros sed turpis tristique, non convallis libero fermentum.</li>
					<li>Nam luctus justo non purus suscipit, sed convallis urna dapibus.</li>
				</ul>
				<p>
					Quis id nostrud nostrud voluptate in. Enim exercitation mollit mollit exercitation. Est ea
					occaecat consequat nisi excepteur. Labore consequat ipsum ex ad aliquip in est officia
					magna incididunt eiusmod. Cupidatat consequat in Lorem laborum ipsum nulla deserunt id do
					sit ut et.
				</p>
				<h2>Phasellus Varius Nibh</h2>
				<p>
					Suspendisse ultricies lectus vel gravida gravida. Phasellus dapibus, arcu nec vestibulum
					hendrerit, nisl tortor tempor risus, eget tincidunt arcu orci et sapien. Etiam sed nunc
					non lectus aliquet tincidunt.
				</p>
				<p>
					Morbi non mauris at justo vehicula mollis sit amet nec sapien. Integer accumsan arcu at
					orci dictum, ac placerat augue hendrerit. Duis sit amet leo ac augue suscipit vulputate.
				</p>
				<p>
					Cillum minim duis occaecat cupidatat dolore irure aliquip in dolor aliquip sit ea.
					Consectetur incididunt qui reprehenderit cillum nisi culpa est. Velit in nisi ipsum dolore
					reprehenderit dolore cupidatat sunt magna proident cillum proident. Irure velit aliquip
					magna et mollit culpa in voluptate sunt sunt consequat laborum sit.
				</p>
				<p>
					Commodo tempor proident consectetur do. Nisi et excepteur ipsum dolor ex consectetur.
					Occaecat ut reprehenderit exercitation id laborum proident ut magna aliquip sit ut ex.
				</p>
				<ol>
					<li>
						<strong>Laborum esse eiusmod in est irure Lorem.</strong> Ullamco proident nulla
						pariatur eiusmod in reprehenderit. Anim mollit minim sit ea pariatur officia id dolore
						aute incididunt consectetur laboris cupidatat. Non ut et ex magna duis occaecat elit non
						ea occaecat. Ullamco nisi deserunt et ea nostrud culpa aliquip in non ut enim in magna.
						Exercitation aute tempor velit voluptate duis fugiat fugiat.
					</li>
					<li>
						<strong>
							Deserunt elit adipisicing dolore do proident est ex et aute in enim est sit tempor.
						</strong>
						Tempor nulla eu aute dolore. Sunt ex minim elit ea elit aute quis ad dolor incididunt
						cillum qui dolor. Enim Lorem ipsum officia enim id occaecat culpa elit nostrud enim ad
						occaecat sint non. Aliquip cillum reprehenderit dolore consequat adipisicing.
					</li>
					<li>
						<strong>Quis excepteur ullamco in sint est.</strong> Voluptate incididunt reprehenderit
						qui elit aute consequat aute. Ut occaecat dolore culpa dolore in culpa nostrud. Ea esse
						consequat aliqua consectetur sunt amet occaecat cillum duis velit velit. Nostrud ex
						adipisicing laboris mollit ex qui et duis exercitation id.
					</li>
					<li>
						<strong>Nulla culpa dolor amet eu laborum do voluptate et laboris.</strong> Aute amet
						dolor et fugiat. Lorem tempor incididunt minim excepteur consequat velit. Proident
						excepteur dolor sunt ea. Elit aliqua nisi velit eu occaecat.
					</li>
				</ol>
				<p>
					Aute cillum sunt adipisicing in eu. Deserunt ad veniam elit sunt consequat ex laborum ad
					nulla amet. Ipsum commodo sint excepteur elit magna nisi nostrud id. Mollit veniam laborum
					ut Lorem amet laboris ut quis.
				</p>
				<p>
					Do nisi mollit reprehenderit esse commodo incididunt commodo Lorem nisi est consectetur in
					ullamco Lorem. Reprehenderit non culpa officia irure tempor consequat sunt excepteur. Id
					anim minim aute aliqua dolor eiusmod est eu anim dolor ullamco. Mollit dolore cupidatat
					aute quis ad dolore magna labore velit ea officia amet laboris esse. Labore elit cupidatat
					laboris exercitation Lorem cupidatat labore commodo labore. Irure ullamco sint non tempor
					ex mollit proident sunt velit laboris.
				</p>
			</section>
		</MainContent>
	);
}
