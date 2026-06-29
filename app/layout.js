export const metadata = {
  title: "1500 Gateway Dashboard | Penzance Reports",
  description: "Stakeholder, coalition, and engagement dashboard for 1500 Gateway.",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
