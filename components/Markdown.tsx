// Markdown renderer with GitHub-flavored extensions and KaTeX math support.
// Use $...$ for inline math and $$...$$ blocks for display math.

import type { AnchorHTMLAttributes, ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

// react-markdown v9 passes a `node` extra prop alongside the standard anchor
// attributes. We accept it loosely and strip it before forwarding.
type AnchorRendererProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  node?: unknown;
  children?: ReactNode;
};

function MarkdownAnchor({ node, href, children, ...rest }: AnchorRendererProps) {
  void node;
  const isExternal = !!href && /^https?:\/\//i.test(href);
  return (
    <a
      href={href}
      {...rest}
      target={isExternal ? "_blank" : rest.target}
      rel={isExternal ? "noopener noreferrer" : rest.rel}
    >
      {children}
    </a>
  );
}

const components: Components = {
  a: MarkdownAnchor,
};

export default function Markdown({ children }: { children: string }) {
  return (
    <div className="prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={components}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
