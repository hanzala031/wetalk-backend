import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime
from app.config import settings

def send_password_reset_email(to_email: str, user_name: str, reset_url: str, reset_token: str) -> tuple[bool, str | None]:
    """
    Sends a password reset email to the user.
    If SMTP credentials are not set, prints to the console log for development testing.
    """
    # HTML Content
    html_content = f"""
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset your WeTalk password</title>
        <style>
          body {{ font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; color: #1e293b; }}
          .container {{ max-width: 580px; margin: 30px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }}
          .header {{ background-color: #004D73; padding: 30px 20px; text-align: center; color: #ffffff; }}
          .header h1 {{ margin: 0; font-size: 26px; font-weight: 700; letter-spacing: 0.5px; }}
          .header p {{ margin: 6px 0 0 0; opacity: 0.9; font-size: 14px; }}
          .content {{ padding: 35px 30px; text-align: left; line-height: 1.6; }}
          .content h2 {{ color: #004D73; margin-top: 0; font-size: 20px; }}
          .button-wrapper {{ text-align: center; margin: 30px 0; }}
          .btn {{ background-color: #004D73; color: #ffffff !important; padding: 14px 32px; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 10px; display: inline-block; box-shadow: 0 4px 12px rgba(0,77,115,0.25); }}
          .info-box {{ background-color: #f1f5f9; border-left: 4px solid #004D73; padding: 12px 16px; border-radius: 6px; font-size: 13px; color: #475569; margin: 20px 0; }}
          .footer {{ background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }}
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>WeTalk</h1>
            <p>Learn English with AI</p>
          </div>
          <div class="content">
            <h2>Hello {user_name},</h2>
            <p>We received a request to reset your password for your <strong>WeTalk</strong> account. Click the button below to reset your password:</p>
            
            <div class="button-wrapper">
              <a href="{reset_url}" class="btn" target="_blank">Reset Password</a>
            </div>

            <div class="info-box">
              ⏱️ <strong>Note:</strong> This password reset link is valid for <strong>15 minutes</strong>. If you did not request a password reset, please ignore this email.
            </div>

            <p style="font-size: 13px; color: #64748b;">If the button above doesn't work, copy and paste this link into your browser:<br>
            <a href="{reset_url}" style="color: #004D73; word-break: break-all;">{reset_url}</a></p>
          </div>
          <div class="footer">
            &copy; {datetime.now().year} WeTalk AI. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    """

    # Print to console log for development testing
    print("\n==================================================")
    print("🔑 PASSWORD RESET LINK GENERATED:")
    print(reset_url)
    print("==================================================\n")

    if not settings.SMTP_USER or not settings.SMTP_PASS:
        print("⚠️ SMTP credentials not found in environment variables. Printed reset URL to console log.")
        return True, "printed_to_console"

    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = 'Reset your WeTalk password'
        msg['From'] = f'"{settings.EMAIL_FROM_NAME}" <{settings.SMTP_USER}>'
        msg['To'] = to_email

        part_html = MIMEText(html_content, 'html')
        msg.attach(part_html)

        # Connect and send
        print(f"✉️ SMTP: Connecting to SMTP server {settings.SMTP_HOST}:{settings.SMTP_PORT}")
        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(settings.SMTP_USER, settings.SMTP_PASS)
        server.sendmail(settings.SMTP_USER, to_email, msg.as_string())
        server.quit()
        
        print("✉️ SMTP: Password reset email sent successfully.")
        return True, None
    except Exception as e:
        print(f"❌ SMTP Error sending reset email: {e}")
        return False, str(e)


def send_otp_email(to_email: str, user_name: str, otp: str) -> tuple[bool, str | None]:
    """
    Sends a 6-digit OTP password reset email to the user.
    If SMTP credentials are not set, prints to the console log for development testing.
    """
    # HTML Content
    html_content = f"""
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset your WeTalk password</title>
        <style>
          body {{ font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; color: #1e293b; }}
          .container {{ max-width: 580px; margin: 30px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }}
          .header {{ background-color: #004D73; padding: 30px 20px; text-align: center; color: #ffffff; }}
          .header h1 {{ margin: 0; font-size: 26px; font-weight: 700; letter-spacing: 0.5px; }}
          .header p {{ margin: 6px 0 0 0; opacity: 0.9; font-size: 14px; }}
          .content {{ padding: 35px 30px; text-align: left; line-height: 1.6; }}
          .content h2 {{ color: #004D73; margin-top: 0; font-size: 20px; }}
          .otp-wrapper {{ text-align: center; margin: 30px 0; }}
          .otp-code {{ background-color: #f1f5f9; color: #004D73; padding: 16px 40px; font-size: 32px; font-weight: bold; letter-spacing: 6px; border-radius: 12px; display: inline-block; border: 2px dashed #004D73; }}
          .info-box {{ background-color: #f1f5f9; border-left: 4px solid #004D73; padding: 12px 16px; border-radius: 6px; font-size: 13px; color: #475569; margin: 20px 0; }}
          .footer {{ background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }}
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>WeTalk</h1>
            <p>Learn English with AI</p>
          </div>
          <div class="content">
            <h2>Hello {user_name},</h2>
            <p>We received a request to reset your password for your <strong>WeTalk</strong> account. Use the following 6-digit One-Time Password (OTP) to reset your password:</p>
            
            <div class="otp-wrapper">
              <div class="otp-code">{otp}</div>
            </div>

            <div class="info-box">
              ⏱️ <strong>Note:</strong> This OTP is valid for <strong>15 minutes</strong>. If you did not request a password reset, please ignore this email.
            </div>
          </div>
          <div class="footer">
            &copy; {datetime.now().year} WeTalk AI. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    """

    # Print to console log for development testing
    print("\n==================================================")
    print("🔑 PASSWORD RESET OTP GENERATED:")
    print(otp)
    print("==================================================\n")

    sender = settings.MAIL_FROM or settings.SMTP_USER
    if not settings.SMTP_USER or not settings.SMTP_PASS:
        print("⚠️ SMTP credentials not found in environment variables. Printed OTP to console log.")
        return False, "SMTP credentials (MAIL_USERNAME/MAIL_PASSWORD) are not configured in backend .env file."

    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = 'Your WeTalk Password Reset OTP'
        msg['From'] = f'"{settings.EMAIL_FROM_NAME}" <{sender}>'
        msg['To'] = to_email

        part_html = MIMEText(html_content, 'html')
        msg.attach(part_html)

        # Connect and send
        print(f"✉️ SMTP: Connecting to SMTP server {settings.SMTP_HOST}:{settings.SMTP_PORT}")
        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10)
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(settings.SMTP_USER, settings.SMTP_PASS)
        server.sendmail(sender, to_email, msg.as_string())
        server.quit()
        
        print("✉️ SMTP: Password reset OTP email sent successfully.")
        return True, None
    except Exception as e:
        print(f"❌ SMTP Error sending OTP email: {e}")
        return False, str(e)
