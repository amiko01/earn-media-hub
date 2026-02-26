import { Send, Heart, ThumbsUp, Video, ExternalLink, Flame } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";

const tasks = [
  { id: 1, title: "Join Telegram Channel", reward: "$0.10", icon: Send, link: "https://t.me/EarnMedia0" },
  { id: 2, title: "React to Post #1", reward: "$0.05", icon: Heart, link: "https://t.me/EarnMedia0/3" },
  { id: 3, title: "React to Post #2", reward: "$0.05", icon: ThumbsUp, link: "https://t.me/EarnMedia0/5" },
];

const Tasks = () => {
  const [tiktokUrl, setTiktokUrl] = useState("");

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
        <div className="flex gap-2">
          <input
            placeholder="Paste your TikTok video URL"
            value={tiktokUrl}
            onChange={(e) => setTiktokUrl(e.target.value)}
            maxLength={500}
            className="flex-1 bg-muted border border-border rounded-xl py-2 px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button onClick={handleTiktokSubmit} className="gold-gradient text-primary-foreground text-xs font-semibold px-4 rounded-xl whitespace-nowrap">
            Submit Link
          </button>
        </div>
      </motion.div>

      {/* Regular Tasks */}
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
            <a
              href={task.link}
              target="_blank"
              rel="noopener noreferrer"
              className="gold-gradient text-primary-foreground text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1"
            >
              Earn <ExternalLink size={12} />
            </a>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Tasks;
