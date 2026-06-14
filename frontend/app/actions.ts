"use server";

export async function fetchPlaylist(url: string) {
  try {
    const parsedUrl = new URL(url);

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      throw new Error("Invalid protocol: Only HTTP and HTTPS are allowed");
    }

    const response = await fetch(parsedUrl.toString(), {
      method: 'GET',
      headers: {
        'User-Agent': 'VLC/3.0.20 LibVLC/3.0.20',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.text();
    return { success: true, data };
  } catch (error) {
    if (error instanceof Error) {
      console.error("Fetch error:", error);
      return { success: false, error: `Fetch failed: ${error.message}` };
    }

    console.error("Fetch error (unknown):", error);
    return { success: false, error: "Fetch failed: Unknown error" };
  }
}

export async function fetchEpg(url: string) {
  try {
    const parsedUrl = new URL(url);

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      throw new Error("Invalid protocol: Only HTTP and HTTPS are allowed");
    }

    const response = await fetch(parsedUrl.toString(), {
      method: 'GET',
      headers: {
        'User-Agent': 'VLC/3.0.20 LibVLC/3.0.20',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.text();
    return { success: true, data };
  } catch (error) {
    if (error instanceof Error) {
      console.error("EPG fetch error:", error);
      return { success: false, error: `EPG fetch failed: ${error.message}` };
    }

    console.error("EPG fetch error (unknown):", error);
    return { success: false, error: "EPG fetch failed: Unknown error" };
  }
}
