import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Users, Zap, Shield, Globe, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import FeatureCard from "@/components/FeatureCard";

const Index = () => {
  const features = [
    {
      icon: Users,
      title: "Real-Time Collaboration",
      description: "Work together seamlessly with your team. See changes as they happen with live cursor tracking.",
    },
    {
      icon: Zap,
      title: "Instant Sync",
      description: "Your documents sync instantly across all devices. Never lose a change again.",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "End-to-end encryption keeps your documents safe. You control who has access.",
    },
    {
      icon: Globe,
      title: "Access Anywhere",
      description: "Work from any device, anywhere in the world. Your documents are always with you.",
    },
  ];

  return (
    <div className="min-h-screen gradient-hero">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 text-foreground leading-tight">
              Write Together,{" "}
              <span className="gradient-text">Anywhere</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              The modern collaborative document editor that makes teamwork effortless. 
              Real-time editing, beautiful design, and powerful features.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link to="/signup">
              <Button variant="hero" size="xl" className="group">
                Start Writing Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="outline" size="xl">
                View Demo
              </Button>
            </Link>
          </motion.div>

          {/* Preview Image */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-16 relative"
          >
            <div className="bg-card rounded-2xl shadow-elevated border border-border/50 overflow-hidden p-1">
              <div className="bg-muted rounded-xl p-8 min-h-[300px] flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-4 animate-float">
                    <svg className="w-8 h-8 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <p className="text-muted-foreground">Interactive editor preview</p>
                </div>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl font-bold mb-4 text-foreground">
              Everything You Need
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Powerful features designed for modern teams who value efficiency and collaboration.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="rounded-3xl gradient-bg p-12 text-center shadow-elevated"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-primary-foreground">
              Ready to Collaborate?
            </h2>
            <p className="text-primary-foreground/90 mb-8 text-lg">
              Join thousands of teams already writing better together.
            </p>
            <Link to="/signup">
              <Button variant="glass" size="xl" className="bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground border-primary-foreground/30">
                Get Started — It's Free
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border/50">
        <div className="container mx-auto text-center text-muted-foreground text-sm">
          <p>© 2026 CollabWrite. Built for writers who collaborate.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
