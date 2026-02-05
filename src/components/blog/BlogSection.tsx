import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BlogCard } from "./BlogCard";
import { Blog } from "@prisma/client";

interface BlogSectionProps {
    title: string;
    subtitle?: string;
    blogs: any[]; // Changed from Blog[] to accept partial blog objects
    viewMoreLink?: string;
    id?: string;
    priorityStartIndex?: number;
}

export function BlogSection({ title, subtitle, blogs, viewMoreLink = "/blog", id, priorityStartIndex = -1 }: BlogSectionProps) {
    if (blogs.length === 0) return null;

    return (
        <section className="py-20" id={id}>
            <div className="container mx-auto px-4">
                <div className="mb-12 flex flex-col items-center justify-center text-center">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-2">{title}</h2>
                        {subtitle && <p className="text-zinc-400">{subtitle}</p>}
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {blogs.map((blog, index) => (
                        <BlogCard
                            key={blog.id}
                            blog={blog}
                            priority={index < priorityStartIndex}
                        />
                    ))}
                </div>

                <div className="mt-12 flex justify-center">
                    <Link
                        href={viewMoreLink}
                        className="group flex items-center gap-2 rounded-full border border-brand/30 bg-brand/5 px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-brand hover:text-white hover:shadow-lg hover:shadow-brand/20"
                    >
                        View More
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
