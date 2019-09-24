import React from 'react';

export default function Page({ title, children }) {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <title>{title}</title>
      </head>
      <body>
        <div id="root">{children}</div>
        <noscript>You need to enable JavaScript to run this app.</noscript>
        <script src="/index.bundle.js"></script>
      </body>
    </html>
  );
}
