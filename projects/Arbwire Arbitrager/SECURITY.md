# Security Policy

## 1. Open Source Statement & Non-Liability
Arbwire is an **open-source community project**. The contributors and maintainers provide this codebase on an **"as-is"** basis for research and educational applications, and are **not responsible for any security exploits, misuse, or problems** resulting from operating the application or modified forks.

---

## 2. Non-Custodial Architecture
Arbwire adheres to zero-trust non-custodial principles:
- **No Secret Key Storage**: The application requires zero API secrets, authentication tokens, or wallet keys to operate.
- **Read-Only Public Feeds**: Only publicly accessible WebSocket book streams are ingested.
- **Client-Side Sandbox**: No external backend servers or proxy brokers can intercept or alter market computations.

---

## 3. Reporting a Vulnerability
If you identify a security issue or vulnerability in the Arbwire codebase:
1. Open a private security advisory or report via the repository issue tracker.
2. Provide a clear reproduction script or packet capture detailing the anomaly.
3. Allow reasonable time for the open-source community to review and patch any verified bug.

---

## 4. Best Practices for Users
- Always build and run the application from verified open-source repository commits.
- Never enter your exchange API private keys or wallet seed phrases into any software fork claiming to execute live trades on your behalf.
- Run the software on secure network environments with verified DNS servers to prevent man-in-the-middle packet tampering.
