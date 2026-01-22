import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
import { FontFamily } from "@tiptap/extension-font-family";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { jsPDF } from "jspdf";
import { Document as DocxDocument, Packer, Paragraph } from "docx";
import { useRef, useEffect, useState } from "react";
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Heading1, 
  Heading2, 
  Heading3,
  Undo,
  Redo,
  Minus,
  Upload,
  Download,
  Type,
  ChevronDown,
  Strikethrough,
  Code,
  Quote,
  Highlighter,
  Palette
} from "lucide-react";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface RichTextEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  fontFamily?: string;
  onFontFamilyChange?: (font: string) => void;
  documentTitle?: string;
}

const FONT_OPTIONS = [
  { label: "Inter", value: "Inter" },
  { label: "Arial", value: "Arial" },
  { label: "Georgia", value: "Georgia" },
  { label: "Times New Roman", value: "Times New Roman" },
  { label: "Courier New", value: "Courier New" },
  { label: "Verdana", value: "Verdana" },
  { label: "Comic Sans MS", value: "Comic Sans MS" },
];

const TEXT_COLORS = [
  { label: "Default", value: "" },
  { label: "Red", value: "hsl(var(--editor-red))" },
  { label: "Orange", value: "hsl(var(--editor-orange))" },
  { label: "Yellow", value: "hsl(var(--editor-yellow))" },
  { label: "Green", value: "hsl(var(--editor-green))" },
  { label: "Blue", value: "hsl(var(--editor-blue))" },
  { label: "Purple", value: "hsl(var(--editor-purple))" },
  { label: "Pink", value: "hsl(var(--editor-pink))" },
  { label: "Gray", value: "hsl(var(--editor-gray))" },
];

const HIGHLIGHT_COLORS = [
  { label: "None", value: "" },
  { label: "Yellow", value: "hsl(var(--editor-hl-yellow))" },
  { label: "Green", value: "hsl(var(--editor-hl-green))" },
  { label: "Blue", value: "hsl(var(--editor-hl-blue))" },
  { label: "Pink", value: "hsl(var(--editor-hl-pink))" },
  { label: "Orange", value: "hsl(var(--editor-hl-orange))" },
  { label: "Purple", value: "hsl(var(--editor-hl-purple))" },
];

const lowlight = createLowlight(common);

