const nodemailer = require('nodemailer');

const sendWelcomeEmail = async (to, name) => {
  // Create transporter inside the function so env vars are definitely loaded
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to OSS First Mate</title>
</head>
<body style="margin:0;padding:0;background:#030712;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#030712;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <div style="width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#a855f7);margin:0 auto 12px;display:flex;align-items:center;justify-content:center;">
              </div>
              <div style="font-size:10px;letter-spacing:3px;color:#6366f1;text-transform:uppercase;font-weight:700;">
                OSS FIRST MATE
              </div>
            </td>
          </tr>

          <!-- Main card -->
          <tr>
            <td style="background:#0d1117;border:1px solid rgba(99,102,241,0.2);border-radius:16px;overflow:hidden;">

              <!-- Top gradient bar -->
              <tr>
                <td style="height:4px;background:linear-gradient(90deg,#6366f1,#a855f7,#06b6d4);line-height:4px;font-size:0;">&nbsp;</td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding:40px 40px 32px;">
                  <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:#f1f5f9;letter-spacing:-0.5px;">
                    Welcome aboard, ${name}!
                  </h1>
                  <p style="margin:0 0 28px;font-size:15px;color:#6b7280;line-height:1.6;">
                    You have successfully joined OSS First Mate — the AI-powered assistant for open source maintainers.
                  </p>

                  <!-- Features -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                    <tr><td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
                      <span style="color:#3b82f6;font-size:13px;font-weight:700;">Issue Triage</span>
                      <span style="color:#6b7280;font-size:13px;"> — Classify open GitHub issues as bug, feature, or docs with priority in 15 seconds.</span>
                    </td></tr>
                    <tr><td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
                      <span style="color:#eab308;font-size:13px;font-weight:700;">Duplicate Detection</span>
                      <span style="color:#6b7280;font-size:13px;"> — Find pairs of similar issues automatically with confidence scores.</span>
                    </td></tr>
                    <tr><td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
                      <span style="color:#22c55e;font-size:13px;font-weight:700;">Release Notes</span>
                      <span style="color:#6b7280;font-size:13px;"> — Draft a structured markdown changelog from merged pull requests.</span>
                    </td></tr>
                    <tr><td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
                      <span style="color:#a855f7;font-size:13px;font-weight:700;">Slack Insights</span>
                      <span style="color:#6b7280;font-size:13px;"> — Match GitHub issues to Slack discussions via AI semantic join.</span>
                    </td></tr>
                    <tr><td style="padding:10px 0;">
                      <span style="color:#06b6d4;font-size:13px;font-weight:700;">SQL Log</span>
                      <span style="color:#6b7280;font-size:13px;"> — See every Coral query that ran — fully transparent, no black boxes.</span>
                    </td></tr>
                  </table>

                  <!-- Info box -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                    <tr>
                      <td style="background:rgba(99,102,241,0.06);border:1px solid rgba(99,102,241,0.2);border-radius:10px;padding:16px 18px;">
                        <p style="margin:0 0 4px;font-size:13px;color:#a5b4fc;font-weight:700;">Get started in 2 steps</p>
                        <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6;">
                          1. Add your Groq API key and GitHub token in Settings.<br/>
                          2. Enter any public GitHub repo and click Run Triage.
                        </p>
                      </td>
                    </tr>
                  </table>

                  <!-- CTA -->
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="border-radius:10px;background:linear-gradient(135deg,#6366f1,#a855f7);">
                        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}"
                          style="display:inline-block;padding:13px 32px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;">
                          Open Dashboard
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding:18px 40px;border-top:1px solid rgba(255,255,255,0.04);">
                  <p style="margin:0;font-size:11px;color:#374151;text-align:center;line-height:1.6;">
                    Built for open source maintainers · Powered by Coral SQL + Groq AI<br/>
                    You received this because you signed up at OSS First Mate.
                  </p>
                </td>
              </tr>

            </td>
          </tr>

          <tr>
            <td style="padding-top:20px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#1f2937;">OSS First Mate · Open Source · 2026</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    console.log('Attempting to send welcome email to:', to)
    console.log('Using EMAIL_USER:', process.env.EMAIL_USER)
    await transporter.sendMail({
      from: `"OSS First Mate" <${process.env.EMAIL_USER}>`,
      to,
      subject: `Welcome aboard, ${name}! Your OSS First Mate account is ready`,
      html,
    });
    console.log('Welcome email sent successfully to:', to)
  } catch (err) {
    console.error('Failed to send welcome email:', err.message)
  }
};

