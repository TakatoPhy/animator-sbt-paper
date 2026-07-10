// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title AnimatorSBTV2
 * @notice Phase C development version of AnimatorSBT. Adds a studio co-signing
 *         (attestation) layer on top of the deployed v1 contract, turning a
 *         self-attested record into a mutually verified credential.
 * @dev    This is NOT the contract currently deployed on Polygon Amoy (that is
 *         `AnimatorSBT.sol`, reproduced verbatim in the paper's Appendix D and
 *         left untouched). This v2 is intended for a fresh testnet deployment.
 *
 *         OpenZeppelin v4.x style (Counters + _beforeTokenTransfer) is used here
 *         to match the installed toolchain and the existing v1; migrating both to
 *         OZ v5 (`_update` hook, plain counter) is tracked as a separate sub-step
 *         (see docs/plan Phase C-1). The co-signing logic below is independent of
 *         that migration and ports unchanged.
 *
 *         Design decisions (flagged in the Phase C plan, open question #4):
 *           - Multiple distinct studios may co-sign one token (peer/multi-studio).
 *           - The SAME attester cannot co-sign twice (idempotent; reverts).
 *           - A revoked token cannot be co-signed.
 *           - Attestations are add-only in this MVP (no withdrawal yet).
 */
contract AnimatorSBTV2 is ERC721, AccessControl {
    using Counters for Counters.Counter;

    // ===== Roles =====
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");
    /// @notice Role held by studios (or production managers) authorized to co-sign.
    bytes32 public constant STUDIO_ATTESTER_ROLE = keccak256("STUDIO_ATTESTER_ROLE");

    /// @dev ERC-5192 (minimal soulbound) interface id == bytes4(keccak256("locked(uint256)")).
    bytes4 private constant _INTERFACE_ID_ERC5192 = 0xb45a3c0e;

    // ===== State =====
    Counters.Counter private _tokenIdCounter;

    /// @notice Mapping from token ID to metadata URI (IPFS CID)
    mapping(uint256 => string) private _tokenURIs;

    /// @notice Mapping from token ID to revocation status
    mapping(uint256 => bool) private _revoked;

    /// @notice Mapping from token ID to issuance timestamp
    mapping(uint256 => uint256) private _issuedAt;

    /// @notice Mapping from token ID to the list of addresses that co-signed it
    mapping(uint256 => address[]) private _attesters;

    /// @notice token ID => attester => whether that attester has already co-signed
    mapping(uint256 => mapping(address => bool)) private _hasCoSigned;

    // ===== Events =====
    event SBTMinted(
        uint256 indexed tokenId,
        address indexed to,
        string uri,
        uint256 timestamp
    );

    event SBTRevoked(uint256 indexed tokenId, uint256 timestamp);

    /// @notice Emitted when a studio/attester co-signs a token.
    event SBTCoSigned(
        uint256 indexed tokenId,
        address indexed attester,
        uint256 timestamp
    );

    /// @notice ERC-5192: emitted when a token becomes permanently locked (at mint).
    /// No `Unlocked` event is declared: AnimatorSBTs never unlock.
    event Locked(uint256 tokenId);

    // ===== Errors =====
    error SoulboundTransferDisabled();
    error TokenAlreadyRevoked(uint256 tokenId);
    error TokenNotRevoked(uint256 tokenId);
    error CannotCoSignRevokedToken(uint256 tokenId);
    error DuplicateAttestation(uint256 tokenId, address attester);

    // ===== Constructor =====
    constructor() ERC721("AnimatorSBT", "ASBT") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ISSUER_ROLE, msg.sender);
        _grantRole(STUDIO_ATTESTER_ROLE, msg.sender);
    }

    // ===== Soulbinding: Disable Transfers =====

    /**
     * @dev Override to prevent all transfers. Minting (from == address(0)) is allowed.
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal virtual override {
        if (from != address(0) && to != address(0)) {
            revert SoulboundTransferDisabled();
        }
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function approve(address, uint256) public pure override {
        revert SoulboundTransferDisabled();
    }

    function setApprovalForAll(address, bool) public pure override {
        revert SoulboundTransferDisabled();
    }

    // ===== Core Functions (unchanged from v1) =====

    function mint(
        address to,
        string calldata uri
    ) external onlyRole(ISSUER_ROLE) returns (uint256) {
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();

        _safeMint(to, tokenId);
        _tokenURIs[tokenId] = uri;
        _issuedAt[tokenId] = block.timestamp;

        emit SBTMinted(tokenId, to, uri, block.timestamp);
        emit Locked(tokenId); // ERC-5192: token is soulbound from issuance
        return tokenId;
    }

    function mintBatch(
        address[] calldata recipients,
        string[] calldata uris
    ) external onlyRole(ISSUER_ROLE) {
        require(recipients.length == uris.length, "Length mismatch");
        for (uint256 i = 0; i < recipients.length; i++) {
            _tokenIdCounter.increment();
            uint256 tokenId = _tokenIdCounter.current();

            _safeMint(recipients[i], tokenId);
            _tokenURIs[tokenId] = uris[i];
            _issuedAt[tokenId] = block.timestamp;

            emit SBTMinted(tokenId, recipients[i], uris[i], block.timestamp);
            emit Locked(tokenId); // ERC-5192
        }
    }

    function revoke(uint256 tokenId) external onlyRole(ISSUER_ROLE) {
        if (_revoked[tokenId]) revert TokenAlreadyRevoked(tokenId);
        _requireMinted(tokenId);
        _revoked[tokenId] = true;
        emit SBTRevoked(tokenId, block.timestamp);
    }

    // ===== Co-signing / Attestation Layer (new in v2) =====

    /**
     * @notice Co-sign (attest to) an existing token, recording that a studio
     *         endorses the contribution claim. Elevates the token from
     *         self-attested to studio-attested.
     * @param tokenId The token to co-sign. Must be minted and not revoked.
     * @dev Only STUDIO_ATTESTER_ROLE holders may call. The same attester cannot
     *      co-sign the same token twice.
     */
    function coSign(uint256 tokenId) external onlyRole(STUDIO_ATTESTER_ROLE) {
        _requireMinted(tokenId);
        if (_revoked[tokenId]) revert CannotCoSignRevokedToken(tokenId);
        if (_hasCoSigned[tokenId][msg.sender]) {
            revert DuplicateAttestation(tokenId, msg.sender);
        }
        _hasCoSigned[tokenId][msg.sender] = true;
        _attesters[tokenId].push(msg.sender);
        emit SBTCoSigned(tokenId, msg.sender, block.timestamp);
    }

    // ===== View Functions =====

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        _requireMinted(tokenId);
        return _tokenURIs[tokenId];
    }

    function isRevoked(uint256 tokenId) external view returns (bool) {
        return _revoked[tokenId];
    }

    /**
     * @notice ERC-5192: every minted AnimatorSBT is permanently locked (soulbound).
     * @dev Always returns true for an existing token; reverts for a non-existent one.
     *      Exposed so SBT-aware wallets and explorers can recognize the token as
     *      non-transferable via the standard signaling interface, complementing the
     *      enforcement in `_beforeTokenTransfer`.
     */
    function locked(uint256 tokenId) external view returns (bool) {
        _requireMinted(tokenId);
        return true;
    }

    function issuedAt(uint256 tokenId) external view returns (uint256) {
        return _issuedAt[tokenId];
    }

    function totalMinted() external view returns (uint256) {
        return _tokenIdCounter.current();
    }

    /**
     * @notice Get all addresses that have co-signed a token.
     */
    function attesters(
        uint256 tokenId
    ) external view returns (address[] memory) {
        return _attesters[tokenId];
    }

    /**
     * @notice Number of distinct studio attestations on a token.
     */
    function attestationCount(uint256 tokenId) external view returns (uint256) {
        return _attesters[tokenId].length;
    }

    /**
     * @notice Whether a specific address has co-signed a token.
     */
    function hasCoSigned(
        uint256 tokenId,
        address attester
    ) external view returns (bool) {
        return _hasCoSigned[tokenId][attester];
    }

    /**
     * @notice Coarse trust level for a token.
     * @return 0 = self-attested (no studio co-signature),
     *         1 = studio-attested (>= 1 studio co-signature).
     */
    function attestationLevel(uint256 tokenId) external view returns (uint8) {
        return _attesters[tokenId].length > 0 ? 1 : 0;
    }

    function tokensOfOwner(
        address owner
    ) external view returns (uint256[] memory) {
        uint256 total = _tokenIdCounter.current();
        uint256 count = balanceOf(owner);
        uint256[] memory result = new uint256[](count);
        uint256 idx = 0;
        for (uint256 i = 1; i <= total && idx < count; i++) {
            if (_exists(i) && ownerOf(i) == owner) {
                result[idx++] = i;
            }
        }
        return result;
    }

    // ===== Interface Support =====

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, AccessControl) returns (bool) {
        return
            interfaceId == _INTERFACE_ID_ERC5192 ||
            super.supportsInterface(interfaceId);
    }
}
