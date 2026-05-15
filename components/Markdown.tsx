// Markdown renderer with GitHub-flavored extensions and KaTeX math support.
// Use $...$ for inline math and $$...$$ blocks for display math.

import ReactMarkdown from "react-markdown";
import type { AnchorHTMLAttributes } from "react";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

function ExternalSafeAnchor(props: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const isExternal = !!props.href && /^https?:\/\//i.test(props.href);
  return (
    <a
      {...props}
      target={isExternal ? "_blank" : props.target}
      rel={isExternal ? "noopener noreferrer" : props.rel}
    />
  );
}

export default function Markdown({ children }: { children: string }) {
  return (
    <div className="prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{ a: ExternalSafeAnchor }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
