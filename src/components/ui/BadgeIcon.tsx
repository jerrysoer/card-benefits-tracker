import {
  Target,
  Scale,
  Banknote,
  Layers,
  Gem,
  Flame,
  Crown,
  Rocket,
  Wallet,
  Recycle,
  Skull,
  Shield,
  Zap,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
  XCircle,
  Check,
  type LucideProps,
} from "lucide-react";
import type { ComponentType } from "react";

const ICON_MAP: Record<string, ComponentType<LucideProps>> = {
  target: Target,
  scale: Scale,
  banknote: Banknote,
  layers: Layers,
  gem: Gem,
  flame: Flame,
  crown: Crown,
  rocket: Rocket,
  wallet: Wallet,
  recycle: Recycle,
  skull: Skull,
  shield: Shield,
  zap: Zap,
  "check-circle": CheckCircle,
  "help-circle": HelpCircle,
  "alert-triangle": AlertTriangle,
  "x-circle": XCircle,
  check: Check,
};

interface BadgeIconProps extends LucideProps {
  name: string;
}

export default function BadgeIcon({ name, ...props }: BadgeIconProps) {
  const Icon = ICON_MAP[name];
  if (!Icon) return <span>?</span>;
  return <Icon {...props} />;
}
