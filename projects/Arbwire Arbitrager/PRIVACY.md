# Privacy Policy

**Last Updated: September 2026**

## 1. Open Source Project Statement
Arbwire is an **open-source, non-custodial, client-side research application**. This project is distributed publicly for educational, simulation, and quantitative research purposes. The developers, maintainers, and open-source contributors are **not responsible for any misuse, security breaches, network issues, or problems** arising from running this software.

---

## 2. Zero Personal Data Collection
- **No User Tracking**: Arbwire does not operate remote backend telemetry servers, user accounts, or private tracking databases.
- **Client-Side Execution**: All market depth ingestion, order book reconstruction, Welford jitter computations, and 3D WebGL gyroscope rendering take place strictly inside your local web browser process.
- **No Private Keys or Wallets**: Arbwire does not request, store, or transmit exchange API secret keys, private keys, or wallet seed phrases.

---

## 3. Third-Party Network Connections
When operating Arbwire, your web browser connects directly to public market data feeds operated by third-party cryptocurrency venues:
- **Binance Public WebSocket Feed** (`stream.binance.com`)
- **Coinbase Public WebSocket Feed** (`ws-feed.exchange.coinbase.com`)
- **Kraken Public WebSocket Feed** (`ws.kraken.com`)

These connections are subject to the respective privacy policies and terms of service of those third-party exchange providers. Arbwire developers have no control over and assume no liability for third-party exchange infrastructure, network logs, or packet routing.

---

## 4. Local Storage
Arbwire uses your browser's local storage (`localStorage`) strictly to preserve user interface preferences (such as welcome screen dismissal, customized theme selections, and sound toggles). This data never leaves your device.

---

## 5. Disclaimer of Responsibility & Misuse
Arbwire is provided **"as is" without warranty of any kind**. The creators and contributors explicitly disclaim all responsibility for any problems, privacy violations, unauthorized network intercepts, or financial losses incurred while utilizing this open-source code. Use at your own discretion.
