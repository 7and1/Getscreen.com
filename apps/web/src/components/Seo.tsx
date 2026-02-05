import { Helmet } from "react-helmet-async";

type SeoProps = {
  title: string;
  description?: string;
  pathname?: string;
  noindex?: boolean;
  imagePath?: string;
  keywords?: string;
  author?: string;
  twitterSite?: string;
  twitterCreator?: string;
  ogType?: "website" | "article" | "product";
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    section?: string;
    tags?: string[];
  };
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
};

function getSiteUrl(): string {
  const fromEnv = import.meta.env.VITE_SITE_URL as string | undefined;
  if (fromEnv && fromEnv.trim()) return fromEnv.replace(/\/+$/g, "");
  if (typeof window !== "undefined" && window.location?.origin)
    return window.location.origin;
  return "https://visionlink.ai";
}

export function Seo(props: SeoProps) {
  const siteUrl = getSiteUrl();
  const canonical = props.pathname
    ? `${siteUrl}${props.pathname.startsWith("/") ? "" : "/"}${props.pathname}`
    : undefined;
  const imageUrl = (() => {
    const path = props.imagePath ?? "/og.svg";
    if (!path) return undefined;
    return path.startsWith("http")
      ? path
      : `${siteUrl}${path.startsWith("/") ? "" : "/"}${path}`;
  })();

  const ogType = props.ogType ?? "website";

  return (
    <Helmet>
      <title>{props.title}</title>
      {props.description ? (
        <meta name="description" content={props.description} />
      ) : null}
      {props.keywords ? (
        <meta name="keywords" content={props.keywords} />
      ) : null}
      {props.author ? <meta name="author" content={props.author} /> : null}
      {canonical ? <link rel="canonical" href={canonical} /> : null}
      {props.noindex ? <meta name="robots" content="noindex,nofollow" /> : null}

      {/* OpenGraph tags */}
      <meta property="og:site_name" content="VisionLink AI" />
      <meta property="og:title" content={props.title} />
      {props.description ? (
        <meta property="og:description" content={props.description} />
      ) : null}
      {canonical ? <meta property="og:url" content={canonical} /> : null}
      <meta property="og:type" content={ogType} />
      {imageUrl ? <meta property="og:image" content={imageUrl} /> : null}
      {imageUrl ? <meta property="og:image:alt" content={props.title} /> : null}
      <meta property="og:locale" content="en_US" />

      {/* Article-specific OpenGraph tags */}
      {ogType === "article" && props.article?.publishedTime ? (
        <meta
          property="article:published_time"
          content={props.article.publishedTime}
        />
      ) : null}
      {ogType === "article" && props.article?.modifiedTime ? (
        <meta
          property="article:modified_time"
          content={props.article.modifiedTime}
        />
      ) : null}
      {ogType === "article" && props.article?.author ? (
        <meta property="article:author" content={props.article.author} />
      ) : null}
      {ogType === "article" && props.article?.section ? (
        <meta property="article:section" content={props.article.section} />
      ) : null}
      {ogType === "article" &&
        props.article?.tags?.map((tag) => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}

      {/* Twitter Card tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={props.title} />
      {props.description ? (
        <meta name="twitter:description" content={props.description} />
      ) : null}
      {imageUrl ? <meta name="twitter:image" content={imageUrl} /> : null}
      {imageUrl ? (
        <meta name="twitter:image:alt" content={props.title} />
      ) : null}
      {props.twitterSite ? (
        <meta name="twitter:site" content={props.twitterSite} />
      ) : null}
      {props.twitterCreator ? (
        <meta name="twitter:creator" content={props.twitterCreator} />
      ) : null}

      {/* Structured data (JSON-LD) */}
      {props.jsonLd ? (
        <script type="application/ld+json">
          {JSON.stringify(props.jsonLd)}
        </script>
      ) : null}
    </Helmet>
  );
}

export default Seo;
