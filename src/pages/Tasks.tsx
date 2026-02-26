import { Play, Share2, Star, MessageSquare, ThumbsUp } from "lucide-react";
import { motion } from "framer-motion";

const tasks = [
  { id: 1, title: "Watch video ad", reward: "$0.10", icon: Play, done: false },
  { id: 2, title: "Share referral link", reward: "$0.15", icon: Share2, done: false },
  { id: 3, title: "Rate the app", reward: "$0.05", icon: Star, done: false },
  { id: 4, title: "Comment on post", reward: "$0.08", icon: MessageSquare, done: false },
  { id: 5, title: "Like social media page", reward: "$0.05", icon: ThumbsUp, done: false },
];

const Tasks = () => {
  return (
    <div className="px-5 pt-4 pb-6 space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Daily Tasks</h2>
        <p className="text-sm text-muted-foreground">Complete tasks to earn rewards</p>
      </div>

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
            <button className="gold-gradient text-primary-foreground text-xs font-semibold px-4 py-2 rounded-xl">
              Earn
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Tasks;
