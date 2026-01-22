import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Share2, Users, Cloud, CheckCircle, Trash2 } from "lucide-react";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import RichTextEditor from "@/components/RichTextEditor";
import CollaboratorAvatar from "@/components/CollaboratorAvatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type DocumentType = Tables<"documents">;

const Document = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [document, setDocument] = useState<DocumentType | null>(null);
  const [title, setTitle] = useState("Untitled Document");
  const [content, setContent] = useState("");
  const [fontFamily, setFontFamily] = useState("Inter");
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [shareEmail, setShareEmail] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch document
  useEffect(() => {
    if (id && user) {
      fetchDocument();
    }
  }, [id, user]);

  const fetchDocument = async () => {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch document",
        variant: "destructive",
      });
      navigate("/dashboard");
    } else if (data) {
      setDocument(data);
      setTitle(data.title);
      setContent(data.content || "");
      setFontFamily(data.font_family || "Inter");
    } else {
      toast({
        title: "Not found",
        description: "Document not found",
        variant: "destructive",
      });
      navigate("/dashboard");
    }
    setLoading(false);
  };

  // Auto-save with debounce
  const saveDocument = useCallback(async (newTitle: string, newContent: string, newFont: string) => {
    if (!id || !user) return;
    
    setSaveStatus("saving");
    
    const { error } = await supabase
      .from("documents")
      .update({
        title: newTitle,
        content: newContent,
        font_family: newFont,
      })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save document",
        variant: "destructive",
      });
      setSaveStatus("unsaved");
    } else {
      setSaveStatus("saved");
    }
  }, [id, user, toast]);

  // Debounced save
  useEffect(() => {
    if (!loading && document) {
      const timer = setTimeout(() => {
        if (title !== document.title || content !== document.content || fontFamily !== document.font_family) {
          saveDocument(title, content, fontFamily);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [title, content, fontFamily, loading, document, saveDocument]);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setSaveStatus("unsaved");
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setSaveStatus("unsaved");
  };

  const handleFontFamilyChange = (font: string) => {
    setFontFamily(font);
    setSaveStatus("unsaved");
  };

  const handleShare = () => {
    if (shareEmail) {
      toast({
        title: "Feature coming soon",
        description: "Collaboration invites will be available in the next update.",
      });
      setShareEmail("");
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied!",
      description: "Share this link with your collaborators.",
    });
  };

  const handleDelete = async () => {
    const { error } = await supabase
      .from("documents")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Document deleted",
        description: "The document has been permanently deleted.",
      });
      navigate("/dashboard");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/20" />
          <p className="text-muted-foreground">Loading document...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border/50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Back + Logo + Title */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Link to="/dashboard">
                <Button variant="ghost" size="icon" className="shrink-0">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              
              <Logo size="sm" showText={false} />
              
              <Input
                value={title}
                onChange={handleTitleChange}
                className="font-semibold text-lg border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0 h-auto max-w-[300px]"
                placeholder="Document title..."
              />

              {/* Save Status */}
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                {saveStatus === "saved" && (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                    Saved
                  </>
                )}
                {saveStatus === "saving" && (
                  <>
                    <Cloud className="w-3.5 h-3.5 animate-pulse" />
                    Saving...
                  </>
                )}
                {saveStatus === "unsaved" && (
                  <>
                    <Cloud className="w-3.5 h-3.5" />
                    Unsaved
                  </>
                )}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Delete Button */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Document</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{title}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {/* Share Button */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="default" size="sm" className="gap-2">
                    <Share2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Share</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="font-display">Share Document</DialogTitle>
                    <DialogDescription>
                      Invite others to collaborate on this document
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 pt-4">
                    <div className="flex gap-2">
                      <Input
                        type="email"
                        placeholder="Enter email address"
                        value={shareEmail}
                        onChange={(e) => setShareEmail(e.target.value)}
                      />
                      <Button onClick={handleShare}>Invite</Button>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">or</span>
                      </div>
                    </div>

                    <Button variant="outline" className="w-full" onClick={copyShareLink}>
                      Copy Share Link
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      {/* Editor */}
      <main className="flex-1 container mx-auto px-4 py-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <RichTextEditor
            content={content}
            onChange={handleContentChange}
            placeholder="Start writing your document..."
            fontFamily={fontFamily}
            onFontFamilyChange={handleFontFamilyChange}
            documentTitle={title.replace(/[^a-zA-Z0-9]/g, '_') || 'document'}
          />
        </motion.div>
      </main>
    </div>
  );
};

export default Document;
