class ScamSimulator {
  constructor() {
    this.currentScenarioId = 'olx';
    this.currentStepIndex = 0;
    this.scenarios = {
      olx: {
        id: 'olx', title: 'Scenario 1: OLX Marketplace QR Code Swap Scam', vector: 'Collect Reversal Spoof',
        steps: [
          { stage: 1, title: 'Initial Contact', story: 'Scammer poses as buyer for Suresh's sofa and agrees to pay ₹15,000 immediately.', userAction: 'Suresh shares his UPI ID.', attackerAction: 'Attacker creates deceptive Collect Request.', upiShieldTelemetry: { status: 'MONITORING', score: 24, flag: 'Inbound Collect Request initiated from high-request VPA.' } },
          { stage: 2, title: 'The ₹5 Test QR', story: 'Scammer sends QR code: "Scan and enter PIN to receive ₹5 test payment."', userAction: 'Suresh scans QR code.', attackerAction: 'Payload encoded with debit amount.', upiShieldTelemetry: { status: 'SUSPICIOUS', score: 62, flag: 'Rule Violation: Payee name claims official entity but maps to unverified private handle.' } },
          { stage: 3, title: 'The High-Value Drain', story: 'Scammer sends full ₹15,000 QR code request.', userAction: 'Suresh enters 6-digit PIN.', attackerAction: 'Debit request triggered.', upiShieldTelemetry: { status: 'CRITICAL_INTERCEPT', score: 95, flag: 'SHIELD INTERVENTION: Blocked Collect-as-Credit exploit. Banner displayed: "NEVER enter PIN to receive money!"' } }
        ]
      },
      electricity: {
        id: 'electricity', title: 'Scenario 2: Midnight Electricity Bill Disconnection Panic', vector: 'SMS Phishing',
        steps: [
          { stage: 1, title: 'Threatening SMS Delivery', story: 'Meena receives SMS threatening electricity disconnection at 10:30 PM.', userAction: 'Meena calls the number.', attackerAction: 'Attacker poses as Discom officer.', upiShieldTelemetry: { status: 'ANALYZING', score: 35, flag: 'SMS origin header not in TRAI DLT registry.' } },
          { stage: 2, title: 'The ₹10 Token Verification', story: 'Scammer asks Meena to pay ₹10 via link to update bill record.', userAction: 'Meena clicks link and enters UPI details.', attackerAction: 'Phishing domain initiates ₹45,000 drain.', upiShieldTelemetry: { status: 'CRITICAL_INTERCEPT', score: 98, flag: 'SHIELD INTERVENTION: Phishing domain blacklisted. 1200km IP Geo-velocity jump flagged.' } }
        ]
      },
      anydesk: {
        id: 'anydesk', title: 'Scenario 3: Remote Desktop Screen-Share (AnyDesk RAT)', vector: 'Remote Access Trojan',
        steps: [
          { stage: 1, title: 'Fake Support Helpline', story: 'Kishore calls fake Swiggy refund helpline from search ads.', userAction: 'Kishore asks for ₹450 refund.', attackerAction: 'Attacker tells victim to install AnyDesk/QuickSupport.', upiShieldTelemetry: { status: 'MONITORING', score: 20, flag: 'App usage telemetry monitors background accessibility permissions.' } },
          { stage: 2, title: 'Screen Broadcast & PIN Extraction', story: 'Victim shares connection code and opens banking app.', userAction: 'Victim opens UPI app while screen-sharing.', attackerAction: 'Attacker records screen to harvest PINs.', upiShieldTelemetry: { status: 'CRITICAL_INTERCEPT', score: 99, flag: 'SHIELD INTERVENTION: Active Screen Cast detected. UPI input immediately blanked and protected.' } }
        ]
      }
    };
  }
  selectScenario(id) { if (this.scenarios[id]) { this.currentScenarioId = id; this.currentStepIndex = 0; this.render(); } }
  nextStep() { const s = this.scenarios[this.currentScenarioId]; if (this.currentStepIndex < s.steps.length - 1) { this.currentStepIndex++; this.render(); } }
  prevStep() { if (this.currentStepIndex > 0) { this.currentStepIndex--; this.render(); } }
  render() {
    const container = document.getElementById('scam-simulator-view');
    if (!container) return;
    const scenario = this.scenarios[this.currentScenarioId];
    const step = scenario.steps[this.currentStepIndex];
    const timelineHtml = scenario.steps.map((s, idx) => {
      let statusClass = idx < this.currentStepIndex ? 'completed' : idx === this.currentStepIndex ? (s.upiShieldTelemetry.status.includes('CRITICAL') ? 'blocked' : 'active') : '';
      return `<div class="step-node ${statusClass}" onclick="window.scamSimulator.goToStep(${idx})">${idx + 1}</div>`;
    }).join('');

    container.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; margin-bottom:1.5rem;">
        <div>
          <h3 style="font-size:1.2rem; color:var(--text-primary);">${scenario.title}</h3>
          <span class="badge badge-info" style="margin-top:0.4rem;">Vector: ${scenario.vector}</span>
        </div>
        <div style="display:flex; gap:0.5rem;">
          <button class="btn btn-secondary" style="font-size:0.8rem; padding:0.4rem 0.85rem;" onclick="window.scamSimulator.selectScenario('olx')">OLX QR Scam</button>
          <button class="btn btn-secondary" style="font-size:0.8rem; padding:0.4rem 0.85rem;" onclick="window.scamSimulator.selectScenario('electricity')">Electricity Discom</button>
          <button class="btn btn-secondary" style="font-size:0.8rem; padding:0.4rem 0.85rem;" onclick="window.scamSimulator.selectScenario('anydesk')">AnyDesk RAT</button>
        </div>
      </div>
      <div class="scenario-timeline">${timelineHtml}</div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.5rem; margin-top:1.5rem;">
        <div class="glass-panel-elevated" style="padding:1.5rem;">
          <h4 style="color:var(--text-primary); font-size:1.05rem; margin-bottom:0.5rem;">Stage ${step.stage}: ${step.title}</h4>
          <p style="color:var(--text-secondary); font-size:0.92rem; line-height:1.6; margin-bottom:1.25rem;">${step.story}</p>
          <div style="background:var(--bg-input); padding:0.85rem; border-radius:var(--radius-sm); border:1px solid var(--border-subtle); margin-bottom:0.75rem;">
            <strong style="color:var(--accent-cyan); font-size:0.8rem;">VICTIM ACTION:</strong>
            <p style="color:var(--text-primary); font-size:0.88rem; margin-top:0.2rem;">${step.userAction}</p>
          </div>
          <div style="background:rgba(255, 51, 102, 0.08); padding:0.85rem; border-radius:var(--radius-sm); border:1px solid var(--border-danger); margin-bottom:1.25rem;">
            <strong style="color:var(--accent-crimson); font-size:0.8rem;">ATTACKER EXPLOIT:</strong>
            <p style="color:var(--text-primary); font-size:0.88rem; margin-top:0.2rem;">${step.attackerAction}</p>
          </div>
          <div style="display:flex; justify-content:space-between;">
            <button class="btn btn-secondary" onclick="window.scamSimulator.prevStep()" ${this.currentStepIndex === 0 ? 'disabled style="opacity:0.5;"' : ''}>← Previous</button>
            <button class="btn btn-primary" onclick="window.scamSimulator.nextStep()" ${this.currentStepIndex === scenario.steps.length - 1 ? 'disabled style="opacity:0.5;"' : ''}>Advance Stage →</button>
          </div>
        </div>
        <div class="glass-panel" style="background:#090e1b; border:1px solid var(--border-highlight); padding:1.5rem; display:flex; flex-direction:column; justify-content:space-between;">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
              <span class="mono" style="font-size:0.8rem; color:var(--accent-cyan);">UPI_SHIELD_DEFENSE_TELEMETRY</span>
              <span class="badge ${step.upiShieldTelemetry.score > 70 ? 'badge-critical' : 'badge-warning'}">${step.upiShieldTelemetry.status}</span>
            </div>
            <div style="font-size:2rem; font-weight:800; color:${step.upiShieldTelemetry.score > 70 ? 'var(--accent-crimson)' : 'var(--accent-cyan)'}; margin-bottom:1rem;">${step.upiShieldTelemetry.score}% Threat Index</div>
            <div style="background:var(--bg-surface); padding:1rem; border-radius:var(--radius-sm); border:1px solid var(--border-subtle);">
              <strong style="color:var(--text-primary); font-size:0.85rem;">AI Neural Intercept Log:</strong>
              <p style="color:var(--text-secondary); font-family:var(--font-mono); font-size:0.82rem; margin-top:0.35rem;">${step.upiShieldTelemetry.flag}</p>
            </div>
          </div>
          <div style="border-top:1px solid var(--border-subtle); padding-top:1rem; display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:0.75rem; color:var(--text-muted);">Simulated Inference: <strong style="color:var(--accent-emerald);">8.2 ms</strong></span>
          </div>
        </div>
      </div>
    `;
  }
  goToStep(index) { this.currentStepIndex = index; this.render(); }
}
window.scamSimulator = new ScamSimulator();
