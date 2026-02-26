import { Gift, Wallet, TrendingUp, LogOut } from "lucide-react";
import { motion } from "framer-motion";

const Dashboard = () => {
  return (
    <div className="px-5 pt-4 pb-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-foreground tracking-tight">
          Earn<span className="text-primary">Media</span>
        </h1>
        <button className="p-2 rounded-full bg-secondary">
          <LogOut size={18} className="text-muted-foreground" />
        </button>
      </div>

      {/* Greeting */}
      <div>
        <h2 className="text-lg font-semibold text-foreground">Welcome, User! 👋</h2>
        <p className="text-sm text-muted-foreground">Your dashboard at a glance</p>
      </div>

      {/* Registration Bonus */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="gold-card rounded-3xl p-6 space-y-2"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary-foreground/20 flex items-center justify-center">
            <Gift size={22} className="text-primary-foreground" />
          </div>
          <span className="text-sm font-medium text-primary-foreground/80">Registration Bonus</span>
        </div>
        <p className="text-3xl font-bold text-primary-foreground">$5.00</p>
        <p className="text-xs text-primary-foreground/70">Credited instantly on sign-up</p>
      </motion.div>

      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="gold-card rounded-3xl p-6 space-y-2"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary-foreground/20 flex items-center justify-center">
            <Wallet size={22} className="text-primary-foreground" />
          </div>
          <span className="text-sm font-medium text-primary-foreground/80">Current Balance</span>
        </div>
        <p className="text-3xl font-bold text-primary-foreground">$5.00</p>
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-primary-foreground/70" />
          <p className="text-xs text-primary-foreground/70">Total earned: $5.00</p>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Tasks Done", value: "0" },
          { label: "Referrals", value: "0" },
        ].map((stat) => (
          <div key={stat.label} className="bg-secondary rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
