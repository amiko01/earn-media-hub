import { useState } from "react";
import { Wallet, ArrowDownToLine, ArrowUpFromLine, Copy, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const DEPOSIT_ADDRESS = "TJ7Hhzgz7y6N3pYUCqPuMBDeAAYaT2PYNE";
const NETWORK_FEE = 1;

type TxType = "deposit" | "withdrawal" | "bonus";
interface Transaction {
  id: number;
  type: TxType;
  amount: number;
  date: string;
  status: "completed" | "pending";
}

const initialTxs: Transaction[] = [
  { id: 1, type: "bonus", amount: 5, date: "2025-06-01", status: "completed" },
];

const WalletPage = () => {
  const { toast } = useToast();
  const [balance, setBalance] = useState(5);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTxs);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAddr, setWithdrawAddr] = useState("");
  const [withdrawAmt, setWithdrawAmt] = useState("");
  const [error, setError] = useState("");

  const copyAddress = () => {
    navigator.clipboard.writeText(DEPOSIT_ADDRESS);
    toast({ title: "Address copied!" });
  };

  const handleWithdraw = () => {
    setError("");
    const trc20Regex = /^T[1-9A-HJ-NP-Za-km-z]{33}$/;
    if (!trc20Regex.test(withdrawAddr)) {
      setError("Invalid TRC-20 wallet address");
      return;
    }
    const amt = parseFloat(withdrawAmt);
    if (isNaN(amt) || amt <= 0) {
      setError("Enter a valid amount");
      return;
    }
    if (amt + NETWORK_FEE > balance) {
      setError("Insufficient balance");
      return;
    }
    const newTx: Transaction = {
      id: Date.now(),
      type: "withdrawal",
      amount: amt,
      date: new Date().toISOString().split("T")[0],
      status: "pending",
    };
    setBalance((b) => b - amt - NETWORK_FEE);
    setTransactions((t) => [newTx, ...t]);
    setShowWithdraw(false);
    setWithdrawAddr("");
    setWithdrawAmt("");
    toast({ title: "Withdrawal submitted", description: "Status: Pending" });
  };

  return (
    <div className="px-5 pt-4 pb-6 space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Wallet</h2>
        <p className="text-sm text-muted-foreground">Manage your funds</p>
      </div>

      {/* Balance */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="gold-card rounded-3xl p-6 space-y-3"
      >
        <div className="flex items-center gap-2">
          <Wallet size={20} className="text-primary-foreground" />
          <span className="text-sm text-primary-foreground/80">Available Balance</span>
        </div>
        <p className="text-3xl font-bold text-primary-foreground">${balance.toFixed(2)}</p>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowDeposit(true); setShowWithdraw(false); }}
            className="flex-1 flex items-center justify-center gap-2 bg-primary-foreground text-primary py-2.5 rounded-xl text-sm font-semibold"
          >
            <ArrowDownToLine size={16} /> Deposit
          </button>
          <button
            onClick={() => { setShowWithdraw(true); setShowDeposit(false); }}
            className="flex-1 flex items-center justify-center gap-2 bg-primary-foreground/20 text-primary-foreground py-2.5 rounded-xl text-sm font-semibold"
          >
            <ArrowUpFromLine size={16} /> Withdraw
          </button>
        </div>
      </motion.div>

      {/* Deposit Modal */}
      <AnimatePresence>
        {showDeposit && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-secondary rounded-3xl p-5 space-y-3 overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Deposit (TRON TRC-20)</p>
              <button onClick={() => setShowDeposit(false)}>
                <X size={18} className="text-muted-foreground" />
              </button>
            </div>
            <div className="bg-muted rounded-2xl p-4 flex flex-col items-center gap-3">
              {/* QR placeholder */}
              <div className="w-36 h-36 bg-foreground/10 rounded-2xl flex items-center justify-center border-2 border-dashed border-muted-foreground/30">
                <span className="text-xs text-muted-foreground text-center px-2">QR Code<br/>Placeholder</span>
              </div>
              <div className="w-full flex items-center gap-2">
                <div className="flex-1 bg-background rounded-xl px-3 py-2 text-xs text-foreground truncate font-mono">
                  {DEPOSIT_ADDRESS}
                </div>
                <button onClick={copyAddress} className="bg-primary text-primary-foreground p-2 rounded-xl">
                  <Copy size={14} />
                </button>
              </div>
              <p className="text-xs text-primary font-medium">Network: TRON (TRC-20)</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Withdraw Form */}
      <AnimatePresence>
        {showWithdraw && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-secondary rounded-3xl p-5 space-y-3 overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Withdraw (TRON TRC-20)</p>
              <button onClick={() => { setShowWithdraw(false); setError(""); }}>
                <X size={18} className="text-muted-foreground" />
              </button>
            </div>
            <input
              value={withdrawAddr}
              onChange={(e) => setWithdrawAddr(e.target.value)}
              placeholder="Recipient TRC-20 address"
              className="w-full bg-muted rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary font-mono"
            />
            <input
              value={withdrawAmt}
              onChange={(e) => setWithdrawAmt(e.target.value)}
              placeholder="Amount (USDT)"
              type="number"
              className="w-full bg-muted rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Network fee</span>
              <span>1 USDT</span>
            </div>
            {error && <p className="text-xs text-destructive font-medium">{error}</p>}
            <button
              onClick={handleWithdraw}
              className="w-full gold-gradient text-primary-foreground py-3 rounded-xl text-sm font-semibold"
            >
              Confirm Withdrawal
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transaction History */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground">Transaction History</p>
        {transactions.map((tx) => (
          <div key={tx.id} className="bg-secondary rounded-2xl px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  tx.type === "withdrawal" ? "bg-destructive/20" : "bg-success/20"
                }`}
              >
                {tx.type === "withdrawal" ? (
                  <ArrowUpFromLine size={14} className="text-destructive" />
                ) : (
                  <ArrowDownToLine size={14} className="text-success" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground capitalize">{tx.type}</p>
                <p className="text-xs text-muted-foreground">{tx.date}</p>
              </div>
            </div>
            <div className="text-right">
              <p
                className={`text-sm font-semibold ${
                  tx.type === "withdrawal" ? "text-destructive" : "text-success"
                }`}
              >
                {tx.type === "withdrawal" ? "-" : "+"}${tx.amount.toFixed(2)}
              </p>
              {tx.status === "pending" && (
                <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-lg font-medium">
                  Pending
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WalletPage;
