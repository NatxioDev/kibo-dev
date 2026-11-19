import { describe, expect, it } from "vitest";
import { friendIdFromSearchParam } from "@/features/friends/domain/friendQuery";

const ID = "11111111-1111-4111-8111-111111111111";

describe("friendIdFromSearchParam", () => {
  it("acepta un uuid de amigo", () => {
    expect(friendIdFromSearchParam(ID)).toBe(ID);
    expect(friendIdFromSearchParam([ID])).toBe(ID);
  });

  it("ignora valores vacíos o que no son un uuid", () => {
    expect(friendIdFromSearchParam(undefined)).toBeNull();
    expect(friendIdFromSearchParam("")).toBeNull();
    expect(friendIdFromSearchParam("ana")).toBeNull();
    expect(friendIdFromSearchParam(["no"])).toBeNull();
  });
});