const sendFeedbackEmail = async (to, firstName) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const clientUrl    = process.env.CLIENT_URL || 'http://localhost:5173';
  const feedbackLink = `${clientUrl}/?feedback=true`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>How is OSS First Mate working for you?</title>
</head>
<body style="margin:0;padding:0;background:#030712;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#030712;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <div style="width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#a855f7);margin:0 auto 12px;display:flex;align-items:center;justify-content:center;">
              </div>
              <div style="font-size:10px;letter-spacing:3px;color:#6366f1;text-transform:uppercase;font-weight:700;">
                OSS FIRST MATE
              </div>
            </td>
          </tr>

          <!-- Main card -->
          <tr>
            <td style="background:#0d1117;border:1px solid rgba(99,102,241,0.2);border-radius:16px;overflow:hidden;">

              <!-- Top gradient bar -->
              <tr>
                <td style="height:4px;background:linear-gradient(90deg,#6366f1,#a855f7,#06b6d4);line-height:4px;font-size:0;">&nbsp;</td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding:40px 40px 32px;">
                  <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:#f1f5f9;letter-spacing:-0.5px;">
                    How's it going, ${firstName}?
                  </h1>
                  <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.6;">
                    You've been using OSS First Mate for a little while now — we'd love to hear how it's working for you. Your feedback helps other maintainers discover the tool, and helps us make it better.
                  </p>

                  <!-- Why box -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                    <tr>
                      <td style="background:rgba(99,102,241,0.06);border:1px solid rgba(99,102,241,0.2);border-radius:10px;padding:16px 18px;">
                        <p style="margin:0 0 4px;font-size:13px;color:#a5b4fc;font-weight:700;">It takes 30 seconds</p>
                        <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6;">
                          Drop a quick star rating and a sentence or two about your experience. Approved testimonials show up on our public testimonials page.
                        </p>
                      </td>
                    </tr>
                  </table>

                  <!-- CTA -->
                  <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                    <tr>
                      <td style="border-radius:10px;background:linear-gradient(135deg,#6366f1,#a855f7);">
                        <a href="${feedbackLink}"
                          style="display:inline-block;padding:13px 32px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;">
                          Share your feedback
                        </a>
                      </td>
                    </tr>
                  </table>

                  <!-- Blog encouragement -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="border-top:1px solid rgba(255,255,255,0.06);padding-top:22px;">
                        <p style="margin:0 0 6px;font-size:14px;color:#a5b4fc;font-weight:700;">
                          Want to go further? Write about it.
                        </p>
                        <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.7;">
                          If OSS First Mate saved you time, consider writing a short blog post about how you use it. <a href="https://hashnode.com" style="color:#818cf8;text-decoration:none;">Hashnode</a> is a great free place to start, but any platform works — Dev.to, Medium, your own site, whatever you like. Drop the link in your feedback and we'll feature it on our testimonials page.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding:18px 40px;border-top:1px solid rgba(255,255,255,0.04);">
                  <p style="margin:0;font-size:11px;color:#374151;text-align:center;line-height:1.6;">
                    Built for open source maintainers · Powered by Coral SQL + Groq AI<br/>
                    You received this because you signed up at OSS First Mate.
                  </p>
                </td>
              </tr>

            </td>
          </tr>

          <tr>
            <td style="padding-top:20px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#1f2937;">OSS First Mate · Open Source · 2026</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    console.log('Attempting to send feedback email to:', to);
    await transporter.sendMail({
      from: `"OSS First Mate" <${process.env.EMAIL_USER}>`,
      to,
      subject: `${firstName}, how's OSS First Mate working for you?`,
      html,
    });
    console.log('Feedback email sent successfully to:', to);
  } catch (err) {
    console.error('Failed to send feedback email:', err.message);
  }
};

module.exports = { sendWelcomeEmail, sendFeedbackEmail };