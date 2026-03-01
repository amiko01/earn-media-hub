import { Gift, Wallet, TrendingUp, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [username, setUsername] = useState("User");
  const [tasksDone, setTasksDone] = useState(0);
  const [referrals, setReferrals] = useState(0);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("balance, username, referral_code")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profile) {
        setBalance(Number(profile.balance));
        setUsername(profile.username || "User");

        const { count } = await supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("referred_by", profile.referral_code);
        setReferrals(count ?? 0);
      }

      const { count: tasksCount } = await supabase
        .from("task_completions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);
      setTasksDone(tasksCount ?? 0);
    };
    load();
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="px-5 pt-4 pb-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-foreground tracking-tight">
          Earn<span className="text-primary">Media</span>
        </h1>
        <button onClick={handleLogout} className="p-2 rounded-full bg-secondary">
          <LogOut size={18} className="text-muted-foreground" />
        </button>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-foreground">Welcome, {username}! 👋</h2>
        <p className="text-sm text-muted-foreground">Your dashboard at a glance</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="gold-card rounded-3xl p-6 space-y-2"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary-foreground/20 flex items-center justify-center">
            <Wallet size={22} className="text-primary-foreground" />
          </div>
          <span className="text-sm font-medium text-primary-foreground/80">Current Balance</span>
        </div>
        <p className="text-3xl font-bold text-primary-foreground">${balance.toFixed(2)}</p>
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-primary-foreground/70" />
          <p className="text-xs text-primary-foreground/70">Total earned: ${balance.toFixed(2)}</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Tasks Done", value: String(tasksDone) },
          { label: "Referrals", value: String(referrals) },
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
