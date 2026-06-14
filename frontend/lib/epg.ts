import { EpgChannel, EpgData, EpgProgramme } from "@/types";

export async function fetchEpg(url: string): Promise<{ success: boolean; data?: EpgData; error?: string }> {
  try {
    const { fetchEpg: fetchEpgAction } = await import("@/app/actions");
    const result = await fetchEpgAction(url);

    if (!result.success) {
      throw new Error(result.error || "Failed to fetch EPG data");
    }

    const text = result.data || "";

    try {
      const jsonData = JSON.parse(text);
      if (jsonData.channels && Array.isArray(jsonData.channels)) {
        const parsed = parseJsonEpg(jsonData);
        return { success: true, data: parsed };
      }
    } catch {
      // Not JSON, fall back to XMLTV parsing
    }

    if (!text.includes("<tv")) {
      throw new Error("Invalid EPG format. Missing XMLTV structure or valid JSON.");
    }

    const parsed = parseXmltv(text);
    return { success: true, data: parsed };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch EPG data",
    };
  }
}

const parseXmltv = (xmlText: string): EpgData => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "text/xml");

  const channels: EpgChannel[] = [];
  const programmes: EpgProgramme[] = [];

  const channelElements = xmlDoc.getElementsByTagName("channel");
  for (let i = 0; i < channelElements.length; i++) {
    const channelEl = channelElements[i];
    const id = channelEl.getAttribute("id");
    const displayName = channelEl.querySelector("display-name")?.textContent;

    if (id && displayName) {
      channels.push({
        id,
        displayName,
        programmes: [],
      });
    }
  }

  const programmeElements = xmlDoc.getElementsByTagName("programme");
  for (let i = 0; i < programmeElements.length; i++) {
    const progEl = programmeElements[i];
    const channel = progEl.getAttribute("channel");
    const start = progEl.getAttribute("start");
    const stop = progEl.getAttribute("stop");

    if (channel && start && stop) {
      const title = progEl.querySelector("title")?.textContent || "";
      const desc = progEl.querySelector("desc")?.textContent;
      const category = progEl.querySelector("category")?.textContent;

      programmes.push({
        channel,
        start: parseXmltvDate(start),
        stop: parseXmltvDate(stop),
        title,
        description: desc || undefined,
        category: category || undefined,
      });
    }
  }

  channels.forEach(channel => {
    channel.programmes = programmes.filter(prog => prog.channel === channel.id);
  });

  return {
    channels,
    generator: xmlDoc.querySelector("tv")?.getAttribute("generator-info-name") || undefined,
  };
};

function parseXmltvDate(dateStr: string): Date {
  const match = dateStr.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})\s*([+-]\d{4})?$/);
  if (!match) {
    throw new Error(`Invalid date format: ${dateStr}`);
  }

  const [, year, month, day, hour, minute, second, timezone] = match;
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute), parseInt(second));

  if (timezone) {
    const tzOffset = parseInt(timezone.substring(1, 3)) * 60 + parseInt(timezone.substring(3));
    const tzSign = timezone[0] === "+" ? 1 : -1;
    date.setMinutes(date.getMinutes() - tzSign * tzOffset);
  }

  return date;
}

function parseJsonEpg(jsonData: { channels: EpgChannel[]; generator?: string }): EpgData {
  const channels: EpgChannel[] = [];

  const validChannels = jsonData.channels.filter((channel: EpgChannel) => channel.programmes && channel.programmes.length > 0);

  for (const channelData of validChannels) {
    const programmes: EpgProgramme[] = [];

    if (channelData.programmes) {
      for (const progData of channelData.programmes) {
        programmes.push({
          channel: channelData.id || channelData.displayName || "",
          start: new Date(progData.start || Date.now()),
          stop: new Date(progData.stop || Date.now()),
          title: progData.title || "",
          description: progData.description,
          category: progData.category,
        });
      }
    }

    channels.push({
      id: channelData.id || channelData.displayName || "",
      displayName: channelData.displayName || channelData.id || "",
      programmes,
    });
  }

  return {
    channels,
    generator: jsonData.generator,
  };
}

export function getCurrentProgramme(channelName: string, epgData: EpgData): EpgProgramme | null {
  const channel = epgData.channels.find(ch => ch.displayName === channelName);
  if (!channel) return null;

  const now = new Date();
  return channel.programmes.find(prog => prog.start <= now && prog.stop > now) || null;
}

export function getNextProgramme(channelName: string, epgData: EpgData): EpgProgramme | null {
  const channel = epgData.channels.find(ch => ch.displayName === channelName);
  if (!channel) return null;

  const now = new Date();
  const futureProgrammes = channel.programmes.filter(prog => prog.start > now);
  return futureProgrammes.length > 0 ? futureProgrammes[0] : null;
}

export function getChannelDescription(channelName: string, epgData: EpgData): string | null {
  const channel = epgData.channels.find(ch => ch.displayName === channelName);
  if (!channel || channel.programmes.length === 0) return null;

  return channel.programmes[0].description || null;
}

export function formatProgrammeTime(programme: EpgProgramme): string {
  const startTime = programme.start.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const endTime = programme.stop.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${startTime} - ${endTime}`;
}
