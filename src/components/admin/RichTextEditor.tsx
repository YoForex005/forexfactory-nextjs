"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
} from "lucide-react";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ content, onChange, placeholder = "Start writing..." }: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-brand underline",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none focus:outline-none min-h-[400px] px-4 py-3",
      },
    },
  });

  if (!editor) {
    return null;
  }

  const addImage = () => {
    const url = window.prompt("Enter image URL:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addLink = () => {
    const url = window.prompt("Enter URL:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div className="rounded-lg border border-white/10 bg-white/5">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 border-b border-white/10 p-2">
        {/* Text Formatting */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`rounded p-2 transition-colors hover:bg-white/10 ${editor.isActive("bold") ? "bg-brand text-white" : "text-zinc-400"
            }`}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`rounded p-2 transition-colors hover:bg-white/10 ${editor.isActive("italic") ? "bg-brand text-white" : "text-zinc-400"
            }`}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`rounded p-2 transition-colors hover:bg-white/10 ${editor.isActive("underline") ? "bg-brand text-white" : "text-zinc-400"
            }`}
          title="Underline"
        >
          <UnderlineIcon className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`rounded p-2 transition-colors hover:bg-white/10 ${editor.isActive("strike") ? "bg-brand text-white" : "text-zinc-400"
            }`}
          title="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`rounded p-2 transition-colors hover:bg-white/10 ${editor.isActive("code") ? "bg-brand text-white" : "text-zinc-400"
            }`}
          title="Code"
        >
          <Code className="h-4 w-4" />
        </button>

        <div className="mx-2 w-px bg-white/10" />

        {/* Headings */}
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`rounded p-2 transition-colors hover:bg-white/10 ${editor.isActive("heading", { level: 1 }) ? "bg-brand text-white" : "text-zinc-400"
            }`}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`rounded p-2 transition-colors hover:bg-white/10 ${editor.isActive("heading", { level: 2 }) ? "bg-brand text-white" : "text-zinc-400"
            }`}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`rounded p-2 transition-colors hover:bg-white/10 ${editor.isActive("heading", { level: 3 }) ? "bg-brand text-white" : "text-zinc-400"
            }`}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </button>

        <div className="mx-2 w-px bg-white/10" />

        {/* Lists */}
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`rounded p-2 transition-colors hover:bg-white/10 ${editor.isActive("bulletList") ? "bg-brand text-white" : "text-zinc-400"
            }`}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`rounded p-2 transition-colors hover:bg-white/10 ${editor.isActive("orderedList") ? "bg-brand text-white" : "text-zinc-400"
            }`}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`rounded p-2 transition-colors hover:bg-white/10 ${editor.isActive("blockquote") ? "bg-brand text-white" : "text-zinc-400"
            }`}
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </button>

        <div className="mx-2 w-px bg-white/10" />

        {/* Media */}
        <button
          onClick={addLink}
          className={`rounded p-2 transition-colors hover:bg-white/10 ${editor.isActive("link") ? "bg-brand text-white" : "text-zinc-400"
            }`}
          title="Add Link"
        >
          <LinkIcon className="h-4 w-4" />
        </button>
        <button
          onClick={addImage}
          className="rounded p-2 text-zinc-400 transition-colors hover:bg-white/10"
          title="Add Image"
        >
          <ImageIcon className="h-4 w-4" />
        </button>

        <div className="mx-2 w-px bg-white/10" />

        {/* Undo/Redo */}
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="rounded p-2 text-zinc-400 transition-colors hover:bg-white/10 disabled:opacity-30"
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="rounded p-2 text-zinc-400 transition-colors hover:bg-white/10 disabled:opacity-30"
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </button>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} />
    </div>
  );
}
