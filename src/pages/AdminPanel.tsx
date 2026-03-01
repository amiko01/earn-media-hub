import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Users, DollarSign, Video, RotateCcw, Plus, Check, X, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UserRow {
  user_id: string;
  username: string;
  email: string;
  balance: number;
  vip_level: number;
  commission_earned: number;
  referral_code: string;
  created_at: string;
}

interface TiktokRow {
  id: string;
  user_id: string;
  username: string;
  video_url: string;
  status: string;
  created_at: string;
}

const AdminPanel = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [submissions, setSubmissions] = useState<TiktokRow[]>([]);
  const [stats, setStats] = useState({ total_users: 0, total_earned: 0 });
  const [bonusAmounts, setBonusAmounts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const [usersRes, subsRes, statsRes] = await Promise.all([
      supabase.rpc("admin_get_users"),
      supabase.rpc("admin_get_tiktok_submissions"),
      supabase.rpc("admin_get_stats"),
    ]);
    if (usersRes.data) setUsers(usersRes.data as any);
    if (subsRes.data) setSubmissions(subsRes.data as any);
    if (statsRes.data) setStats(statsRes.data as any);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleResetBalance = async (userId: string) => {
    const { error } = await supabase.rpc("admin_reset_balance", { p_user_id: userId });
    if (error) { toast.error("Failed to reset"); return; }
    toast.success("Balance reset");
    fetchData();
  };

  const handleAddBonus = async (userId: string) => {
    const amt = parseFloat(bonusAmounts[userId] || "0");
    if (!amt || amt <= 0) { toast.error("Enter a valid amount"); return; }
    const { error } = await supabase.rpc("admin_add_bonus", { p_user_id: userId, p_amount: amt });
    if (error) { toast.error("Failed to add bonus"); return; }
    toast.success(`$${amt.toFixed(2)} bonus added`);
    setBonusAmounts((p) => ({ ...p, [userId]: "" }));
    fetchData();
  };

  const handleApprove = async (id: string) => {
    const { error } = await supabase.rpc("admin_approve_tiktok", { p_submission_id: id });
    if (error) { toast.error("Failed to approve"); return; }
    toast.success("Approved! $100 added.");
    fetchData();
  };

  const handleReject = async (id: string) => {
    const { error } = await supabase.rpc("admin_reject_tiktok", { p_submission_id: id });
    if (error) { toast.error("Failed to reject"); return; }
    toast.success("Submission rejected");
    fetchData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading admin panel...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/dashboard")} className="p-2 rounded-xl bg-secondary">
            <ArrowLeft size={18} className="text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
            <p className="text-xs text-muted-foreground">Manage users, tasks & submissions</p>
          </div>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-secondary rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Users size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{stats.total_users}</p>
              <p className="text-xs text-muted-foreground">Total Users</p>
            </div>
          </div>
          <div className="bg-secondary rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <DollarSign size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">${Number(stats.total_earned).toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Total Balances</p>
            </div>
          </div>
        </div>

        {/* Pending TikTok Submissions */}
        <div className="bg-secondary rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Video size={16} className="text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Pending TikTok Submissions</h2>
            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">{submissions.length}</span>
          </div>
          {submissions.length === 0 ? (
            <p className="text-xs text-muted-foreground">No pending submissions</p>
          ) : (
            <div className="space-y-2">
              {submissions.map((s) => (
                <div key={s.id} className="bg-muted rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground">{s.username}</span>
                    <span className="text-[10px] text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</span>
                  </div>
                  <a href={s.video_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline break-all">
                    {s.video_url}
                  </a>
                  <div className="flex gap-2">
                    <button onClick={() => handleApprove(s.id)} className="flex items-center gap-1 bg-green-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg">
                      <Check size={12} /> Approve (+$100)
                    </button>
                    <button onClick={() => handleReject(s.id)} className="flex items-center gap-1 bg-destructive text-destructive-foreground text-xs font-semibold px-3 py-1.5 rounded-lg">
                      <X size={12} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Users Table */}
        <div className="bg-secondary rounded-2xl p-4 space-y-3">
          <h2 className="text-sm font-semibold text-foreground">All Users ({users.length})</h2>
          <div className="space-y-2">
            {users.map((u) => (
              <div key={u.user_id} className="bg-muted rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-foreground">{u.username || "—"}</p>
                    <p className="text-[10px] text-muted-foreground">{u.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-primary">${Number(u.balance).toFixed(2)}</p>
                    <p className="text-[10px] text-muted-foreground">VIP {u.vip_level}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] text-muted-foreground">Code: {u.referral_code}</span>
                  <span className="text-[10px] text-muted-foreground">Commission: ${Number(u.commission_earned).toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleResetBalance(u.user_id)} className="flex items-center gap-1 text-[10px] font-semibold bg-destructive/20 text-destructive px-2.5 py-1 rounded-lg">
                    <RotateCcw size={10} /> Reset
                  </button>
                  <input
                    type="number"
                    placeholder="$"
                    value={bonusAmounts[u.user_id] || ""}
                    onChange={(e) => setBonusAmounts((p) => ({ ...p, [u.user_id]: e.target.value }))}
                    className="w-16 bg-background border border-border rounded-lg px-2 py-1 text-[10px] text-foreground"
                  />
                  <button onClick={() => handleAddBonus(u.user_id)} className="flex items-center gap-1 text-[10px] font-semibold bg-primary/20 text-primary px-2.5 py-1 rounded-lg">
                    <Plus size={10} /> Bonus
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
