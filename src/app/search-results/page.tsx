import { Suspense } from "react";
import SearchResultsClient from "./SearchResultsClient";

export default function SearchResultsPage() {
  return (
    <Suspense fallback={<p>Loading search results...</p>}>
      <SearchResultsClient />
    </Suspense>
  );
}
