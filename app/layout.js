export const metadata = {
  title: "Penzance Reports",
  description: "Project reporting dashboard for Penzance",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
