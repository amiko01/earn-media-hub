import { useState } from "react";
import { User, Mail, Phone, Lock, Eye, EyeOff, Gift } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    referral: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Full name is required";
    else if (form.name.trim().length > 100) e.name = "Name must be under 100 characters";

    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = "Invalid email address";

    if (form.phone && !/^\+?[\d\s\-()]{7,20}$/.test(form.phone.trim())) e.phone = "Invalid phone number";

    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "Minimum 6 characters";

    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    toast.success("Account created! Welcome to EarnMedia 🎉");
    navigate("/dashboard");
  };

  const inputClass =
    "w-full bg-secondary border border-border rounded-2xl py-3 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-5 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary font-serif">EarnMedia</h1>
          <p className="text-muted-foreground text-sm mt-1">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <div className="relative">
              <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                className={inputClass}
                placeholder="Full Name"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                maxLength={100}
              />
            </div>
            {errors.name && <p className="text-xs text-destructive mt-1 ml-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                className={inputClass}
                placeholder="Email Address"
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                maxLength={255}
              />
            </div>
            {errors.email && <p className="text-xs text-destructive mt-1 ml-1">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div>
            <div className="relative">
              <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                className={inputClass}
                placeholder="Phone Number"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                maxLength={20}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground italic">Optional</span>
            </div>
            {errors.phone && <p className="text-xs text-destructive mt-1 ml-1">{errors.phone}</p>}
          </div>

          {/* Referral Code */}
          <div className="relative">
            <Gift size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              className={inputClass}
              placeholder="Referral Code"
              value={form.referral}
              onChange={(e) => update("referral", e.target.value)}
              maxLength={30}
            />
          </div>

          {/* Password */}
          <div>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                className={inputClass}
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                maxLength={128}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-destructive mt-1 ml-1">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                className={inputClass}
                placeholder="Confirm Password"
                type={showConfirm ? "text" : "password"}
                value={form.confirmPassword}
                onChange={(e) => update("confirmPassword", e.target.value)}
                maxLength={128}
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-xs text-destructive mt-1 ml-1">{errors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            className="w-full gold-gradient text-primary-foreground font-bold text-base py-3.5 rounded-2xl mt-2 transition-transform active:scale-[0.98]"
          >
            Sign Up
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <button onClick={() => navigate("/login")} className="text-primary font-semibold hover:underline">
            Log In
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
