"use client";

import { useEffect, useState } from "react";
import { useDependencyContext } from "@/core/context/dependency/useDependencyContext";
import { SearchFriends } from "@/features/friends/application/SearchFriends.application";
import type {
  FriendSearchResult,
  ServiceResult,
} from "@/features/friends/domain/models/Friendship";
import {
  friendSearchSchema,
  sanitizeFriendSearchInput,
} from "@/features/friends/schemas/friendSearchSchema";

const SEARCH_DEBOUNCE_MS = 300;

export type FriendSearchStatus = "idle" | "searching" | "error" | "done";

type SearchResponse = {
  query: string;
  result: ServiceResult<FriendSearchResult[]>;
};

/** `syncKey` must change whenever the user's friendships change, so results show the current relation. */
export function useFriendSearch(syncKey: string) {
  const { friendshipRepository } = useDependencyContext();
  const [value, setValue] = useState("");
  const [response, setResponse] = useState<SearchResponse | null>(null);

  const parsed = friendSearchSchema.safeParse(value);
  const query = parsed.success ? parsed.data : null;

  useEffect(() => {
    if (!query) return;

    let cancelled = false;
    const timeout = setTimeout(async () => {
      const result = await new SearchFriends(friendshipRepository).execute(
        query,
      );

      if (!cancelled) {
        setResponse({ query, result });
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [query, syncKey, friendshipRepository]);

  const current = query && response?.query === query ? response.result : null;

  let status: FriendSearchStatus = "idle";
  if (query) {
    status = !current ? "searching" : current.success ? "done" : "error";
  }

  return {
    value,
    updateValue: (next: string) => setValue(sanitizeFriendSearchInput(next)),
    status,
    results: current?.success ? current.data : [],
    error: current && !current.success ? current.error : null,
  };
}
