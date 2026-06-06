/**
 * Hedera payment service — HashConnect (HashPack) primary, MetaMask/EVM fallback.
 *
 * Implements the x402 client protocol:
 *  1. Frontend hits a protected endpoint and receives a 402 response.
 *  2. This service handles the payment against Hedera and encodes the receipt.
 *  3. Caller retries the request with the X-PAYMENT header.
 */

import { HashConnect, HashConnectConnectionState } from 'hashconnect';
import { AccountId, Hbar, LedgerId, TransferTransaction } from '@hashgraph/sdk';

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type WalletType = 'hashconnect' | 'metamask';

export interface ConnectedWallet {
  type: WalletType;
  address: string;     // Hedera account ID (0.0.XXXX) or EVM address (0x...)
  displayAddress: string;
}

export interface X402PaymentReceipt {
  x402Version: 1;
  scheme: 'exact';
  network: string;
  payload: {
    transactionId?: string; // HashConnect path: "0.0.XXXX@seconds.nanos"
    evmTransactionHash?: string; // MetaMask path: "0x..."
    payer: string;
  };
}

// ─── HashConnect singleton ────────────────────────────────────────────────────

let hc: HashConnect | null = null;
const WALLETCONNECT_PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string ?? '';
const HEDERA_NETWORK = (import.meta.env.VITE_HEDERA_NETWORK ?? 'testnet') as 'testnet' | 'mainnet';

function getHashConnect(): HashConnect {
  if (!hc) {
    hc = new HashConnect(
      HEDERA_NETWORK === 'mainnet' ? LedgerId.MAINNET : LedgerId.TESTNET,
      WALLETCONNECT_PROJECT_ID,
      {
        name: 'SeeqMe AI',
        description: 'Deploy your AI portfolio — pay with HBAR',
        url: window.location.origin,
        icons: [`${window.location.origin}/favicon.ico`],
      },
    );
  }
  return hc;
}

// ─── HashConnect wallet ───────────────────────────────────────────────────────

export async function connectHashPack(): Promise<ConnectedWallet> {
  if (!WALLETCONNECT_PROJECT_ID) {
    throw new Error('WalletConnect Project ID not configured (VITE_WALLETCONNECT_PROJECT_ID).');
  }

  const hashConnect = getHashConnect();
  await hashConnect.init();

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('HashPack connection timed out. Please try again.')), 90_000);

    const onStateChange = (state: HashConnectConnectionState) => {
      if (state === HashConnectConnectionState.Connected) {
        clearTimeout(timeout);
        hashConnect.connectionStatusChangeEvent.off(onStateChange);

        const accounts = hashConnect.connectedAccountIds;
        if (!accounts.length) {
          reject(new Error('No accounts found in HashPack.'));
          return;
        }
        const accountId = accounts[0].toString();
        resolve({
          type: 'hashconnect',
          address: accountId,
          displayAddress: accountId,
        });
      }
    };

    hashConnect.connectionStatusChangeEvent.on(onStateChange);
    hashConnect.openPairingModal();
  });
}

export function disconnectHashPack(): void {
  if (hc) {
    hc.disconnect();
    hc = null;
  }
}

// ─── MetaMask / EVM wallet (fallback) ────────────────────────────────────────

const HEDERA_EVM_NETWORKS = {
  testnet: {
    chainId: '0x128', // 296
    chainName: 'Hedera Testnet',
    rpcUrls: ['https://testnet.hashio.io/api'],
    nativeCurrency: { name: 'HBAR', symbol: 'HBAR', decimals: 8 },
    blockExplorerUrls: ['https://hashscan.io/testnet/'],
  },
  mainnet: {
    chainId: '0x127', // 295
    chainName: 'Hedera Mainnet',
    rpcUrls: ['https://mainnet.hashio.io/api'],
    nativeCurrency: { name: 'HBAR', symbol: 'HBAR', decimals: 8 },
    blockExplorerUrls: ['https://hashscan.io/mainnet/'],
  },
};

export async function connectMetaMask(): Promise<ConnectedWallet> {
  if (!window.ethereum) throw new Error('MetaMask is not installed.');

  const accounts = (await window.ethereum.request({ method: 'eth_requestAccounts' })) as string[];
  if (!accounts.length) throw new Error('No account found. Please unlock MetaMask.');

  const targetNet = HEDERA_EVM_NETWORKS[HEDERA_NETWORK];
  try {
    await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: targetNet.chainId }] });
  } catch (e: any) {
    if (e.code === 4902 || e.code === -32603) {
      await window.ethereum.request({ method: 'wallet_addEthereumChain', params: [targetNet] });
    } else {
      throw new Error('Please switch to Hedera network in MetaMask.');
    }
  }

  return { type: 'metamask', address: accounts[0], displayAddress: accounts[0] };
}

// ─── Pay with HashConnect ─────────────────────────────────────────────────────

export async function payWithHashConnect(
  wallet: ConnectedWallet,
  recipientAccountId: string,
  amountHbar: number,
): Promise<string> {
  const hashConnect = getHashConnect();
  const senderAccountId = AccountId.fromString(wallet.address);
  const signer = hashConnect.getSigner(senderAccountId);

  const transferTx = await new TransferTransaction()
    .addHbarTransfer(senderAccountId, Hbar.fromTinybars(-Math.floor(amountHbar * 1e8)))
    .addHbarTransfer(AccountId.fromString(recipientAccountId), Hbar.fromTinybars(Math.floor(amountHbar * 1e8)))
    .setTransactionMemo('SeeqMe Portfolio Deploy')
    .freezeWithSigner(signer);

  const txResponse = await transferTx.executeWithSigner(signer);
  return txResponse.transactionId.toString(); // "0.0.XXXX@seconds.nanos"
}

// ─── Pay with MetaMask (EVM) ──────────────────────────────────────────────────

export async function payWithMetaMask(
  wallet: ConnectedWallet,
  recipientEvmAddress: string,
  amountHbar: number,
): Promise<string> {
  if (!window.ethereum) throw new Error('MetaMask not found.');
  // 1 HBAR = 100_000_000 tinybar. Hedera EVM uses 8 decimal places.
  const tinybars = Math.floor(amountHbar * 1e8);
  const valueHex = '0x' + tinybars.toString(16);

  return (await window.ethereum.request({
    method: 'eth_sendTransaction',
    params: [{ from: wallet.address, to: recipientEvmAddress, value: valueHex, gas: '0x7530' }],
  })) as string;
}

// ─── Encode x402 payment receipt ─────────────────────────────────────────────

export function encodePaymentReceipt(
  wallet: ConnectedWallet,
  transactionResult: string,
): string {
  const receipt: X402PaymentReceipt = {
    x402Version: 1,
    scheme: 'exact',
    network: `hedera-${HEDERA_NETWORK}`,
    payload:
      wallet.type === 'hashconnect'
        ? { transactionId: transactionResult, payer: wallet.address }
        : { evmTransactionHash: transactionResult, payer: wallet.address },
  };
  return btoa(JSON.stringify(receipt));
}
