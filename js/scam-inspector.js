class ScamInspector {
  inspectUPIString(uriString) {
    const trimmed = (uriString || '').trim();
    if (!trimmed.startsWith('upi://pay')) return { isValidUPI: false, error: "Invalid URI schema. Must start with upi://pay?" };
    try {
      const url = new URL(trimmed.replace('upi://pay', 'http://upi.pay'));
      const params = new URLSearchParams(url.search);
      const pa = params.get('pa') || '';
      const pn = params.get('pn') || '';
      const am = params.get('am') || '';
      const cu = params.get('cu') || 'INR';
      const tn = params.get('tn') || '';
      const mc = params.get('mc') || '';
      const warnings = [];
      let riskScore = 10;
      const officialKeywords = ['electricity', 'power', 'discom', 'bescom', 'mahavitaran', 'bill', 'bank', 'sbi', 'hdfc', 'refund', 'support', 'kyc'];
      const hasOfficialName = officialKeywords.some(kw => pn.toLowerCase().includes(kw));
      const isPersonalHandle = pa.includes('@ybl') || pa.includes('@okaxis') || pa.includes('@paytm') || pa.includes('@airtel') || pa.includes('@okhdfcbank');
      if (hasOfficialName && isPersonalHandle && !mc) {
        riskScore += 65;
        warnings.push({ level: 'CRITICAL', text: `Deceptive Merchant Spoof: Payee name claims "${pn}" but receiver "${pa}" is a personal P2P wallet.` });
      }
      if (am && Number(am) <= 5) {
        riskScore += 20;
        warnings.push({ level: 'WARNING', text: `Micro-amount probe (₹${am}). Often used to verify active account state before major drain.` });
      }
      const fraudNotes = ['refund', 'cashback', 'lottery', 'verify pin', 'bonus', 'claim'];
      if (tn && fraudNotes.some(fn => tn.toLowerCase().includes(fn))) {
        riskScore += 30;
        warnings.push({ level: 'SUSPICIOUS', text: `Scam Bait Note: Note contains "${tn}". Remember: UPI PIN is NEVER entered to receive money!` });
      }
      const status = riskScore >= 70 ? 'CRITICAL_SCAM' : riskScore >= 35 ? 'SUSPICIOUS' : 'VERIFIED_SAFE';
      return { isValidUPI: true, pa, pn, am: am || 'Any Amount', cu, tn: tn || 'None', mc: mc || 'Unspecified (P2P)', riskScore: Math.min(99, riskScore), status, warnings };
    } catch (e) {
      return { isValidUPI: false, error: "Malformed UPI string." };
    }
  }
  inspectSMS(text) {
    const raw = (text || '').trim();
    if (!raw) return null;
    const lower = raw.toLowerCase();
    const findings = [];
    let scamScore = 5;
    let threatCategory = "Normal Message";
    if ((lower.includes('electricity') || lower.includes('power') || lower.includes('bill')) && (lower.includes('disconnect') || lower.includes('tonight') || lower.includes('cutoff'))) {
      scamScore += 80;
      threatCategory = "Electricity Disconnection Phishing";
      findings.push({ type: 'CRITICAL', title: 'Fake Disconnection Threat', detail: 'Threatens power cutoff tonight to induce panic.' });
    }
    if (lower.includes('anydesk') || lower.includes('teamviewer') || lower.includes('rustdesk') || lower.includes('.apk')) {
      scamScore += 90;
      threatCategory = "Remote Access Screen-Share RAT";
      findings.push({ type: 'CRITICAL', title: 'Remote Access Tool Download', detail: 'Directs victim to download screen-sharing tool to capture UPI PINs.' });
    }
    if ((lower.includes('kyc') || lower.includes('pan card')) && (lower.includes('blocked') || lower.includes('suspended') || lower.includes('expire'))) {
      scamScore += 85;
      threatCategory = "Banking KYC Impersonation";
      findings.push({ type: 'CRITICAL', title: 'Urgent KYC Expiry Trap', detail: 'Impersonates bank compliance team asking to verify identity.' });
    }
    scamScore = Math.min(99, scamScore);
    const riskLevel = scamScore >= 75 ? 'CRITICAL_FRAUD' : scamScore >= 35 ? 'SUSPICIOUS' : 'LEGITIMATE';
    return { text: raw, scamScore, riskLevel, threatCategory, findings, timestamp: new Date().toLocaleTimeString('en-IN') };
  }
}
window.scamInspector = new ScamInspector();
