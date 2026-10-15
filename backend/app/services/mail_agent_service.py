"""
AI Mail Generation Agent — Niyojan
====================================
Uses the official google-genai SDK (gemini-3.8-flash) with structured output
to generate context-aware official notification emails that include:
  - Blockchain Digital Signature Certificate block
  - ECDSA signature snippet
  - SHA-256 hash
  - Block explorer link / local ledger tx hash
  - QR verification link

Gracefully falls back to a deterministic HTML template if GEMINI_API_KEY is
not configured or the API call fails.
"""

import os
import json
import logging
import smtplib
from email.message import EmailMessage
from typing import Optional

from app.core.config import settings

logger = logging.getLogger("mail_agent_service")

# ─────────────────────────────────────────────────────────────────────────────
# Email data schema (matches Pydantic structured output)
# ─────────────────────────────────────────────────────────────────────────────

class GeneratedEmailPayload:
    """Simple data class for a generated email."""
    def __init__(self, subject: str, plain_text_body: str, html_body: str,
                 tone_used: str, agent_engine: str):
        self.subject = subject
        self.plain_text_body = plain_text_body
        self.html_body = html_body
        self.tone_used = tone_used
        self.agent_engine = agent_engine

    def to_dict(self) -> dict:
        return {
            "subject":         self.subject,
            "plain_text_body": self.plain_text_body,
            "html_body":       self.html_body,
            "tone_used":       self.tone_used,
            "agent_engine":    self.agent_engine,
        }


# ─────────────────────────────────────────────────────────────────────────────
# Fallback template
# ─────────────────────────────────────────────────────────────────────────────

