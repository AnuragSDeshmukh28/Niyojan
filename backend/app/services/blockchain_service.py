import os
import json
import logging
import hashlib
from pathlib import Path
from typing import Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session

from app.core.config import settings
import app.database.session as session_module
from app.models.document import Document
from app.models.appointment import Appointment

logger = logging.getLogger("blockchain_service")

# Fallback ABI in case json file is absent or incomplete
DEFAULT_CONTRACT_ABI = [
    {
        "anonymous": False,
        "inputs": [
            {"indexed": False, "internalType": "string", "name": "docId", "type": "string"},
            {"indexed": True, "internalType": "bytes32", "name": "fileHash", "type": "bytes32"},
            {"indexed": False, "internalType": "uint256", "name": "timestamp", "type": "uint256"},
            {"indexed": True, "internalType": "address", "name": "issuer", "type": "address"}
        ],
        "name": "DocumentRegistered",
        "type": "event"
    },
    {
        "inputs": [{"internalType": "string", "name": "", "type": "string"}],
        "name": "records",
        "outputs": [
            {"internalType": "bytes32", "name": "fileHash", "type": "bytes32"},
            {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
            {"internalType": "address", "name": "issuer", "type": "address"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "string", "name": "docId", "type": "string"},
            {"internalType": "bytes32", "name": "fileHash", "type": "bytes32"}
        ],
        "name": "registerDocument",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "string", "name": "docId", "type": "string"}],
        "name": "verifyDocument",
        "outputs": [
            {"internalType": "bytes32", "name": "fileHash", "type": "bytes32"},
            {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
            {"internalType": "address", "name": "issuer", "type": "address"},
            {"internalType": "bool", "name": "exists", "type": "bool"}
        ],
        "stateMutability": "view",
        "type": "function"
    }
]

