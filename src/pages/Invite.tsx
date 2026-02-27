import { Copy, Users, Gift, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

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
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState("");
  const [balance, setBalance] = useState(0);
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [currentVip, setCurrentVip] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch own profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("referral_code, balance, vip_level")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profile) {
          setReferralCode(profile.referral_code);
          setBalance(Number(profile.balance));
          setCurrentVip(profile.vip_level);

          // Count referrals
          const { count } = await supabase
            .from("profiles")
            .select("id", { count: "exact", head: true })
            .eq("referred_by", profile.referral_code);

          setTotalReferrals(count ?? 0);
        }
        // If no profile found, defaults (0 values) remain — UI still renders
      } catch (err) {
        console.error("Error fetching invite data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const referralLink = `https://earnmedia.app/ref/${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    toast({ title: "Code copied!", description: "Share your referral code with friends." });
  };

  if (loading) {
    return (
      <div className="px-5 pt-4 pb-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-muted-foreground text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="px-5 pt-4 pb-6 space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Invite Friends</h2>
        <p className="text-sm text-muted-foreground">Earn from every referral</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#151515] rounded-2xl p-4 text-center">
          <Users size={20} className="text-primary mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">{totalReferrals}</p>
          <p className="text-xs text-muted-foreground">Total Referrals</p>
        </div>
        <div className="bg-[#151515] rounded-2xl p-4 text-center">
          <TrendingUp size={20} className="text-primary mx-auto mb-1" />
          <p className="text-xl font-bold text-foreground">${balance.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">Commission Earned</p>
        </div>
      </div>

      {/* Referral Code Box */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-primary rounded-3xl p-5 space-y-3"
      >
        <p className="text-sm font-semibold text-primary-foreground">Your Referral Code</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-primary-foreground/20 rounded-xl px-4 py-3 text-center">
            <span className="text-xl font-bold tracking-[0.2em] text-primary-foreground">{referralCode}</span>
          </div>
          <button
            onClick={handleCopy}
            className="bg-primary-foreground text-primary p-3 rounded-xl active:scale-95 transition-transform"
          >
            <Copy size={18} />
          </button>
        </div>
      </motion.div>

      {/* Commission Table */}
      <div className="bg-[#151515] rounded-2xl p-4 space-y-3">
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
      <div className="bg-[#151515] rounded-2xl p-4 space-y-3">
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
              <span className="text-xs text-foreground">{m.count} Referrals</span>
              <span className={`text-xs font-semibold ${reached ? "text-primary" : "text-muted-foreground"}`}>
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
