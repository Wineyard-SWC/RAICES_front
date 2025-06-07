// src/utils/avatarApi.ts

import { print } from "../debugLogger";

interface RegisterUserPayload {
  firebase_id: string;
  name: string;
  avatar_url: string | null;
  gender?: string | null;
}

export async function registerAvatarUser({
  firebase_id,
  name,
  avatar_url = null,
  gender = null,
}: RegisterUserPayload): Promise<{ id: number; created_at: string }> {
    print("Registering user in Avatar API:", {
      firebase_id,
      name,
      avatar_url,
      gender,
    });

    const res = await fetch(
    `${process.env.NEXT_PUBLIC_AVATAR_API}/users/signin`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firebase_id, name, avatar_url, gender }),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    console.error("Error registering user in Avatar API:", err);
    throw new Error(`Avatar API error (${res.status}): ${err}`);
  }

  return res.json();
}

