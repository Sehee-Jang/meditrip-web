const DEFAULT_MAX_UPLOAD_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const rawLimit =
  process.env.NEXT_PUBLIC_UPLOAD_MAX_FILE_SIZE ??
  process.env.UPLOAD_MAX_FILE_SIZE;

const parsedLimit = rawLimit ? Number(rawLimit) : Number.NaN;

export const MAX_UPLOAD_FILE_SIZE =
  Number.isFinite(parsedLimit) && parsedLimit > 0
    ? parsedLimit
    : DEFAULT_MAX_UPLOAD_FILE_SIZE;

export const MAX_UPLOAD_FILE_SIZE_IN_MB =
  Math.round((MAX_UPLOAD_FILE_SIZE / (1024 * 1024)) * 10) / 10;

export const MAX_UPLOAD_FILE_SIZE_LABEL = Number.isInteger(
  MAX_UPLOAD_FILE_SIZE_IN_MB
)
  ? String(MAX_UPLOAD_FILE_SIZE_IN_MB)
  : MAX_UPLOAD_FILE_SIZE_IN_MB.toFixed(1);

export const FILE_TOO_LARGE_ERROR_CODE = "FILE_TOO_LARGE";
export const FILE_TOO_LARGE_ERROR_MESSAGE = `File size exceeds the ${MAX_UPLOAD_FILE_SIZE_LABEL}MB limit.`;
export const FILE_TOO_LARGE_TOAST_FALLBACK_MESSAGE = `Files must be ${MAX_UPLOAD_FILE_SIZE_LABEL}MB or smaller.`;
