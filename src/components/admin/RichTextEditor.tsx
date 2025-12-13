"use client";

import { Editor } from "@tinymce/tinymce-react";
import { useRef } from "react";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ content, onChange, placeholder = "Start writing..." }: RichTextEditorProps) {
  const editorRef = useRef<any>(null);

  // Use a default API key or fallback to free/no-key mode (which may show a warning)
  // Ideally, the user should provide NEXT_PUBLIC_TINYMCE_API_KEY in .env.local
  const apiKey = process.env.NEXT_PUBLIC_TINYMCE_API_KEY || "no-api-key";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
      <Editor
        apiKey={apiKey}
        onInit={(_evt, editor) => editorRef.current = editor}
        value={content}
        onEditorChange={(newValue) => onChange(newValue)}
        init={{
          height: 500,
          menubar: true,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
          ],
          toolbar: 'undo redo | blocks | ' +
            'bold italic forecolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | help',
          content_style: 'body { font-family:Inter,Helvetica,Arial,sans-serif; font-size:16px; background-color: #0B0D16; color: #fff; }',
          skin: "oxide-dark",
          content_css: "dark",
          // Fix for dark mode aesthetics matching the site
          invalid_styles: {
            // ... any styles to block
          }
        }}
      />
    </div>
  );
}
