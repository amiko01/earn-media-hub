import { Send, Heart, ThumbsUp, Video, ExternalLink, Flame, CheckCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const tasks = [
  { id: "telegram_join", title: "Join Telegram Channel", reward: 0.10, icon: Send, link: "https://t.me/EarnMedia0" },
  { id: "react_post_1", title: "React to Post #1", reward: 0.05, icon: Heart, link: "https://t.me/EarnMedia0/3" },
  { id: "react_post_2", title: "React to Post #2", reward: 0.05, icon: ThumbsUp, link: "https://t.me/EarnMedia0/5" },
];

const Tasks = () => {
  const { user } = useAuth();
  const [tiktokUrl, setTiktokUrl] = useState("");
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [loadingTask, setLoadingTask] = useState<string | null>(null);
  const [tiktokPending, setTiktokPending] = useState(false);
  const [tiktokSubmitting, setTiktokSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    // Load completed tasks and tiktok status
    const load = async () => {
      const [{ data: completions }, { data: submissions }] = await Promise.all([
        supabase.from("task_completions").select("task_id").eq("user_id", user.id),
        supabase.from("tiktok_submissions").select("status").eq("user_id", user.id).eq("status", "pending").limit(1),
      ]);
      if (completions) setCompletedTasks(new Set(completions.map((c: any) => c.task_id)));
      if (submissions && submissions.length > 0) setTiktokPending(true);
    };
    load();
  }, [user]);

  const handleTaskClick = async (taskId: string, reward: number, link: string) => {
    if (!user) { toast.error("Please log in first"); return; }
    if (completedTasks.has(taskId)) { toast.info("Already completed!"); return; }

    // Open link
    window.open(link, "_blank", "noopener,noreferrer");

    setLoadingTask(taskId);
    const { data, error } = await supabase.rpc("complete_task", { p_task_id: taskId, p_reward: reward });
    setLoadingTask(null);

    if (error) { toast.error("Failed to complete task"); console.error(error); return; }

    const result = data as any;
    if (result?.success === false) {
      toast.info("Task already completed");
      setCompletedTasks((prev) => new Set(prev).add(taskId));
      return;
    }

    setCompletedTasks((prev) => new Set(prev).add(taskId));
    toast.success(`+$${reward.toFixed(2)} added to your balance!`);
  };

  const handleTiktokSubmit = async () => {
    if (!user) { toast.error("Please log in first"); return; }
    if (!tiktokUrl.trim()) { toast.error("Please enter your TikTok video URL"); return; }

    setTiktokSubmitting(true);
    const { data, error } = await supabase.rpc("submit_tiktok", { p_url: tiktokUrl.trim() });
    setTiktokSubmitting(false);

    if (error) { toast.error("Failed to submit"); console.error(error); return; }

    const result = data as any;
    if (result?.success === false && result?.reason === "already_pending") {
      toast.info("You already have a pending submission");
      setTiktokPending(true);
      return;
    }

    setTiktokPending(true);
    setTiktokUrl("");
    toast.success("Video link submitted for verification!");
  };

  return (
    <div className="px-5 pt-4 pb-6 space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Daily Tasks</h2>
        <p className="text-sm text-muted-foreground">Complete tasks to earn rewards</p>
      </div>

      {/* TikTok Challenge Card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-3xl p-5 bg-secondary border border-primary/40 relative overflow-hidden"
      >
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-primary/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
          <Flame size={12} /> $100
        </div>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center">
            <Video size={20} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">TikTok Challenge: #earnmedia</p>
            <p className="text-xs text-muted-foreground">Upload a video about us. Reach 10,000 views to earn <span className="font-bold text-primary">$100</span>.</p>
          </div>
        </div>
        {tiktokPending ? (
          <div className="flex items-center gap-2 bg-muted rounded-xl py-2.5 px-4">
            <CheckCircle size={16} className="text-primary" />
            <span className="text-xs font-semibold text-primary">Pending Review</span>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              placeholder="Paste your TikTok video URL"
              value={tiktokUrl}
              onChange={(e) => setTiktokUrl(e.target.value)}
              maxLength={500}
              className="flex-1 bg-muted border border-border rounded-xl py-2 px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button
              onClick={handleTiktokSubmit}
              disabled={tiktokSubmitting}
              className="gold-gradient text-primary-foreground text-xs font-semibold px-4 rounded-xl whitespace-nowrap disabled:opacity-60"
            >
              {tiktokSubmitting ? "..." : "Submit Link"}
            </button>
          </div>
        )}
      </motion.div>

      {/* Regular Tasks */}
      <div className="space-y-3">
        {tasks.map((task, i) => {
          const done = completedTasks.has(task.id);
          const isLoading = loadingTask === task.id;
          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="bg-secondary rounded-2xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                  <task.icon size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{task.title}</p>
                  <p className="text-xs text-muted-foreground">Earn ${task.reward.toFixed(2)}</p>
                </div>
              </div>
              {done ? (
                <div className="flex items-center gap-1 text-primary text-xs font-semibold px-4 py-2">
                  <CheckCircle size={14} /> Done
                </div>
              ) : (
                <button
                  onClick={() => handleTaskClick(task.id, task.reward, task.link)}
                  disabled={isLoading}
                  className="gold-gradient text-primary-foreground text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1 disabled:opacity-60"
                >
                  {isLoading ? <Loader2 size={12} className="animate-spin" /> : <>Earn <ExternalLink size={12} /></>}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Tasks;
