/**
 * Wallet provisioning seam (Phase C).
 *
 * The animator's wallet is RECEIVE-ONLY here: AnimaTime's issuer wallet mints the
 * SBT to the animator's address (the animator never signs for issuance). So the
 * provider only needs to give each animator a stable, non-custodial, recoverable
 * ADDRESS with no seed phrase.
 *
 * Per Phase C ADR-001 the recommended provider is **Coinbase CDP Embedded
 * Wallets** (op-based pricing -> ~$0 for dormant holders, non-custodial AWS Nitro
 * TEE, MetaMask-compatible key export, Polygon), with **Turnkey** as fallback.
 * Implementations are kept behind this interface so the provider is swappable and
 * the rest of the issuance pipeline does not depend on a specific vendor.
 *
 * STATUS: interface + an unconfigured CDP skeleton. The CDP SDK is intentionally
 * NOT added as a dependency yet (avoid premature dep churn); wire it during the
 * testnet POC. The go-live gate (ADR-001) requires proving in a Polygon testnet
 * POC that (a) minting to a pre-generated CDP wallet works, (b) receiving the SBT
 * costs the animator 0 billable ops, and (c) a cold lost-device recovery succeeds.
 */

/**
 * @typedef {Object} ProvisionedWallet
 * @property {string} address        EVM address to mint the SBT to
 * @property {string} providerUserId provider-side user/wallet id (for recovery)
 */

/**
 * @interface WalletProvider
 * ensureWallet(externalUserId): Promise<ProvisionedWallet>
 *   Idempotently get-or-create a non-custodial wallet for an animator, keyed by a
 *   stable external id (e.g. AnimaTime Staff.id). MUST be safe to call repeatedly.
 */

class WalletProviderNotConfiguredError extends Error {}

/**
 * Coinbase CDP Embedded Wallets adapter — SKELETON.
 * Wire with @coinbase/cdp-sdk (Server Wallet for pre-generation) during the POC.
 * Pre-generation requires a CDP Portal "Server Wallet Secret" (custody/rotate it).
 */
class CdpWalletProvider {
  constructor({ apiKeyId, apiKeySecret, walletSecret } = {}) {
    this.configured = Boolean(apiKeyId && apiKeySecret && walletSecret);
    this._cfg = { apiKeyId, apiKeySecret, walletSecret };
  }

  async ensureWallet(/* externalUserId */) {
    if (!this.configured) {
      throw new WalletProviderNotConfiguredError(
        "CDP not configured: install @coinbase/cdp-sdk and set CDP_API_KEY_ID, " +
          "CDP_API_KEY_SECRET, CDP_WALLET_SECRET. See Phase C ADR-001 / go-live POC."
      );
    }
    // POC TODO: createEndUser/account via CDP Server Wallet (pre-generation),
    // return its EVM address + provider user id. Receiving an ERC-721 must cost
    // 0 animator-side billable ops — VERIFY in the POC (docs confirm reads are
    // free but are silent on token receipt).
    throw new Error("CdpWalletProvider.ensureWallet: implement during testnet POC");
  }
}

/**
 * Turnkey adapter — SKELETON (fallback per ADR-001). Provision each animator as a
 * sub-organization with an email-auth fallback authenticator (else a root user who
 * loses all authenticators is unrecoverable).
 */
class TurnkeyWalletProvider {
  constructor({ apiPublicKey, apiPrivateKey, organizationId } = {}) {
    this.configured = Boolean(apiPublicKey && apiPrivateKey && organizationId);
  }
  async ensureWallet(/* externalUserId */) {
    if (!this.configured) {
      throw new WalletProviderNotConfiguredError(
        "Turnkey not configured: set TURNKEY_API_PUBLIC_KEY, TURNKEY_API_PRIVATE_KEY, TURNKEY_ORG_ID."
      );
    }
    throw new Error("TurnkeyWalletProvider.ensureWallet: implement during testnet POC");
  }
}

module.exports = {
  CdpWalletProvider,
  TurnkeyWalletProvider,
  WalletProviderNotConfiguredError,
};
