document.addEventListener('DOMContentLoaded', () => {
  const navItems = document.querySelectorAll('.nav-item[data-tab]');
  const tabViews = document.querySelectorAll('.tab-view');

  function switchTab(tabId) {
    navItems.forEach(item => {
      if (item.getAttribute('data-tab') === tabId) item.classList.add('active');
      else item.classList.remove('active');
    });

    tabViews.forEach(view => {
      if (view.id === `tab-${tabId}`) {
        view.style.display = 'block';
        view.classList.add('animate-slide-up');
      } else {
        view.style.display = 'none';
        view.classList.remove('animate-slide-up');
      }
    });

    if (tabId === 'network') {
      setTimeout(() => { if (!window.muleGraph) window.initNetworkGraph(); else window.muleGraph.resize(); }, 50);
    } else if (tabId === 'scenarios') {
      window.scamSimulator.render();
    } else if (tabId === 'analytics') {
      setTimeout(() => { window.analyticsDashboard.init(); }, 50);
    } else if (tabId === 'capstone') {
      window.capstoneDocs.renderArchitecture();
    }
    if (window.soundEngine) window.soundEngine.playClick();
  }

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      switchTab(item.getAttribute('data-tab'));
    });
  });

  const soundToggleBtn = document.getElementById('soundToggleBtn');
  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', () => {
      const isEnabled = window.soundEngine.toggle();
      soundToggleBtn.innerHTML = isEnabled 
        ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg> Audio On`
        : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg> Muted`;
      showToast(isEnabled ? "Audio alert cues enabled" : "Audio muted", isEnabled ? "success" : "info");
    });
  }

  const pausePlayBtn = document.getElementById('pausePlayBtn');
  const injectFraudBtn = document.getElementById('injectFraudBtn');
  const speedSelect = document.getElementById('simSpeedSelect');

  if (pausePlayBtn) {
    pausePlayBtn.addEventListener('click', () => {
      if (window.txSimulator.isRunning) {
        window.txSimulator.stop();
        pausePlayBtn.innerHTML = `Resume`;
        showToast("Simulation paused", "info");
      } else {
        window.txSimulator.resume();
        pausePlayBtn.innerHTML = `Pause`;
        showToast("Simulation running", "success");
      }
    });
  }

  if (injectFraudBtn) {
    injectFraudBtn.addEventListener('click', () => {
      window.txSimulator.injectAttack();
      showToast("⚠️ Synthetic Fraud Burst Injected", "danger");
    });
  }

  if (speedSelect) {
    speedSelect.addEventListener('change', (e) => {
      window.txSimulator.setSpeed(Number(e.target.value));
    });
  }

  window.txSimulator.start((tx, stats) => {
    updateStatCards(stats);
    appendLiveStreamRow(tx);
  });

  let activeFilter = 'all';
  const filterBtns = document.querySelectorAll('.table-filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('btn-primary'));
      filterBtns.forEach(b => b.classList.add('btn-secondary'));
      btn.classList.remove('btn-secondary');
      btn.classList.add('btn-primary');
      activeFilter = btn.getAttribute('data-filter');
      reRenderStreamTable();
    });
  });

  function updateStatCards(stats) {
    const elTotal = document.getElementById('statTotalMonitored');
    const elBlocked = document.getElementById('statFraudBlocked');
    const elChallenges = document.getElementById('statChallenges');
    const elSaved = document.getElementById('statAmountSaved');

    if (elTotal) elTotal.textContent = stats.totalTransactions.toLocaleString('en-IN');
    if (elBlocked) elBlocked.textContent = stats.fraudBlocked.toLocaleString('en-IN');
    if (elChallenges) elChallenges.textContent = stats.challengesIssued.toLocaleString('en-IN');
    if (elSaved) elSaved.textContent = "₹" + stats.amountSaved.toLocaleString('en-IN');
  }

  function appendLiveStreamRow(tx) {
    const tbody = document.getElementById('liveStreamTableBody');
    if (!tbody) return;

    if (activeFilter === 'blocked' && tx.decision !== 'CRITICAL_BLOCKED') return;
    if (activeFilter === 'warning' && tx.decision !== 'STEP_UP_CHALLENGE') return;
    if (activeFilter === 'safe' && tx.decision !== 'APPROVED_SAFE') return;

    const row = document.createElement('tr');
    if (tx.decision === 'CRITICAL_BLOCKED') row.className = 'row-danger';
    else if (tx.decision === 'STEP_UP_CHALLENGE') row.className = 'row-warning';

    let badgeHtml = tx.decision === 'CRITICAL_BLOCKED'
      ? `<span class="badge badge-critical">CRITICAL BLOCKED</span>`
      : tx.decision === 'STEP_UP_CHALLENGE'
      ? `<span class="badge badge-warning">STEP-UP AUTH</span>`
      : `<span class="badge badge-safe">APPROVED</span>`;

    let appClass = `app-${tx.app.toLowerCase()}`;

    row.innerHTML = `
      <td class="mono" style="color:var(--text-muted); font-size:0.75rem;">${tx.timestamp}</td>
      <td>
        <span class="vpa-tag"><span class="bank-logo-mini">${tx.senderVpa.charAt(0).toUpperCase()}</span> ${tx.senderVpa}</span>
        <span style="font-size:0.75rem; color:var(--text-muted); display:block;">${tx.senderName} (${tx.city})</span>
      </td>
      <td>
        <span class="vpa-tag">${tx.receiverVpa}</span>
        <span style="font-size:0.75rem; color:var(--text-muted); display:block;">${tx.receiverName}</span>
      </td>
      <td class="mono" style="font-weight:700; color:var(--text-primary);">₹${tx.amount.toLocaleString('en-IN')}</td>
      <td><span class="app-badge ${appClass}">${tx.app}</span></td>
      <td>
        <strong class="mono" style="color:${tx.scorePercent > 70 ? 'var(--accent-crimson)' : tx.scorePercent > 40 ? 'var(--accent-amber)' : 'var(--accent-emerald)'}">${tx.scorePercent}%</strong>
        <span style="font-size:0.7rem; color:var(--text-muted);">(${tx.inferenceLatencyMs}ms)</span>
      </td>
      <td>${badgeHtml}</td>
      <td>
        <button class="btn btn-secondary" style="padding:0.25rem 0.6rem; font-size:0.75rem;" onclick="window.viewIncidentReport('${tx.id}')">Dossier</button>
      </td>
    `;
    tbody.insertBefore(row, tbody.firstChild);
    if (tbody.children.length > 25) tbody.removeChild(tbody.lastChild);
  }

  function reRenderStreamTable() {
    const tbody = document.getElementById('liveStreamTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    window.txSimulator.history.forEach(tx => appendLiveStreamRow(tx));
  }

  // AI Lab Logic
  const amountRange = document.getElementById('inputAmountRange');
  const amountInput = document.getElementById('inputAmount');
  const velocityRange = document.getElementById('inputVelocityRange');
  const velocityValue = document.getElementById('velocityDisplayValue');
  const geoRange = document.getElementById('inputGeoRange');
  const geoValue = document.getElementById('geoDisplayValue');
  const deviceTrustRange = document.getElementById('inputDeviceTrust');
  const deviceTrustValue = document.getElementById('deviceTrustDisplayValue');

  if (amountRange && amountInput) {
    amountRange.addEventListener('input', () => { amountInput.value = amountRange.value; runLiveEvaluation(); });
    amountInput.addEventListener('input', () => { amountRange.value = amountInput.value; runLiveEvaluation(); });
  }
  if (velocityRange && velocityValue) {
    velocityRange.addEventListener('input', () => { velocityValue.textContent = `${velocityRange.value} txns/15m`; runLiveEvaluation(); });
  }
  if (geoRange && geoValue) {
    geoRange.addEventListener('input', () => { geoValue.textContent = `${geoRange.value} km`; runLiveEvaluation(); });
  }
  if (deviceTrustRange && deviceTrustValue) {
    deviceTrustRange.addEventListener('input', () => { deviceTrustValue.textContent = `${deviceTrustRange.value}%`; runLiveEvaluation(); });
  }

  document.querySelectorAll('#aiAssessmentForm input, #aiAssessmentForm select').forEach(el => {
    el.addEventListener('change', runLiveEvaluation);
  });

  function runLiveEvaluation() {
    const tx = {
      amount: Number(amountInput?.value || 1000),
      senderVpa: document.getElementById('inputSenderVpa')?.value || 'user@upi',
      receiverVpa: document.getElementById('inputReceiverVpa')?.value || 'merchant@upi',
      velocity: Number(velocityRange?.value || 1),
      geoDistance: Number(geoRange?.value || 0),
      deviceTrust: Number(deviceTrustRange?.value || 95),
      isNewBeneficiary: document.getElementById('inputNewBeneficiary')?.checked || false,
      isLateNight: document.getElementById('inputLateNight')?.checked || false,
      isRooted: document.getElementById('inputRooted')?.checked || false,
      mccRisk: document.getElementById('inputMccRisk')?.value || 'low',
      qrScanned: document.getElementById('inputQrScanned')?.checked || false
    };

    const res = window.mlEngine.evaluateTransaction(tx);
    const scoreNum = document.getElementById('labScoreNum');
    const ring = document.getElementById('labProgressRing');
    const badge = document.getElementById('labDecisionBadge');
    const actionText = document.getElementById('labActionRecommendation');
    const latencyText = document.getElementById('labLatencyText');

    if (scoreNum) scoreNum.textContent = `${res.scorePercent}%`;
    if (latencyText) latencyText.textContent = `${res.inferenceLatencyMs} ms`;
    if (ring) {
      const radius = ring.r.baseVal.value;
      const circumference = 2 * Math.PI * radius;
      const offset = circumference - (res.scorePercent / 100) * circumference;
      ring.style.strokeDashoffset = offset;
      ring.style.stroke = res.scorePercent >= 75 ? 'var(--accent-crimson)' : res.scorePercent >= 45 ? 'var(--accent-amber)' : 'var(--accent-emerald)';
    }
    if (badge) {
      badge.className = `badge badge-${res.statusClass}`;
      badge.textContent = res.decision.replace('_', ' ');
    }
    if (actionText) actionText.textContent = res.actionRecommendation;

    const shapContainer = document.getElementById('shapWaterfallContainer');
    if (shapContainer) {
      shapContainer.innerHTML = res.shapContributions.map(c => {
        const isPos = c.type === 'positive';
        const barWidth = Math.min(100, Math.abs(c.weight) * 2.2);
        return `
          <div class="shap-item">
            <div class="shap-meta">
              <span style="font-weight:600; color:var(--text-primary);">${c.feature}</span>
              <span class="mono" style="color:${isPos ? 'var(--accent-crimson)' : 'var(--accent-emerald)'}; font-weight:700;">
                ${isPos ? '+' : ''}${c.weight}% Risk
              </span>
            </div>
            <div class="shap-bar-track">
              <div class="shap-bar-fill ${isPos ? 'shap-positive' : 'shap-negative'}" style="width:${barWidth}%;"></div>
            </div>
            <span style="font-size:0.72rem; color:var(--text-muted);">${c.description}</span>
          </div>
        `;
      }).join('');
    }
  }

  runLiveEvaluation();

  // QR & SMS Inspector
  const qrInput = document.getElementById('qrStringInput');
  const inspectQrBtn = document.getElementById('inspectQrBtn');
  const qrResultBox = document.getElementById('qrInspectionResult');

  if (inspectQrBtn && qrInput && qrResultBox) {
    inspectQrBtn.addEventListener('click', () => {
      const res = window.scamInspector.inspectUPIString(qrInput.value);
      if (!res.isValidUPI) {
        qrResultBox.innerHTML = `<div style="color:var(--accent-crimson); font-weight:600; padding:1rem; background:rgba(255,51,102,0.1); border-radius:var(--radius-sm);">${res.error}</div>`;
        return;
      }
      qrResultBox.innerHTML = `
        <div class="glass-panel" style="background:#0b1120; border:1px solid var(--border-highlight); padding:1.25rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
            <h4 style="font-size:0.95rem; color:var(--text-primary);">Decoded UPI Payload Signature</h4>
            <span class="badge ${res.status === 'CRITICAL_SCAM' ? 'badge-critical' : res.status === 'SUSPICIOUS' ? 'badge-warning' : 'badge-safe'}">${res.status} (${res.riskScore}%)</span>
          </div>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:0.75rem; font-size:0.85rem; margin-bottom:1rem;">
            <div><span style="color:var(--text-muted);">Payee Handle (pa):</span><br><strong class="mono" style="color:var(--accent-cyan);">${res.pa}</strong></div>
            <div><span style="color:var(--text-muted);">Payee Name (pn):</span><br><strong style="color:var(--text-primary);">${res.pn}</strong></div>
            <div><span style="color:var(--text-muted);">Amount (am):</span><br><strong style="color:var(--accent-amber);">${res.am}</strong></div>
          </div>
          ${res.warnings.map(w => `<div style="background:rgba(255,51,102,0.1); border-left:3px solid var(--accent-crimson); padding:0.6rem; font-size:0.8rem; margin-top:0.35rem;"><strong>[${w.level}]</strong> ${w.text}</div>`).join('')}
        </div>
      `;
      if (window.soundEngine) { if (res.riskScore > 60) window.soundEngine.playCriticalAlert(); else window.soundEngine.playSafeBeep(); }
    });
  }

  const smsInput = document.getElementById('smsTextInput');
  const inspectSmsBtn = document.getElementById('inspectSmsBtn');
  const smsResultBox = document.getElementById('smsInspectionResult');

  if (inspectSmsBtn && smsInput && smsResultBox) {
    inspectSmsBtn.addEventListener('click', () => {
      const res = window.scamInspector.inspectSMS(smsInput.value);
      if (!res) return;
      smsResultBox.innerHTML = `
        <div class="glass-panel" style="background:#0b1120; border:1px solid var(--border-highlight); padding:1.25rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
            <div><h4 style="font-size:0.95rem; color:var(--text-primary);">NLP Phishing Profile</h4><span style="color:var(--accent-amber); font-size:0.8rem;">${res.threatCategory}</span></div>
            <span class="badge ${res.riskLevel === 'CRITICAL_FRAUD' ? 'badge-critical' : 'badge-warning'}">${res.riskLevel} (${res.scamScore}%)</span>
          </div>
          ${res.findings.map(f => `<div style="background:rgba(255,51,102,0.08); border-left:3px solid var(--accent-crimson); padding:0.6rem; font-size:0.82rem; margin-top:0.35rem;"><strong>${f.title}:</strong> ${f.detail}</div>`).join('')}
        </div>
      `;
      if (window.soundEngine) { if (res.scamScore > 60) window.soundEngine.playCriticalAlert(); else window.soundEngine.playSafeBeep(); }
    });
  }

  // Incident Modal
  window.viewIncidentReport = (txOrId) => {
    let tx = typeof txOrId === 'string' ? (window.txSimulator.history.find(t => t.id === txOrId) || { id: txOrId, amount: 68500, senderName: "Amit Verma", senderVpa: "amit.verma88@paytm", receiverName: "Mule Ring Layer 1", receiverVpa: "fund.router.x89@ybl", decision: "CRITICAL_BLOCKED", scorePercent: 94, inferenceLatencyMs: "10.8" }) : txOrId;
    const modal = document.getElementById('incidentModal');
    const modalContent = document.getElementById('incidentModalContent');
    if (!modal || !modalContent) return;

    modalContent.innerHTML = `
      <div style="border-bottom:1px solid var(--border-subtle); padding-bottom:1rem; margin-bottom:1.25rem; display:flex; justify-content:space-between; align-items:flex-start;">
        <div>
          <span class="mono" style="font-size:0.75rem; color:var(--accent-cyan);">CYBER CRIME REPORTING DOSSIER</span>
          <h2 style="font-size:1.35rem; color:var(--text-primary); margin-top:0.25rem;">Incident Dossier #${tx.id}</h2>
        </div>
        <span class="badge badge-critical">${tx.decision || 'CRITICAL INTERCEPT'}</span>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1.5rem; font-size:0.85rem;">
        <div style="background:var(--bg-input); padding:0.85rem; border-radius:var(--radius-sm); border:1px solid var(--border-subtle);">
          <span style="color:var(--text-muted); font-size:0.75rem;">SENDER / VICTIM</span>
          <p style="color:var(--text-primary); font-weight:700;">${tx.senderName || 'Anonymous'}</p>
          <p class="mono" style="color:var(--accent-cyan); font-size:0.8rem;">${tx.senderVpa || 'sender@upi'}</p>
        </div>
        <div style="background:var(--bg-input); padding:0.85rem; border-radius:var(--radius-sm); border:1px solid var(--border-subtle);">
          <span style="color:var(--text-muted); font-size:0.75rem;">SUSPECT VPA</span>
          <p style="color:var(--text-primary); font-weight:700;">${tx.receiverName || 'Suspect Entity'}</p>
          <p class="mono" style="color:var(--accent-crimson); font-size:0.8rem;">${tx.receiverVpa || 'suspect@upi'}</p>
        </div>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <button class="btn btn-secondary" onclick="window.closeIncidentModal()">Close</button>
        <button class="btn btn-primary" onclick="window.print()">🖨️ Print / Save PDF Dossier</button>
      </div>
    `;
    modal.classList.add('open');
  };

  window.closeIncidentModal = () => {
    const modal = document.getElementById('incidentModal');
    if (modal) modal.classList.remove('open');
  };

  window.quarantineVPA = (vpa) => {
    showToast(`🔒 VPA "${vpa}" quarantined across NPCI switch`, "danger");
    if (window.soundEngine) window.soundEngine.playCriticalAlert();
  };

  function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `cyber-toast ${type}`;
    toast.innerHTML = `<div><strong style="font-size:0.85rem; color:var(--text-primary);">UPI Shield System</strong><p style="font-size:0.8rem; color:var(--text-secondary); margin-top:0.15rem;">${message}</p></div>`;
    container.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 3800);
  }
  window.showToast = showToast;
});
