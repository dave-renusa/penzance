export default function GatewayPage() {
  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <p style={styles.eyebrow}>Penzance Reports</p>
        <h1 style={styles.heading}>1500 Gateway</h1>
        <p style={styles.text}>
          This is the placeholder dashboard page for the 1500 Gateway project.
        </p>
      </section>

      <section style={styles.grid}>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Project Status</h2>
          <p style={styles.cardText}>Content coming soon.</p>
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Community Engagement</h2>
          <p style={styles.cardText}>Content coming soon.</p>
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Key Materials</h2>
          <p style={styles.cardText}>Content coming soon.</p>
        </div>
      </section>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "48px",
    fontFamily: "Arial, sans-serif",
    background: "#f7f7f7",
  },
  hero: {
    maxWidth: "900px",
    margin: "0 auto 32px",
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
    fontSize: "44px",
    lineHeight: "1.1",
  },
  text: {
    maxWidth: "680px",
    fontSize: "18px",
    lineHeight: "1.5",
    color: "#333",
  },
  grid: {
    maxWidth: "900px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "16px",
  },
  card: {
    padding: "24px",
    background: "white",
    borderRadius: "14px",
    border: "1px solid #ddd",
  },
  cardTitle: {
    margin: "0 0 8px",
    fontSize: "20px",
  },
  cardText: {
    margin: 0,
    color: "#555",
  },
};
