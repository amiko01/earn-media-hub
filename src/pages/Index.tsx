import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import BottomNav, { type TabId } from "@/components/BottomNav";
import Dashboard from "./Dashboard";
import Tasks from "./Tasks";
import VIP from "./VIP";
import Invite from "./Invite";
import WalletPage from "./WalletPage";

const pages: Record<TabId, React.FC> = {
  home: Dashboard,
  tasks: Tasks,
  vip: VIP,
  invite: Invite,
  wallet: WalletPage,
};

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const Page = pages[activeTab];

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="pb-20"
        >
          <Page />
        </motion.div>
      </AnimatePresence>
      <BottomNav active={activeTab} onChange={setActiveTab} />
    </div>
  );
};

export default Index;