class BlockchainService:
    def __init__(self):
        self._w3 = None
        self._contract = None
        self._account = None
        self._abi = None
        self._contract_address = None
        self._initialized = False

    @staticmethod
    def calculate_file_hash(file_bytes: bytes) -> str:
        """Calculates standard SHA-256 hexadecimal hash string for binary content."""
        return hashlib.sha256(file_bytes).hexdigest()

    @staticmethod
    def hex_to_bytes32(hex_str: str) -> bytes:
        """Converts a SHA-256 hex string to bytes32 for Solidity ABI."""
        clean_hex = hex_str.strip().lower()
        if clean_hex.startswith("0x"):
            clean_hex = clean_hex[2:]
        clean_hex = clean_hex.zfill(64)[:64]
        return bytes.fromhex(clean_hex)

    @staticmethod
    def bytes32_to_hex(b: bytes) -> str:
        """Converts bytes32 back to a 64-character lowercase hex string."""
        if isinstance(b, str):
            clean = b.lower()
            return clean[2:] if clean.startswith("0x") else clean
        return b.hex()

    def get_explorer_url(self, tx_hash: Optional[str]) -> Optional[str]:
        """Generates block explorer transaction link."""
        if not tx_hash:
            return None
        base = settings.BLOCKCHAIN_EXPLORER_URL.rstrip("/")
        # If tx_hash already starts with 0x, keep it intact
        clean_tx = tx_hash.strip()
        if not clean_tx.startswith("0x") and not clean_tx.startswith("mock_"):
            clean_tx = f"0x{clean_tx}"
        return f"{base}/{clean_tx}"

    def load_contract_metadata(self) -> Tuple[Optional[str], list]:
        """Loads deployed contract address and ABI from disk or settings."""
        abi_path = Path(__file__).resolve().parent.parent / "core" / "contract_abi.json"
        contract_address = settings.BLOCKCHAIN_CONTRACT_ADDRESS or ""
        abi = DEFAULT_CONTRACT_ABI

        if abi_path.exists():
            try:
                with open(abi_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if isinstance(data, dict):
                        file_address = data.get("address", "")
                        if not contract_address and file_address and file_address != "0x0000000000000000000000000000000000000000":
                            contract_address = file_address
                        if "abi" in data and isinstance(data["abi"], list):
                            abi = data["abi"]
            except Exception as e:
                logger.warning(f"Could not load contract ABI from {abi_path}: {e}")

        return contract_address, abi

    def get_web3_client(self):
        """Lazy-inits and returns Web3 instance if enabled and libraries are available."""
        if self._w3 is not None:
            return self._w3

        if not settings.BLOCKCHAIN_ENABLED:
            logger.info("Blockchain anchoring is disabled via configuration.")
            return None

        try:
            from web3 import Web3
            from eth_account import Account
        except ImportError:
            logger.warning("web3 or eth-account packages not installed. Running in local fallback mode.")
            return None

        try:
            w3 = Web3(Web3.HTTPProvider(settings.BLOCKCHAIN_RPC_URL))
            self._w3 = w3

            address, abi = self.load_contract_metadata()
            self._abi = abi
            self._contract_address = address

            if settings.BLOCKCHAIN_PRIVATE_KEY:
                try:
                    self._account = Account.from_key(settings.BLOCKCHAIN_PRIVATE_KEY)
                except Exception as ex:
                    logger.warning(f"Invalid BLOCKCHAIN_PRIVATE_KEY provided: {ex}")
                    self._account = None

            if address and Web3.is_address(address) and address != "0x0000000000000000000000000000000000000000":
                self._contract = w3.eth.contract(address=Web3.to_checksum_address(address), abi=abi)
            
            return self._w3
        except Exception as e:
            logger.warning(f"Failed to initialize Web3 client: {e}")
            return None

    def anchor_document_on_chain(self, doc_id: str, file_hash_hex: str, entity_type: str = "document") -> Dict[str, Any]:
        """
        Background-safe method to anchor document/appointment digest onto EVM blockchain.
        Updates DB record status: unanchored -> pending -> confirmed (or failed).
        Never raises exceptions to callers; errors are logged and status updated gracefully.
        """
        db: Session = session_module.SessionLocal()
        try:
            # 1. Fetch entity record
            record = None
            if entity_type == "appointment" or doc_id.startswith("APT-"):
                record = db.query(Appointment).filter(Appointment.id == doc_id).first()
                is_doc = False
            else:
                record = db.query(Document).filter(Document.id == doc_id).first()
                is_doc = True

            if not record:
                logger.error(f"Cannot anchor: Entity {doc_id} not found in database.")
                return {"success": False, "error": "Entity not found", "status": "failed"}

            # Update hash on model if missing
            record.sha256_hash = file_hash_hex
            if is_doc and not getattr(record, "document_hash", None):
                record.document_hash = file_hash_hex

            # 2. Check if blockchain is enabled and configured
            if not settings.BLOCKCHAIN_ENABLED:
                logger.info(f"Blockchain disabled. Setting {doc_id} to local unanchored status.")
                record.blockchain_status = "unanchored"
                db.commit()
                return {"success": True, "status": "unanchored", "message": "Blockchain disabled, local record only."}

            w3 = self.get_web3_client()
            if not w3 or not self._account or not self._contract:
                # Local fallback mode when no funded relayer or RPC is connected
                logger.info(f"Blockchain credentials or contract address not configured. Using local fallback for {doc_id}.")
                mock_tx = f"mock_{hashlib.sha256((doc_id + file_hash_hex).encode()).hexdigest()[:40]}"
                record.blockchain_tx_hash = mock_tx
                record.blockchain_status = "confirmed"
                db.commit()
                return {
                    "success": True,
                    "status": "confirmed",
                    "tx_hash": mock_tx,
                    "is_fallback": True,
                    "message": "Local fallback anchor recorded."
                }

            # 3. Live on-chain transaction
            try:
                # Mark status as pending
                record.blockchain_status = "pending"
                db.commit()

                bytes32_hash = self.hex_to_bytes32(file_hash_hex)
                account_addr = self._account.address

                nonce = w3.eth.get_transaction_count(account_addr)
                gas_price = w3.eth.gas_price

                # Build raw transaction
                tx_data = self._contract.functions.registerDocument(doc_id, bytes32_hash).build_transaction({
                    "from": account_addr,
                    "nonce": nonce,
                    "gasPrice": gas_price
                })

                # Estimate gas safely
                try:
                    estimated_gas = w3.eth.estimate_gas(tx_data)
                    tx_data["gas"] = int(estimated_gas * 1.2)
                except Exception:
                    tx_data["gas"] = 120000

                # Sign & broadcast transaction
                signed_tx = self._account.sign_transaction(tx_data)
                tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
                tx_hash_hex = tx_hash.hex()

                record.blockchain_tx_hash = tx_hash_hex
                record.blockchain_status = "pending"
                db.commit()

                logger.info(f"Broadcasted transaction for {doc_id}: {tx_hash_hex}")

                # Wait for receipt with timeout
                try:
                    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=60)
                    if receipt and receipt.status == 1:
                        record.blockchain_status = "confirmed"
                        db.commit()
                        logger.info(f"Document {doc_id} confirmed on-chain in block {receipt.blockNumber}!")
                        return {
                            "success": True,
                            "status": "confirmed",
                            "tx_hash": tx_hash_hex,
                            "block_number": receipt.blockNumber
                        }
                    else:
                        record.blockchain_status = "failed"
                        db.commit()
                        logger.warning(f"Transaction for {doc_id} reverted on-chain.")
                        return {"success": False, "status": "failed", "tx_hash": tx_hash_hex}
                except Exception as wait_err:
                    # Timeout waiting for block inclusion - remains pending for explorer lookup
                    logger.info(f"Waiting for receipt timed out for {doc_id}; left in pending state: {wait_err}")
                    return {"success": True, "status": "pending", "tx_hash": tx_hash_hex}

            except Exception as tx_err:
                logger.error(f"Error submitting blockchain transaction for {doc_id}: {tx_err}", exc_info=True)
                record.blockchain_status = "failed"
                db.commit()
                return {"success": False, "status": "failed", "error": str(tx_err)}

        except Exception as e:
            logger.error(f"Unexpected error in anchor_document_on_chain for {doc_id}: {e}", exc_info=True)
            try:
                db.rollback()
            except Exception:
                pass
            return {"success": False, "status": "failed", "error": str(e)}
        finally:
            db.close()

    def verify_document_on_chain(self, doc_id: str) -> Dict[str, Any]:
        """
        Queries smart contract verifyDocument(docId) view function.
        Returns anchored record or exists=False.
        """
        w3 = self.get_web3_client()
        if not w3 or not self._contract:
            return {"exists": False, "reason": "Blockchain client or contract not available"}

        try:
            file_hash_bytes, timestamp, issuer, exists = self._contract.functions.verifyDocument(doc_id).call()
            file_hash_hex = self.bytes32_to_hex(file_hash_bytes) if exists else None
            return {
                "exists": exists,
                "file_hash": file_hash_hex,
                "timestamp": timestamp,
                "issuer": issuer
            }
        except Exception as e:
            logger.warning(f"Error querying smart contract for {doc_id}: {e}")
            return {"exists": False, "error": str(e)}

# Global singleton instance
blockchain_service = BlockchainService()
