import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return new Response(
        JSON.stringify({ success: false, error: "No file provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const fileName = file.name.toLowerCase();
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    let extractedText = "";
    let extractedHtml = "";

    if (fileName.endsWith(".pdf")) {
      // Parse PDF in a Deno/Edge compatible way (pdf-parse requires Node fs)
      const { getDocument } = await import("https://esm.sh/pdfjs-serverless@1.0.3");
      const pdf = await getDocument({ data: bytes, useSystemFonts: true }).promise;

      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pageText = (content.items as any[])
          .map((item) => (typeof item?.str === "string" ? item.str : ""))
          .filter(Boolean)
          .join(" ");
        fullText += pageText + "\n\n";
      }

      extractedText = fullText.trim();
      extractedHtml = extractedText
        .split(/\n\n+/)
        .filter((p: string) => p.trim())
        .map((p: string) => `<p>${p.replace(/\n/g, "<br/>")}</p>`)
        .join("");
    } else if (fileName.endsWith(".docx")) {
      // Parse DOCX using mammoth
      const mammoth = await import("https://esm.sh/mammoth@1.6.0");
      const result = await mammoth.default.convertToHtml({ arrayBuffer });
      extractedHtml = result.value || "";
      extractedText = extractedHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    } else if (fileName.endsWith(".doc")) {
      // .doc files are binary and harder to parse; provide guidance
      return new Response(
        JSON.stringify({
          success: false,
          error: "Legacy .doc files are not supported. Please convert to .docx first.",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      return new Response(
        JSON.stringify({ success: false, error: "Unsupported file type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Parsed ${fileName}: ${extractedText.length} chars`);

    return new Response(
      JSON.stringify({
        success: true,
        text: extractedText,
        html: extractedHtml,
        fileName: file.name,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error parsing document:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Failed to parse document",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
