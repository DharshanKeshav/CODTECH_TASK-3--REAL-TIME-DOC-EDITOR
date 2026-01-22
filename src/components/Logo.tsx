import logoImage from "@/assets/logo.jpeg";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

const sizeMap = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-14 w-14",
};

const textSizeMap = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-2xl",
};

const Logo = ({ size = "md", showText = true }: LogoProps) => {
  return (
    <div className="flex items-center gap-3">
      <img
        src={logoImage}
        alt="CollabWrite Logo"
        className={`${sizeMap[size]} rounded-full object-cover shadow-soft`}
      />
      {showText && (
        <span className={`font-display font-semibold ${textSizeMap[size]} text-foreground`}>
          CollabWrite
        </span>
      )}
    </div>
  );
};

export default Logo;
