import type { UserProfile } from "@/lib/firebase/firestore";

export interface UserSearchParams {
  query: string;
}

export interface UserSearchResult {
  uid: string;
  username: string;
  email: string;
}

class UserService {
  async search(params: UserSearchParams): Promise<UserSearchResult[]> {
    const url = new URL("/api/users/search", typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
    url.searchParams.set("q", params.query);

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${await this.getIdToken()}`,
      },
    });

    if (!res.ok) {
      throw new Error(`User search failed: ${res.status}`);
    }
    const contentType = res.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      throw new Error("Invalid response type");
    }
    const data = await res.json();
    return data.users || [];
  }

  private async getIdToken(): Promise<string> {
    const { auth } = await import("@/lib/firebase/config");
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");
    return user.getIdToken();
  }
}

export const userService = new UserService();

