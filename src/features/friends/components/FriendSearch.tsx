"use client";

import { Alert } from "@/components/ui/Alert";
import { ListGroup } from "@/components/ui/ListGroup";
import { labelClassName } from "@/components/ui/Field";
import { FriendSearchResultItem } from "@/features/friends/components/FriendSearchResultItem";
import { useFriendSearch } from "@/features/friends/hooks/useFriendSearch";
import { FRIEND_SEARCH_MIN_LENGTH } from "@/features/friends/schemas/friendSearchSchema";

type FriendSearchProps = {
  syncKey: string;
};

export function FriendSearch({ syncKey }: FriendSearchProps) {
  const { value, updateValue, status, results, error } =
    useFriendSearch(syncKey);

  let hint = `Escribe al menos ${FRIEND_SEARCH_MIN_LENGTH} caracteres de su @username.`;
  if (status === "searching") {
    hint = "Buscando…";
  } else if (status === "done") {
    hint =
      results.length === 0
        ? "No encontramos a nadie con ese @username. Revisa cómo lo escribiste."
        : `${results.length} ${results.length === 1 ? "resultado" : "resultados"}`;
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="friend-search" className={`px-1 ${labelClassName}`}>
          Buscar amigos
        </label>
        <div className="glass flex h-12 w-full items-center rounded-2xl border border-border bg-surface px-4 shadow-card transition-colors focus-within:ring-2 focus-within:ring-primary/50">
          <span aria-hidden className="text-base font-semibold text-muted-foreground">
            @
          </span>
          <input
            id="friend-search"
            name="friend-search"
            type="search"
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="search"
            value={value}
            onChange={(event) => updateValue(event.target.value)}
            placeholder="juan_perez…"
            aria-describedby="friend-search-hint"
            className="h-full w-full bg-transparent pl-0.5 text-base text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-none"
          />
        </div>
        <p
          id="friend-search-hint"
          aria-live="polite"
          className="min-h-5 px-1 text-sm text-muted-foreground"
        >
          {hint}
        </p>
      </div>

      {status === "error" && error ? <Alert>{error}</Alert> : null}

      {results.length > 0 ? (
        <ListGroup>
          {results.map((result) => (
            <FriendSearchResultItem key={result.profile.id} result={result} />
          ))}
        </ListGroup>
      ) : null}
    </section>
  );
}
