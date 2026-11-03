const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');

ffmpeg.setFfmpegPath(ffmpegPath);

const tmpFile = (ext) => path.join(os.tmpdir(), `khan-${crypto.randomBytes(8).toString('hex')}.${ext}`);

const STICKER_FILTER =
  "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,pad=320:320:-1:-1:color=white@0.0";

const convert = (input, output, extraOptions) =>
  new Promise((resolve, reject) => {
    ffmpeg(input)
      .on('error', reject)
      .on('end', () => resolve(true))
      .addOutputOptions(['-vcodec', 'libwebp', ...extraOptions, '-loop', '0', '-preset', 'default', '-an', '-vsync', '0'])
      .toFormat('webp')
      .save(output);
  });

/**
 * Convert an image buffer to a WhatsApp-compatible WebP sticker buffer.
 */
async function imageToWebp(buffer) {
  const input = tmpFile('img');
  const output = tmpFile('webp');
  try {
    fs.writeFileSync(input, buffer);
    await convert(input, output, ['-vf', STICKER_FILTER]);
    return await fs.promises.readFile(output);
  } finally {
    await fs.promises.unlink(input).catch(() => {});
    await fs.promises.unlink(output).catch(() => {});
  }
}

/**
 * Convert a short video/GIF buffer to an animated WebP sticker buffer.
 */
async function videoToWebp(buffer) {
  const input = tmpFile('mp4');
  const output = tmpFile('webp');
  try {
    fs.writeFileSync(input, buffer);
    await convert(input, output, ['-vf', `${STICKER_FILTER},fps=15`, '-ss', '00:00:00', '-t', '00:00:05']);
    return await fs.promises.readFile(output);
  } finally {
    await fs.promises.unlink(input).catch(() => {});
    await fs.promises.unlink(output).catch(() => {});
  }
}

const isVideo = (mime = '') => String(mime).startsWith('video/') || mime === 'image/gif';

/**
 * Turn a media buffer into a WebP sticker buffer.
 * Accepts either a Buffer or a { data, mimetype } object.
 */
async function writeExif(media = {}, metadata = {}) {
  const data = Buffer.isBuffer(media) ? media : media.data;
  const mime = Buffer.isBuffer(media) ? '' : media.mimetype || '';
  if (!data) throw new Error('writeExif: no media buffer provided');
  if (mime === 'image/webp') return data;
  return isVideo(mime) ? videoToWebp(data) : imageToWebp(data);
}

const writeExifImg = (data) => writeExif({ data, mimetype: 'image/png' });
const writeExifVid = (data) => writeExif({ data, mimetype: 'video/mp4' });

/**
 * Human readable size for a buffer.
 */
function getSizeMedia(data) {
  const bytes = Buffer.isBuffer(data) ? data.length : (data && data.length) || 0;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

module.exports = {
  imageToWebp,
  videoToWebp,
  writeExif,
  writeExifImg,
  writeExifVid,
  getSizeMedia,
};
