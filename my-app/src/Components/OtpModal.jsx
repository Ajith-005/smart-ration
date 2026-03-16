import { useState } from "react";
import "./OtpModal.css";

const PhoneInput = ({ value, onChange }) => (
  <input
    className="otp-phone-input"
    type="tel"
    inputMode="numeric"
    placeholder="e.g. +60123456789"
    value={value}
    onChange={(e) => onChange(e.target.value)}
  />

);

export default function OtpModal({ open, onClose, apiBase, cardNumber, onVerified }) {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState("phone"); // 'phone' | 'otp'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [forcePossible, setForcePossible] = useState(false);

  if (!open) return null;

  const reset = () => {
    setPhone(""); setCode(""); setStep("phone"); setLoading(false); setError(""); setInfo("");
    setForcePossible(false);
  };

  const handleClose = () => { reset(); onClose && onClose(); };

  const sendOtp = async () => {
    setError(""); setInfo("");
    if (!phone) { setError("Enter a phone number"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone })
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.message || "Failed to send OTP");
      setInfo("OTP sent — check your messages. It expires in 5 minutes.");
      setStep("otp");
    } catch (err) { setError(err.message || "Failed to send OTP"); }
    finally { setLoading(false); }
  };

  const verifyOtp = async (force = false) => {
    setError(""); setInfo("");
    if (!code) { setError("Enter the verification code"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code, cardNumber, force })
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.message || "Verification failed");
      setInfo("Phone verified");
      setForcePossible(false);
      onVerified && await onVerified();
      handleClose();
    } catch (err) {
      const msg = err.message || "Verification failed";
      setError(msg);
      // allow forcing update when server reports mismatch
      if (msg === 'Phone does not match card records') setForcePossible(true);
    }
    finally { setLoading(false); }
  };

  return (
    <div className="otp-modal-backdrop" onClick={handleClose}>
      <div className="otp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="otp-modal-header">
          <h3>Verify Mobile Number</h3>
          <button className="otp-close" onClick={handleClose}>✕</button>
        </div>
        <div className="otp-modal-body">
          {step === 'phone' && (
            <>
              <p className="otp-desc">Enter the mobile number to receive a one-time code.</p>
              <PhoneInput value={phone} onChange={setPhone} />
              <div className="otp-actions">
                <button className="btn btn-secondary" onClick={handleClose}>Cancel</button>
                <button className="btn btn-primary" onClick={sendOtp} disabled={loading}>{loading ? 'Sending…' : 'Send OTP'}</button>
              </div>
            </>
          )}

          {step === 'otp' && (
            <>
              <p className="otp-desc">Enter the 6-digit code sent to <strong>{phone}</strong></p>
              <input className="otp-code-input" type="text" inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value)} />
              <div className="otp-actions">
                <button className="btn btn-secondary" onClick={() => setStep('phone')}>Back</button>
                <button className="btn btn-primary" onClick={() => verifyOtp(false)} disabled={loading}>{loading ? 'Verifying…' : 'Verify'}</button>
              </div>
              <div className="otp-resend">
                <button className="btn btn-link" onClick={() => sendOtp()} disabled={loading}>{loading ? 'Sending…' : 'Resend OTP'}</button>
              </div>
              {forcePossible && (
                <div className="otp-force">
                  <div className="otp-error">The phone number on the card differs from this number.</div>
                  <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    <button className="btn btn-secondary" onClick={() => setForcePossible(false)}>Cancel</button>
                    <button className="btn btn-primary" onClick={() => verifyOtp(true)} disabled={loading}>{loading ? 'Updating…' : 'Use this phone and update card'}</button>
                  </div>
                </div>
              )}
            </>
          )}

          {error && <div className="otp-error">{error}</div>}
          {info  && <div className="otp-info">{info}</div>}
        </div>
      </div>
    </div>
  );
}
