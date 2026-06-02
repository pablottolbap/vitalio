export const splitList = (value) =>
  value.split(',').map((s) => s.trim()).filter(Boolean);

export const normalizeVideoUrl = (url) => {
  if (!url) {
    return { normalized: null, error: 'Invalid format. Expected: https://www.youtube.com/watch?v=dQw4w9WgXcQ or https://youtu.be/dQw4w9WgXcQ' };
  }

  let videoId = null;

  if (url.startsWith('https://youtu.be/')) {
    // Extract ID from youtu.be/ID[?params]
    const pathPart = url.substring('https://youtu.be/'.length).split('?')[0];
    videoId = pathPart;
  } else if (url.startsWith('https://www.youtube.com/watch?v=')) {
    // Extract ID from watch?v=ID[&params]
    const queryPart = url.substring('https://www.youtube.com/watch?v='.length);
    videoId = queryPart.split('&')[0];
  }

  if (!videoId || videoId.length < 11) {
    return { normalized: null, error: 'Invalid format. Expected: https://www.youtube.com/watch?v=dQw4w9WgXcQ or https://youtu.be/dQw4w9WgXcQ' };
  }

  return { normalized: `https://www.youtube.com/watch?v=${videoId}`, error: null };
};

export const normalizeChannelUrl = (url) => {
  if (!url) {
    return { normalized: null, error: 'Invalid format. Expected: https://www.youtube.com/@ChannelName' };
  }

  let handle = null;

  if (url.startsWith('https://www.youtube.com/@')) {
    // Extract handle from www variant
    const pathPart = url.substring('https://www.youtube.com/@'.length).split('?')[0];
    handle = pathPart;
  } else if (url.startsWith('https://youtube.com/@')) {
    // Extract handle from non-www variant
    const pathPart = url.substring('https://youtube.com/@'.length).split('?')[0];
    handle = pathPart;
  }

  if (!handle) {
    return { normalized: null, error: 'Invalid format. Expected: https://www.youtube.com/@ChannelName' };
  }

  return { normalized: `https://www.youtube.com/@${handle}`, error: null };
};

export const validateVideoUrl = (url) => {
  const result = normalizeVideoUrl(url);
  return result.error;
};

export const validateChannelUrl = (url) => {
  const result = normalizeChannelUrl(url);
  return result.error;
};
