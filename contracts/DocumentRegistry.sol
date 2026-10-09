// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title DocumentRegistry
 * @dev Gas-efficient registry for anchoring tamper-proof document & appointment digests on EVM testnets.
 */
contract DocumentRegistry {
    struct Record {
        bytes32 fileHash;
        uint256 timestamp;
        address issuer;
    }

    // Keyed by document UUID (e.g. DOC-2026-8812) or appointment code (e.g. APT-2026-1001)
    mapping(string => Record) public records;

    event DocumentRegistered(
        string docId,
        bytes32 indexed fileHash,
        uint256 timestamp,
        address indexed issuer
    );

    /**
     * @notice Register or update a document digest.
     * @dev Only allow registration if new, or if updating by the same authorized issuer.
     * @param docId Document identifier or appointment code
     * @param fileHash SHA-256 digest packed as bytes32
     */
    function registerDocument(string calldata docId, bytes32 fileHash) external {
        Record storage existing = records[docId];
        if (existing.timestamp != 0) {
            require(existing.issuer == msg.sender, "Unauthorized: already registered by another issuer");
        }

        records[docId] = Record({
            fileHash: fileHash,
            timestamp: block.timestamp,
            issuer: msg.sender
        });

        emit DocumentRegistered(docId, fileHash, block.timestamp, msg.sender);
    }

    /**
     * @notice Verify whether a document is registered and retrieve its anchored metadata.
     * @param docId Document identifier or appointment code
     * @return fileHash Anchored SHA-256 digest
     * @return timestamp Block timestamp when registered
     * @return issuer Address of the relayer / issuer
     * @return exists Boolean indicating whether the record exists
     */
    function verifyDocument(string calldata docId) external view returns (
        bytes32 fileHash,
        uint256 timestamp,
        address issuer,
        bool exists
    ) {
        Record memory rec = records[docId];
        return (rec.fileHash, rec.timestamp, rec.issuer, rec.timestamp != 0);
    }
}
