import { Copy, Users, Gift, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const milestones = [
  { count: 50, reward: 20 },
  { count: 100, reward: 35 },
  { count: 300, reward: 50 },
];

const commissionTable = [
  { vip: 1, pct: 8 },
  { vip: 2, pct: 15 },
  { vip: 3, pct: 20 },
  { vip: 4, pct: 25 },
  { vip: 5, pct: 35 },
];

const Invite = () => {
  const { toast } = useToast();
  const referralLink = "https://earnmedia.app/ref/USER123";
  const totalReferrals = 3;
  const currentVip = 0;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    toast({ title: "Link copied!", description: "Share it with your friends." });
  };

  return (
    <div className="px-5 pt-4 pb-6 space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Invite Friends</h2>
        <p className="text-sm text-muted-foreground">Earn from every referral</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-secondary rounded-2xl p-4 text-center">
          <Users size={20} className="text-primary mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">{totalReferrals}</p>
          <p className="text-xs text-muted-foreground">Total Referrals</p>
        </div>
        <div className="bg-secondary rounded-2xl p-4 text-center">
          <TrendingUp size={20} className="text-primary mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">$0.00</p>
          <p className="text-xs text-muted-foreground">Commission Earned</p>
        </div>
      </div>

      {/* Referral Link */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="gold-card rounded-3xl p-5 space-y-3"
      >
        <p className="text-sm font-semibold text-primary-foreground">Your Referral Link</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-primary-foreground/20 rounded-xl px-3 py-2 text-xs text-primary-foreground/80 truncate">
            {referralLink}
          </div>
          <button
            onClick={handleCopy}
            className="bg-primary-foreground text-primary p-2.5 rounded-xl"
          >
            <Copy size={16} />
          </button>
        </div>
      </motion.div>

      {/* Commission Table */}
      <div className="bg-secondary rounded-2xl p-4 space-y-3">
        <p className="text-sm font-semibold text-foreground">Commission by VIP Level</p>
        <p className="text-xs text-muted-foreground">
          Your referral commission percentage is tied to your current VIP level. Upgrade to a higher VIP to unlock higher percentage earnings from your team!
        </p>
        <div className="space-y-2">
          {commissionTable.map((row) => (
            <div
              key={row.vip}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs ${
                currentVip === row.vip ? "gold-gradient text-primary-foreground font-bold" : "bg-muted text-foreground"
              }`}
            >
              <span>VIP {row.vip}</span>
              <span>{row.pct}% earnings</span>
            </div>
          ))}
        </div>
      </div>

      {/* Milestones */}
      <div className="bg-secondary rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Gift size={18} className="text-primary" />
          <p className="text-sm font-semibold text-foreground">Referral Milestones</p>
        </div>
        {milestones.map((m) => {
          const reached = totalReferrals >= m.count;
          return (
            <div
              key={m.count}
              className="flex items-center justify-between bg-muted rounded-xl px-3 py-2.5"
            >
              <span className="text-xs text-foreground">
                {m.count} Referrals
              </span>
              <span
                className={`text-xs font-semibold ${
                  reached ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {reached ? "✓ Claimed" : `$${m.reward} Reward`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Invite;
