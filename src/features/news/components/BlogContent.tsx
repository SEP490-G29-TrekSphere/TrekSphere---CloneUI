import type { BlogBlock, BlogPost } from '../types';

function getBlockKey(block: BlogBlock): string {
  switch (block.type) {
    case 'h2':
    case 'p':
    case 'quote':
      return `${block.type}-${block.text.slice(0, 32)}`;
    case 'image':
      return `image-${block.src}`;
    case 'list':
      return `list-${block.items.join('|').slice(0, 32)}`;
    default:
      return `block-${Math.random()}`;
  }
}

interface BlogContentProps {
  post: BlogPost;
}

/**
 * Render nội dung bài viết từ các khối (paragraph, h2, image, quote, list).
 */
export function BlogContent({ post }: BlogContentProps) {
  return (
    <article className="flex flex-col gap-6 text-base leading-relaxed text-primary/90 md:text-lg">
      {post.blocks.map((block) => (
        <RenderBlock key={getBlockKey(block)} block={block} />
      ))}
      {/* Tags ở cuối bài */}
      {post.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-primary/80"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}

function RenderBlock({ block }: { block: BlogBlock }) {
  switch (block.type) {
    case 'h2':
      return <h2 className="mt-4 text-xl font-bold text-primary md:text-2xl">{block.text}</h2>;
    case 'p':
      return <p>{block.text}</p>;
    case 'image':
      return (
        <figure className="my-2">
          <img
            src={block.src}
            alt={block.alt}
            loading="lazy"
            className="w-full rounded-2xl object-cover"
          />
          {block.caption && (
            <figcaption className="mt-2 text-center text-xs text-muted-foreground md:text-sm">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    case 'quote':
      return (
        <blockquote className="rounded-2xl bg-muted px-6 py-5 text-italic text-base italic text-primary md:text-lg">
          <p>“{block.text}”</p>
          {block.author && (
            <footer className="mt-2 text-sm font-medium text-muted-foreground not-italic">
              — {block.author}
            </footer>
          )}
        </blockquote>
      );
    case 'list':
      return (
        <ul className="ml-5 list-disc space-y-2 marker:text-primary">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    default:
      return null;
  }
}
