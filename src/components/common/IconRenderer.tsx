import React from 'react';
import * as Icons from 'lucide-react';

interface IconRendererProps {
  name: string;
  className?: string;
  size?: number;
  color?: string;
}

export const IconRenderer: React.FC<IconRendererProps> = ({
  name,
  className = 'w-5 h-5',
  size,
  color,
}) => {
  // Try direct match or PascalCase match
  const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ className?: string; size?: number; color?: string }>>)[name] || Icons.Sparkles;

  return <IconComponent className={className} size={size} color={color} />;
};

export const AVAILABLE_ICONS = [
  'Sparkles', 'Activity', 'Flame', 'Droplets', 'BookOpen', 'Brain',
  'Dumbbell', 'Moon', 'Sun', 'Clock', 'CheckCircle2', 'Zap',
  'Shield', 'Trophy', 'Heart', 'Coffee', 'Target', 'Laptop',
  'Smile', 'Music', 'Star', 'Briefcase', 'Wallet', 'Compass',
  'Code', 'Feather', 'Glasses', 'Leaf', 'Lightbulb', 'Award'
];

export const PRESET_COLORS = [
  '#22c55e', // Green
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#f59e0b', // Amber
  '#06b6d4', // Cyan
  '#ef4444', // Red
  '#10b981', // Emerald
  '#f97316', // Orange
  '#6366f1', // Indigo
];
