// Overleaf-style split editor:
// - Toolbar inserts Markdown / LaTeX snippets at the cursor position.
// - Left pane: monospace textarea (the "source").
// - Right pane: live KaTeX-rendered preview, deferred so typing stays smooth.

"use client";

import { useDeferredValue, useRef } from "react";
import Markdown from "@/components/Markdown";

type Props = {
  value: string;
  onChange: (next: string) => void;
};

type Action =
  | { kind: "wrap"; before: string; after: string; placeholder?: string }
  | { kind: "block"; template: string }
  | { kind: "lineStart"; prefix: string };

function applyAction(
  textarea: HTMLTextAreaElement,
  value: string,
  action: Action
): { next: string; selStart: number; selEnd: number } {
  const { selectionStart, selectionEnd } = textarea;
  const selected = value.slice(selectionStart, selectionEnd);

  if (action.kind === "wrap") {
    const inner = selected || action.placeholder || "";
    const insert = `${action.before}${inner}${action.after}`;
    const next = value.slice(0, selectionStart) + insert + value.slice(selectionEnd);
    const newCursor = selectionStart + action.before.length + inner.length;
    return { next, selStart: newCursor, selEnd: newCursor };
  }

  if (action.kind === "lineStart") {
    // Find start of current line
    const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
    const next = value.slice(0, lineStart) + action.prefix + value.slice(lineStart);
    const cursor = selectionEnd + action.prefix.length;
    return { next, selStart: cursor, selEnd: cursor };
  }

  // block: ensure preceding blank line, insert template, ensure trailing blank line
  const before = value.slice(0, selectionStart);
  const after = value.slice(selectionEnd);
  const padBefore = before.endsWith("\n\n") || before === "" ? "" : before.endsWith("\n") ? "\n" : "\n\n";
  const padAfter = after.startsWith("\n\n") || after === "" ? "" : after.startsWith("\n") ? "\n" : "\n\n";
  const insert = `${padBefore}${action.template}${padAfter}`;
  const next = before + insert + after;
  const cursor = selectionStart + insert.length;
  return { next, selStart: cursor, selEnd: cursor };
}

export default function SplitMarkdownEditor({ value, onChange }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const deferredValue = useDeferredValue(value);

  function run(action: Action) {
    const ta = textareaRef.current;
    if (!ta) return;
    const { next, selStart, selEnd } = applyAction(ta, value, action);
    onChange(next);
    // Restore cursor after React commits
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(selStart, selEnd);
    });
  }

  return (
    <div className="split-editor">
      <div className="split-toolbar" role="toolbar" aria-label="Editor toolbar">
        <ToolbarBtn label="H1" title="Heading 1" onClick={() => run({ kind: "lineStart", prefix: "# " })} />
        <ToolbarBtn label="H2" title="Heading 2" onClick={() => run({ kind: "lineStart", prefix: "## " })} />
        <ToolbarBtn label="H3" title="Heading 3" onClick={() => run({ kind: "lineStart", prefix: "### " })} />
        <Sep />
        <ToolbarBtn label="B" bold title="Bold" onClick={() => run({ kind: "wrap", before: "**", after: "**", placeholder: "bold" })} />
        <ToolbarBtn label="I" italic title="Italic" onClick={() => run({ kind: "wrap", before: "*", after: "*", placeholder: "italic" })} />
        <ToolbarBtn label="`code`" mono title="Inline code" onClick={() => run({ kind: "wrap", before: "`", after: "`", placeholder: "code" })} />
        <Sep />
        <ToolbarBtn label="$x$" mono title="Inline math" onClick={() => run({ kind: "wrap", before: "$", after: "$", placeholder: "x^2" })} />
        <ToolbarBtn label="$$ … $$" mono title="Display math block" onClick={() => run({ kind: "block", template: "$$\n\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}\n$$" })} />
        <ToolbarBtn label="align" mono title="Aligned equations" onClick={() => run({ kind: "block", template: "$$\n\\begin{aligned}\n  a &= b + c \\\\\n    &= d\n\\end{aligned}\n$$" })} />
        <ToolbarBtn label="frac" mono title="Insert fraction" onClick={() => run({ kind: "wrap", before: "$\\frac{", after: "}{}$", placeholder: "a" })} />
        <Sep />
        <ToolbarBtn label="•" title="Bulleted list" onClick={() => run({ kind: "lineStart", prefix: "- " })} />
        <ToolbarBtn label="1." title="Numbered list" onClick={() => run({ kind: "lineStart", prefix: "1. " })} />
        <ToolbarBtn label="“ ”" title="Block quote" onClick={() => run({ kind: "lineStart", prefix: "> " })} />
        <ToolbarBtn label="link" title="Link" onClick={() => run({ kind: "wrap", before: "[", after: "](https://)", placeholder: "text" })} />
        <ToolbarBtn label="```" mono title="Code block" onClick={() => run({ kind: "block", template: "```python\n# code\n```" })} />
      </div>

      <div className="split-panes">
        <div className="split-pane split-source">
          <div className="split-pane-header">
            <span className="split-pane-label">SOURCE</span>
            <span className="split-pane-hint">Markdown + LaTeX</span>
          </div>
          <textarea
            ref={textareaRef}
            className="split-source-area"
            value={value}
            spellCheck={false}
            onChange={(e) => onChange(e.target.value)}
            placeholder={"# Heading\n\nThis is a paragraph with $\\sqrt{x^2 + y^2}$ inline math.\n\n$$\n\\int_0^\\infty e^{-x^2}\\, dx = \\frac{\\sqrt{\\pi}}{2}\n$$"}
          />
        </div>
        <div className="split-pane split-preview">
          <div className="split-pane-header">
            <span className="split-pane-label">PREVIEW</span>
            <span className="split-pane-hint">live</span>
          </div>
          <div className="split-preview-body">
            <Markdown>{deferredValue}</Markdown>
          </div>
        </div>
      </div>
    </div>
  );
}

function Sep() {
  return <span className="split-sep" aria-hidden="true">|</span>;
}

function ToolbarBtn({
  label,
  title,
  onClick,
  bold,
  italic,
  mono,
}: {
  label: string;
  title: string;
  onClick: () => void;
  bold?: boolean;
  italic?: boolean;
  mono?: boolean;
}) {
  const cls = [
    "split-toolbar-btn",
    bold ? "is-bold" : "",
    italic ? "is-italic" : "",
    mono ? "is-mono" : "",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <button type="button" className={cls} title={title} onClick={onClick}>
      {label}
    </button>
  );
}
