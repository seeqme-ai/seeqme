import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ArrowRight, ArrowLeft, Loader2, CheckCircle2,
  AlertCircle, ExternalLink, RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  connectHashPack,
  connectMetaMask,
  payWithHashConnect,
  payWithMetaMask,
  encodePaymentReceipt,
  type ConnectedWallet,
} from '../services/hederaPaymentService';
import { hederaService, type HederaConfig } from '../services/apiService';


const PaystackLogo: React.FC<{ className?: string }> = ({ className = 'h-7' }) => (
  <svg viewBox="0 0 132 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="0" y="2" width="36" height="32" rx="8" fill="#011B33" />
    <rect x="8" y="10" width="20" height="4.5" rx="2.25" fill="#00C3F7" />
    <rect x="8" y="16.5" width="15" height="4.5" rx="2.25" fill="#00C3F7" opacity="0.7" />
    <rect x="8" y="23" width="10" height="4.5" rx="2.25" fill="#00C3F7" opacity="0.4" />
    <text x="44" y="25" fontFamily="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"
      fontWeight="700" fontSize="16" fill="#011B33" letterSpacing="-0.3">Paystack</text>
  </svg>
);

const HederaLogo: React.FC<{ className?: string }> = ({ className = 'h-7' }) => (
  <svg viewBox="0 0 116 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="0" y="2" width="36" height="32" rx="8" fill="#1D2029" />
    <text x="6" y="26" fontFamily="Georgia,'Times New Roman',serif" fontWeight="400" fontSize="22" fill="white">ℏ</text>
    <text x="44" y="25" fontFamily="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"
      fontWeight="700" fontSize="16" fill="#1D2029" letterSpacing="-0.3">Hedera</text>
  </svg>
);

const HashPackIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="40" height="40" rx="10" fill="#0d9488" />
    <text x="8" y="28" fontFamily="Georgia,serif" fontSize="22" fontWeight="700" fill="white">ℏ</text>
  </svg>
);

const MetaMaskIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="40" height="40" rx="10" fill="#F6851B" />
    <path d="M28 10L22 19.5L20.5 15L28 10Z" fill="#E2761B" />
    <path d="M12 10L17.9 15.1L16.5 19.5L12 10Z" fill="#E4761B" />
    <path d="M26 26L22.5 30.5L27.5 32L29 26.5L26 26Z" fill="#E4761B" />
    <path d="M11 26.5L12.5 32L17.5 30.5L14 26L11 26.5Z" fill="#E4761B" />
    <path d="M17.2 21.5L16.5 25.5L22 25L21.5 21.5L17.2 21.5Z" fill="#E4761B" />
    <path d="M22.8 21.5L22 25L24 25.5L25.5 21.5L22.8 21.5Z" fill="#CD6116" />
  </svg>
);


type ModalStep = 'select' | 'hedera';
type HederaStep = 'loading' | 'choose_wallet' | 'connecting' | 'connected' | 'paying' | 'verifying' | 'success' | 'error';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onPaystackProceed: () => void;
  onHederaSuccess: (encodedReceipt: string) => void;
  planId?: string;
}

const MotionDiv = motion.div as any;

// ─── Gateway Selector ─────────────────────────────────────────────────────────

