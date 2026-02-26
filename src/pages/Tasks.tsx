import { Play, Share2, Star, MessageSquare, ThumbsUp, Send, Heart, Video, ExternalLink, Flame } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const tasks = [
  { id: 1, title: "Watch video ad", reward: "$0.10", icon: Play, done: false },
  { id: 2, title: "Share referral link", reward: "$0.15", icon: Share2, done: false },
  { id: 3, title: "Rate the app", reward: "$0.05", icon: Star, done: false },
  { id: 4, title: "Comment on post", reward: "$0.08", icon: MessageSquare, done: false },
  { id: 5, title: "Like social media page", reward: "$0.05", icon: ThumbsUp, done: false },
  { id: 6, title: "Join our Telegram Channel", reward: "$0.10", icon: Send, done: false, link: "https://t.me/EarnMedia0" },
  { id: 7, title: "React to Telegram Post", reward: "$0.05", icon: Heart, done: false, link: "https://t.me/EarnMedia0/3" },
  { id: 8, title: "React to Recent Update", reward: "$0.05", icon: ThumbsUp, done: false, link: "https://t.me/EarnMedia0/5" },
];

const Tasks = () => {
  const [tiktokUrl, setTiktokUrl] = useState("");

  const handleEarn = (task: typeof tasks[0]) => {
    if (task.link) {
      window.open(task.link, "_blank");
    }
  };

  const handleTiktokSubmit = () => {
    if (!tiktokUrl.trim()) {
      toast.error("Please enter your TikTok video URL");
      return;
    }
    toast.success("Video link submitted for verification!");
    setTiktokUrl("");
  };

  return (
    <div className="px-5 pt-4 pb-6 space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Daily Tasks</h2>
        <p className="text-sm text-muted-foreground">Complete tasks to earn rewards</p>
      </div>

      {/* TikTok Special Card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="gold-card rounded-3xl p-5 relative overflow-hidden border border-primary/30"
      >
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-background/80 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
          <Flame size={12} /> HOT
        </div>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl bg-background/20 flex items-center justify-center">
            <Video size={20} className="text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-bold text-primary-foreground">TikTok Video Creator</p>
            <p className="text-xs text-primary-foreground/70">
              Post a video about us using <span className="font-semibold">#earnmedia</span>. Reach 10,000 views to earn <span className="font-bold">$100</span>.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Paste your TikTok video URL"
            value={tiktokUrl}
            onChange={(e) => setTiktokUrl(e.target.value)}
            className="bg-background/20 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40 rounded-xl text-xs h-9"
          />
          <button
            onClick={handleTiktokSubmit}
            className="bg-background text-primary text-xs font-semibold px-4 rounded-xl whitespace-nowrap shrink-0"
          >
            Submit Link
          </button>
        </div>
      </motion.div>

      <div className="space-y-3">
        {tasks.map((task, i) => (
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
                <p className="text-xs text-muted-foreground">Earn {task.reward}</p>
              </div>
            </div>
            <button
              onClick={() => handleEarn(task)}
              className="gold-gradient text-primary-foreground text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1"
            >
              Earn
              {task.link && <ExternalLink size={12} />}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Tasks;
