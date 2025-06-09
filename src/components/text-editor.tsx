import { useEditor, EditorContent } from "@tiptap/react";
import Placeholder from "@tiptap/extension-placeholder";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Underline from "@tiptap/extension-underline";
import Strike from "@tiptap/extension-strike";
import History from "@tiptap/extension-history";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function TextEditor(props: {
  initialValue?: string;
  placeholder?: string;
  onChange?: (content: string) => void;
}) {
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Bold,
      Italic,
      Underline,
      Strike,
      History,
      Placeholder.configure({ placeholder: props.placeholder }),
    ],
    content: props.initialValue,
    onUpdate: ({ editor }) => {
      props.onChange?.(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="px-2 flex flex-col gap-2">
      <div className="flex gap-1 items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(editor.isActive("bold") && "bg-muted")}
        >
          <span className="font-bold">B</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(editor.isActive("italic") && "bg-muted")}
        >
          <span className="italic">I</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={cn(editor.isActive("underline") && "bg-muted")}
        >
          <span className="underline">U</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={cn(editor.isActive("strike") && "bg-muted")}
        >
          <span className="line-through">S</span>
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="M3 7v6h6" />
            <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
          </svg>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="M21 7v6h-6" />
            <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
          </svg>
        </Button>
      </div>
      <EditorContent
        className="prose prose-sm dark:prose-invert max-w-none focus:outline-none focus:ring-0 px-2"
        editor={editor}
      />
    </div>
  );
}

export function CommentEditor(props: {
  initialValue?: string;
  placeholder?: string;
  onChange?: (content: string) => void;
  onSubmit?: () => Promise<void>;
  onSubmitEnabled?: boolean;
}) {
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Bold,
      Italic,
      Underline,
      Strike,
      History,
      Placeholder.configure({ placeholder: props.placeholder }),
    ],
    content: props.initialValue,
    onUpdate: ({ editor }) => {
      props.onChange?.(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="px-2 flex flex-col gap-2">
      <EditorContent
        className="prose prose-sm dark:prose-invert max-w-none focus:outline-none focus:ring-0 px-2"
        editor={editor}
      />
      <div className="flex gap-1 items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(editor.isActive("bold") && "bg-muted")}
        >
          <span className="font-bold">B</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(editor.isActive("italic") && "bg-muted")}
        >
          <span className="italic">I</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={cn(editor.isActive("underline") && "bg-muted")}
        >
          <span className="underline">U</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={cn(editor.isActive("strike") && "bg-muted")}
        >
          <span className="line-through">S</span>
        </Button>
        <div className="flex-1" />
        <Button
          size="sm"
          onClick={async () => {
            await props.onSubmit?.();
            editor.commands.setContent("");
          }}
          className="mr-2"
          disabled={!props.onSubmitEnabled}
        >
          Comment
        </Button>
      </div>
    </div>
  );
}
