// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title NiyojanSignatureRegistry
 * @notice Tamper-proof ECDSA Digital Signature Registry for Niyojan Educational Documents.
 *         Stores SHA-256 document hashes with on-chain ecrecover signature verification.
 *         Compatible with Polygon Amoy, Base Sepolia, and local Hardhat/Anvil.
 */
contract NiyojanSignatureRegistry {

    struct SignedDocument {
        bytes32  docHash;       // SHA-256 of approved document bytes (as bytes32)
        address  signer;        // Recovered ECDSA signer address (authorised approver)
        bytes    signature;     // 65-byte ECDSA secp256k1 signature (EIP-191)
        uint256  timestamp;     // block.timestamp at anchoring
        string   documentId;   // Human-readable Niyojan document ID, e.g. "DOC-2026-8812"
        bool     isRevoked;    // Revocation flag (owner-only)
    }

    // Mapping from SHA-256 hash (bytes32) to signed record
    mapping(bytes32 => SignedDocument) private registry;
    // Mapping from document ID string to its hash key (for ID-based lookups)
    mapping(string => bytes32) private idToHash;
    // Authorised signer wallets (set by owner)
    mapping(address => bool) public authorizedApprovers;

    address public owner;

    // ─────────── Events ───────────

    event DocumentSigned(
        bytes32 indexed docHash,
        address indexed signer,
        string  documentId,
        uint256 timestamp
    );

    event DocumentRevoked(
        bytes32 indexed docHash,
        address indexed revokedBy,
        uint256 timestamp
    );

    event ApproverUpdated(
        address indexed approver,
        bool    status
    );

    // ─────────── Modifiers ───────────

    modifier onlyOwner() {
        require(msg.sender == owner, "NiyojanRegistry: caller is not owner");
        _;
    }

    // ─────────── Constructor ───────────

    constructor() {
        owner = msg.sender;
        authorizedApprovers[msg.sender] = true;
        emit ApproverUpdated(msg.sender, true);
    }

    // ─────────── Admin ───────────

    /// @notice Owner can authorise or deauthorise approver wallets
    function setApprover(address approver, bool status) external onlyOwner {
        authorizedApprovers[approver] = status;
        emit ApproverUpdated(approver, status);
    }

    // ─────────── Core Functions ───────────

    /**
     * @notice Anchors a signed document on-chain.
     *         The caller supplies docHash + documentId + 65-byte ECDSA signature.
     *         ecrecover must resolve to an authorised approver address.
     * @param  docHash      bytes32 SHA-256 of the document bytes (0x + 64 hex chars)
     * @param  documentId   Human-readable document ID string (e.g. "DOC-2026-8812")
     * @param  signature    65-byte ECDSA secp256k1 signature (EIP-191 personal_sign)
     * @return recoveredSigner  The wallet address that produced the signature
     */
    function anchorSignedDocument(
        bytes32 docHash,
        string  calldata documentId,
        bytes   calldata signature
    ) external returns (address recoveredSigner) {
        require(registry[docHash].timestamp == 0, "NiyojanRegistry: document already anchored");

        // Recover signer using EIP-191 personal_sign prefix
        bytes32 ethSignedHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", docHash)
        );
        recoveredSigner = _recoverSigner(ethSignedHash, signature);

        require(
            authorizedApprovers[recoveredSigner],
            "NiyojanRegistry: signer is not an authorised Niyojan approver"
        );

        registry[docHash] = SignedDocument({
            docHash:    docHash,
            signer:     recoveredSigner,
            signature:  signature,
            timestamp:  block.timestamp,
            documentId: documentId,
            isRevoked:  false
        });
        idToHash[documentId] = docHash;

        emit DocumentSigned(docHash, recoveredSigner, documentId, block.timestamp);
    }

    /**
     * @notice Verifies a document record by its SHA-256 hash.
     */
    function verifyDocumentByHash(bytes32 docHash)
        external
        view
        returns (
            bool    isValid,
            address signer,
            uint256 timestamp,
            string  memory documentId,
            bytes   memory signature
        )
    {
        SignedDocument storage doc = registry[docHash];
        bool valid = (doc.timestamp != 0) && (!doc.isRevoked);
        return (valid, doc.signer, doc.timestamp, doc.documentId, doc.signature);
    }

    /**
     * @notice Verifies a document record by its string document ID.
     */
    function verifyDocumentById(string calldata documentId)
        external
        view
        returns (
            bool    isValid,
            address signer,
            uint256 timestamp,
            bytes32 docHash,
            bytes   memory signature
        )
    {
        bytes32 hash = idToHash[documentId];
        require(hash != bytes32(0), "NiyojanRegistry: document ID not found");
        SignedDocument storage doc = registry[hash];
        bool valid = (doc.timestamp != 0) && (!doc.isRevoked);
        return (valid, doc.signer, doc.timestamp, hash, doc.signature);
    }

    /**
     * @notice Revokes a previously anchored document (owner only).
     */
    function revokeDocument(bytes32 docHash) external onlyOwner {
        require(registry[docHash].timestamp != 0, "NiyojanRegistry: document not found");
        registry[docHash].isRevoked = true;
        emit DocumentRevoked(docHash, msg.sender, block.timestamp);
    }

    // ─────────── Internal Helpers ───────────

    function _recoverSigner(bytes32 ethSignedHash, bytes memory signature)
        internal
        pure
        returns (address)
    {
        require(signature.length == 65, "NiyojanRegistry: invalid ECDSA signature length");
        bytes32 r;
        bytes32 s;
        uint8   v;
        assembly {
            r := mload(add(signature, 32))
            s := mload(add(signature, 64))
            v := byte(0, mload(add(signature, 96)))
        }
        if (v < 27) { v += 27; }
        require(v == 27 || v == 28, "NiyojanRegistry: invalid signature recovery byte");
        address recovered = ecrecover(ethSignedHash, v, r, s);
        require(recovered != address(0), "NiyojanRegistry: invalid signature");
        return recovered;
    }

    /**
     * @notice Public helper to recover signer from any hash + signature (for testing).
     */
    function recoverSigner(bytes32 ethSignedHash, bytes calldata signature)
        external
        pure
        returns (address)
    {
        return _recoverSigner(ethSignedHash, signature);
    }
}
