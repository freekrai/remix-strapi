import qs from "qs"
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { marked } from "marked";
import * as React from "react";

type Post = {
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
};

type PostData = { id: string; attributes: Post }[];

type PostResponse = {
  data: PostData;
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
};

export const loader: LoaderFunction = async () => {

  const queryString = qs.stringify({
    sort: 'publishedAt:desc',    
    populate: "*", 
    pagination: { start: 0, limit: 100} 
  });
  
  const url = `${STRAPI_API_URL}/api/posts?${queryString}`;
  const response = await fetch(url);
  const postResponse = (await response.json()) as PostResponse;

  return json(
    postResponse.data.map((post) => ({
      ...post,
      attributes: {
        ...post.attributes,
        content: marked(post.attributes.content),
      },
    }))
  );
};

const Posts: React.FC = () => {
  const posts = useLoaderData();

  return (
    <>
      {posts.map((post) => {
        const { title, content, createdAt } = post.attributes;
        const date = new Date(createdAt).toLocaleString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        return (
          <article key={post.id}>
		<Link to={`/blog/${post.slug}`}>
	            <h1>{title}</h1>
	            <time dateTime={createdAt}>{date}</time>
	            <div dangerouslySetInnerHTML={{ __html: content }} />
            </Link>
          </article>
        );
      })}
    </>
  );
};
export default Posts;
