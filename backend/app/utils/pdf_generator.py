import os
import uuid
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image as RLImage, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
import fitz # PyMuPDF
from app.core.config import settings

def generate_signed_approval_pdf(
    original_file_path: str,
    doc_title: str,
    doc_category: str,
    submitted_by_name: str,
    submitted_by_identifier: str,
    approved_by_name: str,
    approval_ref_no: str,
    verification_id: str,
    qr_code_path: str,
    principal_note: str = ""
) -> str:
    approved_filename = f"approved_{uuid.uuid4().hex}.pdf"
    approved_file_path = os.path.join(settings.UPLOAD_DIR, approved_filename)
    
    # If the original file is a PDF, overlay digital stamp footer on it
    if original_file_path.endswith('.pdf') and os.path.exists(original_file_path):
        try:
            doc = fitz.open(original_file_path)
            # Add verification stamp banner on last page
            last_page = doc[-1]
            rect = last_page.rect
            
            # Position stamp banner at bottom right
            stamp_rect = fitz.Rect(rect.width - 240, rect.height - 130, rect.width - 20, rect.height - 20)
            
            # Draw semi-transparent background box
            shape = last_page.new_shape()
            shape.draw_rect(stamp_rect)
            shape.finish(fill=(0.95, 0.97, 1.0), color=(0.12, 0.23, 0.54), width=1.5)
            shape.commit()
            
            # Embed QR Code
            if os.path.exists(qr_code_path):
                qr_rect = fitz.Rect(rect.width - 230, rect.height - 120, rect.width - 150, rect.height - 40)
                last_page.insert_image(qr_rect, filename=qr_code_path)
                
            # Embed Stamp Text
            text_x = rect.width - 145
            text_y = rect.height - 110
            
            stamp_lines = [
                "OFFICIALLY SIGNED & VERIFIED",
                f"Ref: {approval_ref_no}",
                f"Approved By: {approved_by_name}",
                f"Date: {datetime.now().strftime('%d %b %Y')}",
                f"Verify: NIYOJAN Portal"
            ]
            
            for i, line in enumerate(stamp_lines):
                fontsize = 8 if i == 0 else 7
                fontname = "helvetica-bold" if i in [0, 1] else "helvetica"
                color = (0.12, 0.23, 0.54) if i == 0 else (0.2, 0.2, 0.2)
                last_page.insert_text(fitz.Point(text_x, text_y + (i * 12)), line, fontsize=fontsize, fontname=fontname, color=color)
                
            doc.save(approved_file_path)
            doc.close()
            return approved_file_path
        except Exception as e:
            print(f"Error overlaying stamp on original PDF: {e}")

    # Default standalone PDF generator
    doc = SimpleDocTemplate(
        approved_file_path,
        pagesize=letter,
        rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40
    )
    
    styles = getSampleStyleSheet()
    header_style = ParagraphStyle(
        'HeaderStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#1e3a8a'),
        alignment=1 # Center
    )
    
    sub_header_style = ParagraphStyle(
        'SubHeaderStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#0d9488'),
        alignment=1
    )
    
    normal_style = ParagraphStyle(
        'NormalStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#334155')
    )
    
    bold_style = ParagraphStyle(
        'BoldStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#0f172a')
    )
    
    elements = []
    
    # Institution Banner Header
    elements.append(Paragraph(settings.INSTITUTION_NAME.upper(), header_style))
    elements.append(Paragraph("OFFICIAL DIGITAL APPROVAL CERTIFICATE", sub_header_style))
    elements.append(Spacer(1, 15))
    elements.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#1e3a8a'), spaceAfter=15))
    
    # Document Metadata Table
    data = [
        [Paragraph("<b>Document Title:</b>", normal_style), Paragraph(doc_title, bold_style)],
        [Paragraph("<b>Category:</b>", normal_style), Paragraph(doc_category, bold_style)],
        [Paragraph("<b>Submitted By:</b>", normal_style), Paragraph(f"{submitted_by_name} ({submitted_by_identifier})", bold_style)],
        [Paragraph("<b>Official Ref No:</b>", normal_style), Paragraph(approval_ref_no, bold_style)],
        [Paragraph("<b>Verification ID:</b>", normal_style), Paragraph(verification_id, bold_style)],
        [Paragraph("<b>Approved By:</b>", normal_style), Paragraph(f"{approved_by_name} (Executive Office)", bold_style)],
        [Paragraph("<b>Approval Date:</b>", normal_style), Paragraph(datetime.now().strftime("%B %d, %Y - %H:%M HRS"), bold_style)],
    ]
    
    if principal_note:
        data.append([Paragraph("<b>Executive Remarks:</b>", normal_style), Paragraph(principal_note, normal_style)])
        
    t = Table(data, colWidths=[140, 380])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('PADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    elements.append(t)
    elements.append(Spacer(1, 20))
    
    # Digital Stamp & QR Verification Box
    qr_img = RLImage(qr_code_path, width=80, height=80) if os.path.exists(qr_code_path) else Paragraph("QR", bold_style)
    
    stamp_text = Paragraph(
        f"<b>DIGITALLY SIGNED & SEALED</b><br/>"
        f"Verified by Niyojan Administrative Engine<br/>"
        f"Scan QR code or visit public verification portal to validate document integrity.<br/>"
        f"<font color='#0d9488'><b>Status: AUTHENTIC</b></font>",
        normal_style
    )
    
    stamp_table = Table([[qr_img, stamp_text]], colWidths=[90, 430])
    stamp_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f0fdf4')),
        ('BOX', (0,0), (-1,-1), 1.5, colors.HexColor('#16a34a')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('PADDING', (0,0), (-1,-1), 10),
    ]))
    
    elements.append(stamp_table)
    
    doc.build(elements)
    return approved_file_path
