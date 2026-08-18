class MuleNetworkVisualizer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.nodes = [];
    this.links = [];
    this.selectedNode = null;
    this.hoveredNode = null;
    this.isDragging = false;
    this.dragNode = null;
    this.time = 0;
    this.initData();
    this.setupListeners();
    this.resize();
    this.startAnimation();
  }
  initData() {
    this.nodes = [
      { id: "victim1", label: "Victim (Elderly User)", vpa: "ramesh.k62@sbi", type: "victim", x: 120, y: 150, risk: 10, amount: "₹95,000 Drained", status: "Compromised" },
      { id: "victim2", label: "Victim (Job Seeker)", vpa: "tanvi.career@icici", type: "victim", x: 120, y: 350, risk: 15, amount: "₹48,000 Drained", status: "Compromised" },
      { id: "hub1", label: "Scam Aggregator VPA", vpa: "claim.refund.auth9@airtel", type: "hub", x: 340, y: 250, risk: 96, amount: "₹1,43,000 Pooled", status: "CRITICAL MULE HUB" },
      { id: "mule1", label: "Mule 1A (Student Acct)", vpa: "subham.stu88@ybl", type: "mule", x: 550, y: 140, risk: 88, amount: "₹50,000 Forwarded", status: "Active Mule" },
      { id: "mule2", label: "Mule 1B (Dormant Acct)", vpa: "sunil.rentals@paytm", type: "mule", x: 550, y: 260, risk: 91, amount: "₹45,000 Forwarded", status: "Active Mule" },
      { id: "mule3", label: "Mule 1C (SIM Clone)", vpa: "quick.mart98@kotak", type: "mule", x: 550, y: 380, risk: 84, amount: "₹48,000 Forwarded", status: "Active Mule" },
      { id: "cashout1", label: "Offshore Crypto P2P", vpa: "binance.p2p.escrow@axis", type: "offramp", x: 780, y: 180, risk: 98, amount: "USDT Converted", status: "Off-ramp Exit" },
      { id: "cashout2", label: "Micro-ATM Cashout", vpa: "micro.atm.agent@ibl", type: "offramp", x: 780, y: 320, risk: 94, amount: "Cash Withdrawn", status: "Physical Drained" }
    ];
    this.links = [
      { source: "victim1", target: "hub1", amount: "₹95k" },
      { source: "victim2", target: "hub1", amount: "₹48k" },
      { source: "hub1", target: "mule1", amount: "₹50k" },
      { source: "hub1", target: "mule2", amount: "₹45k" },
      { source: "hub1", target: "mule3", amount: "₹48k" },
      { source: "mule1", target: "cashout1", amount: "₹50k" },
      { source: "mule2", target: "cashout1", amount: "₹45k" },
      { source: "mule3", target: "cashout2", amount: "₹48k" }
    ];
  }
  setupListeners() {
    window.addEventListener('resize', () => this.resize());
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      if (this.isDragging && this.dragNode) {
        this.dragNode.x = mouseX;
        this.dragNode.y = mouseY;
        return;
      }
      this.hoveredNode = this.getNodeAt(mouseX, mouseY);
      this.canvas.style.cursor = this.hoveredNode ? 'pointer' : 'default';
    });
    this.canvas.addEventListener('mousedown', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const node = this.getNodeAt(mouseX, mouseY);
      if (node) {
        this.isDragging = true;
        this.dragNode = node;
        this.selectedNode = node;
        this.showNodeDetails(node);
      } else {
        this.selectedNode = null;
        this.hideNodeDetails();
      }
    });
    window.addEventListener('mouseup', () => { this.isDragging = false; this.dragNode = null; });
  }
  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = 500;
  }
  getNodeAt(x, y) {
    for (let i = this.nodes.length - 1; i >= 0; i--) {
      const node = this.nodes[i];
      const dx = x - node.x;
      const dy = y - node.y;
      if (Math.sqrt(dx * dx + dy * dy) <= 26) return node;
    }
    return null;
  }
  showNodeDetails(node) {
    const infoPanel = document.getElementById('network-node-details');
    if (!infoPanel) return;
    let badgeColor = node.risk > 75 ? 'badge-critical' : node.risk > 40 ? 'badge-warning' : 'badge-safe';
    infoPanel.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.75rem;">
        <div>
          <h4 style="color:var(--text-primary); font-size:0.95rem;">${node.label}</h4>
          <span class="mono" style="color:var(--accent-cyan); font-size:0.8rem;">${node.vpa}</span>
        </div>
        <span class="badge ${badgeColor}">Risk: ${node.risk}%</span>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; font-size:0.8rem; margin-bottom:0.75rem;">
        <div><strong style="color:var(--text-muted)">Cluster Status:</strong><br><span style="color:var(--text-primary)">${node.status}</span></div>
        <div><strong style="color:var(--text-muted)">Flow Volume:</strong><br><span style="color:var(--accent-amber)">${node.amount}</span></div>
      </div>
      <div style="display:flex; gap:0.5rem; margin-top:0.75rem;">
        <button class="btn btn-danger" style="padding:0.4rem 0.75rem; font-size:0.78rem;" onclick="window.quarantineVPA('${node.vpa}')">
          Quarantine VPA
        </button>
      </div>
    `;
  }
  hideNodeDetails() {
    const infoPanel = document.getElementById('network-node-details');
    if (infoPanel) infoPanel.innerHTML = `<p style="color:var(--text-muted); font-size:0.85rem; font-style:italic;">Click on any node in the graph above to inspect laundering telemetry and freeze accounts.</p>`;
  }
  startAnimation() {
    const render = () => {
      this.time += 0.03;
      this.draw();
      requestAnimationFrame(render);
    };
    render();
  }
  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.links.forEach((link, idx) => {
      const source = this.nodes.find(n => n.id === link.source);
      const target = this.nodes.find(n => n.id === link.target);
      if (!source || !target) return;
      this.ctx.beginPath();
      this.ctx.moveTo(source.x, source.y);
      this.ctx.lineTo(target.x, target.y);
      this.ctx.strokeStyle = "rgba(255, 51, 102, 0.35)";
      this.ctx.lineWidth = 2.5;
      this.ctx.setLineDash([4, 4]);
      this.ctx.stroke();
      this.ctx.setLineDash([]);
      const t = (this.time + idx * 0.35) % 1;
      const pulseX = source.x + (target.x - source.x) * t;
      const pulseY = source.y + (target.y - source.y) * t;
      this.ctx.beginPath();
      this.ctx.arc(pulseX, pulseY, 4, 0, Math.PI * 2);
      this.ctx.fillStyle = "#00d2ff";
      this.ctx.fill();
    });
    this.nodes.forEach(node => {
      let fillColor = node.type === 'victim' ? "#3b82f6" : node.type === 'hub' ? "#ff3366" : node.type === 'mule' ? "#f59e0b" : "#8b5cf6";
      let radius = node.type === 'hub' ? 28 : 22;
      this.ctx.beginPath();
      this.ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      this.ctx.fillStyle = fillColor;
      this.ctx.fill();
      if (node === this.selectedNode) {
        this.ctx.beginPath();
        this.ctx.arc(node.x, node.y, radius + 7, 0, Math.PI * 2);
        this.ctx.strokeStyle = "#00d2ff";
        this.ctx.lineWidth = 2.5;
        this.ctx.stroke();
      }
      this.ctx.font = "bold 11px Plus Jakarta Sans";
      this.ctx.fillStyle = "#f8fafc";
      this.ctx.textAlign = "center";
      this.ctx.fillText(node.label, node.x, node.y + radius + 16);
    });
  }
}
window.initNetworkGraph = () => { window.muleGraph = new MuleNetworkVisualizer('muleNetworkCanvas'); };
