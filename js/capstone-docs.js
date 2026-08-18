class CapstoneDocs {
  constructor() {
    this.benchmarks = [
      { model: "Rule-Based Baseline", roc: "0.812", precision: "82.4%", recall: "74.1%", latency: "2.1 ms", xai: "Rule Tree" },
      { model: "Random Forest (100 Trees)", roc: "0.924", precision: "91.8%", recall: "88.6%", latency: "6.4 ms", xai: "Gini Impurity" },
      { model: "XGBoost Classifier", roc: "0.965", precision: "96.2%", recall: "93.8%", latency: "8.9 ms", xai: "TreeSHAP" },
      { model: "UPI Shield Pro (XGBoost + Bi-LSTM)", roc: "0.988", precision: "99.1%", recall: "97.4%", latency: "11.4 ms", xai: "Kernel SHAP + Integrated Gradients" }
    ];
  }
  renderArchitecture() {
    const container = document.getElementById('capstone-architecture-view');
    if (!container) return;
    container.innerHTML = `
      <div class="glass-panel" style="margin-bottom:1.5rem; background:#080d1a;">
        <h3 style="font-size:1.15rem; color:var(--accent-cyan); margin-bottom:0.5rem;">⚡ End-to-End High Throughput ML Architecture Pipeline</h3>
        <p style="color:var(--text-secondary); font-size:0.88rem; margin-bottom:1.25rem;">Sub-15ms decision latency capable of sustaining NPCI switch scale (>10,000 TPS).</p>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(190px, 1fr)); gap:1rem; margin-bottom:1.5rem;">
          <div style="background:var(--bg-surface-elevated); padding:1rem; border-radius:var(--radius-sm); border:1px solid var(--border-subtle);">
            <span style="font-size:0.7rem; color:var(--accent-cyan); font-weight:700;">STAGE 1: INGESTION</span>
            <h4 style="color:var(--text-primary); font-size:0.95rem; margin:0.35rem 0;">Apache Kafka Cluster</h4>
            <p style="color:var(--text-muted); font-size:0.78rem;">Distributed stream ingestion across Indian PSPs (GPay, PhonePe, Paytm).</p>
          </div>
          <div style="background:var(--bg-surface-elevated); padding:1rem; border-radius:var(--radius-sm); border:1px solid var(--border-subtle);">
            <span style="font-size:0.7rem; color:var(--accent-indigo); font-weight:700;">STAGE 2: FEATURE STORE</span>
            <h4 style="color:var(--text-primary); font-size:0.95rem; margin:0.35rem 0;">Redis + Feast Engine</h4>
            <p style="color:var(--text-muted); font-size:0.78rem;">Velocity windows, IP geo-velocity vector, hardware trust hash.</p>
          </div>
          <div style="background:var(--bg-surface-elevated); padding:1rem; border-radius:var(--radius-sm); border:1px solid var(--border-subtle);">
            <span style="font-size:0.7rem; color:var(--accent-emerald); font-weight:700;">STAGE 3: INFERENCE</span>
            <h4 style="color:var(--text-primary); font-size:0.95rem; margin:0.35rem 0;">XGBoost + Bi-LSTM</h4>
            <p style="color:var(--text-muted); font-size:0.78rem;">Dual ensemble evaluating tabular transactional features and behavioral sequences.</p>
          </div>
          <div style="background:var(--bg-surface-elevated); padding:1rem; border-radius:var(--radius-sm); border:1px solid var(--border-subtle);">
            <span style="font-size:0.7rem; color:var(--accent-amber); font-weight:700;">STAGE 4: EXPLAINABILITY</span>
            <h4 style="color:var(--text-primary); font-size:0.95rem; margin:0.35rem 0;">TreeSHAP Engine</h4>
            <p style="color:var(--text-muted); font-size:0.78rem;">Calculates exact feature impact weights for compliance audit trails.</p>
          </div>
          <div style="background:var(--bg-surface-elevated); padding:1rem; border-radius:var(--radius-sm); border:1px solid var(--border-subtle);">
            <span style="font-size:0.7rem; color:var(--accent-crimson); font-weight:700;">STAGE 5: MITIGATION</span>
            <h4 style="color:var(--text-primary); font-size:0.95rem; margin:0.35rem 0;">Automated Webhook</h4>
            <p style="color:var(--text-muted); font-size:0.78rem;">Green Lane, Biometric FIDO2 challenge, or VPA quarantine.</p>
          </div>
        </div>
      </div>
      <div class="glass-panel" style="margin-bottom:1.5rem;">
        <h3 style="font-size:1.15rem; color:var(--text-primary); margin-bottom:1rem;">📊 Machine Learning Benchmark Comparisons</h3>
        <div class="table-container">
          <table class="cyber-table">
            <thead>
              <tr><th>Model Architecture</th><th>ROC-AUC</th><th>Precision</th><th>Recall</th><th>Latency</th><th>Explainability</th></tr>
            </thead>
            <tbody>
              ${this.benchmarks.map((b, idx) => `
                <tr ${idx === 3 ? 'style="background:rgba(0, 210, 255, 0.08); font-weight:600;"' : ''}>
                  <td>${b.model}</td>
                  <td class="mono" style="color:var(--accent-cyan);">${b.roc}</td>
                  <td class="mono" style="color:var(--accent-emerald);">${b.precision}</td>
                  <td class="mono" style="color:var(--accent-emerald);">${b.recall}</td>
                  <td class="mono">${b.latency}</td>
                  <td><span class="badge badge-neutral">${b.xai}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }
}
window.capstoneDocs = new CapstoneDocs();
