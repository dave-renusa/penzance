export default function HomePage() {
  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <p style={styles.eyebrow}>Penzance Reports</p>
        <h1 style={styles.heading}>Project Dashboard</h1>
        <p style={styles.text}>
          This site is live. Penzance Project dashboards will be added here as they are built.
        </p>

        <a href="/1500-gateway" style={styles.button}>
          Go To 1500 Gateway
        </a>
      </section>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "48px",
    fontFamily: "Arial, sans-serif",
    background: "#f5f5f5",
  },
  card: {
    maxWidth: "720px",
    margin: "0 auto",
    padding: "40px",
    background: "white",
    borderRadius: "16px",
    border: "1px solid #ddd",
  },
  eyebrow: {
    margin: "0 0 8px",
    fontSize: "14px",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#666",
  },
  heading: {
    margin: "0 0 16px",
    fontSize: "40px",
    lineHeight: "1.1",
  },
  text: {
    fontSize: "18px",
    lineHeight: "1.5",
    color: "#333",
  },
  button: {
    display: "inline-block",
    marginTop: "20px",
    padding: "12px 18px",
    background: "#111",
    color: "white",
    textDecoration: "none",
    borderRadius: "8px",
  },
};