def _build_fallback_email(
    recipient_name: str,
    recipient_email: str,
    document_id: str,
    purpose: str,
    additional_notes: str,
    blockchain_record: dict,
    verify_link: str,
    sig_short: str,
    engine_note: str,
) -> GeneratedEmailPayload:
    subject = f"[Niyojan Verified] {purpose} — Ref #{document_id}"

    plain_text = (
        f"Dear {recipient_name},\n\n"
        f"Your request for '{purpose}' (Ref: {document_id}) has been officially approved and "
        f"cryptographically signed with an ECDSA digital signature.\n\n"
        f"Additional Notes: {additional_notes}\n\n"
        f"──── BLOCKCHAIN DIGITAL SIGNATURE CERTIFICATE ────\n"
        f"Document ID  : {blockchain_record.get('document_id', document_id)}\n"
        f"Network      : {blockchain_record.get('network', 'Niyojan Local ECDSA Ledger')}\n"
        f"Tx Hash      : {blockchain_record.get('tx_hash', 'N/A')}\n"
        f"SHA-256 Hash : {blockchain_record.get('document_sha256', 'N/A')}\n"
        f"Signer Wallet: {blockchain_record.get('signer_address', 'N/A')}\n"
        f"ECDSA Sig    : {sig_short}\n"
        f"Verify Online: {verify_link}\n"
        f"──────────────────────────────────────────────────\n\n"
        f"This is an automated notification from the Niyojan Administrative System.\n"
        f"Do not reply to this email.\n"
    )

    doc_hash = blockchain_record.get("document_sha256", "N/A")
    tx_hash = blockchain_record.get("tx_hash", "N/A")
    network = blockchain_record.get("network", "Niyojan Local ECDSA Ledger")
    signer = blockchain_record.get("signer_address", "N/A")
    explorer_url = blockchain_record.get("explorer_url", "")

    tx_link_html = (
        f'<a href="{explorer_url}" style="color:#38bdf8; word-break:break-all;" target="_blank">{tx_hash}</a>'
        if explorer_url and not tx_hash.startswith("0x" + "0" * 10)  # not a local genesis hash
        else f'<code style="color:#38bdf8; word-break:break-all;">{tx_hash}</code>'
    )

    html_body = f"""<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:20px;background:#f0f4f8;font-family:Inter,Arial,sans-serif;">
  <div style="max-width:640px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1e3a5f,#0f172a);padding:28px 32px;">
      <div style="display:flex;align-items:center;gap:12px;">
        <div style="width:40px;height:40px;background:linear-gradient(135deg,#3b82f6,#14b8a6);border-radius:10px;
                    display:flex;align-items:center;justify-content:center;font-weight:900;color:#fff;font-size:18px;">N</div>
        <div>
          <div style="color:#94a3b8;font-size:11px;letter-spacing:.08em;text-transform:uppercase;">Official Notification</div>
          <div style="color:#f8fafc;font-size:18px;font-weight:800;">Niyojan Administrative System</div>
        </div>
      </div>
    </div>

    <!-- Body -->
    <div style="padding:28px 32px;">
      <p style="color:#1e293b;font-size:15px;margin:0 0 8px;">Dear <strong>{recipient_name}</strong>,</p>
      <p style="color:#334155;font-size:14px;line-height:1.6;margin:0 0 16px;">
        Your request for <strong>{purpose}</strong> (ID: <code style="background:#f1f5f9;padding:2px 6px;border-radius:4px;">{document_id}</code>)
        has been <strong style="color:#16a34a;">officially approved</strong> and anchored with an ECDSA cryptographic digital signature.
      </p>

      <!-- Notes block -->
      <div style="background:#f8fafc;border-left:4px solid #3b82f6;padding:12px 16px;border-radius:0 8px 8px 0;margin-bottom:24px;">
        <p style="color:#475569;font-size:13px;margin:0;">{additional_notes}</p>
      </div>

      <!-- Blockchain Certificate -->
      <div style="background:#0f172a;border-radius:10px;padding:20px;margin-bottom:24px;">
        <div style="color:#38bdf8;font-size:11px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;margin-bottom:14px;">
          🔒 Blockchain Digital Signature Certificate
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:12px;font-family:monospace;">
          <tr>
            <td style="color:#64748b;padding:4px 0;white-space:nowrap;padding-right:16px;">Document ID</td>
            <td style="color:#e2e8f0;word-break:break-all;">{document_id}</td>
          </tr>
          <tr>
            <td style="color:#64748b;padding:4px 0;padding-right:16px;">Network</td>
            <td style="color:#e2e8f0;">{network}</td>
          </tr>
          <tr>
            <td style="color:#64748b;padding:4px 0;padding-right:16px;">SHA-256 Hash</td>
            <td style="color:#a3e635;word-break:break-all;">{doc_hash}</td>
          </tr>
          <tr>
            <td style="color:#64748b;padding:4px 0;padding-right:16px;">Tx / Block Hash</td>
            <td style="word-break:break-all;">{tx_link_html}</td>
          </tr>
          <tr>
            <td style="color:#64748b;padding:4px 0;padding-right:16px;">Signer Wallet</td>
            <td style="color:#e2e8f0;word-break:break-all;">{signer}</td>
          </tr>
          <tr>
            <td style="color:#64748b;padding:4px 0;padding-right:16px;">ECDSA Signature</td>
            <td style="color:#94a3b8;word-break:break-all;">{sig_short}</td>
          </tr>
        </table>
        <div style="margin-top:16px;">
          <a href="{verify_link}"
             style="display:inline-block;background:#22c55e;color:#000;font-weight:700;font-size:12px;
                    padding:10px 18px;border-radius:7px;text-decoration:none;">
            ✅ Verify Signature &amp; QR Certificate →
          </a>
        </div>
      </div>

      <p style="color:#94a3b8;font-size:11px;text-align:center;margin:0;">
        This is an automated notification from the Niyojan Administrative System. Do not reply.
      </p>
    </div>
  </div>
</body>
</html>"""

    return GeneratedEmailPayload(
        subject=subject,
        plain_text_body=plain_text,
        html_body=html_body,
        tone_used="Official & Cryptographically Auditable",
        agent_engine=engine_note,
    )


# ─────────────────────────────────────────────────────────────────────────────
# AI Mail Agent Service
# ─────────────────────────────────────────────────────────────────────────────

