// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

/// @title CertificateRegistry
/// @notice Educational prototype for the course Introduction to Finance.
///         Stores only the hash, issuer, date and status of a certificate.
///         No personal data and no money are ever stored or handled here.
contract CertificateRegistry is AccessControl, Pausable {
    bytes32 public constant UNIVERSITY_ROLE = keccak256("UNIVERSITY_ROLE");

    enum Status {
        NotFound,
        Valid,
        Revoked
    }

    struct Certificate {
        address issuer;
        uint64 issuedAt;
        Status status;
    }

    mapping(bytes32 => Certificate) private certificates;

    event CertificateIssued(bytes32 indexed hash, address indexed issuer, uint64 issuedAt);
    event CertificateRevoked(bytes32 indexed hash, address indexed issuer);

    error AlreadyIssued(bytes32 hash);
    error NotFoundCertificate(bytes32 hash);
    error NotIssuer(bytes32 hash, address caller);
    error AlreadyRevoked(bytes32 hash);

    /// @param admin Network operator. In a real deployment this would be a 2-of-3 multisignature wallet.
    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    // ----- Admin functions -----

    function registerUniversity(address university) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(UNIVERSITY_ROLE, university);
    }

    function removeUniversity(address university) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(UNIVERSITY_ROLE, university);
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    // ----- University functions -----

    /// @notice A registered university saves the hash of a new certificate.
    function issue(bytes32 hash) external onlyRole(UNIVERSITY_ROLE) whenNotPaused {
        if (certificates[hash].status != Status.NotFound) revert AlreadyIssued(hash);
        uint64 nowTs = uint64(block.timestamp);
        certificates[hash] = Certificate(msg.sender, nowTs, Status.Valid);
        emit CertificateIssued(hash, msg.sender, nowTs);
    }

    /// @notice Only the university that issued a certificate can revoke it.
    function revoke(bytes32 hash) external {
        Certificate storage c = certificates[hash];
        if (c.status == Status.NotFound) revert NotFoundCertificate(hash);
        if (c.issuer != msg.sender) revert NotIssuer(hash, msg.sender);
        if (c.status == Status.Revoked) revert AlreadyRevoked(hash);
        c.status = Status.Revoked;
        emit CertificateRevoked(hash, msg.sender);
    }

    // ----- Public read function (free, runs no consensus) -----

    /// @notice Anyone with network access can check a certificate hash.
    function verify(bytes32 hash) external view returns (Status status, address issuer, uint64 issuedAt) {
        Certificate memory c = certificates[hash];
        return (c.status, c.issuer, c.issuedAt);
    }
}
