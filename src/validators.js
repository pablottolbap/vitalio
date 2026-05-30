export const splitList = (value) =>
  value.split(',').map((s) => s.trim()).filter(Boolean);

export const validateVideoUrl = (url) => {
  if (!url.startsWith('https://www.youtube.com/watch?v=')) {
    return 'Invalid format. Expected: https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  }
  const videoId = url.substring('https://www.youtube.com/watch?v='.length);
  if (!videoId || videoId.length < 11) {
    return 'Invalid format. Expected: https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  }
  return null;
};

export const validateChannelUrl = (url) => {
  if (!url.startsWith('https://www.youtube.com/@')) {
    return 'Invalid format. Expected: https://www.youtube.com/@ChannelName';
  }
  const channelName = url.substring('https://www.youtube.com/@'.length);
  if (!channelName) {
    return 'Invalid format. Expected: https://www.youtube.com/@ChannelName';
  }
  return null;
};
