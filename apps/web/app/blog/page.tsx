import Link from "next/link";
import { prisma } from "@odthan/database";
import { Card } from "@odthan/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Blog" };

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <h1 className="mb-12 text-4xl font-bold text-white">Blog</h1>

      {posts.length === 0 ? (
        <p className="text-[#A0A0A0]">Aucun article publié pour le moment.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`}>
              <Card className="h-full">
                <h2 className="mb-2 text-xl font-bold text-[#F1D77A]">{post.title}</h2>
                <p className="text-sm text-[#A0A0A0]">{post.excerpt}</p>
                {post.publishedAt && (
                  <p className="mt-4 text-xs text-[#A0A0A0]">
                    {post.publishedAt.toLocaleDateString("fr-FR")}
                  </p>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
