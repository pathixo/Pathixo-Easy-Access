import "server-only";

interface VoucherEmailParams {
  toEmail: string;
  toName: string;
  prizeName: string;
  voucherCode: string;
  redemptionInstructions: string;
  expiresAt: string;
}

/**
 * Sends a branded voucher delivery email to the visitor after a spin.
 * Supports Resend API (RESEND_API_KEY) with zero external dependency overhead.
 */
export async function sendVoucherEmail({
  toEmail,
  toName,
  prizeName,
  voucherCode,
  redemptionInstructions,
  expiresAt,
}: VoucherEmailParams): Promise<{ success: boolean; error?: string }> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || "Pathixo Booth <booth@pathixo.com>";

  if (!resendApiKey || resendApiKey.startsWith("your-") || resendApiKey.includes("placeholder")) {
    console.log(
      `[EMAIL NOTE] RESEND_API_KEY not configured. Simulated voucher email to ${toEmail} for prize: ${prizeName} (${voucherCode})`
    );
    return { success: false, error: "RESEND_API_KEY_NOT_CONFIGURED" };
  }

  const formattedDate = new Date(expiresAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Pathixo Trade Show Voucher</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0b0c; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #f4f4f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 580px; margin: 40px auto; background-color: #101214; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 16px; overflow: hidden;">
    <tr>
      <td style="padding: 28px 32px; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
        <div style="display: inline-block; background-color: #ccff00; color: #0a0b0c; font-weight: 900; font-size: 16px; width: 36px; height: 36px; line-height: 36px; border-radius: 8px; margin-bottom: 10px;">◆</div>
        <h1 style="margin: 0; font-size: 18px; font-weight: 800; color: #ffffff; letter-spacing: 0.05em;">PATHIXO PRIVATE LIMITED</h1>
        <p style="margin: 6px 0 0; font-size: 11px; font-family: monospace; color: #ccff00;">MEERUT TRADE SHOW 2026 • LUCKY DRAW PASS</p>
      </td>
    </tr>

    <tr>
      <td style="padding: 32px;">
        <p style="margin: 0 0 14px; font-size: 15px; color: #e4e4e7;">Hi ${toName},</p>
        <p style="margin: 0 0 22px; font-size: 14px; line-height: 1.6; color: #a1a1aa;">
          Thank you for visiting the Pathixo Technology Pavilion. You spun the wheel and unlocked:
        </p>

        <div style="background-color: #16191d; border: 1px solid rgba(204, 255, 0, 0.35); border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 22px;">
          <span style="display: inline-block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #ccff00; margin-bottom: 6px;">Allocated Reward</span>
          <h2 style="margin: 0; font-size: 20px; font-weight: 800; color: #ffffff;">${prizeName}</h2>
        </div>

        <div style="background-color: #0a0b0c; border: 2px dashed rgba(204, 255, 0, 0.4); border-radius: 12px; padding: 18px; text-align: center; margin-bottom: 22px;">
          <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #a1a1aa;">Official Voucher Code</span>
          <div style="margin-top: 6px; font-family: monospace; font-size: 26px; font-weight: 900; letter-spacing: 0.15em; color: #ccff00;">${voucherCode}</div>
        </div>

        <div style="background-color: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; padding: 16px; margin-bottom: 22px;">
          <h3 style="margin: 0 0 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #d4d4d8;">How to Claim:</h3>
          <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #a1a1aa;">${redemptionInstructions}</p>
          <p style="margin: 8px 0 0; font-size: 11px; color: #71717a;">Valid through: <strong>${formattedDate}</strong></p>
        </div>
      </td>
    </tr>

    <tr>
      <td style="padding: 20px 32px; background-color: #0a0b0c; border-top: 1px solid rgba(255, 255, 255, 0.08); text-align: center; font-size: 11px; color: #71717a;">
        <p style="margin: 0;">PATHIXO PRIVATE LIMITED • Digital Trade Show Pavilion</p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        subject: `[Voucher: ${voucherCode}] You won ${prizeName} at Pathixo!`,
        html: htmlContent,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      return { success: false, error: `Resend error ${res.status}: ${errBody}` };
    }

    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return { success: false, error: errorMsg };
  }
}
