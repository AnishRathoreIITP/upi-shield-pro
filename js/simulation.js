class TransactionSimulator {
  constructor() {
    this.isRunning = true;
    this.speed = 1800;
    this.timer = null;
    this.history = [];
    this.maxHistory = 100;
    this.stats = { totalTransactions: 14892, fraudBlocked: 142, challengesIssued: 418, amountSaved: 3845900, avgLatency: 11.4 };
    this.users = [
      { name: "Rahul Sharma", vpa: "rahul.sharma@okaxis", city: "Mumbai", device: 98 },
      { name: "Priya Nair", vpa: "priya.nair@okhdfcbank", city: "Bengaluru", device: 95 },
      { name: "Amit Verma", vpa: "amit.verma88@paytm", city: "Delhi-NCR", device: 89 },
      { name: "Sneha Patel", vpa: "sneha.p@ybl", city: "Ahmedabad", device: 96 },
      { name: "Vikram Reddy", vpa: "vikram.r@icici", city: "Hyderabad", device: 92 },
      { name: "Ananya Das", vpa: "ananya.das@sbi", city: "Kolkata", device: 94 },
      { name: "Rohan Joshi", vpa: "rohan.j@kotak", city: "Pune", device: 97 },
      { name: "Deepak Mehra", vpa: "deepak.m@okicici", city: "Chandigarh", device: 90 }
    ];
    this.merchantsAndReceivers = [
      { name: "Swiggy Food Delivery", vpa: "swiggy.pay@icici", type: "merchant", mcc: "low" },
      { name: "Zomato DineOut", vpa: "zomato@okhdfcbank", type: "merchant", mcc: "low" },
      { name: "Blinkit Grocery", vpa: "blinkit.ops@kotak", type: "merchant", mcc: "low" },
      { name: "Uber Mobility India", vpa: "uber.trip@axisbank", type: "merchant", mcc: "low" },
      { name: "CustomerCare Power Support", vpa: "helpdesk.power.auth@airtel", type: "scam", mcc: "high" },
      { name: "Mule Ring Layer 1", vpa: "fund.router.x89@ybl", type: "mule", mcc: "high" },
      { name: "Offshore Crypto P2P Bot", vpa: "p2p.express.pay@icici", type: "crypto", mcc: "crypto_gaming" }
    ];
    this.apps = ["GPay", "PhonePe", "Paytm", "CRED", "BHIM", "AmazonPay"];
    this.fraudCities = ["Jamtara", "Mewat", "Alwar", "Deoghar"];
  }
  start(onTransactionCallback) {
    this.onTransaction = onTransactionCallback;
    this.tick();
  }
  stop() { clearTimeout(this.timer); this.isRunning = false; }
  resume() { if (!this.isRunning) { this.isRunning = true; this.tick(); } }
  setSpeed(ms) { this.speed = ms; }
  tick() {
    if (!this.isRunning) return;
    const tx = this.generateTransaction();
    const evaluation = window.mlEngine.evaluateTransaction(tx);
    const fullTx = { ...tx, ...evaluation };
    this.history.unshift(fullTx);
    if (this.history.length > this.maxHistory) this.history.pop();
    this.stats.totalTransactions += 1;
    if (fullTx.decision === "CRITICAL_BLOCKED") {
      this.stats.fraudBlocked += 1;
      this.stats.amountSaved += fullTx.amount;
      if (window.soundEngine) window.soundEngine.playCriticalAlert();
    } else if (fullTx.decision === "STEP_UP_CHALLENGE") {
      this.stats.challengesIssued += 1;
      if (window.soundEngine) window.soundEngine.playWarningChime();
    } else {
      if (window.soundEngine && Math.random() < 0.25) window.soundEngine.playSafeBeep();
    }
    if (this.onTransaction) this.onTransaction(fullTx, this.stats);
    const nextInterval = this.speed * (0.8 + Math.random() * 0.4);
    this.timer = setTimeout(() => this.tick(), nextInterval);
  }
  generateTransaction(forcedType = null) {
    const isFraudulent = forcedType === 'fraud' || (forcedType !== 'safe' && Math.random() < 0.12);
    const sender = this.users[Math.floor(Math.random() * this.users.length)];
    const app = this.apps[Math.floor(Math.random() * this.apps.length)];
    const txnId = "UPI" + Date.now().toString().slice(-8) + Math.floor(1000 + Math.random() * 9000);
    if (isFraudulent) {
      const fraudReceivers = this.merchantsAndReceivers.filter(r => r.type !== 'merchant');
      const receiver = fraudReceivers[Math.floor(Math.random() * fraudReceivers.length)];
      const amount = Math.floor(28000 + Math.random() * 65000);
      const velocity = Math.floor(4 + Math.random() * 6);
      const geoDistance = Math.floor(650 + Math.random() * 1200);
      const isRooted = Math.random() < 0.4;
      const deviceTrust = isRooted ? 15 : Math.floor(20 + Math.random() * 35);
      const originCity = this.fraudCities[Math.floor(Math.random() * this.fraudCities.length)];
      return {
        id: txnId, senderVpa: sender.vpa, senderName: sender.name, receiverVpa: receiver.vpa, receiverName: receiver.name,
        amount, velocity, geoDistance, deviceTrust, isNewBeneficiary: true, isLateNight: Math.random() < 0.5,
        isRooted, mccRisk: receiver.mcc, qrScanned: Math.random() < 0.6, app, city: `${sender.city} → ${originCity}`,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour12: false })
      };
    } else {
      const legitimateReceivers = this.merchantsAndReceivers.filter(r => r.type === 'merchant');
      const receiver = legitimateReceivers[Math.floor(Math.random() * legitimateReceivers.length)];
      const amount = Math.floor(80 + Math.random() * 4500);
      const velocity = Math.floor(1 + Math.random() * 2);
      const geoDistance = Math.floor(0 + Math.random() * 15);
      const deviceTrust = Math.floor(88 + Math.random() * 12);
      return {
        id: txnId, senderVpa: sender.vpa, senderName: sender.name, receiverVpa: receiver.vpa, receiverName: receiver.name,
        amount, velocity, geoDistance, deviceTrust, isNewBeneficiary: Math.random() < 0.15, isLateNight: false,
        isRooted: false, mccRisk: 'low', qrScanned: Math.random() < 0.3, app, city: sender.city,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour12: false })
      };
    }
  }
  injectAttack() {
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        const tx = this.generateTransaction('fraud');
        const evaluation = window.mlEngine.evaluateTransaction(tx);
        const fullTx = { ...tx, ...evaluation };
        this.history.unshift(fullTx);
        this.stats.totalTransactions += 1;
        this.stats.fraudBlocked += 1;
        this.stats.amountSaved += fullTx.amount;
        if (window.soundEngine) window.soundEngine.playCriticalAlert();
        if (this.onTransaction) this.onTransaction(fullTx, this.stats);
      }, i * 300);
    }
  }
}
window.txSimulator = new TransactionSimulator();
