import { motion } from "framer-motion";
import { FileText, MoreVertical, Clock, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface DocumentCardProps {
  id: string;
  title: string;
  lastEdited: string;
  collaborators: number;
  preview?: string;
  delay?: number;
}

const DocumentCard = ({
  id,
  title,
  lastEdited,
  collaborators,
  preview = "",
  delay = 0,
}: DocumentCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <Link to={`/document/${id}`}>
        <div className="p-5 rounded-xl bg-card shadow-card hover:shadow-elevated transition-all duration-300 border border-border/50">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
              <FileText className="w-5 h-5 text-accent-foreground" />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Rename</DropdownMenuItem>
                <DropdownMenuItem>Share</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <h3 className="font-semibold text-foreground mb-1 line-clamp-1">{title}</h3>
          
          {preview && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{preview}</p>
          )}

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {lastEdited}
            </span>
            {collaborators > 0 && (
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {collaborators} collaborator{collaborators > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default DocumentCard;
