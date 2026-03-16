export const metadata = {
  title: "Try RHONDA Free | Tree Stand Partners Demo",
  description: "Take RHONDA for a test drive. See how an AI office manager can draft emails, organize data, and handle customer replies for your business.",
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' fill='none' stroke='%23c49b2a' stroke-width='2'%3E%3Cline x1='16' y1='6' x2='16' y2='26'/%3E%3Cpolyline points='10,17 16,10 22,17'/%3E%3Cpolyline points='12,22 16,17 20,22'/%3E%3Cline x1='11' y1='26' x2='21' y2='26'/%3E%3C/svg%3E",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, boxSizing: "border-box", background: "#f4f1ea" }}>
        {children}
      </body>
    </html>
  );
}
