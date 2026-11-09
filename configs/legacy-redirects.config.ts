import type { NextConfig } from "next";

type Redirects = Awaited<ReturnType<NonNullable<NextConfig["redirects"]>>>;

/**
 * Redirects for urls from the previous clariah.at website (`acdh-oeaw/clariah-at-website`), whose content was migrated
 * to the api with new slugs.
 *
 * Sources have no trailing slash: with the default `trailingSlash: false`, Next strips it with its own redirect before
 * these run, so a source ending in `/` never matches. The old url with its slash still arrives here, just one hop
 * later.
 *
 * Generated once from the previous website's content and the api's sitemap, matching documents by title, summary and
 * event date. Destinations are not checked against the api at build time, so a slug changed in the api later needs its
 * entry updated here.
 */

/** Standalone pages, which now live under `/pages`, or were merged into another page or event. */
const pages: Record<string, string> = {
	"/de/about-clariah-at": "/de/pages/ueber-clariah-at",
	"/de/exploresalon2023": "/de/events/explore-salon-2023-anmeldung-ist-offen",
	"/de/funding-opportunities": "/de/pages/foerderung",
	"/de/funding-opportunities-for-junior-researcher": "/de/pages/foerderung",
	"/de/in-honor-of-thierry-declerck": "/de/pages/zu-ehren-thierry-declerck",
	"/de/privacy-declaration": "/de/pages/datenschutzerklaerung",
	"/de/project-funding": "/de/pages/foerderung",
	"/de/summerschool2024":
		"/de/events/summer-school-vom-archiv-zum-algorithmus-digital-humanities-in-der-praxis-anmeldung-ist-geoeffnet",
	"/de/summerschool2025": "/de/events/summer-school-machine-learning-for-digital-scholarly-editions-anmeldung-offen",
	"/en/about-clariah-at": "/en/pages/about-clariah-at",
	"/en/exploresalon2023": "/en/events/explore-salon-2023-registrations-are-open",
	"/en/funding-opportunities": "/en/pages/funding",
	"/en/funding-opportunities-for-junior-researcher": "/en/pages/funding",
	"/en/in-honor-of-thierry-declerck": "/en/pages/in-honor-of-thierry-declerck",
	"/en/privacy-declaration": "/en/pages/privacy-declaration",
	"/en/project-funding": "/en/pages/funding",
	"/en/summerschool2024":
		"/en/events/summer-school-vom-archiv-zum-algorithmus-digital-humanities-in-der-praxis-registrations-are-open",
	"/en/summerschool2025": "/en/events/summer-school-machine-learning-for-digital-scholarly-editions-registration-open",
};

/** Consortium members. */
const consortium: Record<string, string> = {
	"/de/consortium/austrian-academy-of-sciences": "/de/consortium/oesterreichische-akademie-der-wissenschaften",
	"/de/consortium/university-for-continuing-education-krems": "/de/consortium/universitaet-fuer-weiterbildung-krems",
	"/de/consortium/university-of-graz": "/de/consortium/universitaet-graz",
	"/de/consortium/university-of-klagenfurt": "/de/consortium/universitaet-klagenfurt",
	"/de/consortium/university-of-music-and-performing-arts-vienna":
		"/de/consortium/universitaet-fuer-musik-und-darstellende-kunst-wien",
	"/de/consortium/university-of-salzburg": "/de/consortium/universitaet-salzburg",
	"/de/consortium/university-of-vienna": "/de/consortium/universitaet-wien",
	"/en/consortium/naturhistorisches-museum-wien": "/en/consortium/natural-history-museum-vienna",
};

/** Events. Old urls whose event was not migrated go to the listing page. */
const events: Record<string, string> = {
	"/de/events/acdh-ch-lecture-8-1-the-problem-with-social-media-reserach":
		"/de/events/acdh-ch-lecture-8-1-the-problem-with-social-media-research",
	"/de/events/acdh-ch-lecture-8-3":
		"/de/events/acdh-ch-lecture-8-3-kulturanalyse-als-integrierte-geistes-und-naturwissenschaft",
	"/de/events/acdh-ch-research-lunch-nikola-ljubesic": "/de/events/acdh-ch-research-lunch-mit-nikola-ljubesic",
	"/de/events/acdh-ch-tool-gallery-10-1": "/de/events/acdh-ch-tool-gallery-10-1-transkribus-fuer-anfaenger-innen",
	"/de/events/acdh-ch-tool-gallery-10-2":
		"/de/events/acdh-ch-tool-gallery-10-2-encoding-manuscripts-with-tei-xml-training",
	"/de/events/acdh-ch-tool-gallery-9-1-xslt-dh": "/de/events/acdh-ch-tool-gallery-9-1-xslt-fuer-digital-humanists",
	"/de/events/acdh-ch-tool-gallery-9-2-transkribus-for-beginners":
		"/de/events/acdh-ch-tool-gallery-9-2-transkribus-fuer-anfaenger-innen",
	"/de/events/acdh-ch-tool-gallery-9-3": "/de/events/acdh-ch-tool-gallery-9-3-transkribus-fuer-fortgeschrittene",
	"/de/events/acdh-lecture-12-3":
		"/de/events/acdh-lecture-12-3-implicitly-abusive-language-data-biases-and-challenges-in-detection",
	"/de/events/acdh-rl-laura-untner": "/de/events/acdh-research-lunch-mit-laura-untner",
	"/de/events/clariah-at-roadshow": "/de/events/clariah-at-roadshow-2024",
	"/de/events/clariah-at-roadshow-at-CEU": "/de/events/clariah-at-roadshow-2025",
	"/de/events/clarin-cafe-translation-technologies-and-workflows-for-ssh-researchers":
		"/de/events/clarin-cafe-translation-technologies-and-amp-workflows-for-ssh-researchers",
	"/de/events/computer-vision-for-digital-humanists-a-three-day-winter-school-hosted-by-the-university-of-graz":
		"/de/events/computer-vision-for-digital-humanists-eine-dreitaegige-winterschule-organisiert-von-der-universitaet-graz",
	"/de/events/conference-ai-meets-hss": "/de/events/konferenz-ai-meets-humanities-and-social-sciences",
	"/de/events/conference-on-cultural-heritage-new-technologies-cultural-heritage-nextgen":
		"/de/events/conference-on-cultural-heritage-and-amp-new-technologies-cultural-heritage-next-gen",
	"/de/events/context-matters-opportunities-challenges-ai-ch-data":
		"/de/events/context-matters-opportunities-and-challenges-when-working-with-artificial-intelligence-and-cultural-heritage-data",
	"/de/events/crash-hackathon-2026": "/de/events/crash-hackathon",
	"/de/events/dazzling-data-lectureseries-izmf-23-24":
		"/de/events/dazzling-data-digital-humanities-in-der-mediaevistik-und-fruehneuzeitforschung",
	"/de/events/dch-speed-dating": "/de/events/d-c-h-speed-dating",
	"/de/events/dhd2026": "/de/events/d-hd-2026-nicht-nur-text-nicht-nur-daten",
	"/de/events/dhinfra-public-launch-event": "/de/events/d-hinfra-at-public-launch-event",
	"/de/events/digedtnt-workshop-meet-the-tools-and-developers":
		"/de/events/dig-ed-tn-t-workshop-meet-the-tools-and-developers",
	"/de/events/digital-humanities-lecture-circuit-23-24": "/de/events/ringvorlesung-digital-humanities",
	"/de/events/digital-linguistics-recent-developments-in-austria-olt-2023":
		"/de/events/oesterreichisches-treffen-zur-digitalen-linguistik-rezente-entwicklungen-in-oesterreich-oe-lt-2023",
	"/de/events/digital-methods-live-seminar": "/de/events/digitale-methoden",
	"/de/events/drittes-oesterreichisches-treffen-zur-digitalen-linguistik-oelt-2025":
		"/de/events/drittes-oesterreichisches-treffen-zur-digitalen-linguistik-oe-lt-2025",
	"/de/events/exploresalon2023": "/de/events/explore-salon-2023-anmeldung-ist-offen",
	"/de/events/introduction-dh-sose26": "/de/events/einfuehrung-in-die-digital-humanities",
	"/de/events/ki-kulturerbe-symposium-oenb-2026":
		"/de/events/ki-und-kulturerbe-symposium-an-der-oesterreichischen-nationalbibliothek",
	"/de/events/konferenz-zeitungen-zeitschriften-und-ki-modelle":
		"/de/events/konferenz-zeitungen-zeitschriften-and-ki-modelle-training-und-nach-nutzung-in-den-digital-humanities",
	"/de/events/museum-law-2023-ai-co-creation-nft": "/de/events/museum-recht-2023-ki-co-creation-and-nft",
	"/de/events/ocr-htr-workshop": "/de/events/ocr-htr-workshop-for-under-resourced-and-under-represented-languages",
	"/de/events/oeaw-ai-winter-school-2025": "/de/events/oe-aw-ai-winter-school-2025",
	"/de/events/oeaw-ai-winter-school-2026": "/de/events/oe-aw-ai-winter-school-2026",
	"/de/events/oenb-labs-jupyter-notebooks-workshop": "/de/events/oe-nb-labs-jupyter-notebooks-workshop",
	"/de/events/oenb-labs-symposium-2026": "/de/events/oe-nb-labs-symposium-2026",
	"/de/events/onb-labs-symposium-newspapers-as-datasets": "/de/events/oe-nb-labs-symposium-newspapers-as-datasets",
	"/de/events/projectpresentation-digital-edition-baernreither":
		"/de/events/vom-archiv-ins-digitale-die-tagebuecher-des-altoesterreichischen-politikers-joseph-m-baernreither-projektpraesentation-der-digitalen-edition",
	"/de/events/ssh-open-marketplace-online-workshop-for-phd-students":
		"/de/events/enhance-your-research-skills-with-ssh-open-marketplace-an-online-workshop-for-ph-d-students",
	"/de/events/summer-school-2024":
		"/de/events/summer-school-vom-archiv-zum-algorithmus-digital-humanities-in-der-praxis-anmeldung-ist-geoeffnet",
	"/de/events/summer-school-2025":
		"/de/events/summer-school-machine-learning-for-digital-scholarly-editions-anmeldung-offen",
	"/de/events/summerschool2026":
		"/de/events/machine-learning-for-digital-scholarly-editions-clariah-at-summer-school-2026",
	"/de/events/train-the-trainers-proprietary-rights-open-access-in-academic-teaching":
		"/de/events/train-the-trainers-urheberrecht-and-open-access-in-der-akademischen-lehre",
	"/de/events/transnational-research-infrastructure":
		"/de/events/transnational-research-infrastructure-a-journey-through-clarin-knowledge-centres",
	"/de/events/webinar-series-digital-editions-tools-transitions":
		"/de/events/dig-ed-tn-t-webinarreihe-digital-editions-tools-and-transitions",
	"/de/events/workshop-central-european-book-history-data-tools":
		"/de/events/workshop-central-european-book-history-data-and-amp-tools",
	"/de/events/workshop-iiif-digital-scholarly-editions": "/de/events/iiif-in-und-digitale-n-editionen",
	"/de/events/workshop-interface-of-medieval-studies": "/de/events/workshop-schnittstelle-mediaevistik",
	"/de/events/workshop-writing-a-digital-conceptual-history-of-democracy":
		"/de/events/writing-a-digital-conceptual-history-of-democracy",
	"/de/events/worldcafe-nfdi4memory-data-culture":
		"/de/events/world-cafe-zu-historischen-forschungsdaten-der-nfdi-4-memory-task-area-5-data-culture",
	"/en/events/acdh-ch-lecture-8-1-the-problem-with-social-media-reserach":
		"/en/events/acdh-ch-lecture-8-1-the-problem-with-social-media-research",
	"/en/events/acdh-ch-lecture-8-3": "/en/events/acdh-ch-lecture-8-3-cultural-analysis-as-a-multidisciplinary-science",
	"/en/events/acdh-ch-research-lunch-nikola-ljubesic": "/en/events/acdh-ch-research-lunch-with-nikola-ljubesic",
	"/en/events/acdh-ch-tool-gallery-10-1": "/en/events/acdh-ch-tool-gallery-10-1-transkribus-for-beginners",
	"/en/events/acdh-ch-tool-gallery-10-2":
		"/en/events/acdh-ch-tool-gallery-10-2-encoding-manuscripts-with-tei-xml-training",
	"/en/events/acdh-ch-tool-gallery-9-1-xslt-dh": "/en/events/acdh-ch-tool-gallery-9-1-xslt-fuer-digital-humanists",
	"/en/events/acdh-ch-tool-gallery-9-3": "/en/events/acdh-ch-tool-gallery-9-3-transkribus-for-advanced-users",
	"/en/events/acdh-lecture-12-3":
		"/en/events/acdh-lecture-12-3-implicitly-abusive-language-data-biases-and-challenges-in-detection",
	"/en/events/acdh-rl-laura-untner": "/en/events/acdh-research-lunch-with-laura-untner",
	"/en/events/clariah-at-roadshow": "/en/events/clariah-at-roadshow-2024",
	"/en/events/clariah-at-roadshow-at-CEU": "/en/events/clariah-at-roadshow-2025",
	"/en/events/clarin-cafe-translation-technologies-and-workflows-for-ssh-researchers":
		"/en/events/clarin-cafe-translation-technologies-and-amp-workflows-for-ssh-researchers",
	"/en/events/conference-ai-meets-hss": "/en/events/conference-ai-meets-humanities-and-social-sciences",
	"/en/events/conference-on-cultural-heritage-new-technologies-cultural-heritage-nextgen":
		"/en/events/conference-on-cultural-heritage-and-new-technologies-cultural-heritage-next-gen",
	"/en/events/context-matters-opportunities-challenges-ai-ch-data":
		"/en/events/context-matters-opportunities-and-challenges-when-working-with-artificial-intelligence-and-cultural-heritage-data",
	"/en/events/crash-hackathon-2026": "/en/events/crash-hackathon",
	"/en/events/dazzling-data-lectureseries-izmf-23-24":
		"/en/events/dazzling-data-digital-humanities-in-medieval-and-early-modern-studies",
	"/en/events/dch-speed-dating": "/en/events/d-c-h-speed-dating",
	"/en/events/dhd2026": "/en/events/d-hd-2026-not-only-text-not-only-data",
	"/en/events/dhinfra-public-launch-event": "/en/events/d-hinfra-at-public-launch-event",
	"/en/events/digedtnt-workshop-meet-the-tools-and-developers":
		"/en/events/dig-ed-tn-t-workshop-meet-the-tools-and-developers",
	"/en/events/digital-history-tagung-2026": "/en/events/digital-history-conference-2026",
	"/en/events/digital-humanities-lecture-circuit-23-24": "/en/events/digital-humanities-lecture-circuit",
	"/en/events/digital-linguistics-recent-developments-in-austria-olt-2023":
		"/en/events/austrian-meeting-on-digital-linguistics-recent-developments-in-austria-at-oe-lt-2023",
	"/en/events/digital-methods-live-seminar": "/en/events/digital-methods",
	"/en/events/drittes-oesterreichisches-treffen-zur-digitalen-linguistik-oelt-2025":
		"/en/events/third-austrian-meeting-on-digital-linguistics",
	"/en/events/exploresalon2023": "/en/events/explore-salon-2023-registrations-are-open",
	"/en/events/introduction-dh-sose26": "/en/events/introduction-to-digital-humanities",
	"/en/events/ki-kulturerbe-symposium-oenb-2026":
		"/en/events/ai-and-cultural-heritage-symposium-at-the-austrian-national-library",
	"/en/events/konferenz-zeitungen-zeitschriften-und-ki-modelle":
		"/en/events/conference-newspapers-magazines-and-ai-models-training-and-re-use-in-the-digital-humanities",
	"/en/events/kontrolliertes-vokabular-mit-vocabs": "/en/events/controlled-vocabulary-with-vocabs",
	"/en/events/museum-law-2023-ai-co-creation-nft": "/en/events/museum-law-2023-ai-co-creation-and-nft",
	"/en/events/ocr-htr-workshop": "/en/events/ocr-htr-workshop-for-under-resourced-and-under-represented-languages",
	"/en/events/oeaw-ai-winter-school-2025": "/en/events/oe-aw-ai-winter-school-2025",
	"/en/events/oeaw-ai-winter-school-2026": "/en/events/oe-aw-ai-winter-school-2026",
	"/en/events/oenb-labs-jupyter-notebooks-workshop": "/en/events/oe-nb-labs-jupyter-notebooks-workshop",
	"/en/events/oenb-labs-symposium-2026": "/en/events/oe-nb-labs-symposium-2026",
	"/en/events/onb-labs-symposium-newspapers-as-datasets": "/en/events/oe-nb-labs-symposium-newspapers-as-datasets",
	"/en/events/projectpresentation-digital-edition-baernreither":
		"/en/events/vom-archiv-ins-digitale-die-tagebuecher-des-altoesterreichischen-politikers-joseph-m-baernreither-projektpraesentation-der-digitalen-edition",
	"/en/events/ssh-open-marketplace-online-workshop-for-phd-students":
		"/en/events/enhance-your-research-skills-with-ssh-open-marketplace-an-online-workshop-for-ph-d-students",
	"/en/events/summer-school-2024":
		"/en/events/summer-school-vom-archiv-zum-algorithmus-digital-humanities-in-der-praxis-registrations-are-open",
	"/en/events/summer-school-2025":
		"/en/events/summer-school-machine-learning-for-digital-scholarly-editions-registration-open",
	"/en/events/summerschool2026":
		"/en/events/machine-learning-for-digital-scholarly-editions-clariah-at-summer-school-2026",
	"/en/events/train-the-trainers-proprietary-rights-open-access-in-academic-teaching":
		"/en/events/train-the-trainers-copyright-and-open-access-in-academic-teaching",
	"/en/events/transnational-research-infrastructure":
		"/en/events/transnational-research-infrastructure-a-journey-through-clarin-knowledge-centres",
	"/en/events/viertes-oesterreichisches-treffen-zur-digitalen-linguistik-oelt-2026":
		"/en/events/4th-austrian-meeting-on-digital-linguistics",
	"/en/events/von-historischen-daten-zu-ki": "/en/events/from-historical-data-to-ai",
	"/en/events/webinar-series-digital-editions-tools-transitions":
		"/en/events/dig-ed-tn-t-webinar-series-digital-editions-tools-and-transitions",
	"/en/events/workshop-central-european-book-history-data-tools":
		"/en/events/workshop-central-european-book-history-data-and-tools",
	"/en/events/workshop-iiif-digital-scholarly-editions": "/en/events/iiif-in-and-digital-scholarly-editions",
	"/en/events/workshop-writing-a-digital-conceptual-history-of-democracy":
		"/en/events/writing-a-digital-conceptual-history-of-democracy",
	"/en/events/worldcafe-nfdi4memory-data-culture":
		"/en/events/world-cafe-on-historical-research-data-of-the-nfdi-4-memory-task-area-5-data-culture",
	"/en/events/zweites-oesterreichisches-treffen-zur-digitalen-linguistik":
		"/en/events/second-austrian-meeting-on-digital-linguistics",
};

