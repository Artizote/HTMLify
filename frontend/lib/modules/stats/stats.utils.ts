import { getResourceStats } from "@/lib/modules/stats/stats.api"
import { formatCount, formatHits, formatSize } from "@/lib/utils/format"


async function getRandomStats() {
  let statsResources = [ "user", "blob", "file", "pen", "shortlink", "tmpfile", "tmpfolder" ];
  let resource = statsResources[Math.floor(Math.random() * statsResources.length)];
  let stats = await getResourceStats(resource);
  return {resource, stats};
}

export async function getRandomStatsInsightLine() {
  let { resource, stats } = await getRandomStats();

  if (!stats?.data) {
    return "Hosting for serving.";
  }

  let data = stats.data;
  let fields = Object.keys(data);
  let field = fields[Math.floor(Math.random() * fields.length)];
  let value = data[field];

  switch (field)  {
    case "count": value = formatCount(value); break;
    case "size":  value = formatSize(value);  break;
    case "hits":  value = formatHits(value);  break;
  }

  switch (resource) {
    case "user": {
      switch (field) {
        case "count": return `${value} registered Users.`;
      }
      break;
    }

    case "blob": {
      switch (field) {
        case "count": return `Hosting ${value} Blobs.`;
        case "size": return `${value} size of Blobs hosted.`;
      }
      break;
    }

    case "file": {
      switch (field) {
        case "count": return `${value} Files are hosted live.`;
        case "size": return `${value} of Files hosted.`;
        case "hits": return `${value} File hits.`;
      }
      break;
    }

    case "pen": {
      switch (field) {
        case "count": return `${value} Pens created.`;
        case "hits": return `${value} Pen hits.`;
      }
      break;
    }

    case "shortlink": {
      switch (field) {
        case "count": return `${value} Shortened Links.`;
        case "hits": return `${value} Shortlink hits.`;
      }
      break;
    }

    case "tmpfile": {
      switch (field) {
        case "count": return `Currently ${value} Temp Files.`;
        case "size": return `${value} size of Temp Files.`;
      }
      break;
    }

    case "tmpfolder": {
      switch (field) {
        case "count": return `Currently ${value} Temp Folders.`;
      }
      break;
    }
  }

  return "Hosting and serving.";
}
