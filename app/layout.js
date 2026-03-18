export const metadata = {
  title: "Try RHONDA Free | Tree Stand Partners Demo",
  description: "Take RHONDA for a test drive. See how an AI office manager can draft emails, organize data, and handle customer replies for your business.",
  icons: {
    icon: "/icons/icon-192.svg",
    apple: "/icons/icon-192.svg",
  },
  manifest: "/manifest.json",
  themeColor: "#c49b2a",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "RHONDA",
  },
};

export const viewport = {
  themeColor: "#c49b2a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="RHONDA" />
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
      </head>
      <body style={{ margin: 0, padding: 0, boxSizing: "border-box", background: "#f4f1ea" }}>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ("serviceWorker" in navigator) {
                navigator.serviceWorker.register("/sw.js").catch(() => {});
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
