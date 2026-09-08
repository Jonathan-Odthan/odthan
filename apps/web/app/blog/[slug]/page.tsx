import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@odthan/database";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await prisma.blogPost.findUnique({ where: { slug: params.slug } });
  if (!post) return {};
  return {
    title: post.seoTitle ?? post.title,
    description: post.seoDescription ?? post.excerpt,
    openGraph: { title: post.title, description: post.excerpt, images: post.imageUrl ? [post.imageUrl] : undefined },
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await prisma.blogPost.findUnique({ where: { slug: params.slug } });

  if (!post || !post.published) notFound();

  return (
    <article className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="mb-4 text-4xl font-bold text-white">{post.title}</h1>
      {post.publishedAt && (
        <p className="mb-10 text-sm text-[#A0A0A0]">{post.publishedAt.toLocaleDateString("fr-FR")}</p>
      )}
      <div className="prose prose-invert max-w-none whitespace-pre-line leading-relaxed text-[#A0A0A0]">
        {post.content}
      </div>
    </article>
  );
}
