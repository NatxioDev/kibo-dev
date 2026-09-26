"use client";

import { useEffect, useState } from "react";
import { searchFriendsAction } from "@/features/friends/actions/searchFriends.action";
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
  const [value, setValue] = useState("");
  const [response, setResponse] = useState<SearchResponse | null>(null);

  const parsed = friendSearchSchema.safeParse(value);
  const query = parsed.success ? parsed.data : null;

  useEffect(() => {
    if (!query) return;

    let cancelled = false;
    const timeout = setTimeout(async () => {
      // Llamar al server action en lugar del repositorio del cliente
      const result = await searchFriendsAction(query);

      if (!cancelled) {
        setResponse({ query, result });
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [query, syncKey]);

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