/** News. */
const news: Record<string, string> = {
	"/de/news/DAC-summer-school-2026-UWK":
		"/de/news/summer-school-who-cares-collecting-preserving-and-curating-in-museums-archives-and-organizations",
	"/de/news/OA-Sammelband-Schnittstelle-Mediaevistik":
		"/de/news/schnittstelle-mediaevistik-kollaborationen-der-mittelalterforschung-im-digitalen-zeitalter",
	"/de/news/acdh-arche-re-certified-as-clarin-b-centre": "/de/news/acdh-arche-rezertifiziert-als-clarin-b-centre",
	"/de/news/acdh-ch-internships-february-2025": "/de/news/acdh-ch-volontariate-februar-2025",
	"/de/news/acdh-ch-lecture-9-1-with-achim-rabus-online": "/de/news/acdh-ch-lecture-mit-achim-rabus-ist-online",
	"/de/news/art-internship-2025-oenb-labs": "/de/news/ferialanstellung-bei-den-oe-nb-labs-digitale-kunstwerke",
	"/de/news/call-for-abstracts-clarin-2024": "/de/news/call-for-abstracts-clarin-annual-conference-2024",
	"/de/news/call-for-contributions-digital-history-tagung-2026":
		"/de/news/call-for-contributions-fuer-die-digital-history-tagung-2026",
	"/de/news/call-for-contributions-updating-konde": "/de/news/call-for-contributions-update-weissbuch-digitale-edition",
	"/de/news/call-for-participants-dariah-2024": "/de/news/einladung-zur-teilnahme-dariah-jahreskonferenz-2024",
	"/de/news/call-second-austrian-meeting-on-digital-linguistics":
		"/de/news/call-zweites-oesterreichisches-treffen-zur-digitalen-linguistik",
	"/de/news/cfp-austrian-meeting-on-digital-linguistics-oelt-2023":
		"/de/news/call-for-papers-oesterreichisches-treffen-zur-digitalen-linguistik-rezente-entwicklungen-in-oesterreich-oe-lt-2023",
	"/de/news/cfp-back-and-into-the-future-10th-digital-library-meeting":
		"/de/news/cf-p-zurueck-und-in-die-zukunft-10-tagung-digitale-bibliothek",
	"/de/news/cfp-book-proposal":
		"/de/news/cf-p-buchentwurf-digital-translation-history-processing-historical-data-with-new-methodologies",
	"/de/news/cfp-clariah-at-summer-school-machine-learning-for-digital-scholarly-editions":
		"/de/news/cf-p-clariah-at-summer-school-machine-learning-for-digital-scholarly-editions",
	"/de/news/cfp-clarin-flagship-projects-2025":
		"/de/news/aufruf-zur-einreichung-von-vorschlaegen-fuer-clarin-flagship-projekte-2025",
	"/de/news/cfp-dh-data-sprint": "/de/news/call-for-paricipation-digital-humanties-data-sprint",
	"/de/news/cfp-drittes-oesterreichisches-treffen-zur-digitalen-linguistik":
		"/de/news/call-for-papers-drittes-oesterreichisches-treffen-zur-digitalen-linguistik",
	"/de/news/cfp-pressmint-workshop-lrec2026": "/de/news/call-for-papers-press-mint-workshop-at-lrec-2026",
	"/de/news/cfp-summerschool2025": "/de/news/clariah-at-summer-school-machine-learning-for-digital-scholarly-editions",
	"/de/news/cfp-viertes-oesterreichisches-treffen-zur-digitalen-linguistik":
		"/de/news/viertes-oesterreichisches-treffen-zur-digitalen-linguistik",
	"/de/news/clariah-at-roadshow-2024": "/de/news/die-clariah-at-roadshow-12-projekte-haben-sich-vorgestellt",
	"/de/news/clariah-at-roadshow-2026": "/de/news/clariah-at-roadshow-2026-save-the-date",
	"/de/news/clariah-at-to-discontinue-presence-on-x-from-2025":
		"/de/news/clariah-at-stellt-ab-2025-seine-praesenz-auf-x-ein",
	"/de/news/clarin-2023-call-for-abstracts": "/de/news/clarin-annual-conference-2023-call-for-extended-abstracts",
	"/de/news/clarin-2026-call-for-papers": "/de/news/clarin-2026-call-for-papers-offen",
	"/de/news/clarin-annual-report-2023": "/de/news/clarin-jahresbericht-2023",
	"/de/news/clarin-conference-2025-vienna": "/de/news/clarin-konferenz-2025-in-wien",
	"/de/news/conference-newspapers-magazines-aimodels":
		"/de/news/zeitungen-zeitschriften-and-ki-modelle-training-und-nach-nutzung-in-den-digital-humanities",
	"/de/news/dariah-annual-report-2023": "/de/news/dariah-jahresbericht-2023",
	"/de/news/dariah2025-cfp": "/de/news/dariah-annual-event-2025-call-for-papers",
	"/de/news/dariah2026-call-for-papers": "/de/news/dariah-2026-call-for-papers",
	"/de/news/dazzling-data-lecture-circuit-now-available-online":
		"/de/news/ringvorlesung-dazzling-data-aufzeichnungen-verfuegbar",
	"/de/news/dhd2026-call-for-papers": "/de/news/d-hd2026-call-for-papers",
	"/de/news/euralex2026-call-for-papers": "/de/news/euralex-2026-call-for-papers",
	"/de/news/exploresalon2023-save-the-date": "/de/news/explore-salon-2023-save-the-date",
	"/de/news/glam-innovation-lab":
		"/de/news/glam-innovation-lab-jetzt-digitalisierungs-und-innovationsherausforderungen-einreichen",
	"/de/news/impressions-of-the-dh-festival": "/de/news/impressionen-des-dh-festivals",
	"/de/news/jupyter-notebooks-oenb-labs":
		"/de/news/zum-projektabschluss-neue-jupyter-notebooks-in-den-oe-nb-labs-veroeffentlicht",
	"/de/news/new-oenb-labs-jupyter-notebooks": "/de/news/neue-jupyter-notebooks-in-den-oe-nb-labs-jetzt-ausprobieren",
	"/de/news/oesterreich-aus-der-luft-interaktiv": "/de/news/oesterreich-aus-der-luft-interaktiv-erkunden",
	"/de/news/onb-labs-symposium-2024-newspapers-as-datasets":
		"/de/news/save-the-date-oe-nb-labs-symposium-newspapers-as-datasets",
	"/de/news/report-clariah-at-summer-school-2025":
		"/de/news/erfahrungsbericht-ueber-die-clariah-at-summer-school-2025-machine-learning-for-digital-scholarly-editions",
	"/de/news/results-from-call-for-projects-announced":
		"/de/news/auswahlergebnis-der-projektausschreibung-veroeffentlicht",
	"/de/news/retrospective-clariah-at-summerschool2024": "/de/news/rueckblick-clariah-at-summer-school-2024",
	"/de/news/retrospective-onb-labs-symposium-2024":
		"/de/news/rueckblick-oe-nb-labs-symposium-zeitungen-als-datensaetze",
	"/de/news/rueckblick-zur-dhd2026": "/de/news/rueckblick-zur-d-hd2026",
	"/de/news/small-scale-projects-announced": "/de/news/ergebnisse-des-kleinprojekt-calls-veroeffentlicht",
	"/de/news/summerschool2025-uwk":
		"/de/news/summer-school-ai-will-sort-it-out-practices-of-collecting-archiving-and-curating-in-the-age-of-digital-transformation",
	"/de/news/sustaining-a-digital-humanities-infrastructure-and-network-for-austria":
		"/de/news/infrastruktur-und-netzwerk-fuer-die-digitalen-geisteswissenschaften-in-oesterreich-nachhaltig-sichern",
	"/en/news/DAC-summer-school-2026-UWK":
		"/en/news/summer-school-who-cares-collecting-preserving-and-curating-in-museums-archives-and-organizations",
	"/en/news/OA-Sammelband-Schnittstelle-Mediaevistik":
		"/en/news/interface-medieval-studies-collaborations-in-medieval-research-in-the-digital-age",
	"/en/news/art-internship-2025-oenb-labs": "/en/news/art-internship-oe-nb-labs-in-summer-holidays-digital-artworks",
	"/en/news/call-for-abstracts-clarin-2024": "/en/news/call-for-abstracts-clarin-annual-conference-2024",
	"/en/news/call-for-contributions-digital-history-tagung-2026":
		"/en/news/call-for-contributions-for-the-digital-history-conference-2026",
	"/en/news/call-for-contributions-updating-konde":
		"/en/news/call-for-contributions-updating-the-white-paper-weissbuch-digital-edition",
	"/en/news/call-for-participants-dariah-2024": "/en/news/call-for-participants-dariah-annual-event-2024",
	"/en/news/cfp-austrian-meeting-on-digital-linguistics-oelt-2023":
		"/en/news/call-for-papers-austrian-meeting-on-digital-linguistics-recent-developments-in-austria-at-oe-lt-2023",
	"/en/news/cfp-back-and-into-the-future-10th-digital-library-meeting":
		"/en/news/cf-p-back-and-to-the-future-10th-conference-digital-library",
	"/en/news/cfp-book-proposal":
		"/en/news/cf-p-book-proposal-digital-translation-history-processing-historical-data-with-new-methodologies",
	"/en/news/cfp-clariah-at-summer-school-machine-learning-for-digital-scholarly-editions":
		"/en/news/cf-p-clariah-at-summer-school-machine-learning-for-digital-scholarly-editions",
	"/en/news/cfp-clarin-flagship-projects-2025": "/en/news/call-for-proposals-for-clarin-flagship-projects-2025",
	"/en/news/cfp-dh-data-sprint": "/en/news/call-for-paricipation-digital-humanties-data-sprint",
	"/en/news/cfp-drittes-oesterreichisches-treffen-zur-digitalen-linguistik":
		"/en/news/call-for-papers-third-austrian-meeting-on-digital-linguistics",
	"/en/news/cfp-pressmint-workshop-lrec2026": "/en/news/call-for-papers-press-mint-workshop-at-lrec-2026",
	"/en/news/cfp-summerschool2025": "/en/news/clariah-at-summer-school-machine-learning-for-digital-scholarly-editions",
	"/en/news/cfp-viertes-oesterreichisches-treffen-zur-digitalen-linguistik":
		"/en/news/call-for-papers-fourth-austrian-meeting-on-digital-linguistics",
	"/en/news/clariah-at-roadshow-2024": "/en/news/the-clariah-at-roadshow-introduction-of-12-dh-projects",
	"/en/news/clariah-at-roadshow-2026": "/en/news/clariah-at-roadshow-2026-save-the-date",
	"/en/news/clarin-2023-call-for-abstracts": "/en/news/clarin-annual-conference-2023-call-for-extended-abstracts",
	"/en/news/clarin-2026-call-for-papers": "/en/news/clarin-2026-call-for-papers-open",
	"/en/news/clarin-conference-2025-vienna": "/en/news/clarin-conference-2025-will-be-held-in-vienna",
	"/en/news/conference-newspapers-magazines-aimodels":
		"/en/news/newspapers-magazines-and-ai-models-training-an-re-use-in-the-digital-humanities",
	"/en/news/dariah2025-cfp": "/en/news/dariah-annual-event-2025-call-for-papers",
	"/en/news/dariah2026-call-for-papers": "/en/news/dariah-2026-call-for-papers",
	"/en/news/dhd2026-call-for-papers": "/en/news/d-hd2026-call-for-papers",
	"/en/news/digitale-edition-kofler-aural": "/en/news/digital-edition-kofler-aural",
	"/en/news/euralex2026-call-for-papers": "/en/news/euralex-2026-call-for-papers",
	"/en/news/exploresalon2023-save-the-date": "/en/news/explore-salon-2023-save-the-date",
	"/en/news/feedback-kulturpool-visuell": "/en/news/feedback-kulturpool-visual",
	"/en/news/glam-innovation-lab": "/en/news/glam-innovation-lab-submit-your-digitization-and-innovation-challenges-now",
	"/en/news/jupyter-notebooks-oenb-labs": "/en/news/project-completed-new-jupyter-notebooks-published-in-oe-nb-labs",
	"/en/news/mhdbdb-next-forschen-ohne-datenbankserver": "/en/news/mhdbdb-next-researching-without-a-database-server",
	"/en/news/new-oenb-labs-jupyter-notebooks": "/en/news/new-jupyter-notebooks-in-the-oe-nb-labs-try-them-out-now",
	"/en/news/oesterreich-aus-der-luft": "/en/news/austria-from-the-air",
	"/en/news/oesterreich-aus-der-luft-interaktiv": "/en/news/discover-austria-in-aerial-views-with-the-interactive-map",
	"/en/news/onb-labs-symposium-2024-newspapers-as-datasets":
		"/en/news/save-the-date-onb-labs-symposium-newspapers-as-datasets",
	"/en/news/report-clariah-at-summer-school-2025":
		"/en/news/report-on-the-clariah-at-summer-school-2025-machine-learning-for-digital-scholarly-editions",
	"/en/news/retrospective-clariah-at-summerschool2024": "/en/news/retrospective-of-the-clariah-at-summer-school-2024",
	"/en/news/retrospective-onb-labs-symposium-2024":
		"/en/news/a-retrospective-of-the-onb-labs-symposium-newspapers-as-datasets",
	"/en/news/rueckblick-zur-dhd2026": "/en/news/rueckblick-zur-d-hd2026",
	"/en/news/small-scale-projects-announced": "/en/news/results-from-call-for-small-scale-projects-announced",
	"/en/news/summerschool2025-uwk":
		"/en/news/summer-school-ai-will-sort-it-out-practices-of-collecting-archiving-and-curating-in-the-age-of-digital-transformation",
};