const GatewaySelector: React.FC<{
  onPaystack: () => void;
  onHedera: () => void;
  onClose: () => void;
  hbarConfig: HederaConfig | null;
}> = ({ onPaystack, onHedera, onClose, hbarConfig }) => {
  const hbarLabel = hbarConfig
    ? `${hbarConfig.amountHbar} HBAR ≈ ₦${hbarConfig.amountNgn.toLocaleString()}`
    : 'Loading price…';

  return (
    <div className="px-4 sm:px-6 pb-6 pt-1 space-y-4">
      <div>
        <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mb-0.5">Publish your portfolio</h2>
        <p className="text-sm text-slate-500 font-medium">Choose your payment method to go live.</p>
      </div>

      <div className="space-y-3">
        {/* Paystack */}
        <button
          onClick={onPaystack}
          className="group w-full flex items-center gap-3 sm:gap-4 p-4 border-2 border-slate-100 rounded-2xl hover:border-[#00C3F7]/50 hover:bg-[#f0fbff] transition-all text-left"
        >
          <PaystackLogo className="h-6 sm:h-7 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900">Card or bank transfer</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5 leading-relaxed">
              Subscribe for unlimited deploys. Visa, Mastercard, bank transfer.
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#00C3F7] shrink-0 transition-colors" />
        </button>

        {/* Hedera HBAR */}
        <button
          onClick={onHedera}
          className="group w-full flex items-center gap-3 sm:gap-4 p-4 border-2 border-teal-100 rounded-2xl hover:border-teal-300 hover:bg-teal-50/40 transition-all text-left"
        >
          <HederaLogo className="h-6 sm:h-7 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-bold text-slate-900">Pay with HBAR</p>
              <span className="text-[9px] font-bold text-teal-700 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                Pay once · No subscription
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5 leading-relaxed">
              {hbarLabel} · deploy instantly. Verified on Hedera mainnet.
            </p>
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <span className="text-[10px] font-bold text-teal-600 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-full">~3s finality</span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">HashPack · MetaMask</span>
              {hbarConfig?.liveRate && (
                <span className="text-[10px] font-bold text-sky-600 bg-sky-50 border border-sky-100 px-2 py-0.5 rounded-full">Live rate</span>
              )}
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-teal-300 group-hover:text-teal-500 shrink-0 transition-colors" />
        </button>
      </div>

      <div className="flex items-center justify-between pt-1">
        <button onClick={onClose} className="text-sm font-semibold text-slate-400 hover:text-slate-700 transition-colors">
          Cancel
        </button>
        <span className="text-[10px] text-slate-400 font-medium">Secured · x402 protocol</span>
      </div>
    </div>
  );
};


