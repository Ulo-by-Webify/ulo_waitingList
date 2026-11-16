type JsonLdProps = {
  /** A schema.org object (or a list of them). */
  data: Record<string, unknown> | Record<string, unknown>[];
};

/**
 * Structured data for search engines. "<" is escaped so text from the database (a post title,
 * say) can never close the script tag early.
 */
export default function JsonLd({ data }: JsonLdProps) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
