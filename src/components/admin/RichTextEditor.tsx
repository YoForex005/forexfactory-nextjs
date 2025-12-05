"use client";

import { Editor } from "@tinymce/tinymce-react";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-white/5">
      <Editor
        apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
        value={content}
        onEditorChange={(newContent) => onChange(newContent)}
        init={{
          height: 500,
          menubar: false,
          plugins: [
            "advlist", "autolink", "lists", "link", "image", "charmap", "preview",
            "anchor", "searchreplace", "visualblocks", "code", "fullscreen",
            "insertdatetime", "media", "table", "code", "help", "wordcount"
          ],
          toolbar: "undo redo | blocks | " +
            "bold italic forecolor | alignleft aligncenter " +
            "alignright alignjustify | bullist numlist outdent indent | " +
            "removeformat | help",
          content_style: "body { font-family:Inter,sans-serif; font-size:14px; background-color: #18181b; color: #fff }",
          skin: "oxide-dark",
          content_css: "dark",
          placeholder: placeholder,
        }}
      />
    </div>
  );
}