/** Projects. ARCHE, OpenAtlas and VICAV were not migrated, so their old urls go to the listing page. */
const projects: Record<string, string> = {
	"/de/projects/3d-digitizing-glaser-squeezes": "/de/projects/3-d-digitalisierung-von-seltenen-glaser-abklatschen",
	"/de/projects/abacus-austrian-baroque-corpus": "/de/projects/a-ba-c-us-austrian-baroque-corpus",
	"/de/projects/account-books-spaengler-online-aso": "/de/projects/ausgabenbuecher-spaengler-online-aso",
	"/de/projects/aldersbach-chronicle": "/de/projects/chronik-aldersbach",
	"/de/projects/ambraser-heldenbuch": "/de/projects/ambraser-heldenbuch-transkription-und-wissenschaftliches-datenset",
	"/de/projects/andreas-okopenko-diaries-poets-estate-hybrid-edition":
		"/de/projects/andreas-okopenko-tagebuecher-aus-dem-nachlass-hybridedition",
	"/de/projects/archaeological-collections-university-graz":
		"/de/projects/onlineportal-der-archaeologischen-sammlungen-der-karl-franzens-universitaet-graz",
	"/de/projects/arche": "/de/projects",
	"/de/projects/arthur-schnitzler-correspondence-writers":
		"/de/projects/arthur-schnitzler-briefwechsel-mit-autorinnen-und-autoren",
	"/de/projects/asynchrones-lernangebot-forschungsdatenmanagement":
		"/de/projects/asynchrones-lernangebot-fuer-themen-aus-dem-forschungsdatenmanagement",
	"/de/projects/atlas-viennese-avantgardes": "/de/projects/atlas-der-wiener-avantgarden",
	"/de/projects/austria-literally": "/de/projects/oesterreich-am-wort",
	"/de/projects/austrian-land-registers": "/de/projects/kataster-tirol-digital",
	"/de/projects/austrian-radio-journals-1967-1999-www-journale":
		"/de/projects/oe1-journale-von-1967-bis-1999-www-journale-at",
	"/de/projects/becoming-urban-reconstructing-city-graz-long-19th-century-beurb":
		"/de/projects/becoming-urban-reconstructing-the-city-of-graz-in-the-long-19th-century-be-urb",
	"/de/projects/between-composition-and-reception-authority-medieval-charters-becore":
		"/de/projects/zwischen-erstellung-und-rezeption-die-autoritaet-mittelalterlicher-urkunden-be-co-re",
	"/de/projects/biodiversity-cultural-and-linguistic-diversity-movement":
		"/de/projects/biodiversitaet-kulturelle-und-linguistische-diversitaet-eine-bewegung",
	"/de/projects/cataloguing-manuscripts-library-matthias-corvinus-austria":
		"/de/projects/erschliessung-der-handschriften-aus-der-bibliothek-des-matthias-corvinus-in-oesterreich",
	"/de/projects/celtic-divine-names-inscriptions-roman-province-germania-inferior":
		"/de/projects/keltische-goetternamen-in-den-inschriften-der-roemischen-provinz-germania-inferior",
	"/de/projects/cfir-science-roman-small-finds-online": "/de/projects/cfir-science-roemische-kleinfunde-online",
	"/de/projects/charters-open-research-data": "/de/projects/urkunden-als-offene-forschungsdaten",
	"/de/projects/chia-accessing-and-analysing-cultural-images-new-technologies":
		"/de/projects/ch-ia-accessing-and-analysing-cultural-images-with-new-technologies",
	"/de/projects/clariah-at-platform": "/de/projects/clariah-at-plattform",
	"/de/projects/clarin-fcs-implementation":
		"/de/projects/unlocking-the-full-potential-of-textual-resources-application-of-fair-data-principles-through-clarin-federated-content-search-implementation",
	"/de/projects/co-op-community-opportunity": "/de/projects/co-op-community-as-opportunity",
	"/de/projects/computational-analysis-of-jazz-history":
		"/de/projects/gender-networks-and-artistic-success-a-computational-analysis-of-jazz-history",
	"/de/projects/computer-vision-digital-humanists": "/de/projects/computer-vision-for-digital-humanists",
	"/de/projects/corema-cooking-recipes-middle-ages-corpus-analysis-visualisation":
		"/de/projects/kochrezepttexte-des-mittelalters-korpus-analyse-visualisierung",
	"/de/projects/cultural-and-scientific-heritage-styria": "/de/projects/kultur-und-wissenschaftserbe-steiermark",
	"/de/projects/dariah-eu-eldah-gdpr-consent-form-wizard":
		"/de/projects/dariah-eu-eldah-ds-gvo-generator-fuer-einwilligungserklaerungen",
	"/de/projects/datenanalyse-oenb-labs": "/de/projects/datenanalyse-in-den-oe-nb-labs",
	"/de/projects/depcha-digital-edition-publishing-cooperative-historical-accounts":
		"/de/projects/depcha-digital-edition-publishing-cooperative-for-historical-accounts",
	"/de/projects/design-4-emergency": "/de/projects/design-4-emergency-at",
	"/de/projects/developing-hubert-nlp-algorithm-extending-seshat-global-history-databank":
		"/de/projects/developing-hu-bert-a-natural-language-processing-algorithm-for-extending-the-seshat-global-history-databank",
	"/de/projects/dictionary-bavarian-dialects-austria-wboe":
		"/de/projects/woerterbuch-der-bairischen-mundarten-in-oesterreich-wb-oe",
	"/de/projects/die-korrespondenz-leo-thun-hohenstein": "/de/projects/die-korrespondenz-von-leo-von-thun-hohenstein",
	"/de/projects/die-sammlung-amadei": "/de/projects/die-sammlung-amadei-digitalisierung-open-data-public-outreach",
	"/de/projects/digiculture-improving-digital-competences-and-social-inclusion-adults-creative-industries":
		"/de/projects/digi-culture-verbesserung-der-digitalen-kompetenzen-und-der-sozialen-eingliederung-von-erwachsenen-in-der-kreativwirtschaft",
	"/de/projects/digital-editions-medieval-and-early-modern-accounts":
		"/de/projects/digital-editions-of-medieval-and-early-modern-accounts",
	"/de/projects/digital-history-doing-cultural-heritage-2026":
		"/de/projects/internationale-tagung-digital-history-doing-cultural-heritage",
	"/de/projects/digital-interactive-mozart-edition": "/de/projects/digital-interaktive-mozart-edition",
	"/de/projects/digital-memoryscape-austria-erinnerungslandschaft-persecution-and-resistance-during-ns-documentation":
		"/de/projects/digitale-erinnerungslandschaft-oesterreich-derla-verfolgung-und-widerstand-im-nationalsozialismus",
	"/de/projects/digital-scholarly-edition-habsburg-ottoman-diplomatic-sources-1500-1918":
		"/de/projects/digitale-edition-von-quellen-zur-habsburgisch-osmanischen-diplomatie-1500-1918",
	"/de/projects/digital-sustainability-relaunch-mhdbdb": "/de/projects/digital-sustainability-relaunch-of-the-mhdbdb",
	"/de/projects/digital-tools-historical-inventories": "/de/projects/digitale-werkzeuge-fuer-historische-inventare",
	"/de/projects/digitaler-arnim-bibliothekskatalog":
		"/de/projects/autor-innenbibliotheken-als-wissensraeume-digitalisierung-des-katalogs-der-arnim-bibliothek",
	"/de/projects/digitas-digital-affects-and-space": "/de/projects/digit-as-the-digital-affects-and-space",
	"/de/projects/digitising-patterns-power-dpp": "/de/projects/digitising-patterns-of-power-dpp",
	"/de/projects/digitizing-materiality-premodern-book": "/de/projects/digitizing-the-materiality-of-the-premodern-book",
	"/de/projects/distant-spectators-distant-reading-periodicals-enlightenment-dispecs":
		"/de/projects/distant-spectators-distant-reading-for-periodicals-of-the-enlightenment-di-specs",
	"/de/projects/ditah-digital-transformation-austrian-humanities":
		"/de/projects/di-tah-digitale-transformation-der-oesterreichischen-geisteswissenschaften",
	"/de/projects/dixit": "/de/projects/di-xi-t",
	"/de/projects/dylen-diachronic-dynamics-lexical-networks":
		"/de/projects/dylen-diachronic-dynamics-of-lexical-networks",
	"/de/projects/east-epistemology-and-argumentation-south-asia-and-tibet":
		"/de/projects/east-epistemology-and-argumentation-in-south-asia-and-tibet",
	"/de/projects/ephesos-4d-virtual-city": "/de/projects/ephesos-4-d-die-virtuelle-stadt",
	"/de/projects/euralex-2026-lexicography-in-the-age-of-ai":
		"/de/projects/unterstuetzung-fuer-euralex-2026-lexikografie-im-zeitalter-der-ki",
	"/de/projects/european-constitutional-court-network-eccn":
		"/de/projects/das-netzwerk-europaeischer-verfassungsgerichte",
	"/de/projects/eventsearch-api": "/de/projects/event-search-api",
	"/de/projects/exploreat": "/de/projects/explore-at",
	"/de/projects/exploring-austrias-culture-through-language-glass-exploreat":
		"/de/projects/exploring-austrias-culture-through-the-language-glass-explore-at",
	"/de/projects/ferdinand-ebner-collected-works-online-edition":
		"/de/projects/ferdinand-ebner-gesammelte-werke-online-edition",
	"/de/projects/fuggerzeitungen":
		"/de/projects/die-fuggerzeitungen-ein-fruehneuzeitliches-informationsmedium-und-seine-erschliessung",
	"/de/projects/gipsabgusssammlung-salzburg-digitale-sammlung-und-virtueller-rundgang":
		"/de/projects/gipsabgusssammlung-des-fachbereichs-altertumswissenschaften-in-der-alten-residenz-salzburg-erstellung-einer-digitalen-sammlung-und-eines-virtuellen-rundgangs",
	"/de/projects/graz-repository-ancient-fables-graf": "/de/projects/grazer-repositorium-antiker-fabeln-g-ra-f",
	"/de/projects/hack-the-pool-2025":
		"/de/projects/institutionsuebergreifender-kulturdaten-hackathon-hack-the-pool-2025",
	"/de/projects/hackathon-digital-escape-rooms":
		"/de/projects/hackathon-zur-erstellung-von-digitalen-educational-escape-rooms-spanisch-und-franzoesisch-als-l2",
	"/de/projects/handke-zungen-tongues": "/de/projects/handke-in-zungen",
	"/de/projects/hgis-de-las-indas-historical-geographic-information-system-spanish-america-1701-1808":
		"/de/projects/hgis-de-las-indas-ein-historisch-geographisches-informationssystem-von-spanisch-amerika-1701-1808",
	"/de/projects/hineinsehen-heraushoeren": "/de/projects/hi-nein-sehen-he-raus-h-oe-ren",
	"/de/projects/hugo-montfort-poetic-work-visual-presentation":
		"/de/projects/hugo-von-montfort-das-poetische-werk-augenfassung",
	"/de/projects/hybridization-two-sides-ukrainian-russian-and-russian-ukrainian-code-mixing-southern-ukraine":
		"/de/projects/hybridisierung-von-zwei-seiten-ukrainisch-russisches-und-russisch-ukrainisches-code-mixing-in-der-s-ue-dukraine",
	"/de/projects/illuminated-charters-gesamtkunstwerk": "/de/projects/illuminated-charters-as-gesamtkunstwerk",
	"/de/projects/imperial-diet-regensburg-1576-digital": "/de/projects/der-regensburger-reichstag-von-1576-digital",
	"/de/projects/intangible-european-heritage-visual-analysis-curation-communication":
		"/de/projects/in-tangible-european-heritage-visual-analysis-curation-and-communication",
	"/de/projects/integrative-science-communication-science-ink":
		"/de/projects/integrative-wissenschaftskommunikation-science-ink",
	"/de/projects/itinerary-paolo-santonino-culinary-history-document":
		"/de/projects/das-itinerar-des-paolo-santonino-ein-kulinarhistorisches-dokument",
	"/de/projects/iuenna-opening-southern-jauntal-micro-region-future-archaeology":
		"/de/projects/iuenna-open-ing-the-so-uth-ern-jau-ntal-as-a-micro-regio-n-for-future-archaeology",
	"/de/projects/jelinek-online-elfriede-jelinek-work-and-reception":
		"/de/projects/jelinek-online-elfriede-jelinek-werk-und-rezeption",
	"/de/projects/joseph-von-hammer-purgstall-korrespondenz-fairification-erweiterungsworkflow":
		"/de/projects/joseph-von-hammer-purgstall-korrespondenz-fai-rification-und-erweiterungsworkflow",
	"/de/projects/karl-wiesinger-digital-edition-diaries-1961-1973":
		"/de/projects/karl-wiesinger-digitale-edition-der-tagebuecher-1961-1973",
	"/de/projects/ladder-project-learners-digital-communication-database-pragmatic-competence-italian-l2":
		"/de/projects/ladder-project-le-arners-digital-communication-a-database-for-pragmatic-competence-in-italian-l2",
	"/de/projects/ladderweb-pragmatically-annotated-web-based-corpus-query-interface-requests-and-cancellations":
		"/de/projects/ladder-web-a-pragmatically-annotated-web-based-corpus-query-interface-for-requests-and-cancellations-in-italian-l1-and-l2",
	"/de/projects/linked-and-open-bibliography-aegean-glyptic-bronze-age":
		"/de/projects/bibliografie-zur-aegaeischen-glyptik-der-bronzezeit-linked-and-open",
	"/de/projects/linked-cat-explore-half-century-knowledge-production-academy":
		"/de/projects/linked-cat-explore-half-a-century-of-knowledge-production-at-the-academy",
	"/de/projects/machine-learning-suite-iiif-resources": "/de/projects/machine-learning-suite-for-iiif-resources",
	"/de/projects/mapping-difficult-heritage":
		"/de/projects/mapping-difficult-heritage-digital-documentation-of-colonial-traces-in-austrian-urbanscapes",
	"/de/projects/marco-polo-christopher-columbus-francesco-pipinos-latin-version-il-milione":
		"/de/projects/der-marco-polo-des-christoph-kolumbus-francesco-pipinos-lateinische-version-von-il-milione",
	"/de/projects/maximilian-goes-digital-remembrance-data-storage":
		"/de/projects/kaiser-maximilian-goes-digital-vom-gedaechtnis-zum-datenspeicher",
	"/de/projects/medcorpinn": "/de/projects/med-corp-inn",
	"/de/projects/media-relations-how-and-why-older-women-care-information-and-communication-technologies":
		"/de/projects/media-relations-how-and-why-older-women-care-for-information-and-communication-technologies",
	"/de/projects/mediality-diplomatic-communication-habsburg-envoys-constantinople-mid-17th-century":
		"/de/projects/die-medialitaet-diplomatischer-kommunikation-habsburgische-gesandte-in-konstantinopel-in-der-mitte-des-17-jahrhunderts",
	"/de/projects/medieval-explorations-neuro-science-1050-1450-ontology-based-keyword-spotting-manuscript-scans":
		"/de/projects/mittelalterliche-untersuchungen-in-der-neurowissenschaft-1050-1450-ontologie-basierte-schluesselwortsuche-in-manuskript-scans",
	"/de/projects/medieval-laboratory": "/de/projects/mittelalterlabor",
	"/de/projects/medieval-manuscript-fragments-benedictine-abbey-mondsee":
		"/de/projects/modellfall-fragmentendigitalisierung-die-mittelalterlichen-fragmente-des-klosters-mondsee",
	"/de/projects/mhdbdb-goes-ai": "/de/projects/mhdbdb-goes-ai-datenaufbereitung-fuer-das-oer-llm-parziv-ai",
	"/de/projects/mozart-letters-and-documents-online-edition": "/de/projects/mozart-briefe-und-dokumente-online-edition",
	"/de/projects/multi-modal-manuscript-representations-m3r":
		"/de/projects/multimodale-manuskriptrepraesentationen-m3-r",
	"/de/projects/museum-digital-initiatives-during-coronavirus-pandemic":
		"/de/projects/museum-digital-initiatives-during-the-coronavirus-pandemic",
	"/de/projects/museum-knowledge-sciences": "/de/projects/museum-of-knowledge-sciences",
	"/de/projects/nachhaltige-infrastruktur-fuer-digitale-editionen-der-oesterreichischen-nationalbibliothek":
		"/de/projects/nachhaltige-infrastruktur-fuer-digitale-editionen-an-der-oesterreichischen-nationalbibliothek",
	"/de/projects/narrative-didactics-digital-and-other-didactive-narratives":
		"/de/projects/narrative-didactics-digitale-und-andere-didaktische-narrative",
	"/de/projects/nerdpool-data-pool-named-entity-recognition":
		"/de/projects/nerd-pool-datenpool-fuer-named-entity-recognition",
	"/de/projects/nomansland-nomads-manuscripts-landscape": "/de/projects/no-mans-land-nomadische-manuskriptlandschaften",
	"/de/projects/odeeg-online-database-research-development-vessel-shapes-and-capacities":
		"/de/projects/odeeg-online-datenbank-zur-erforschung-der-entwicklung-von-gefaessformen-und-massen",
	"/de/projects/oedoen-horvath-historical-critical-edition-digital-edition":
		"/de/projects/oedoen-von-horvath-historisch-kritische-ausgabe-digitale-edition",
	"/de/projects/oenb-labs-symposium-2024": "/de/projects/oe-nb-labs-symposium-2024",
	"/de/projects/oenb-labs-video-tutorials": "/de/projects/oe-nb-labs-video-tutorials",
	"/de/projects/oim-osservatorio-degli-italianismi-nel-mondo-observatory-italian-loanwords-worldwide":
		"/de/projects/oim-observatorium-der-italianismen-weltweit",
	"/de/projects/onama-ontology-narratives-middle-ages": "/de/projects/onama-ontologie-der-narrative-des-mittelalters",
	"/de/projects/onb-labs": "/de/projects/oe-nb-labs",
	"/de/projects/openatlas": "/de/projects",
	"/de/projects/ottoman-nature-travelogues-1501-1850-digital-analysis-onit":
		"/de/projects/ottoman-nature-in-travelogues-1501-1850-a-digital-analysis-o-ni-t",
	"/de/projects/peter-handke-notebooks-digital-edition": "/de/projects/peter-handke-notizbuecher-digitale-edition",
	"/de/projects/picturing-migrants-lives": "/de/projects/visualisierung-migrantischer-lebenswelten",
	"/de/projects/pilot-corpus-pannonian-rusyn":
		"/de/projects/pilot-corpus-for-tokenization-and-lemmatization-of-pannonian-rusyn-a-first-step-toward-open-language-resources",
	"/de/projects/power-and-diplomacy-illuminated-charter-france-1160-ca-1420":
		"/de/projects/macht-und-diplomatie-die-illuminierte-urkunde-in-frankreich-1160-ca-1420",
	"/de/projects/privater-buchbesitz-tirol-1750-und-1850":
		"/de/projects/privater-buchbesitz-in-tirol-zwischen-1750-und-1850",
	"/de/projects/progressive-visual-decision-making-digital-humanities-providedh":
		"/de/projects/progressive-visual-decision-making-in-digital-humanities-providedh",
	"/de/projects/propaganda-context-youtube-clips-about-bandera-lukashenka-and-navalnyi":
		"/de/projects/propaganda-im-kontext-you-tube-videos-ueber-bandera-lukasenka-und-naval-nyj",
	"/de/projects/prototype-historical-critical-online-edition-based-estate-materials-josef-maria-baernreither":
		"/de/projects/prototype-of-a-historical-critical-online-edition-based-on-the-estate-materials-of-josef-maria-baernreither",
	"/de/projects/puzzle-4d": "/de/projects/a-puzzle-in-4-d",
	"/de/projects/read-recognition-and-enrichment-archival-documents":
		"/de/projects/read-recognition-and-enrichment-of-archival-documents",
	"/de/projects/realonline-image-database": "/de/projects/rea-lonline-bilddatenbank",
	"/de/projects/reassembling-republic-letters": "/de/projects/reassembling-the-republic-of-letters",
	"/de/projects/recommendations-for-the-academic-citation-of-digital-resources":
		"/de/projects/empfehlungen-zum-akademischen-zitieren-von-digitalen-ressourcen",
	"/de/projects/renaissance-architecture": "/de/projects/renaissance-architektur",
	"/de/projects/representation-of-risks-and-responsibility-in-the-automation-debate-mara":
		"/de/projects/die-repraesentation-von-risiken-and-verantwortung-im-automatisierungsdiskurs-mara",
	"/de/projects/roma-journey": "/de/projects/a-roma-journey",
	"/de/projects/salta-open-source-tool-und-database":
		"/de/projects/salta-open-source-tool-und-database-zur-segmentierung-multimodaler-performances",
	"/de/projects/sarit-search-and-retrieval-indic-texts": "/de/projects/sarit-search-and-retrieval-of-indic-texts",
	"/de/projects/semantickraus-connecting-kraus-scholarship-semantic-web":
		"/de/projects/semantic-kraus-connecting-kraus-scholarship-to-the-semantic-web",
	"/de/projects/sentiment-analysis-18th-century-multilingual-corpora":
		"/de/projects/sentiment-analysis-for-18th-century-multilingual-corpora",
	"/de/projects/sentiment-annotated-corpus-of-austrian-historical-newspapers":
		"/de/projects/korpus-oesterreichischer-historischer-zeitungen-mit-sentiment-annotationen",
	"/de/projects/sharing-crown-establishing-workflow-collection-data-linked-research-data":
		"/de/projects/sharing-the-crown-einrichtung-eines-workflows-von-sammlungsdaten-zu-verknuepften-forschungsdaten",
	"/de/projects/shifting-patterns-you-and-thou-modelling-address-english-sonnet":
		"/de/projects/veraenderte-muster-von-you-und-thou-modellierung-der-anrede-im-englischen-sonett",
	"/de/projects/soundscapes-vienna": "/de/projects/vienna-soundscapes",
	"/de/projects/special-research-programme-german-austria-variation-contact-perception":
		"/de/projects/spezialforschungsbereich-deutsch-in-oesterreich-variation-kontakt-perzeption",
	"/de/projects/spectators-international-context": "/de/projects/die-spectators-im-internationalen-kontext",
	"/de/projects/st-patricks-epistles-transcriptions-seven-medieval-manuscript-witnesses":
		"/de/projects/st-patricks-epistles-transcriptions-of-the-seven-medieval-manuscript-witnesses",
	"/de/projects/summer-school-ml-for-digital-editions":
		"/de/projects/summer-school-machine-learning-for-digital-scholarly-editions",
	"/de/projects/tegernseer-wirtschaftsbuechlein-als-hyperdiplomatische-transkription":
		"/de/projects/publikation-des-tegernseer-wirtschaftsbuechlein-als-hyperdiplomatische-transkription",
	"/de/projects/tei-converter-e-book-and-print-editions": "/de/projects/tei-converter-fuer-e-book-und-druck-editionen",
	"/de/projects/thanados-anthropological-and-archaeological-database-sepultures":
		"/de/projects/thanados-the-anthropological-and-archaeological-database-of-sepultures",
	"/de/projects/topotheque": "/de/projects/topothek",
	"/de/projects/traveldigital": "/de/projects/travel-digital",
	"/de/projects/travelogues-perceptions-other-1500-1876-computerized-analysis":
		"/de/projects/travelogues-perceptions-of-the-other-1500-1876-a-computerized-analysis",
	"/de/projects/twitter-archiv-ianina-ilitcheva": "/de/projects/twitter-archiv-von-ianina-ilitcheva",
	"/de/projects/unfolding-woldan-collection-prototype-dissemination-and-visualization-cultural-heritage-spatial":
		"/de/projects/unfolding-the-woldan-collection-ein-prototyp-fuer-die-verbreitung-und-visualisierung-von-kulturgut-im-raeumlich-zeitlichen-kontext",
	"/de/projects/unitv-salzburg": "/de/projects/uni-tv-salzburg",
	"/de/projects/urfehdebuecher-city-basel-digital-edition":
		"/de/projects/urfehdebuecher-der-stadt-basel-digitale-edition",
	"/de/projects/vereinsaufloesungen-im-amtlichen-nachrichtenblatt-1938-1940":
		"/de/projects/automatisierte-erfassung-und-semantische-erschliessung-der-vereinsaufloesungen-im-amtlichen-nachrichtenblatt-1938-1940",
	"/de/projects/vicav": "/de/projects",
	"/de/projects/vienna-time-machine": "/de/projects/time-machine-wien",
	"/de/projects/visually-reading-pandemic-covid19": "/de/projects/visually-reading-the-pandemic-covid-19",
	"/de/projects/wares-types-and-fabrics-upper-egypt-contribution-levantine-ceramics-project":
		"/de/projects/waren-typen-und-fabrikate-ein-beitrag-aus-oberaegypten-zum-levantine-ceramics-project",
	"/de/projects/wb-meets-mhdbdb":
		"/de/projects/wb-meets-mhdbdb-die-wenzelsbibel-als-pilotmodell-fuer-interoperable-editionen",
	"/de/projects/wiennerisches-diarium":
		"/de/projects/das-wien-n-erische-diarium-digitaler-datenschatz-fuer-die-geisteswissenschaftlichen-disziplinen",
	"/de/projects/workshop-re-late-use-work":
		"/de/projects/workshop-re-late-re-use-re-work-potenziale-fuer-varianten-und-intertextualitaetsanalysen-in-den-digital-humanities",
	"/en/projects/3d-digitizing-glaser-squeezes": "/en/projects/3-d-digitizing-of-glaser-squeezes",
	"/en/projects/abacus-austrian-baroque-corpus": "/en/projects/a-ba-c-us-austrian-baroque-corpus",
	"/en/projects/ambraser-heldenbuch": "/en/projects/ambraser-heldenbuch-transcription-and-scientific-dataset",
	"/en/projects/andreas-okopenko-diaries-poets-estate-hybrid-edition":
		"/en/projects/andreas-okopenko-diaries-from-the-poets-estate-hybrid-edition",
	"/en/projects/archaeological-collections-university-graz":
		"/en/projects/archaeological-collections-of-the-university-of-graz",
	"/en/projects/arche": "/en/projects",
	"/en/projects/arthur-schnitzler-correspondence-writers": "/en/projects/arthur-schnitzler-correspondence-with-writers",
	"/en/projects/asynchrones-lernangebot-forschungsdatenmanagement":
		"/en/projects/asynchronous-learning-resources-on-topics-in-research-data-management",
	"/en/projects/atlas-viennese-avantgardes": "/en/projects/atlas-of-the-viennese-avantgardes",
	"/en/projects/austrian-radio-journals-1967-1999-www-journale":
		"/en/projects/austrian-radio-journals-from-1967-to-1999-www-journale-at",
	"/en/projects/becoming-urban-reconstructing-city-graz-long-19th-century-beurb":
		"/en/projects/becoming-urban-reconstructing-the-city-of-graz-in-the-long-19th-century-be-urb",
	"/en/projects/between-composition-and-reception-authority-medieval-charters-becore":
		"/en/projects/between-composition-and-reception-the-authority-of-medieval-charters-be-co-re",
	"/en/projects/biodiversity-cultural-and-linguistic-diversity-movement":
		"/en/projects/biodiversity-cultural-and-linguistic-diversity-a-movement",
	"/en/projects/cataloguing-manuscripts-library-matthias-corvinus-austria":
		"/en/projects/cataloguing-the-manuscripts-from-the-library-of-matthias-corvinus-in-austria",
	"/en/projects/celtic-divine-names-inscriptions-roman-province-germania-inferior":
		"/en/projects/celtic-divine-names-in-the-inscriptions-of-the-roman-province-germania-inferior",
	"/en/projects/chia-accessing-and-analysing-cultural-images-new-technologies":
		"/en/projects/ch-ia-accessing-and-analysing-cultural-images-with-new-technologies",
	"/en/projects/clarin-fcs-implementation":
		"/en/projects/unlocking-the-full-potential-of-textual-resources-application-of-fair-data-principles-through-clarin-federated-content-search-implementation",
	"/en/projects/co-op-community-opportunity": "/en/projects/co-op-community-as-opportunity",
	"/en/projects/computational-analysis-of-jazz-history":
		"/en/projects/gender-networks-and-artistic-success-a-computational-analysis-of-jazz-history",
	"/en/projects/computer-vision-digital-humanists": "/en/projects/computer-vision-for-digital-humanists",
	"/en/projects/corema-cooking-recipes-middle-ages-corpus-analysis-visualisation":
		"/en/projects/co-re-ma-cooking-recipes-of-the-middle-ages-corpus-analysis-visualisation",
	"/en/projects/cultural-and-scientific-heritage-styria": "/en/projects/cultural-and-scientific-heritage-of-styria",
	"/en/projects/dariah-eu-eldah-gdpr-consent-form-wizard": "/en/projects/the-dariah-eu-eldah-gdpr-consent-form-wizard",
	"/en/projects/datenanalyse-oenb-labs": "/en/projects/data-analysis-in-the-oe-nb-labs",
	"/en/projects/depcha-digital-edition-publishing-cooperative-historical-accounts":
		"/en/projects/depcha-digital-edition-publishing-cooperative-for-historical-accounts",
	"/en/projects/design-4-emergency": "/en/projects/design-4-emergency-at",
	"/en/projects/developing-hubert-nlp-algorithm-extending-seshat-global-history-databank":
		"/en/projects/developing-hu-bert-a-natural-language-processing-algorithm-for-extending-the-seshat-global-history-databank",
	"/en/projects/dictionary-bavarian-dialects-austria-wboe":
		"/en/projects/dictionary-of-bavarian-dialects-in-austria-wb-oe",
	"/en/projects/die-korrespondenz-leo-thun-hohenstein": "/en/projects/die-korrespondenz-von-leo-von-thun-hohenstein",
	"/en/projects/die-sammlung-amadei": "/en/projects/the-amadei-collection-digitization-open-data-public-outreach",
	"/en/projects/digiculture-improving-digital-competences-and-social-inclusion-adults-creative-industries":
		"/en/projects/digi-culture-improving-the-digital-competences-and-social-inclusion-of-adults-in-creative-industries",
	"/en/projects/digital-editions-medieval-and-early-modern-accounts":
		"/en/projects/digital-editions-of-medieval-and-early-modern-accounts",
	"/en/projects/digital-history-doing-cultural-heritage-2026":
		"/en/projects/international-conference-digital-history-doing-cultural-heritage",
	"/en/projects/digital-memoryscape-austria-erinnerungslandschaft-persecution-and-resistance-during-ns-documentation":
		"/en/projects/digital-memoryscape-austria-erinnerungslandschaft-at-persecution-and-resistance-during-ns-documentation-and-education",
	"/en/projects/digital-scholarly-edition-habsburg-ottoman-diplomatic-sources-1500-1918":
		"/en/projects/digital-scholarly-edition-of-habsburg-ottoman-diplomatic-sources-1500-1918",
	"/en/projects/digital-sustainability-relaunch-mhdbdb": "/en/projects/digital-sustainability-relaunch-of-the-mhdbdb",
	"/en/projects/digital-tools-historical-inventories": "/en/projects/digital-tools-for-historical-inventories",
	"/en/projects/digitaler-arnim-bibliothekskatalog":
		"/en/projects/authors-libraries-as-knowledge-spaces-digitization-of-the-catalog-of-the-arnim-library",
	"/en/projects/digitas-digital-affects-and-space": "/en/projects/digit-as-the-digital-affects-and-space",
	"/en/projects/digitising-patterns-power-dpp": "/en/projects/digitising-patterns-of-power-dpp",
	"/en/projects/digitizing-materiality-premodern-book": "/en/projects/digitizing-the-materiality-of-the-premodern-book",
	"/en/projects/distant-spectators-distant-reading-periodicals-enlightenment-dispecs":
		"/en/projects/distant-spectators-distant-reading-for-periodicals-of-the-enlightenment-di-specs",
	"/en/projects/ditah-digital-transformation-austrian-humanities":
		"/en/projects/di-tah-digital-transformation-of-the-austrian-humanities",
	"/en/projects/dixit": "/en/projects/di-xi-t",
	"/en/projects/dylen-diachronic-dynamics-lexical-networks":
		"/en/projects/dylen-diachronic-dynamics-of-lexical-networks",
	"/en/projects/east-epistemology-and-argumentation-south-asia-and-tibet":
		"/en/projects/east-epistemology-and-argumentation-in-south-asia-and-tibet",
	"/en/projects/ephesos-4d-virtual-city": "/en/projects/ephesos-4-d-the-virtual-city",
	"/en/projects/euralex-2026-lexicography-in-the-age-of-ai":
		"/en/projects/support-for-euralex-2026-lexicography-in-the-age-of-ai",
	"/en/projects/eventsearch-api": "/en/projects/event-search-api",
	"/en/projects/exploreat": "/en/projects/explore-at",
	"/en/projects/exploring-austrias-culture-through-language-glass-exploreat":
		"/en/projects/exploring-austrias-culture-through-the-language-glass-explore-at",
	"/en/projects/fuggerzeitungen":
		"/en/projects/the-fuggerzeitungen-an-early-modern-informative-medium-and-its-indexing",
	"/en/projects/gipsabgusssammlung-salzburg-digitale-sammlung-und-virtueller-rundgang":
		"/en/projects/cast-collection-of-the-department-of-classical-studies-at-the-old-residence-salzburg-creation-of-a-digital-collection-and-virtual-tour",
	"/en/projects/graz-repository-ancient-fables-graf": "/en/projects/graz-repository-of-ancient-fables-g-ra-f",
	"/en/projects/hack-the-pool-2025":
		"/en/projects/institutionsuebergreifender-kulturdaten-hackathon-hack-the-pool-2025",
	"/en/projects/hackathon-digital-escape-rooms":
		"/en/projects/hackathon-for-the-creation-of-digital-educational-escape-rooms-spanish-and-french-l2",
	"/en/projects/handke-zungen-tongues": "/en/projects/handke-in-zungen-in-tongues",
	"/en/projects/hgis-de-las-indas-historical-geographic-information-system-spanish-america-1701-1808":
		"/en/projects/hgis-de-las-indas-a-historical-geographic-information-system-for-spanish-america-1701-1808",
	"/en/projects/hineinsehen-heraushoeren": "/en/projects/hi-nein-sehen-he-raus-h-oe-ren",
	"/en/projects/hugo-montfort-poetic-work-visual-presentation":
		"/en/projects/hugo-von-montfort-the-poetic-work-visual-presentation",
	"/en/projects/hybridization-two-sides-ukrainian-russian-and-russian-ukrainian-code-mixing-southern-ukraine":
		"/en/projects/hybridization-from-two-sides-ukrainian-russian-and-russian-ukrainian-code-mixing-in-southern-ukraine",
	"/en/projects/illuminated-charters-gesamtkunstwerk": "/en/projects/illuminated-charters-as-gesamtkunstwerk",
	"/en/projects/imperial-diet-regensburg-1576-digital": "/en/projects/the-imperial-diet-of-regensburg-1576-digital",
	"/en/projects/intangible-european-heritage-visual-analysis-curation-communication":
		"/en/projects/in-tangible-european-heritage-visual-analysis-curation-and-communication",
	"/en/projects/itinerary-paolo-santonino-culinary-history-document":
		"/en/projects/the-itinerary-of-paolo-santonino-a-culinary-history-document",
	"/en/projects/iuenna-opening-southern-jauntal-micro-region-future-archaeology":
		"/en/projects/iuenna-open-ing-the-so-uth-ern-jau-ntal-as-a-micro-regio-n-for-future-archaeology",
	"/en/projects/joseph-von-hammer-purgstall-korrespondenz-fairification-erweiterungsworkflow":
		"/en/projects/joseph-von-hammer-purgstall-correspondence-fai-rification-and-expansion-workflow",
	"/en/projects/karl-wiesinger-digital-edition-diaries-1961-1973":
		"/en/projects/karl-wiesinger-digital-edition-of-the-diaries-1961-1973",
	"/en/projects/ladder-project-learners-digital-communication-database-pragmatic-competence-italian-l2":
		"/en/projects/ladder-project-le-arners-digital-communication-a-database-for-pragmatic-competence-in-italian-l2",
	"/en/projects/ladderweb-pragmatically-annotated-web-based-corpus-query-interface-requests-and-cancellations":
		"/en/projects/ladder-web-a-pragmatically-annotated-web-based-corpus-query-interface-for-requests-and-cancellations-in-italian-l1-and-l2",
	"/en/projects/linked-and-open-bibliography-aegean-glyptic-bronze-age":
		"/en/projects/a-linked-and-open-bibliography-for-aegean-glyptic-in-the-bronze-age",
	"/en/projects/linked-cat-explore-half-century-knowledge-production-academy":
		"/en/projects/linked-cat-explore-half-a-century-of-knowledge-production-at-the-academy",
	"/en/projects/machine-learning-suite-iiif-resources": "/en/projects/machine-learning-suite-for-iiif-resources",
	"/en/projects/mapping-difficult-heritage":
		"/en/projects/mapping-difficult-heritage-digital-documentation-of-colonial-traces-in-austrian-urbanscapes",
	"/en/projects/marco-polo-christopher-columbus-francesco-pipinos-latin-version-il-milione":
		"/en/projects/the-marco-polo-of-christopher-columbus-francesco-pipinos-latin-version-of-il-milione",
	"/en/projects/maximilian-goes-digital-remembrance-data-storage":
		"/en/projects/maximilian-goes-digital-from-remembrance-to-data-storage",
	"/en/projects/medcorpinn": "/en/projects/med-corp-inn",
	"/en/projects/media-relations-how-and-why-older-women-care-information-and-communication-technologies":
		"/en/projects/media-relations-how-and-why-older-women-care-for-information-and-communication-technologies",
	"/en/projects/mediality-diplomatic-communication-habsburg-envoys-constantinople-mid-17th-century":
		"/en/projects/the-mediality-of-diplomatic-communication-habsburg-envoys-in-constantinople-in-the-mid-17th-century",
	"/en/projects/medieval-explorations-neuro-science-1050-1450-ontology-based-keyword-spotting-manuscript-scans":
		"/en/projects/medieval-explorations-in-neuro-science-1050-1450-ontology-based-keyword-spotting-in-manuscript-scans",
	"/en/projects/medieval-manuscript-fragments-benedictine-abbey-mondsee":
		"/en/projects/medieval-manuscript-fragments-from-the-benedictine-abbey-of-mondsee",
	"/en/projects/mhdbdb-goes-ai": "/en/projects/mhdbdb-goes-ai-data-preparation-for-the-oer-llm-parziv-ai",
	"/en/projects/multi-modal-manuscript-representations-m3r": "/en/projects/multi-modal-manuscript-representations-m3-r",
	"/en/projects/museum-digital-initiatives-during-coronavirus-pandemic":
		"/en/projects/museum-digital-initiatives-during-the-coronavirus-pandemic",
	"/en/projects/museum-knowledge-sciences": "/en/projects/museum-of-knowledge-sciences",
	"/en/projects/musil-online-TEI-konsolidierung": "/en/projects/musil-online-tei-consolidation",
	"/en/projects/nachhaltige-infrastruktur-fuer-digitale-editionen-der-oesterreichischen-nationalbibliothek":
		"/en/projects/sustainable-infrastructure-for-scholarly-digital-editions-at-the-austrian-national-library",
	"/en/projects/nerdpool-data-pool-named-entity-recognition":
		"/en/projects/nerd-pool-data-pool-for-named-entity-recognition",
	"/en/projects/nomansland-nomads-manuscripts-landscape": "/en/projects/no-mans-land-nomads-manuscripts-landscape",
	"/en/projects/odeeg-online-database-research-development-vessel-shapes-and-capacities":
		"/en/projects/odeeg-online-database-for-research-on-the-development-of-vessel-shapes-and-capacities",
	"/en/projects/oedoen-horvath-historical-critical-edition-digital-edition":
		"/en/projects/oedoen-von-horvath-historical-critical-edition-digital-edition",
	"/en/projects/oenb-labs-symposium-2024": "/en/projects/oe-nb-labs-symposium-2024",
	"/en/projects/oenb-labs-video-tutorials": "/en/projects/oe-nb-labs-video-tutorials",
	"/en/projects/oim-osservatorio-degli-italianismi-nel-mondo-observatory-italian-loanwords-worldwide":
		"/en/projects/oim-osservatorio-degli-italianismi-nel-mondo-observatory-on-italian-loanwords-worldwide",
	"/en/projects/onama-ontology-narratives-middle-ages": "/en/projects/onama-ontology-of-narratives-of-the-middle-ages",
	"/en/projects/openatlas": "/en/projects",
	"/en/projects/ottoman-nature-travelogues-1501-1850-digital-analysis-onit":
		"/en/projects/ottoman-nature-in-travelogues-1501-1850-a-digital-analysis-o-ni-t",
	"/en/projects/pilot-corpus-pannonian-rusyn":
		"/en/projects/pilot-corpus-for-tokenization-and-lemmatization-of-pannonian-rusyn-a-first-step-toward-open-language-resources",
	"/en/projects/power-and-diplomacy-illuminated-charter-france-1160-ca-1420":
		"/en/projects/power-and-diplomacy-the-illuminated-charter-in-france-1160-ca-1420",
	"/en/projects/privater-buchbesitz-tirol-1750-und-1850":
		"/en/projects/privater-buchbesitz-in-tirol-zwischen-1750-und-1850",
	"/en/projects/progressive-visual-decision-making-digital-humanities-providedh":
		"/en/projects/progressive-visual-decision-making-in-digital-humanities-providedh",
	"/en/projects/propaganda-context-youtube-clips-about-bandera-lukashenka-and-navalnyi":
		"/en/projects/propaganda-in-context-you-tube-clips-about-bandera-lukashenka-and-naval-nyi",
	"/en/projects/prototype-historical-critical-online-edition-based-estate-materials-josef-maria-baernreither":
		"/en/projects/prototype-of-a-historical-critical-online-edition-based-on-the-estate-materials-of-josef-maria-baernreither",
	"/en/projects/puzzle-4d": "/en/projects/a-puzzle-in-4-d",
	"/en/projects/read-recognition-and-enrichment-archival-documents":
		"/en/projects/read-recognition-and-enrichment-of-archival-documents",
	"/en/projects/realonline-image-database": "/en/projects/rea-lonline-image-database",
	"/en/projects/reassembling-republic-letters": "/en/projects/reassembling-the-republic-of-letters",
	"/en/projects/ringvorlesung-musikwissenschaft-and-digital-humanities":
		"/en/projects/distinguished-lecture-series-music-and-digital-humanities",
	"/en/projects/roma-journey": "/en/projects/a-roma-journey",
	"/en/projects/salta-open-source-tool-und-database":
		"/en/projects/salta-open-source-tool-and-database-for-the-segmentation-of-multimodal-performances",
	"/en/projects/sarit-search-and-retrieval-indic-texts": "/en/projects/sarit-search-and-retrieval-of-indic-texts",
	"/en/projects/semantickraus-connecting-kraus-scholarship-semantic-web":
		"/en/projects/semantic-kraus-connecting-kraus-scholarship-to-the-semantic-web",
	"/en/projects/sentiment-analysis-18th-century-multilingual-corpora":
		"/en/projects/sentiment-analysis-for-18th-century-multilingual-corpora",
	"/en/projects/sharing-crown-establishing-workflow-collection-data-linked-research-data":
		"/en/projects/sharing-the-crown-establishing-a-workflow-from-collection-data-to-linked-research-data",
	"/en/projects/shifting-patterns-you-and-thou-modelling-address-english-sonnet":
		"/en/projects/shifting-patterns-of-you-and-thou-modelling-address-in-the-english-sonnet",
	"/en/projects/soundscapes-vienna": "/en/projects/soundscapes-from-vienna",
	"/en/projects/special-research-programme-german-austria-variation-contact-perception":
		"/en/projects/special-research-programme-german-in-austria-variation-contact-perception",
	"/en/projects/spectators-international-context": "/en/projects/the-spectators-in-the-international-context",
	"/en/projects/st-patricks-epistles-transcriptions-seven-medieval-manuscript-witnesses":
		"/en/projects/st-patricks-epistles-transcriptions-of-the-seven-medieval-manuscript-witnesses",
	"/en/projects/summer-school-ml-for-digital-editions":
		"/en/projects/summer-school-machine-learning-for-digital-scholarly-editions",
	"/en/projects/tegernseer-wirtschaftsbuechlein-als-hyperdiplomatische-transkription":
		"/en/projects/publication-of-the-tegernsee-economic-booklet-as-a-hyperdiplomatic-transcription",
	"/en/projects/tei-converter-e-book-and-print-editions": "/en/projects/tei-converter-for-e-book-and-print-editions",
	"/en/projects/thanados-anthropological-and-archaeological-database-sepultures":
		"/en/projects/thanados-the-anthropological-and-archaeological-database-of-sepultures",
	"/en/projects/traveldigital": "/en/projects/travel-digital",
	"/en/projects/travelogues-perceptions-other-1500-1876-computerized-analysis":
		"/en/projects/travelogues-perceptions-of-the-other-1500-1876-a-computerized-analysis",
	"/en/projects/twitter-archiv-ianina-ilitcheva": "/en/projects/twitter-archive-of-ianina-ilitcheva",
	"/en/projects/unfolding-woldan-collection-prototype-dissemination-and-visualization-cultural-heritage-spatial":
		"/en/projects/unfolding-the-woldan-collection-a-prototype-for-dissemination-and-visualization-of-cultural-heritage-in-a-spatial-temporal-way",
	"/en/projects/unitv-salzburg": "/en/projects/uni-tv-salzburg",
	"/en/projects/untersuchung-von-iiif-in-digitalen-editionen": "/en/projects/investigation-of-iiif-in-digital-editions",
	"/en/projects/urfehdebuecher-city-basel-digital-edition":
		"/en/projects/urfehdebuecher-of-the-city-of-basel-digital-edition",
	"/en/projects/vereinsaufloesungen-im-amtlichen-nachrichtenblatt-1938-1940":
		"/en/projects/automated-recording-and-semantic-analysis-of-association-dissolutions-in-the-official-gazette-1938-1940",
	"/en/projects/vicav": "/en/projects",
	"/en/projects/visually-reading-pandemic-covid19": "/en/projects/visually-reading-the-pandemic-covid-19",
	"/en/projects/von-vielen-bildern-lernen": "/en/projects/learning-from-many-images",
	"/en/projects/wares-types-and-fabrics-upper-egypt-contribution-levantine-ceramics-project":
		"/en/projects/wares-types-and-fabrics-the-upper-egypt-contribution-to-the-levantine-ceramics-project",
	"/en/projects/wb-meets-mhdbdb":
		"/en/projects/wb-meets-mhdbdb-the-wenzelsbibel-as-a-pilot-model-for-interoperable-editions",
	"/en/projects/wiennerisches-diarium":
		"/en/projects/the-wien-n-erisches-diarium-a-digital-data-trove-for-the-humanities",
	"/en/projects/workshop-re-late-use-work":
		"/en/projects/workshop-re-late-re-use-re-work-potentials-for-variant-and-intertextuality-analyses-in-the-digital-humanities",
};