const RichTextEditor = ({ 
  content = "", 
  onChange, 
  placeholder = "Start writing your document...",
  fontFamily = "Inter",
  onFontFamilyChange,
  documentTitle = "document"
}: RichTextEditorProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [currentColor, setCurrentColor] = useState("");
  const [currentHighlight, setCurrentHighlight] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // We use CodeBlockLowlight instead
      }),
      Placeholder.configure({
        placeholder,
      }),
      TextStyle,
      FontFamily.configure({
        types: ['textStyle'],
      }),
      Color.configure({
        types: ['textStyle'],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && fontFamily) {
      editor.chain().focus().setFontFamily(fontFamily).run();
    }
  }, [editor, fontFamily]);

  const getFileExtension = (filename: string): string => {
    return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2).toLowerCase();
  };

  const isTextLikeFile = (file: File) => {
    const ext = getFileExtension(file.name);
    const validTextExtensions = ["txt", "md", "html", "htm", "rtf"];
    const binaryDocExtensions = ["pdf", "docx"];

    const mime = (file.type || "").toLowerCase();
    const mimeLooksText = mime.startsWith("text/") || mime === "application/rtf";

    return {
      isText: validTextExtensions.includes(ext) || mimeLooksText || ext === "",
      isBinaryDoc: binaryDocExtensions.includes(ext),
      ext,
      mime,
    };
  };

  const [isImporting, setIsImporting] = useState(false);

  const handleBinaryDocImport = async (file: File) => {
    setIsImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const { data, error } = await supabase.functions.invoke("parse-document", {
        body: formData,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error || "Failed to parse document");
      }

      if (editor && data.html) {
        editor.commands.setContent(data.html);
        toast({
          title: "File imported",
          description: `Successfully imported ${file.name}`,
        });
      }
    } catch (err) {
      console.error("Error importing document:", err);
      toast({
        title: "Import failed",
        description: err instanceof Error ? err.message : "Could not import the document",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const { isText, isBinaryDoc, ext: extension, mime } = isTextLikeFile(file);

    // Handle PDF/DOCX via backend
    if (isBinaryDoc) {
      await handleBinaryDocImport(file);
      return;
    }

    if (!isText) {
      toast({
        title: "Invalid file type",
        description: `Please upload a supported file (txt, md, html, pdf, docx). Selected: ${extension || "(no extension)"}${mime ? ` (${mime})` : ""}`,
        variant: "destructive",
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!editor) return;

      const isHtml =
        extension === "html" ||
        extension === "htm" ||
        mime.includes("text/html") ||
        /<\s*html[\s>]/i.test(text);

      if (isHtml) {
        editor.commands.setContent(text);
      } else {
        const htmlContent = text
          .split("\n")
          .map((line) => (line.trim() ? `<p>${line}</p>` : "<p></p>"))
          .join("");
        editor.commands.setContent(htmlContent);
      }

      toast({
        title: "File imported",
        description: `Successfully imported ${file.name}`,
      });
    };
    reader.onerror = () => {
      toast({
        title: "Error reading file",
        description: "Could not read the file. Please try again.",
        variant: "destructive",
      });
    };
    reader.readAsText(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportAsPdf = async () => {
    if (!editor) return;

    // Use a text-based PDF export (reliable across themes; avoids blank PDFs)
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 48;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const maxWidth = pageWidth - margin * 2;
    const lineHeight = 14;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);

    const text = editor.getText() || "";
    const lines = pdf.splitTextToSize(text, maxWidth);

    let y = margin;
    for (const line of lines) {
      if (y + lineHeight > pageHeight - margin) {
        pdf.addPage();
        y = margin;
      }
      pdf.text(String(line), margin, y);
      y += lineHeight;
    }

    pdf.save(`${documentTitle}.pdf`);
    toast({
      title: "Export successful",
      description: `Document exported as ${documentTitle}.pdf`,
    });
  };

  const exportAsDocx = async () => {
    if (!editor) return;

    const text = editor.getText();
    const lines = text.split("\n");

    const doc = new DocxDocument({
      sections: [
        {
          properties: {},
          children: lines.map((line) => new Paragraph({ text: line })),
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    downloadBlob(blob, `${documentTitle}.docx`);

    toast({
      title: "Export successful",
      description: `Document exported as ${documentTitle}.docx`,
    });
  };

  const handleExport = async (format: "html" | "txt" | "md" | "pdf" | "docx") => {
    if (!editor) return;

    if (format === "pdf") {
      await exportAsPdf();
      return;
    }

    if (format === "docx") {
      await exportAsDocx();
      return;
    }

    let content = "";
    let mimeType = "";
    let extension = "";

    switch (format) {
      case "html":
        content = editor.getHTML();
        mimeType = "text/html";
        extension = "html";
        break;
      case "txt":
        content = editor.getText();
        mimeType = "text/plain";
        extension = "txt";
        break;
      case "md":
        // Simple HTML to Markdown conversion
        content = editor
          .getHTML()
          .replace(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1\n\n")
          .replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n\n")
          .replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1\n\n")
          .replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**")
          .replace(/<b[^>]*>(.*?)<\/b>/gi, "**$1**")
          .replace(/<em[^>]*>(.*?)<\/em>/gi, "*$1*")
          .replace(/<i[^>]*>(.*?)<\/i>/gi, "*$1*")
          .replace(/<s[^>]*>(.*?)<\/s>/gi, "~~$1~~")
          .replace(/<strike[^>]*>(.*?)<\/strike>/gi, "~~$1~~")
          .replace(/<code[^>]*>(.*?)<\/code>/gi, "`$1`")
          .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, "> $1\n")
          .replace(/<li[^>]*>(.*?)<\/li>/gi, "- $1\n")
          .replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n")
          .replace(/<br\s*\/?>/gi, "\n")
          .replace(/<[^>]+>/g, "")
          .replace(/\n{3,}/g, "\n\n")
          .trim();
        mimeType = "text/markdown";
        extension = "md";
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    downloadBlob(blob, `${documentTitle}.${extension}`);

    toast({
      title: "Export successful",
      description: `Document exported as ${documentTitle}.${extension}`,
    });
  };

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({ 
    onClick, 
    isActive = false, 
    children, 
    title 
  }: { 
    onClick: () => void; 
    isActive?: boolean; 
    children: React.ReactNode;
    title: string;
  }) => (
    <Button
      variant={isActive ? "secondary" : "ghost"}
      size="icon"
      onClick={onClick}
      title={title}
      className="h-8 w-8"
    >
      {children}
    </Button>
  );

  return (
    <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-border bg-muted/30 flex-wrap">
        {/* Font Family Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1 h-8 px-2" title="Font Family">
              <Type className="w-4 h-4" />
              <span className="hidden sm:inline text-xs max-w-[80px] truncate">{fontFamily}</span>
              <ChevronDown className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {FONT_OPTIONS.map((font) => (
              <DropdownMenuItem
                key={font.value}
                onClick={() => {
                  onFontFamilyChange?.(font.value);
                  editor.chain().focus().setFontFamily(font.value).run();
                }}
                style={{ fontFamily: font.value }}
                className={fontFamily === font.value ? "bg-accent" : ""}
              >
                {font.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Text Formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive("strike")}
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive("code")}
          title="Inline Code"
        >
          <Code className="w-4 h-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Text Color */}
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              title="Text Color"
            >
              <Palette className="w-4 h-4" style={{ color: currentColor || undefined }} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="start">
            <div className="grid grid-cols-5 gap-1">
              {TEXT_COLORS.map((color) => (
                <button
                  key={color.value}
                  className={`w-6 h-6 rounded border border-border ${color.value === "" ? "bg-foreground" : ""}`}
                  style={{ backgroundColor: color.value || undefined }}
                  title={color.label}
                  onClick={() => {
                    if (color.value) {
                      editor.chain().focus().setColor(color.value).run();
                    } else {
                      editor.chain().focus().unsetColor().run();
                    }
                    setCurrentColor(color.value);
                  }}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Highlight Color */}
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              title="Highlight"
            >
              <Highlighter className="w-4 h-4" style={{ color: currentHighlight || undefined }} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="start">
            <div className="grid grid-cols-4 gap-1">
              {HIGHLIGHT_COLORS.map((color) => (
                <button
                  key={color.value}
                  className={`w-6 h-6 rounded border border-border ${color.value === "" ? "bg-transparent" : ""}`}
                  style={{ backgroundColor: color.value || undefined }}
                  title={color.label}
                  onClick={() => {
                    if (color.value) {
                      editor.chain().focus().toggleHighlight({ color: color.value }).run();
                    } else {
                      editor.chain().focus().unsetHighlight().run();
                    }
                    setCurrentHighlight(color.value);
                  }}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Headings */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive("heading", { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive("heading", { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Lists & Blocks */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive("blockquote")}
          title="Blockquote"
        >
          <Quote className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive("codeBlock")}
          title="Code Block"
        >
          <Code className="w-4 h-4 rotate-90" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Rule"
        >
          <Minus className="w-4 h-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Undo/Redo */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          title="Undo"
        >
          <Undo className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          title="Redo"
        >
          <Redo className="w-4 h-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* File Import */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileImport}
          accept="text/*,.txt,.md,.html,.htm,.rtf,.pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          disabled={isImporting}
        />
        <ToolbarButton
          onClick={() => fileInputRef.current?.click()}
          title="Import File (TXT, MD, HTML, PDF, DOCX)"
        >
          {isImporting ? (
            <Upload className="w-4 h-4 animate-pulse" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
        </ToolbarButton>

        {/* Export Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" title="Export">
              <Download className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleExport('html')}>
              Export as HTML
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('txt')}>
              Export as Text
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('md')}>
              Export as Markdown
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('pdf')}>
              Export as PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('docx')}>
              Export as Word (.docx)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Editor Content */}
      <EditorContent 
        editor={editor} 
        className="prose prose-sm max-w-none" 
        style={{ fontFamily }}
      />
    </div>
  );
};

export default RichTextEditor;
