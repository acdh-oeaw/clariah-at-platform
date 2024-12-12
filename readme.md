# app template

template repository for next.js apps.

## how to run

prerequisites:

- [node.js v22](https://nodejs.org/en/download)
- [pnpm v9](https://pnpm.io/installation)

> [!TIP]
>
> you can use `pnpm` to install the required node.js version with `pnpm env use 22 --global`

set required environment variables in `.env.local`:

```bash
cp .env.local.example .env.local
```

also, set environment variables required by [validation](./.github/workflows/validate.yml) and
[deployment](./.github/workflows/build-deploy.yml) github actions. use
["variables"](https://github.com/acdh-oeaw/template-app-next/settings/variables/actions) for every
environment variable prefixed with `NEXT_PUBLIC_`, and
["secrets"](https://github.com/acdh-oeaw/template-app-next/settings/secrets/actions) for all others.

the default template accepts the following variables:

- `NEXT_PUBLIC_REDMINE_ID` (required): service issue for this application in the acdh-ch
  [redmine](https://redmine.acdh.oeaw.ac.at) issue tracker.
- `NEXT_PUBLIC_APP_BASE_URL` (required): the base url for this application. the default of
  "http://localhost:3000" should be fine for local development.
- `NEXT_PUBLIC_BOTS` (required): whether this website can be indexed by web crawlers like the google
  bot. supported values are "disabled" and "enabled", defaults to "disabled".
- `NEXT_PUBLIC_MATOMO_BASE_URL` and `NEXT_PUBLIC_MATOMO_ID` (optional): set these to support
  client-side analytics with matomo.
- `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` (optional): set this to verify site ownership for google
  search console.

when adding new environment variables, don't forget to add them to `.env.local.example` as well.

install dependencies:

```bash
pnpm install
```

run a development server on [http://localhost:3000](http://localhost:3000):

```bash
pnpm run dev
```

> [!TIP]
>
> this template supports developing in containers. when opening the project in your editor, you
> should be prompted to re-open it in a devcontainer.

## how to test

generate a production build and run end-to-end tests with:

```bash
pnpm run build
pnpm run test:e2e
```

visual snapshot tests should be run in the template's devcontainer - or a comparable debian bookworm
based linux environment -, and can be updated with:

```bash
pnpm run test:e2e:update-snapshots
```

## how to deploy

- ask a sysadmin to create a new acdh-ch kubernetes project.
- create a new namespace in that project via [rancher](https://rancher.acdh-dev.oeaw.ac.at), and set
  the `KUBE_NAMESPACE` github variable to that namespace
- adjust the [`app_name`](./.github/workflows/build-deploy.yml#L36), which will be the name of the
  deployment in the above namespace.
- set the `PUBLIC_URL` github variable to the application's public url (e.g.
  "https://my-app.acdh-ch-dev.oeaw.ac.at"), and set the `KUBE_INGRESS_BASE_DOMAIN` to the public
  url's base domain (e.g. "acdh-ch-dev.oeaw.ac.at"). `PUBLIC_URL` should match
  `NEXT_PUBLIC_APP_BASE_URL`.
- when deploying to a production domain (i.e. a domain not ending in "acdh-ch-dev.oeaw.ac.at"), set
  `HELM_UPGRADE_EXTRA_ARGS` to
  `--set 'ingress.annotations.cert-manager\.io/cluster-issuer=acdh-prod'` for "acdh.oeaw.ac.at"
  domains, or to `--set 'ingress.annotations.cert-manager\.io/cluster-issuer=letsencrypt-prod'` for
  any other non-oeaw domains, and ensure `KUBE_INGRESS_BASE_DOMAIN` is set correctly.
- if you haven't yet, create a service issue in the acdh-ch
  [redmine](https://redmine.acdh.oeaw.ac.at) issue tracker, and set the `SERVICE_ID` github variable
  to the issue number. this should match the `NEXT_PUBLIC_REDMINE_ID` variable in your `.env.local`
  file.
- ensure required build args (prefixed with `NEXT_PUBLIC_`) are referenced in both the
  [`Dockerfile`](./Dockerfile), as well as the [validation](./.github/workflows/validate.yml) and
  [deployment](./.github/workflows/build-deploy.yml) pipelines, and set as
  [github variables](https://github.com/acdh-oeaw/template-app-next/settings/variables/actions).
- ensure required runtime environment variables are referenced in the
  [validation](./.github/workflows/validate.yml) and
  [deployment](./.github/workflows/build-deploy.yml) pipelines, and set as
  [github secrets](https://github.com/acdh-oeaw/template-app-next/settings/secrets/actions). github
  secrets need to be prefixed with `K8S_SECRET_` to be automatically copied to the runtime
  environment. in case you need secrets in the docker build context, you can
  [mount a secret in the Dockerfile](https://docs.docker.com/build/building/secrets/).
- ensure both the github repository, as well as the
  [package registry](https://github.com/orgs/acdh-oeaw/packages/container/my-app/settings) is set to
  public.
- the `NEXT_PUBLIC_BOTS` variable defaults to "disabled", which signals to web crawlers that the
  website should not be indexed. when deploying to a production domain (i.e. a domain not ending in
  "acdh-ch-dev.oeaw.ac.at") this should be set to "enabled".

if everything is set up correctly, every git push to the `main` branch will create a new deployment
if the validation pipeline passes.

you can reference the [template repository](https://github.com/acdh-oeaw/template-app-next) for a
working setup.

## template variants

- [`variant/with-auth`](https://github.com/acdh-oeaw/template-app-next/tree/variant/with-auth)
  branch: adds email and password authentication with database sessions, including email
  verification, password reset, and two-factor auth. uses [`drizzle`](https://orm.drizzle.team) as
  orm.

- [`variant/with-commitlint`](https://github.com/acdh-oeaw/template-app-next/tree/variant/with-commitlint)
  branch: enables[ `commitlint`](https://commitlint.js.org) and runs it as a git hook, and as part
  of the validation workflow in a github action.

- [`variant/with-email`](https://github.com/acdh-oeaw/template-app-next/tree/variant/with-email)
  branch: adds [`nodemailer`](https://www.nodemailer.com) for sending emails, and an example contact
  form.

- [`variant/with-keystatic`](https://github.com/acdh-oeaw/template-app-next/tree/variant/with-keystatic)
  branch: adds [`keystatic`](https://keystatic.com) for content management. allows editing `.mdx`
  and `.json` files, and pushes changes to github.

- [`variant/with-opentelemetry`](https://github.com/acdh-oeaw/template-app-next/tree/variant/with-opentelemetry)
  branch: adds instrumentation to collect tracing information and send it to an opentelementry
  collector.

- [`variant/with-rss-feed`](https://github.com/acdh-oeaw/template-app-next/tree/variant/with-rss-feed)
  branch: adds an rss feed.

- [`variant/with-sentry`](https://github.com/acdh-oeaw/template-app-next/tree/variant/with-sentry)
  branch: enables error reporting with [`sentry`](https://acdh-ch.sentry.io).

- [`variant/with-single-locale`](https://github.com/acdh-oeaw/template-app-next/tree/variant/with-single-locale)
  branch: adjusts the template to support a single pre-configured locale only, and removes
  internationalised routing. ui strings are still managed in the [`messages`](./messages) folder to
  make it easy to activate full i18n support later if needed.

- [`variant/with-storybook`](https://github.com/acdh-oeaw/template-app-next/tree/variant/with-storybook)
  branch: adds [storybook](https://storybook.js.org) for building ui components in isolation and
  creating component documentation.
