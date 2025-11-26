'use client';

import React from 'react';

import { EditorContent, useEditor } from '@tiptap/react';
import type { Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  List,
  Strikethrough,
} from 'lucide-react';

import { Button } from '../../ui/button';

export const MenuBar = ({ editor }: { editor: Editor | null }) => {
  const buttonStyle = (isActive: boolean) =>
    `px-3 py-1 text-sm rounded hover:bg-secondary-blue-500 ${
      isActive ? 'bg-black text-white' : ''
    }`;

  return (
    <div className="absolute bottom-5 right-5 flex items-center gap-1 bg-primary-blue-400/80 backdrop-blur-xs rounded-lg p-1 border border-slate-600/50 z-20">
      <Button
        variant="ghost"
        size="sm"
        className={`h-10 w-10 p-0 text-slate-300 hover:text-white hover:bg-slate-700/50 ${buttonStyle(editor?.isActive('bold') ?? false)}`}
        onClick={() => editor?.chain().focus().toggleBold().run()}
      >
        <Bold className="h-5 w-5 font-bold" strokeWidth={2.5} />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className={`h-10 w-10 p-0 text-slate-300 hover:text-white hover:bg-slate-700/50 ${buttonStyle(editor?.isActive('italic') ?? false)}`}
        onClick={() => editor?.chain().focus().toggleItalic().run()}
      >
        <Italic className="h-5 w-5" strokeWidth={2} />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className={`h-10 w-10 p-0 text-slate-300 hover:text-white hover:bg-slate-700/50 ${buttonStyle(editor?.isActive('strike') ?? false)}`}
        onClick={() => editor?.chain().focus().toggleStrike().run()}
      >
        <Strikethrough className="h-5 w-5" strokeWidth={2} />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className={`h-10 w-10 p-0 text-slate-300 hover:text-white hover:bg-slate-700/50 ${buttonStyle(editor?.isActive('list-disc') ?? false)}`}
        onClick={() => editor?.chain().focus().toggleBulletList().run()}
      >
        <List className="h-5 w-5" strokeWidth={2} />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() =>
          editor?.chain().focus().toggleHeading({ level: 1 }).run()
        }
      >
        <Heading1 className="h-5 w-5" strokeWidth={2} />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() =>
          editor?.chain().focus().toggleHeading({ level: 2 }).run()
        }
      >
        <Heading2 className="h-5 w-5" strokeWidth={2} />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() =>
          editor?.chain().focus().toggleHeading({ level: 3 }).run()
        }
      >
        <Heading3 className="h-5 w-5" strokeWidth={2} />
      </Button>
    </div>
  );
};

type RichTextEditorProps = {
  content: string;
  onUpdate?: (value: string) => void;
};

export default function RichTextEditor({
  content,
  onUpdate,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onUpdate?.(editor.getHTML());
    },
  });

  return (
    <div className="relative w-full bg-secondary-blue-500 overflow-hidden min-h-[220px] pb-20">
      <MenuBar editor={editor} />
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none p-4 rounded-sm shadow-sm text-white"
      />
      <style jsx global>{`
        .ProseMirror {
          color: white !important;
          border: none !important;
          outline: none !important;
        }

        .ProseMirror * {
          margin: 0 !important;
          padding: 0 !important;
          margin-bottom: 8px !important;
        }

        .ProseMirror ul,
        .ProseMirror ol {
          padding-left: 20px !important;
        }

        .ProseMirror h1,
        .ProseMirror h2,
        .ProseMirror h3,
        .ProseMirror strong {
          color: white !important;
        }
      `}</style>
    </div>
  );
}