const HederaPayView: React.FC<{
  onBack: () => void;
  onSuccess: (encodedReceipt: string) => void;
  onConnectingChange?: (v: boolean) => void;
  planId: string;
}> = ({ onBack, onSuccess, onConnectingChange, planId }) => {
  const [step, setStep] = useState<HederaStep>('loading');
  const [wallet, setWallet] = useState<ConnectedWallet | null>(null);
  const [error, setError] = useState('');
  const [txRef, setTxRef] = useState('');
  const [config, setConfig] = useState<HederaConfig | null>(null);

  useEffect(() => {
    let cancelled = false;
    setStep('loading');
    hederaService.getConfig(planId).then((cfg) => {
      if (!cancelled) { setConfig(cfg); setStep('choose_wallet'); }
    }).catch(() => {
      if (!cancelled) {
        setError('Could not load payment configuration. Please try again.');
        setStep('error');
      }
    });
    return () => { cancelled = true; };
  }, [planId]);

  const reset = () => { setStep('choose_wallet'); setError(''); setWallet(null); setTxRef(''); };

  const connect = useCallback(async (method: 'hashpack' | 'metamask') => {
    setStep('connecting');
    setError('');
    onConnectingChange?.(true);
    try {
      const connected = method === 'hashpack' ? await connectHashPack() : await connectMetaMask();
      setWallet(connected);
      setStep('connected');
    } catch (e: any) {
      setError(e.message ?? 'Connection failed');
      setStep('error');
    } finally {
      onConnectingChange?.(false);
    }
  }, [onConnectingChange]);

  const pay = useCallback(async () => {
    if (!wallet || !config) return;
    setStep('paying');
    setError('');
    try {
      let txResult: string;
      if (wallet.type === 'hashconnect') {
        if (!config.recipientAccountId) throw new Error('Recipient Hedera account ID not configured.');
        txResult = await payWithHashConnect(wallet, config.recipientAccountId, config.amountHbar);
      } else {
        if (!config.recipientEvmAddress) throw new Error('Recipient EVM address not configured.');
        txResult = await payWithMetaMask(wallet, config.recipientEvmAddress, config.amountHbar);
      }
      setTxRef(txResult);
      setStep('verifying');

      const encoded = encodePaymentReceipt(wallet, txResult);
      const result = await hederaService.verifyPayment(encoded, planId);

      if (!result.success) throw new Error(result.error ?? 'Payment could not be verified on Hedera');

      setStep('success');
      toast.success('Payment confirmed on Hedera!');
      setTimeout(() => onSuccess(encoded), 900);
    } catch (e: any) {
      setError(e.message ?? 'Payment failed');
      setStep('error');
    }
  }, [wallet, config, planId, onSuccess]);

  const network = config?.network ?? (import.meta.env.VITE_HEDERA_NETWORK ?? 'mainnet');
  const explorerBase = network === 'mainnet' ? 'https://hashscan.io/mainnet' : 'https://hashscan.io/testnet';

  return (
    <div className="px-4 sm:px-6 pb-6 pt-1 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition-colors shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="min-w-0">
          <HederaLogo className="h-6 sm:h-7" />
          {config ? (
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Pay <span className="font-bold text-teal-700">{config.amountHbar} HBAR</span>
              <span className="text-slate-400"> (≈ ₦{config.amountNgn.toLocaleString()})</span>
              {' '}to deploy
            </p>
          ) : (
            <p className="text-xs text-slate-400 font-medium mt-0.5">Loading price…</p>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">

        {/* Loading config */}
        {step === 'loading' && (
          <MotionDiv key="load" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center py-8 gap-3">
            <div className="w-10 h-10 rounded-full border-4 border-teal-100 border-t-teal-500 animate-spin" />
            <p className="text-xs text-slate-400 font-medium">Fetching live HBAR rate…</p>
          </MotionDiv>
        )}

        {/* Wallet choice */}
        {step === 'choose_wallet' && config && (
          <MotionDiv key="choose" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Select your wallet</p>
              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                <RefreshCw className="w-2.5 h-2.5" />
                {config.liveRate ? `Live · 1 HBAR = ₦${config.hbarNgnRate.toFixed(0)}` : 'Est. rate'}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => connect('hashpack')}
                className="flex flex-col items-center gap-2 p-3 sm:p-4 border-2 border-slate-100 rounded-2xl hover:border-teal-200 hover:bg-teal-50/40 transition-all"
              >
                <HashPackIcon className="w-9 h-9 sm:w-10 sm:h-10" />
                <div className="text-center">
                  <p className="text-xs font-bold text-slate-900">HashPack</p>
                  <p className="text-[10px] text-slate-400 font-medium">Hedera native</p>
                </div>
                <span className="text-[9px] font-bold text-teal-600 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-full">Recommended</span>
              </button>
              <button
                onClick={() => connect('metamask')}
                className="flex flex-col items-center gap-2 p-3 sm:p-4 border-2 border-slate-100 rounded-2xl hover:border-orange-200 hover:bg-orange-50/30 transition-all"
              >
                <MetaMaskIcon className="w-9 h-9 sm:w-10 sm:h-10" />
                <div className="text-center">
                  <p className="text-xs font-bold text-slate-900">MetaMask</p>
                  <p className="text-[10px] text-slate-400 font-medium">Hedera EVM</p>
                </div>
                <span className="text-[9px] font-bold text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">EVM</span>
              </button>
            </div>
          </MotionDiv>
        )}

        {/* Connecting */}
        {step === 'connecting' && (
          <MotionDiv key="conn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center py-8 gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-teal-100 border-t-teal-500 animate-spin" />
            <div className="text-center">
              <p className="text-sm font-bold text-slate-900">Connecting wallet…</p>
              <p className="text-xs text-slate-400 font-medium mt-1">A wallet prompt will appear — approve the connection</p>
              <p className="text-[10px] text-slate-400 font-medium mt-1">On mobile, switch to your wallet app if prompted</p>
            </div>
          </MotionDiv>
        )}

        {/* Connected — payment summary */}
        {(step === 'connected' || step === 'paying' || step === 'verifying') && wallet && config && (
          <MotionDiv key="pay" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="space-y-3">
            {/* Wallet badge */}
            <div className="flex items-center gap-3 px-3 sm:px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-2xl">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">
                  {wallet.type === 'hashconnect' ? 'HashPack' : 'MetaMask'} connected
                </p>
                <p className="text-xs text-slate-600 font-mono truncate">{wallet.displayAddress}</p>
              </div>
              <button onClick={reset} className="text-[10px] text-slate-400 hover:text-slate-600 font-medium underline shrink-0">Change</button>
            </div>

            {/* Payment summary */}
            <div className="p-3 sm:p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-600 font-medium">Portfolio deployment</span>
                <div className="text-right">
                  <p className="text-lg sm:text-xl font-black text-slate-900">{config.amountHbar} HBAR</p>
                  <p className="text-xs text-slate-400 font-medium">≈ ₦{config.amountNgn.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-3 flex-wrap gap-1">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                  <svg viewBox="0 0 12 12" className="w-3 h-3 shrink-0" fill="none">
                    <rect width="12" height="12" rx="2.5" fill="#1D2029" />
                    <text x="1.5" y="9.5" fontFamily="Georgia,serif" fontSize="9" fill="white">ℏ</text>
                  </svg>
                  Hedera {network} · ~3s finality
                </div>
                <span className="text-[10px] text-slate-400 font-medium">
                  1 HBAR = ₦{config.hbarNgnRate.toFixed(0)}{config.liveRate ? ' (live)' : ' (est.)'}
                </span>
              </div>
            </div>

            <button
              onClick={pay}
              disabled={step === 'paying' || step === 'verifying'}
              className="w-full py-3.5 rounded-2xl bg-teal-500 hover:bg-teal-600 text-white text-sm font-bold shadow-lg shadow-teal-500/25 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {step === 'paying' ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Waiting for wallet…</>
              ) : step === 'verifying' ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Verifying on Hedera…</>
              ) : (
                <>Pay {config.amountHbar} HBAR <ArrowRight className="w-4 h-4" /></>
              )}
            </button>

            {step === 'verifying' && txRef && (
              <a
                href={`${explorerBase}/transaction/${encodeURIComponent(txRef)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 text-xs text-teal-500 hover:text-teal-700 font-medium transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                Track on HashScan
              </a>
            )}
          </MotionDiv>
        )}

        {/* Success */}
        {step === 'success' && (
          <MotionDiv key="ok" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center py-8 gap-3">
            <div className="relative">
              <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/30">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <div className="absolute inset-0 rounded-full bg-emerald-400/20 blur-lg animate-pulse" />
            </div>
            <div className="text-center">
              <p className="text-base font-black text-slate-900">Payment verified!</p>
              <p className="text-xs text-slate-400 font-medium mt-1">Setting up your deployment…</p>
            </div>
          </MotionDiv>
        )}

        {/* Error */}
        {step === 'error' && (
          <MotionDiv key="err" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-50 border border-red-100 rounded-2xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-red-700 mb-0.5">Something went wrong</p>
                <p className="text-xs text-red-500 font-medium leading-relaxed">{error}</p>
                <button
                  onClick={!config ? () => { setStep('loading'); hederaService.getConfig(planId).then(cfg => { setConfig(cfg); setStep('choose_wallet'); }).catch(() => setStep('error')); } : reset}
                  className="mt-2 text-xs font-bold text-red-600 hover:text-red-800 underline"
                >
                  Try again
                </button>
              </div>
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>

      
    </div>
  );
};

const DeploymentPaymentModal: React.FC<Props> = ({
  isOpen, onClose, onPaystackProceed, onHederaSuccess, planId = 'pro',
}) => {
  const [step, setStep] = useState<ModalStep>('select');
  const [hbarConfig, setHbarConfig] = useState<HederaConfig | null>(null);
  // When a wallet pairing modal (WalletConnect/HashPack) is open we must lower
  // our backdrop z-index so the injected wallet UI appears above it and can be
  // tapped freely — especially critical on mobile.
  const [walletConnecting, setWalletConnecting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    hederaService.getConfig(planId).then(setHbarConfig).catch(() => {});
  }, [isOpen, planId]);

  const handleClose = () => { setStep('select'); setWalletConnecting(false); onClose(); };

  return (
    <AnimatePresence>
      {isOpen && (
        // On mobile: bottom sheet. On sm+: centered dialog.
        // z-index steps DOWN to z-10 while the wallet pairing modal is open so
        // the injected WalletConnect UI (z-index ~99999) is fully visible.
        <div
          className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4 ${walletConnecting ? 'z-10' : 'z-[9999]'}`}
          onClick={walletConnecting ? undefined : handleClose}
        >
          <MotionDiv
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl shadow-slate-900/20 overflow-hidden max-h-[92vh] overflow-y-auto"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            {/* Drag handle on mobile */}
            <div className="flex sm:hidden justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-slate-200" />
            </div>

            <div className="flex justify-end px-4 sm:px-6 pt-3 sm:pt-5 pb-1">
              <button
                onClick={handleClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <AnimatePresence mode="wait">
              {step === 'select' ? (
                <MotionDiv key="select" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.15 }}>
                  <GatewaySelector
                    onPaystack={onPaystackProceed}
                    onHedera={() => setStep('hedera')}
                    onClose={handleClose}
                    hbarConfig={hbarConfig}
                  />
                </MotionDiv>
              ) : (
                <MotionDiv key="hedera" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} transition={{ duration: 0.15 }}>
                  <HederaPayView
                    onBack={() => setStep('select')}
                    onSuccess={(encoded) => { handleClose(); onHederaSuccess(encoded); }}
                    onConnectingChange={setWalletConnecting}
                    planId={planId}
                  />
                </MotionDiv>
              )}
            </AnimatePresence>
          </MotionDiv>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DeploymentPaymentModal;
