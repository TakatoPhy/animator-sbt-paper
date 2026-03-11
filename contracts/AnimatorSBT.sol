// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title AnimatorSBT
 * @notice Non-transferable ERC-721 token for anime production contribution certification.
 * @dev Soulbinding is enforced by reverting all transfer functions.
 *      Only addresses with ISSUER_ROLE can mint tokens.
 *      Only addresses with ADMIN_ROLE can grant/revoke issuer roles.
 */
contract AnimatorSBT is ERC721, AccessControl {
    using Counters for Counters.Counter;

    // ===== Roles =====
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");

    // ===== State =====
    Counters.Counter private _tokenIdCounter;

    /// @notice Mapping from token ID to metadata URI (IPFS CID)
    mapping(uint256 => string) private _tokenURIs;

    /// @notice Mapping from token ID to revocation status
    mapping(uint256 => bool) private _revoked;

    /// @notice Mapping from token ID to issuance timestamp
    mapping(uint256 => uint256) private _issuedAt;

    // ===== Events =====
    event SBTMinted(
        uint256 indexed tokenId,
        address indexed to,
        string uri,
        uint256 timestamp
    );

    event SBTRevoked(
        uint256 indexed tokenId,
        uint256 timestamp
    );

    // ===== Errors =====
    error SoulboundTransferDisabled();
    error TokenAlreadyRevoked(uint256 tokenId);
    error TokenNotRevoked(uint256 tokenId);

    // ===== Constructor =====
    constructor() ERC721("AnimatorSBT", "ASBT") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ISSUER_ROLE, msg.sender);
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

    /**
     * @dev Override approve to prevent approvals (no transfers possible).
     */
    function approve(address, uint256) public pure override {
        revert SoulboundTransferDisabled();
    }

    /**
     * @dev Override setApprovalForAll to prevent approvals.
     */
    function setApprovalForAll(address, bool) public pure override {
        revert SoulboundTransferDisabled();
    }

    // ===== Core Functions =====

    /**
     * @notice Mint a new SBT to an animator's address.
     * @param to The animator's wallet address.
     * @param uri IPFS URI pointing to the contribution metadata JSON.
     * @return tokenId The ID of the newly minted token.
     */
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
        return tokenId;
    }

    /**
     * @notice Batch mint SBTs to multiple animators.
     * @param recipients Array of animator wallet addresses.
     * @param uris Array of IPFS URIs (must match recipients length).
     */
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
        }
    }

    /**
     * @notice Revoke an SBT (mark as invalidated). Does not burn.
     * @param tokenId The token to revoke.
     */
    function revoke(uint256 tokenId) external onlyRole(ISSUER_ROLE) {
        if (_revoked[tokenId]) revert TokenAlreadyRevoked(tokenId);
        _requireMinted(tokenId);
        _revoked[tokenId] = true;
        emit SBTRevoked(tokenId, block.timestamp);
    }

    // ===== View Functions =====

    /**
     * @notice Get the metadata URI for a token.
     */
    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        _requireMinted(tokenId);
        return _tokenURIs[tokenId];
    }

    /**
     * @notice Check if a token has been revoked.
     */
    function isRevoked(uint256 tokenId) external view returns (bool) {
        return _revoked[tokenId];
    }

    /**
     * @notice Get the issuance timestamp of a token.
     */
    function issuedAt(uint256 tokenId) external view returns (uint256) {
        return _issuedAt[tokenId];
    }

    /**
     * @notice Get the total number of SBTs minted.
     */
    function totalMinted() external view returns (uint256) {
        return _tokenIdCounter.current();
    }

    /**
     * @notice Get all token IDs owned by an address.
     * @dev Iterates over all minted tokens. Not gas-efficient for on-chain use;
     *      intended for off-chain queries (view function).
     */
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
        return super.supportsInterface(interfaceId);
    }
}
