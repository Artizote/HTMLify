import { z } from "zod";

const searchQuerySchema = z.object({
  query: z.string(),
  page: z.number(),
  page_size: z.number(),
});
type SearchQuery = z.infer<typeof searchQuerySchema>;

interface SearchResult {
  token: string;
  score: number;
  item_type: "file" | "pen";
  item_id: string;
  path: string;
  title: string;
}

interface SearchResponse {
  query: string;
  results: SearchResult[];
  total_results: number;
  page: number;
  page_size: number;
  total_pages: number;
  time_took: number;
}

export {
  type SearchQuery,
  searchQuerySchema,
  type SearchResponse,
  type SearchResult,
};
