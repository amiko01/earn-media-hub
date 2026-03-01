import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Users, DollarSign, Video, RotateCcw, Plus, Check, X, ArrowLeft,
  Search, RefreshCw, Pencil, Save
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";

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
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editBalance, setEditBalance] = useState("");
  const [editVip, setEditVip] = useState("");

  const fetchData = useCallback(async () => {
    const [usersRes, subsRes, statsRes] = await Promise.all([
      supabase.rpc("admin_get_users"),
      supabase.rpc("admin_get_tiktok_submissions"),
      supabase.rpc("admin_get_stats"),
    ]);
    if (usersRes.error) {
      console.error("admin_get_users error:", usersRes.error);
      toast.error("Failed to load users: " + usersRes.error.message);
    }
    if (usersRes.data) setUsers(usersRes.data as any);
    if (subsRes.data) setSubmissions(subsRes.data as any);
    if (statsRes.data) setStats(statsRes.data as any);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

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

  const handleStartEdit = (u: UserRow) => {
    setEditingUser(u.user_id);
    setEditBalance(String(u.balance));
    setEditVip(String(u.vip_level));
  };

  const handleSaveEdit = async (userId: string) => {
    const bal = parseFloat(editBalance);
    const vip = parseInt(editVip);
    if (isNaN(bal) || isNaN(vip) || vip < 1 || vip > 5) {
      toast.error("Invalid values (VIP must be 1-5)");
      return;
    }
    const { error } = await supabase.rpc("admin_update_user", {
      p_user_id: userId,
      p_balance: bal,
      p_vip_level: vip,
    });
    if (error) { toast.error("Failed to update: " + error.message); return; }
    toast.success("User updated");
    setEditingUser(null);
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

  const filteredUsers = users.filter((u) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (u.username || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      u.user_id.toLowerCase().includes(q) ||
      u.referral_code.toLowerCase().includes(q)
    );
  });

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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/dashboard")} className="p-2 rounded-xl bg-secondary">
              <ArrowLeft size={18} className="text-muted-foreground" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
              <p className="text-xs text-muted-foreground">Manage users, tasks & submissions</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 text-xs font-semibold bg-secondary text-foreground px-3 py-2 rounded-xl"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
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

        {/* Users Section */}
        <div className="bg-secondary rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">All Users ({users.length})</h2>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by email, username, ID, or referral code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs bg-muted border-border rounded-xl"
            />
          </div>

          {filteredUsers.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No users found</p>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map((u) => (
                <div key={u.user_id} className="bg-muted rounded-xl p-3 space-y-2">
                  {editingUser === u.user_id ? (
                    /* Edit Mode */
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-foreground">{u.username || "—"} <span className="text-muted-foreground font-normal">({u.email})</span></p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <label className="text-[10px] text-muted-foreground">Balance ($)</label>
                          <Input
                            type="number"
                            value={editBalance}
                            onChange={(e) => setEditBalance(e.target.value)}
                            className="h-8 text-xs bg-background"
                          />
                        </div>
                        <div className="w-20">
                          <label className="text-[10px] text-muted-foreground">VIP Level</label>
                          <Input
                            type="number"
                            min={1}
                            max={5}
                            value={editVip}
                            onChange={(e) => setEditVip(e.target.value)}
                            className="h-8 text-xs bg-background"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleSaveEdit(u.user_id)} className="flex items-center gap-1 text-[10px] font-semibold bg-primary text-primary-foreground px-3 py-1.5 rounded-lg">
                          <Save size={10} /> Save
                        </button>
                        <button onClick={() => setEditingUser(null)} className="text-[10px] font-semibold text-muted-foreground px-3 py-1.5 rounded-lg bg-secondary">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* View Mode */
                    <>
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
                      <div className="flex items-center gap-2 flex-wrap">
                        <button onClick={() => handleStartEdit(u)} className="flex items-center gap-1 text-[10px] font-semibold bg-primary/20 text-primary px-2.5 py-1 rounded-lg">
                          <Pencil size={10} /> Edit
                        </button>
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
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
