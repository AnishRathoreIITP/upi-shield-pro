class AnalyticsDashboard {
  constructor() {
    this.hotspots = [
      { rank: 1, region: "Mewat (Nuh, Haryana)", score: 94, primaryVector: "OLX / Vehicle Advance Scams", activeThreats: 84 },
      { rank: 2, region: "Jamtara (Jharkhand)", score: 91, primaryVector: "Bank KYC & Electricity Phishing", activeThreats: 72 },
      { rank: 3, region: "Alwar / Bharatpur (Rajasthan)", score: 88, primaryVector: "Fake Army Officer Marketplace", activeThreats: 65 },
      { rank: 4, region: "Deoghar (Jharkhand)", score: 82, primaryVector: "Search Engine Ad Spoofing", activeThreats: 51 },
      { rank: 5, region: "Delhi-NCR Hubs", score: 68, primaryVector: "Mule Account Funnels & Crypto P2P", activeThreats: 43 }
    ];
  }
  init() { this.renderHourlyChart(); this.renderVectorChart(); this.renderHotspotsTable(); }
  renderHourlyChart() {
    const canvas = document.getElementById('hourlyTrafficChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = 240;
    const width = canvas.width;
    const height = canvas.height;
    const padding = { top: 30, right: 20, bottom: 40, left: 50 };
    const hours = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "Now"];
    const totalVolume = [120, 80, 450, 980, 850, 1100, 1250];
    const fraudVolume = [14, 22, 12, 18, 15, 29, 38];
    ctx.clearRect(0, 0, width, height);
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;
    const stepX = chartW / (hours.length - 1);
    const maxVal = 1400;

    ctx.beginPath();
    totalVolume.forEach((val, idx) => {
      const x = padding.left + idx * stepX;
      const y = height - padding.bottom - (val / maxVal) * chartH;
      if (idx === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = "#00d2ff"; ctx.lineWidth = 2.5; ctx.stroke();

    ctx.beginPath();
    fraudVolume.forEach((val, idx) => {
      const x = padding.left + idx * stepX;
      const y = height - padding.bottom - (val * 15 / maxVal) * chartH;
      if (idx === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = "#ff3366"; ctx.lineWidth = 2; ctx.stroke();

    hours.forEach((h, idx) => {
      const x = padding.left + idx * stepX;
      ctx.fillStyle = "#94a3b8"; ctx.font = "10px JetBrains Mono"; ctx.textAlign = "center";
      ctx.fillText(h, x, height - 12);
    });
  }
  renderVectorChart() {
    const canvas = document.getElementById('vectorDonutChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = 240;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const data = [
      { label: "Collect / QR Spoof", value: 38, color: "#ff3366" },
      { label: "SMS Utility Phish", value: 26, color: "#f59e0b" },
      { label: "Remote RAT Screen Share", value: 20, color: "#8b5cf6" },
      { label: "SIM Swap / Mule Routing", value: 16, color: "#00d2ff" }
    ];
    let startAngle = -Math.PI / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    data.forEach(slice => {
      const sliceAngle = (slice.value / 100) * (Math.PI * 2);
      ctx.beginPath();
      ctx.arc(centerX, centerY, 75, startAngle, startAngle + sliceAngle);
      ctx.arc(centerX, centerY, 45, startAngle + sliceAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = slice.color;
      ctx.fill();
      startAngle += sliceAngle;
    });
    ctx.fillStyle = "#f8fafc"; ctx.font = "bold 16px Plus Jakarta Sans"; ctx.textAlign = "center";
    ctx.fillText("100%", centerX, centerY + 2);
  }
  renderHotspotsTable() {
    const container = document.getElementById('hotspotsTableBody');
    if (!container) return;
    container.innerHTML = this.hotspots.map(h => `
      <tr>
        <td style="font-weight:700; color:var(--text-muted);">#${h.rank}</td>
        <td><strong style="color:var(--text-primary);">${h.region}</strong></td>
        <td><span class="badge ${h.score > 85 ? 'badge-critical' : 'badge-warning'}">${h.score}/100 Risk</span></td>
        <td style="color:var(--text-secondary); font-size:0.82rem;">${h.primaryVector}</td>
        <td style="font-family:var(--font-mono); color:var(--accent-crimson); font-weight:700;">${h.activeThreats} Clusters</td>
      </tr>
    `).join('');
  }
}
window.analyticsDashboard = new AnalyticsDashboard();
