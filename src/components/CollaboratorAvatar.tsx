import { motion } from "framer-motion";

interface CollaboratorAvatarProps {
  name: string;
  color: string;
  isActive?: boolean;
}

const CollaboratorAvatar = ({ name, color, isActive = true }: CollaboratorAvatarProps) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="relative"
      title={name}
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-primary-foreground"
        style={{ backgroundColor: color }}
      >
        {initials}
      </div>
      {isActive && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-card rounded-full" />
      )}
    </motion.div>
  );
};

export default CollaboratorAvatar;