/**
 * Redirects carried over from `src/config/redirects.config.ts` in the previous Astro website
 * (`acdh-oeaw/clariah-at-website`).
 */
const astroRedirects: Record<string, string> = {
	"/about-clariah-at": "/en/pages/about-clariah-at",
	"/acdh-ch-lecture-10-1": "/en/events/acdh-ch-lecture-10-1",
	"/acdh-ch-lecture-10-2": "/en/events/acdh-ch-lecture-10-2",
	"/acdh-ch-lecture-10-3": "/en/events/acdh-ch-lecture-10-3",
	"/acdh-ch-lecture-8-1-the-problem-with-social-media-reserach":
		"/en/events/acdh-ch-lecture-8-1-the-problem-with-social-media-research",
	"/acdh-ch-lecture-8-2-the-role-of-simplicity-and-linking-in-the-practice-of-digital-archaeology":
		"/en/events/acdh-ch-lecture-8-2-the-role-of-simplicity-and-linking-in-the-practice-of-digital-archaeology",
	"/acdh-ch-lecture-8-3": "/en/events/acdh-ch-lecture-8-3-cultural-analysis-as-a-multidisciplinary-science",
	"/acdh-ch-lecture-8-4-contextualizing-museum-data-digitization-infrastructure-and-digital-literacy":
		"/en/events/acdh-ch-lecture-8-4-contextualizing-museum-data-digitization-infrastructure-and-digital-literacy",
	"/acdh-ch-lecture-9-1": "/en/events/acdh-ch-lecture-9-1",
	"/acdh-ch-lecture-9-1-with-achim-rabus-online": "/en/news/acdh-ch-lecture-9-1-with-achim-rabus-online",
	"/acdh-ch-lecture-9-2": "/en/events/acdh-ch-lecture-9-2",
	"/acdh-ch-lecture-9-3": "/en/events/acdh-ch-lecture-9-3",
	"/acdh-ch-tool-gallery-10-1": "/en/events/acdh-ch-tool-gallery-10-1-transkribus-for-beginners",
	"/acdh-ch-tool-gallery-10-2": "/en/events/acdh-ch-tool-gallery-10-2-encoding-manuscripts-with-tei-xml-training",
	"/acdh-ch-tool-gallery-8-2-teaching-digital-humanities":
		"/en/events/acdh-ch-tool-gallery-8-2-teaching-digital-humanities",
	"/acdh-ch-tool-gallery-9-1-xslt-dh-2": "/en/events/acdh-ch-tool-gallery-9-1-xslt-fuer-digital-humanists",
	"/acdh-ch-tool-gallery-9-2-transkribus-for-beginners":
		"/en/events/acdh-ch-tool-gallery-9-2-transkribus-for-beginners",
	"/acdh-ch-tool-gallery-9-3-2": "/en/events/acdh-ch-tool-gallery-9-3-transkribus-for-advanced-users",
	"/call-for-abstracts-clarin-2024": "/en/news/call-for-abstracts-clarin-annual-conference-2024",
	"/call-for-contributions-updating-konde":
		"/en/news/call-for-contributions-updating-the-white-paper-weissbuch-digital-edition",
	"/call-for-participants-dariah-2024": "/en/news/call-for-participants-dariah-annual-event-2024",
	"/cfp-austrian-meeting-on-digital-linguistics-oelt-2023":
		"/en/news/call-for-papers-austrian-meeting-on-digital-linguistics-recent-developments-in-austria-at-oe-lt-2023",
	"/cfp-back-and-into-the-future-10th-digital-library-meeting":
		"/en/news/cf-p-back-and-to-the-future-10th-conference-digital-library",
	"/cfp-book-proposal":
		"/en/news/cf-p-book-proposal-digital-translation-history-processing-historical-data-with-new-methodologies",
	"/clarin-2023-call-for-abstracts": "/en/news/clarin-annual-conference-2023-call-for-extended-abstracts",
	"/clarin-cafe-computer-assisted-pragmatic-annotation-of-native-and-learner-corpora-2":
		"/en/events/clarin-cafe-computer-assisted-pragmatic-annotation-of-native-and-learner-corpora",
	"/clarin-cafe-translation-technologies-and-workflows-for-ssh-researchers-2":
		"/en/events/clarin-cafe-translation-technologies-and-amp-workflows-for-ssh-researchers",
	"/computer-vision-for-digital-humanists": "/en/projects/computer-vision-for-digital-humanists",
	"/computer-vision-for-digital-humanists-a-three-day-winter-school-hosted-by-the-university-of-graz":
		"/en/events/computer-vision-for-digital-humanists-a-three-day-winter-school-hosted-by-the-university-of-graz",
	"/conference-on-cultural-heritage-new-technologies-cultural-heritage-nextgen":
		"/en/events/conference-on-cultural-heritage-and-new-technologies-cultural-heritage-next-gen",
	"/dariah-campus-how-to-workshop": "/en/events/dariah-campus-how-to-workshop",
	"/dazzling-data-lecture-circuit-now-available-online": "/en/news/dazzling-data-lecture-circuit-now-available-online",
	"/dazzling-data-lectureseries-izmf-23-24":
		"/en/events/dazzling-data-digital-humanities-in-medieval-and-early-modern-studies",
	"/dch-speed-dating": "/en/events/d-c-h-speed-dating",
	"/de/acdh-ch-lecture-10-1-2": "/de/events/acdh-ch-lecture-10-1",
	"/de/acdh-ch-lecture-10-2-2": "/de/events/acdh-ch-lecture-10-2",
	"/de/acdh-ch-lecture-10-3-2": "/de/events/acdh-ch-lecture-10-3",
	"/de/acdh-ch-lecture-8-1-the-problem-with-social-media-research-2":
		"/de/events/acdh-ch-lecture-8-1-the-problem-with-social-media-research",
	"/de/acdh-ch-lecture-8-2-the-role-of-simplicity-and-linking-in-the-practice-of-digital-archaeology-2":
		"/de/events/acdh-ch-lecture-8-2-the-role-of-simplicity-and-linking-in-the-practice-of-digital-archaeology",
	"/de/acdh-ch-lecture-8-3-2":
		"/de/events/acdh-ch-lecture-8-3-kulturanalyse-als-integrierte-geistes-und-naturwissenschaft",
	"/de/acdh-ch-lecture-8-4-contextualizing-museum-data-digitization-infrastructure-and-digital-literacy-2":
		"/de/events/acdh-ch-lecture-8-4-contextualizing-museum-data-digitization-infrastructure-and-digital-literacy",
	"/de/acdh-ch-lecture-9-1-1": "/de/events/acdh-ch-lecture-9-1",
	"/de/acdh-ch-lecture-9-2-2": "/de/events/acdh-ch-lecture-9-2",
	"/de/acdh-ch-lecture-9-3-2": "/de/events/acdh-ch-lecture-9-3",
	"/de/acdh-ch-lecture-mit-achim-rabus-ist-online": "/de/news/acdh-ch-lecture-mit-achim-rabus-ist-online",
	"/de/acdh-ch-tool-gallery-10-1-2": "/de/events/acdh-ch-tool-gallery-10-1-transkribus-fuer-anfaenger-innen",
	"/de/acdh-ch-tool-gallery-10-2-2": "/de/events/acdh-ch-tool-gallery-10-2-encoding-manuscripts-with-tei-xml-training",
	"/de/acdh-ch-tool-gallery-8-2-teaching-digital-humanities-2":
		"/de/events/acdh-ch-tool-gallery-8-2-teaching-digital-humanities",
	"/de/acdh-ch-tool-gallery-9-1-xslt-dh": "/de/events/acdh-ch-tool-gallery-9-1-xslt-fuer-digital-humanists",
	"/de/acdh-ch-tool-gallery-9-2-transkribus-fur-anfangerinnen":
		"/de/events/acdh-ch-tool-gallery-9-2-transkribus-fuer-anfaenger-innen",
	"/de/acdh-ch-tool-gallery-9-3": "/de/events/acdh-ch-tool-gallery-9-3-transkribus-fuer-fortgeschrittene",
	"/de/aktuelles": "/de/news",
	"/de/auswahlergebnis-der-projektausschreibung-veroffentlicht":
		"/de/news/auswahlergebnis-der-projektausschreibung-veroeffentlicht",
	"/de/call-for-abstracts-clarin-2024-2": "/de/news/call-for-abstracts-clarin-annual-conference-2024",
	"/de/call-for-contributions-update-konde": "/de/news/call-for-contributions-update-weissbuch-digitale-edition",
	"/de/cfp-buchentwurf":
		"/de/news/cf-p-buchentwurf-digital-translation-history-processing-historical-data-with-new-methodologies",
	"/de/cfp-osterreichisches-treffen-zur-digitalen-linguistik-oelt-2023":
		"/de/news/call-for-papers-oesterreichisches-treffen-zur-digitalen-linguistik-rezente-entwicklungen-in-oesterreich-oe-lt-2023",
	"/de/cfp-zuruck-und-in-die-zukunft-10-tagung-digitale-bibliothek":
		"/de/news/cf-p-zurueck-und-in-die-zukunft-10-tagung-digitale-bibliothek",
	"/de/clarin-2023-call-for-abstracts-2": "/de/news/clarin-annual-conference-2023-call-for-extended-abstracts",
	"/de/clarin-cafe-computer-assisted-pragmatic-annotation-of-native-and-learner-corpora":
		"/de/events/clarin-cafe-computer-assisted-pragmatic-annotation-of-native-and-learner-corpora",
	"/de/clarin-cafe-translation-technologies-and-workflows-for-ssh-researchers":
		"/de/events/clarin-cafe-translation-technologies-and-amp-workflows-for-ssh-researchers",
	"/de/computer-vision-for-digital-humanists-eine-dreitagige-winterschule-organisiert-von-der-universitat-graz":
		"/de/events/computer-vision-for-digital-humanists-eine-dreitaegige-winterschule-organisiert-von-der-universitaet-graz",
	"/de/conference-on-cultural-heritage-new-technologies-cultural-heritage-nextgen-2":
		"/de/events/conference-on-cultural-heritage-and-amp-new-technologies-cultural-heritage-next-gen",
	"/de/dariah-campus-how-to-workshop-2": "/de/events/dariah-campus-how-to-workshop",
	"/de/dazzling-data-izmf-wise23-24":
		"/de/events/dazzling-data-digital-humanities-in-der-mediaevistik-und-fruehneuzeitforschung",
	"/de/dch-speed-dating-2": "/de/events/d-c-h-speed-dating",
	"/de/digedtnt-workshop-meet-the-tools-and-developers":
		"/de/events/dig-ed-tn-t-workshop-meet-the-tools-and-developers",
	"/de/digitale-linguistik-rezente-entwicklungen-in-osterreich-olt-2023":
		"/de/events/oesterreichisches-treffen-zur-digitalen-linguistik-rezente-entwicklungen-in-oesterreich-oe-lt-2023",
	"/de/digitale-methoden-live-seminar": "/de/events/digitale-methoden",
	"/de/einladung-zur-teilnahme-dariah-2024": "/de/news/einladung-zur-teilnahme-dariah-jahreskonferenz-2024",
	"/de/exploresalon-2023-save-the-date": "/de/news/explore-salon-2023-save-the-date",
	"/de/exploresalon-anmeldung-offen": "/de/events/explore-salon-2023-anmeldung-ist-offen",
	"/de/foerdermoglichkeiten": "/de/pages/foerderung",
	"/de/forderungen-fur-jungwissenschaftlerinnen": "/de/pages/foerderung",
	"/de/museumrecht-2023-ki-co-creation-nft": "/de/events/museum-recht-2023-ki-co-creation-and-nft",
	"/de/projektforderungen": "/de/pages/foerderung",
	"/de/projektprasentation-digitale-edition-baernreither":
		"/de/events/vom-archiv-ins-digitale-die-tagebuecher-des-altoesterreichischen-politikers-joseph-m-baernreither-projektpraesentation-der-digitalen-edition",
	"/de/ringvorlesung-dazzling-data-aufzeichnungen-verfugbar":
		"/de/news/ringvorlesung-dazzling-data-aufzeichnungen-verfuegbar",
	"/de/ringvorlesung-digital-humanities-23-24": "/de/events/ringvorlesung-digital-humanities",
	"/de/ssh-open-marketplace-online-workshop-for-phd-students-2":
		"/de/events/enhance-your-research-skills-with-ssh-open-marketplace-an-online-workshop-for-ph-d-students",
	"/de/summer-school-anmeldung-offen":
		"/de/events/summer-school-vom-archiv-zum-algorithmus-digital-humanities-in-der-praxis-anmeldung-ist-geoeffnet",
	"/de/train-the-trainers-urheberrecht-open-access-in-der-akademischen-lehre":
		"/de/events/train-the-trainers-urheberrecht-and-open-access-in-der-akademischen-lehre",
	"/de/transnational-research-infrastructure-2":
		"/de/events/transnational-research-infrastructure-a-journey-through-clarin-knowledge-centres",
	"/de/ueber-clariah-at": "/de/pages/ueber-clariah-at",
	"/de/veranstaltungen": "/de/events",
	"/de/webinarreihe-digital-editions-tools-transitions":
		"/de/events/dig-ed-tn-t-webinarreihe-digital-editions-tools-and-transitions",
	"/de/workshop-central-european-book-history-data-tools":
		"/de/events/workshop-central-european-book-history-data-and-amp-tools",
	"/de/workshop-schnittstelle-mediavistik": "/de/events/workshop-schnittstelle-mediaevistik",
	"/de/workshop_writing-a-digital-conceptual-history-of-democracy-2":
		"/de/events/writing-a-digital-conceptual-history-of-democracy",
	"/developing-hubert":
		"/en/projects/developing-hu-bert-a-natural-language-processing-algorithm-for-extending-the-seshat-global-history-databank",
	"/digedtnt": "/en/projects/digital-edition-creation-pipelines-tools-and-transitions",
	"/digedtnt-workshop-meet-the-tools-and-developers-2": "/en/events/dig-ed-tn-t-workshop-meet-the-tools-and-developers",
	"/digital-humanities-lecture-circuit-23-24": "/en/events/digital-humanities-lecture-circuit",
	"/digital-linguistics-recent-developments-in-austria-olt-2023":
		"/en/events/austrian-meeting-on-digital-linguistics-recent-developments-in-austria-at-oe-lt-2023",
	"/digital-methods-live-seminar": "/en/events/digital-methods",
	"/digitizing-the-premodern-book": "/en/projects/digitizing-the-materiality-of-the-premodern-book",
	"/esperanto-newspaper-excerpts": "/en/projects/esperanto-newspaper-excerpts",
	"/events": "/en/events",
	"/exploresalon-registrations-open": "/en/events/explore-salon-2023-registrations-are-open",
	"/exploresalon2023": "/en/events/explore-salon-2023-registrations-are-open",
	"/exploresalon2023-save-the-date": "/en/news/explore-salon-2023-save-the-date",
	"/funding-opportunities": "/en/pages/funding",
	"/funding-opportunities-for-junior-researcher": "/en/pages/funding",
	"/iiif-suite": "/en/projects/machine-learning-suite-for-iiif-resources",
	"/in-honor-of-thierry-declerck": "/en/pages/in-honor-of-thierry-declerck",
	"/ladderweb":
		"/en/projects/ladder-web-a-pragmatically-annotated-web-based-corpus-query-interface-for-requests-and-cancellations-in-italian-l1-and-l2",
	"/museum_law-2023-ai-co-creation-nft": "/en/events/museum-law-2023-ai-co-creation-and-nft",
	"/news": "/en/news",
	"/online-edition-baernreither":
		"/en/projects/prototype-of-a-historical-critical-online-edition-based-on-the-estate-materials-of-josef-maria-baernreither",
	"/project-funding": "/en/pages/funding",
	"/projectpresentation-digital-edition-baernreither":
		"/en/events/vom-archiv-ins-digitale-die-tagebuecher-des-altoesterreichischen-politikers-joseph-m-baernreither-projektpraesentation-der-digitalen-edition",
	"/relaunch-of-the-mhdbdb": "/en/projects/digital-sustainability-relaunch-of-the-mhdbdb",
	"/results-from-call-for-projects-announced": "/en/news/results-from-call-for-projects-announced",
	"/semantickraus-connecting-kraus-scholarship-to-the-semantic-web":
		"/en/projects/semantic-kraus-connecting-kraus-scholarship-to-the-semantic-web",
	"/sharing-the-crown":
		"/en/projects/sharing-the-crown-establishing-a-workflow-from-collection-data-to-linked-research-data",
	"/ssh-open-marketplace-online-workshop-for-phd-students":
		"/en/events/enhance-your-research-skills-with-ssh-open-marketplace-an-online-workshop-for-ph-d-students",
	"/summer-school-registrations-open":
		"/en/events/summer-school-vom-archiv-zum-algorithmus-digital-humanities-in-der-praxis-registrations-are-open",
	"/summerschool2024":
		"/en/events/summer-school-vom-archiv-zum-algorithmus-digital-humanities-in-der-praxis-registrations-are-open",
	"/train-the-trainers-proprietary-rights-open-access-in-academic-teaching":
		"/en/events/train-the-trainers-copyright-and-open-access-in-academic-teaching",
	"/transnational-research-infrastructure":
		"/en/events/transnational-research-infrastructure-a-journey-through-clarin-knowledge-centres",
	"/updating-the-konde-weisbuch": "/en/projects/digital-edition-white-paper-update",
	"/webinar-series-digital-editions-tools-transitions":
		"/en/events/dig-ed-tn-t-webinar-series-digital-editions-tools-and-transitions",
	"/workshop-central-european-book-history-data-tools-2":
		"/en/events/workshop-central-european-book-history-data-and-tools",
	"/workshop-interface-of-medieval-studies": "/en/events/workshop-interface-of-medieval-studies",
	"/workshop_writing-a-digital-conceptual-history-of-democracy":
		"/en/events/writing-a-digital-conceptual-history-of-democracy",
};

export const legacyRedirects: Redirects = Object.entries({
	...pages,
	...consortium,
	...events,
	...news,
	...projects,
	...astroRedirects,
}).map(([source, destination]) => {
	return { source, destination, permanent: true };
});
