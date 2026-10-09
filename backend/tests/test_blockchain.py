import io
import hashlib
from unittest.mock import patch, MagicMock
import pytest
from app.services.blockchain_service import BlockchainService, blockchain_service
from app.core.config import settings
from app.models.document import Document, DocumentStatusEnum
from app.models.appointment import Appointment, AppointmentStatusEnum

def test_calculate_file_hash():
    """Verify SHA-256 computation on binary content."""
    sample_bytes = b"Official Niyojan Institutional Document - 2026"
    expected = hashlib.sha256(sample_bytes).hexdigest()
    actual = BlockchainService.calculate_file_hash(sample_bytes)
    assert actual == expected
    assert len(actual) == 64

def test_hex_to_bytes32_conversion():
    """Verify conversion between 64-char hex string and 32-byte Solidity format."""
    original_hex = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    b32 = BlockchainService.hex_to_bytes32(original_hex)
    assert len(b32) == 32
    recovered_hex = BlockchainService.bytes32_to_hex(b32)
    assert recovered_hex == original_hex

def test_get_explorer_url():
    """Verify block explorer URL generation."""
    tx_hash = "0x8fae7261a8b94091a45d0df896e300d6ef114b3ff2561957fae0176df23bb0d4"
    url = blockchain_service.get_explorer_url(tx_hash)
    assert url is not None
    assert "amoy.polygonscan.com/tx/0x8fae7261" in url

def test_blockchain_service_fallback_when_disabled():
    """Verify safe fallback when BLOCKCHAIN_ENABLED is false."""
    service = BlockchainService()
    
    # Mock database session
    mock_db = MagicMock()
    mock_doc = MagicMock()
    mock_doc.id = "DOC-TEST-001"
    mock_doc.sha256_hash = None
    mock_db.query.return_value.filter.return_value.first.return_value = mock_doc

    original_setting = settings.BLOCKCHAIN_ENABLED
    try:
        settings.BLOCKCHAIN_ENABLED = False
        with patch("app.database.session.SessionLocal", return_value=mock_db):
            result = service.anchor_document_on_chain("DOC-TEST-001", "a" * 64, "document")
            assert result["success"] is True
            assert result["status"] == "unanchored"
            assert mock_doc.blockchain_status == "unanchored"
    finally:
        settings.BLOCKCHAIN_ENABLED = original_setting

def test_blockchain_service_unreachable_provider():
    """Verify safe handling when the Web3 RPC provider fails or times out."""
    service = BlockchainService()

    mock_db = MagicMock()
    mock_doc = MagicMock()
    mock_doc.id = "DOC-TEST-002"
    mock_db.query.return_value.filter.return_value.first.return_value = mock_doc

    with patch("app.database.session.SessionLocal", return_value=mock_db):
        with patch.object(service, "get_web3_client") as mock_w3_getter:
            mock_w3 = MagicMock()
            mock_w3.eth.get_transaction_count.side_effect = ConnectionError("Could not connect to EVM RPC node")
            mock_w3_getter.return_value = mock_w3
            service._account = MagicMock()
            service._contract = MagicMock()

            result = service.anchor_document_on_chain("DOC-TEST-002", "b" * 64, "document")
            # Must not crash or raise uncaught exception
            assert result["success"] is False
            assert result["status"] == "failed"
            assert mock_doc.blockchain_status == "failed"

def test_anchor_document_mock_web3_success():
    """Verify successful transaction signing, broadcast, and confirmation."""
    service = BlockchainService()

    mock_db = MagicMock()
    mock_doc = MagicMock()
    mock_doc.id = "DOC-TEST-003"
    mock_doc.sha256_hash = None
    mock_db.query.return_value.filter.return_value.first.return_value = mock_doc

    mock_w3 = MagicMock()
    mock_w3.eth.get_transaction_count.return_value = 12
    mock_w3.eth.gas_price = 25000000000
    mock_w3.eth.estimate_gas.return_value = 85000

    mock_receipt = MagicMock()
    mock_receipt.status = 1
    mock_receipt.blockNumber = 1245678
    mock_w3.eth.wait_for_transaction_receipt.return_value = mock_receipt

    fake_tx_hash = MagicMock()
    fake_tx_hex = "0x9876543210abcdef9876543210abcdef9876543210abcdef9876543210abcdef"
    fake_tx_hash.hex.return_value = fake_tx_hex
    mock_w3.eth.send_raw_transaction.return_value = fake_tx_hash

    mock_account = MagicMock()
    mock_account.address = "0x1111111111111111111111111111111111111111"
    mock_signed = MagicMock()
    mock_signed.rawTransaction = b"mock_raw_tx"
    mock_account.sign_transaction.return_value = mock_signed

    mock_contract = MagicMock()

    with patch("app.database.session.SessionLocal", return_value=mock_db):
        with patch.object(service, "get_web3_client", return_value=mock_w3):
            service._account = mock_account
            service._contract = mock_contract

            result = service.anchor_document_on_chain("DOC-TEST-003", "c" * 64, "document")
            assert result["success"] is True
            assert result["status"] == "confirmed"
            assert result["tx_hash"] == fake_tx_hex
            assert mock_doc.blockchain_status == "confirmed"
            assert mock_doc.blockchain_tx_hash == fake_tx_hex

def test_document_approval_continues_even_if_web3_fails(client):
    """Verify that user/principal approval workflow succeeds uninterrupted even if Web3 fails."""
    # 1. Login as Principal
    login_res = client.post("/api/auth/login", json={
        "email": settings.INITIAL_PRINCIPAL_EMAIL,
        "password": settings.INITIAL_PRINCIPAL_PASSWORD
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Mock blockchain client to throw an exception inside anchor_document_on_chain
    with patch.object(blockchain_service, "get_web3_client", side_effect=RuntimeError("Simulated EVM RPC fatal timeout")):
        # Create a document to approve
        from app.database.session import SessionLocal
        from app.models.document import Document
        from app.models.user import User

        db = SessionLocal()
        try:
            admin_user = db.query(User).filter(User.email == settings.INITIAL_ADMIN_EMAIL).first()
            test_doc = Document(
                id="DOC-TEST-FAILSAFE",
                doc_title="Emergency Leave Request",
                doc_category="Medical Leave",
                submitted_by_id=admin_user.id,
                submitted_date="2026-10-09",
                file_path="uploads/test.pdf",
                file_size="15 KB",
                file_type="application/pdf",
                status=DocumentStatusEnum.VERIFIED_BY_MEDIATOR
            )
            db.merge(test_doc)
            db.commit()
        finally:
            db.close()

        # Approval endpoint must return 200 OK without failing
        appr_res = client.post(
            "/api/principal/documents/DOC-TEST-FAILSAFE/approve",
            json={"note": "Approved despite EVM network status"},
            headers=headers
        )
        assert appr_res.status_code == 200
        data = appr_res.json()
        assert data["status"] == "APPROVED_BY_PRINCIPAL"
        assert data["digitalStampVerified"] is True
        assert data["approvalReferenceNo"] is not None

def test_public_verification_payload(client):
    """Verify public verification endpoint returns full blockchain audit certificate data."""
    res = client.get("/api/public/verify/NON_EXISTENT_ID")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "NOT_FOUND"
    assert "blockchain_status" in data
    assert "blockchain_verified" in data
    assert "institution" in data
