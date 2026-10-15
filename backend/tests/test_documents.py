import io
from app.core.config import settings

def test_document_full_workflow(client):
    # 1. Login as Student
    res = client.post("/api/auth/login", json={
        "email": settings.INITIAL_STUDENT_EMAIL,
        "password": settings.INITIAL_STUDENT_PASSWORD
    })
    assert res.status_code == 200
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Upload Document
    dummy_pdf = b"%PDF-1.4 sample document content for testing approval and QR signature verification"
    upload_res = client.post(
        "/api/documents/upload",
        data={"docTitle": "Fee Concession Request", "docCategory": "Fee Waiver Application"},
        files={"file": ("test_doc.pdf", io.BytesIO(dummy_pdf), "application/pdf")},
        headers=headers
    )
    assert upload_res.status_code == 201
    doc_data = upload_res.json()
    doc_id = doc_data["id"]
    assert doc_data["status"] == "PENDING_VERIFICATION"

    # 3. Mediator Verify
    med_res = client.post("/api/auth/login", json={
        "email": settings.INITIAL_MEDIATOR_EMAIL,
        "password": settings.INITIAL_MEDIATOR_PASSWORD
    })
    assert med_res.status_code == 200
    med_token = med_res.json()["access_token"]
    med_headers = {"Authorization": f"Bearer {med_token}"}

    v_res = client.post(f"/api/mediator/documents/{doc_id}/verify", json={
        "note": "Document verified against institutional records."
    }, headers=med_headers)
    assert v_res.status_code == 200
    assert v_res.json()["status"] == "VERIFIED_BY_MEDIATOR"

    # 4. Principal Approve & Digitally Stamp
    prin_res = client.post("/api/auth/login", json={
        "email": settings.INITIAL_PRINCIPAL_EMAIL,
        "password": settings.INITIAL_PRINCIPAL_PASSWORD
    })
    assert prin_res.status_code == 200
    prin_token = prin_res.json()["access_token"]
    prin_headers = {"Authorization": f"Bearer {prin_token}"}

    appr_res = client.post(f"/api/principal/documents/{doc_id}/approve", json={
        "note": "Approved 50% fee concession."
    }, headers=prin_headers)
    assert appr_res.status_code == 200
    appr_data = appr_res.json()
    assert appr_data["status"] == "APPROVED_BY_PRINCIPAL"
    assert appr_data["digitalStampVerified"] is True
    assert appr_data["approvalReferenceNo"] is not None

    # Get document detail to fetch verification ID
    det_res = client.get(f"/api/documents/{doc_id}", headers=headers)
    assert det_res.status_code == 200

    # 5. Public Verification Check
    pub_res = client.get("/api/public/verify/NON_EXISTENT_ID")
    assert pub_res.status_code == 200
    assert pub_res.json()["status"] == "NOT_FOUND"