class AIMailAgentService:
    """
    Generates official notification emails using Gemini AI (gemini-3.8-flash).
    Falls back to a deterministic HTML template if GEMINI_API_KEY is absent.
    Optionally dispatches via SMTP.
    """

    def generate(
        self,
        recipient_name: str,
        recipient_email: str,
        document_id: str,
        purpose: str,
        additional_notes: str,
        blockchain_record: dict,
        verify_link: Optional[str] = None,
    ) -> GeneratedEmailPayload:

        gemini_api_key = getattr(settings, "GEMINI_API_KEY", os.getenv("GEMINI_API_KEY", ""))
        frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:5173")
        verify_link = verify_link or f"{frontend_url}/verify/{document_id}"

        ecdsa_sig = blockchain_record.get("ecdsa_signature", "")
        sig_short = (
            f"{ecdsa_sig[:18]}...{ecdsa_sig[-12:]}" if len(ecdsa_sig) > 30 else ecdsa_sig
        ) if ecdsa_sig else "N/A"

        # ── Try Gemini AI ────────────────────────────────────────────────────
        if gemini_api_key:
            try:
                from google import genai

                client = genai.Client(api_key=gemini_api_key)

                system_instruction = (
                    "You are the Niyojan Autonomous Communications Agent. "
                    "You generate professional, security-verifiable official notification emails "
                    "for an educational institution's digital document approval system. "
                    "Always include a styled 'Blockchain Digital Signature Certificate' section "
                    "in the HTML body using a dark monospace panel. "
                    "Return ONLY valid JSON with keys: subject, plain_text_body, html_body, tone_used."
                )

                prompt = f"""Generate an official notification email with the following context:

Recipient: {recipient_name} <{recipient_email}>
Purpose: {purpose}
Document/Appointment ID: {document_id}
Additional Notes: {additional_notes}

Blockchain Certificate Data:
- Network: {blockchain_record.get('network', 'Niyojan ECDSA Ledger')}
- Transaction Hash: {blockchain_record.get('tx_hash', 'N/A')}
- Document SHA-256 Hash: {blockchain_record.get('document_sha256', 'N/A')}
- Approver ECDSA Wallet: {blockchain_record.get('signer_address', 'N/A')}
- ECDSA Signature (snippet): {sig_short}
- Public Verification URL: {verify_link}

Return JSON with exactly these keys: subject, plain_text_body, html_body, tone_used.
The html_body must include a dark-background monospace panel displaying the blockchain data above,
and a prominent green call-to-action button linking to the verification URL."""

                interaction = client.interactions.create(
                    model="gemini-3.8-flash",
                    input=prompt,
                    system_instruction=system_instruction,
                    store=False,
                )

                raw = interaction.output_text or ""
                # Strip markdown code fences if present
                clean = raw.strip()
                if clean.startswith("```"):
                    clean = clean.split("```", 2)[-1].lstrip("json").strip()
                    clean = clean.rsplit("```", 1)[0].strip()

                email_data = json.loads(clean)
                return GeneratedEmailPayload(
                    subject=email_data.get("subject", f"[Niyojan] {purpose} — {document_id}"),
                    plain_text_body=email_data.get("plain_text_body", ""),
                    html_body=email_data.get("html_body", ""),
                    tone_used=email_data.get("tone_used", "Official"),
                    agent_engine="gemini-3.8-flash (Live AI Agent)",
                )

            except ImportError:
                logger.warning("google-genai SDK not installed. Using fallback template.")
            except Exception as e:
                logger.warning(f"Gemini AI mail generation failed: {e}. Using fallback template.")

        # ── Deterministic fallback ───────────────────────────────────────────
        engine_note = (
            "Deterministic Agent Template (Set GEMINI_API_KEY for live AI generation)"
            if not gemini_api_key
            else "Deterministic Agent Template (AI generation failed, fallback used)"
        )
        return _build_fallback_email(
            recipient_name=recipient_name,
            recipient_email=recipient_email,
            document_id=document_id,
            purpose=purpose,
            additional_notes=additional_notes,
            blockchain_record=blockchain_record,
            verify_link=verify_link,
            sig_short=sig_short,
            engine_note=engine_note,
        )

    def dispatch_smtp(
        self,
        to_email: str,
        payload: GeneratedEmailPayload,
        from_email: Optional[str] = None,
    ) -> str:
        """Dispatches email via SMTP. Returns status string."""
        smtp_host = os.getenv("SMTP_HOST", "")
        if not smtp_host:
            return "SIMULATED_DELIVERY (Set SMTP_HOST / SMTP_USER / SMTP_PASS env vars)"

        try:
            msg = EmailMessage()
            msg["Subject"] = payload.subject
            msg["From"] = from_email or os.getenv("SMTP_FROM", "no-reply@niyojan.gov.in")
            msg["To"] = to_email
            msg.set_content(payload.plain_text_body)
            msg.add_alternative(payload.html_body, subtype="html")

            port = int(os.getenv("SMTP_PORT", "587"))
            with smtplib.SMTP(smtp_host, port, timeout=10) as server:
                server.starttls()
                server.login(os.getenv("SMTP_USER", ""), os.getenv("SMTP_PASS", ""))
                server.send_message(msg)
            return "DISPATCHED_VIA_SMTP"
        except Exception as e:
            logger.error(f"SMTP dispatch error: {e}")
            return f"SMTP_ERROR: {str(e)}"


# Singleton
ai_mail_agent = AIMailAgentService()
