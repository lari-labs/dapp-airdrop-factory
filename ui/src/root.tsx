import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';

export const Layout = ({ children }: { children: React.ReactNode }) => (
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <link rel="icon" type="image/svg+xml" href="/agoric.svg" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Tribbles Airdrop Claim Page</title>
      <Meta />
      <Links />
    </head>
    <body>
      {children}
      <ScrollRestoration />
      <Scripts />
    </body>
  </html>
);

export default function Root() {
  return <Outlet />;
}
