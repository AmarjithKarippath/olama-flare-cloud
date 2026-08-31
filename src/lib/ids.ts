import { nanoid } from "nanoid";

const ID_PATTERN = /^[A-Za-z0-9_-]{10}$/;

export function createVideoId(): string {
  return nanoid(10);
}

export function isValidVideoId(id: string): boolean {
  return ID_PATTERN.test(id);
}
