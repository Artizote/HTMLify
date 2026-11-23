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
        case "count": return `${value} registered users.`;
      }
      break;
    }

    case "blob": {
      switch (field) {
        case "count": return `${value} blobs hosted and counting.`;
        case "size": return `${value} of blob storage in use.`;
      }
      break;
    }

    case "file": {
      switch (field) {
        case "count": return `${value} files hosted.`;
        case "size": return `${value} of files hosted.`;
        case "hits": return `${value} file requests served.`;
      }
      break;
    }

    case "pen": {
      switch (field) {
        case "count": return `${value} pens created and shared.`;
        case "hits": return `${value} pen views served.`;
      }
      break;
    }

    case "shortlink": {
      switch (field) {
        case "count": return `${value} links shortened.`;
        case "hits": return `${value} shortlink redirects served.`;
      }
      break;
    }

    case "tmpfile": {
      switch (field) {
        case "count": return `${value} temporary files currently stored.`;
        case "size": return `${value} size of Temp Files.`;
      }
      break;
    }

    case "tmpfolder": {
      switch (field) {
        case "count": return `${value} temporary folders in use.`;
      }
      break;
    }
  }

  return "Hosting and serving.";
}
