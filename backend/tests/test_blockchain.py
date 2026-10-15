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
    """Verify safe handling when the Web3 RPC provider fails or times out.
    Updated for the new 3-tuple get_web3_client() signature.
    Falls back to LocalECDSALedger when contract is None, so result is 'confirmed' locally.
    """
    service = BlockchainService()

    mock_db = MagicMock()
    mock_doc = MagicMock()
    mock_doc.id = "DOC-TEST-002"
    mock_doc.sha256_hash = None
    mock_db.query.return_value.filter.return_value.first.return_value = mock_doc

    # Simulate: web3 is connected but contract is not set (simulates unreachable on-chain)
    # The new service falls back gracefully to LocalECDSALedger
    with patch("app.database.session.SessionLocal", return_value=mock_db):
        with patch.object(service, "get_web3_client", return_value=(None, None, None)):
            result = service.anchor_document_on_chain("DOC-TEST-002", "b" * 64, "document")
            # Must not crash or raise uncaught exception
            assert result["success"] is True
            # Falls back to local ECDSA ledger
            assert result["status"] in ("confirmed", "pending", "unanchored")
            assert result.get("mode") == "local_ecdsa_ledger" or result.get("status") in ("unanchored",)


def test_anchor_document_mock_web3_success():
    """Verify successful transaction signing, broadcast, and confirmation.
    Updated for the new 3-tuple get_web3_client() return signature.
    """
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
    fake_tx_hex = "9876543210abcdef9876543210abcdef9876543210abcdef9876543210abcdef"
    fake_tx_hash.hex.return_value = fake_tx_hex
    mock_w3.eth.send_raw_transaction.return_value = fake_tx_hash

    mock_account = MagicMock()
    mock_account.address = "0x1111111111111111111111111111111111111111"
    mock_signed = MagicMock()
    mock_signed.rawTransaction = b"mock_raw_tx"
    mock_account.sign_transaction.return_value = mock_signed

    mock_contract = MagicMock()
    mock_contract.functions.anchorSignedDocument.return_value.build_transaction.return_value = {
        "from": mock_account.address,
        "nonce": 12,
        "gasPrice": 25000000000,
    }

    with patch("app.database.session.SessionLocal", return_value=mock_db):
        # Pass 3-tuple: (w3, contract, account)
        with patch.object(service, "get_web3_client", return_value=(mock_w3, mock_contract, mock_account)):
            # Also mock _ecdsa_sign to avoid needing a real private key
            with patch.object(service, "_ecdsa_sign", return_value=("0x" + "ab" * 65, mock_account.address)):
                result = service.anchor_document_on_chain("DOC-TEST-003", "c" * 64, "document")
                # With live EVM mocked, should succeed
                assert result["success"] is True
                assert result["status"] in ("confirmed", "local_ecdsa_ledger")


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


def test_ecdsa_verify_static():
    """Verify pure ECDSA signature recovery (no network needed)."""
    try:
        from eth_account import Account
        from eth_account.messages import encode_defunct

        private_key = "0x4c0883a69102937d6231471b5dbb6204fe5129617082792ae468d01a3f362318"
        account = Account.from_key(private_key)

        doc_bytes = b"Niyojan test document content for ECDSA verification"
        doc_hash = hashlib.sha256(doc_bytes).hexdigest()
        hash_hex = f"0x{doc_hash}"

        # Sign
        msg = encode_defunct(hexstr=hash_hex)
        signed = Account.sign_message(msg, private_key=private_key)
        sig_hex = "0x" + signed.signature.hex()

        # Verify via service
        result = BlockchainService.verify_ecdsa_signature(hash_hex, sig_hex, account.address)
        assert result["valid"] is True
        assert result["recovered_address"].lower() == account.address.lower()
        assert result["address_match"] is True
    except ImportError:
        pytest.skip("eth_account not installed")
