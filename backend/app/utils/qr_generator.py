import os
import qrcode
from app.core.config import settings

def generate_verification_qr_code(verification_id: str) -> str:
    verify_url = f"{settings.FRONTEND_URL}/verify/{verification_id}"
    
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=8,
        border=3,
    )
    qr.add_data(verify_url)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="#1e3a8a", back_color="white") # Navy blue QR code
    
    filename = f"qr_{verification_id}.png"
    file_path = os.path.join(settings.UPLOAD_DIR, filename)
    img.save(file_path)
    return file_path
