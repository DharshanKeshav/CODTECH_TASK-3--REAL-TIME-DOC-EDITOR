import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Logo from "./Logo";
import { Button } from "./ui/button";

const Navbar = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup";

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 glass"
    >
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/">
          <Logo size="md" />
        </Link>

        {!isAuthPage && (
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" size="default">
                Sign In
              </Button>
            </Link>
            <Link to="/signup">
              <Button variant="hero" size="default">
                Get Started
              </Button>
            </Link>
          </div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;
