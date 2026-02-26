import { Crown, Check, Lock } from "lucide-react";
import { motion } from "framer-motion";

const tiers = [
  { level: 1, price: 50, commission: 8, benefits: ["Basic tasks", "Standard support", "8% referral commission"] },
  { level: 2, price: 99, commission: 15, benefits: ["Premium tasks", "Priority support", "15% referral commission"] },
  { level: 3, price: 155, commission: 20, benefits: ["Exclusive tasks", "VIP support", "20% referral commission"] },
  { level: 4, price: 230, commission: 25, benefits: ["All tasks unlocked", "Dedicated support", "25% referral commission"] },
  { level: 5, price: 320, commission: 35, benefits: ["Max earnings", "1-on-1 support", "35% referral commission"] },
];

const VIP = () => {
  const currentVip = 0;

  return (
    <div className="px-5 pt-4 pb-6 space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-foreground">VIP Membership</h2>
        <p className="text-sm text-muted-foreground">Upgrade to unlock higher earnings</p>
      </div>

      <div className="bg-secondary rounded-2xl p-4 text-center">
        <p className="text-xs text-muted-foreground">Your referral commission is tied to your VIP level.</p>
        <p className="text-xs text-primary font-semibold mt-1">Upgrade to earn more from your team!</p>
      </div>

      <div className="space-y-4">
        {tiers.map((tier, i) => {
          const isActive = currentVip === tier.level;
          const isLocked = currentVip < tier.level;
          return (
            <motion.div
              key={tier.level}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              className={`rounded-3xl p-5 space-y-3 ${
                isActive ? "gold-card" : "bg-secondary"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crown
                    size={20}
                    className={isActive ? "text-primary-foreground" : "text-primary"}
                  />
                  <span
                    className={`font-bold text-base ${
                      isActive ? "text-primary-foreground" : "text-foreground"
                    }`}
                  >
                    VIP {tier.level}
                  </span>
                </div>
                <span
                  className={`text-lg font-bold ${
                    isActive ? "text-primary-foreground" : "text-primary"
                  }`}
                >
                  ${tier.price}
                </span>
              </div>

              {/* Commission Badge */}
              <div
                className={`inline-block px-3 py-1 rounded-xl text-xs font-semibold ${
                  isActive
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-primary/15 text-primary"
                }`}
              >
                Referral Bonus: {tier.commission}% earnings
              </div>

              <ul className="space-y-1.5">
                {tier.benefits.map((b) => (
                  <li key={b} className="flex items-center gap-2">
                    <Check
                      size={14}
                      className={isActive ? "text-primary-foreground/70" : "text-primary"}
                    />
                    <span
                      className={`text-xs ${
                        isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                      }`}
                    >
                      {b}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-2.5 rounded-xl text-sm font-semibold ${
                  isActive
                    ? "bg-primary-foreground text-primary"
                    : "gold-gradient text-primary-foreground"
                }`}
              >
                {isActive ? "Current Plan" : isLocked ? "Upgrade" : "Select"}
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default VIP;
