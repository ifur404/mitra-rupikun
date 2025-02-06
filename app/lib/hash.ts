import { createHash } from "node:crypto";

interface HashOptions {
  length?: number;
  encoding?: "hex" | "base64";
}

export class HashGenerator {
  private readonly salt: string;
  private static readonly DEFAULT_LENGTH = 8;
  private static readonly DEFAULT_ENCODING: "hex" | "base64" = "hex";

  constructor(salt: string) {
    if (!salt || salt.length < 1) {
      throw new Error("Salt must be provided and non-empty");
    }
    this.salt = salt;
  }

  /**
   * Generates a hash from an ID
   */
  createHash(id: string | number, options: HashOptions = {}): string {
    const { length = HashGenerator.DEFAULT_LENGTH, encoding = HashGenerator.DEFAULT_ENCODING } =
      options;

    const input = `${id}${this.salt}`;
    const hash = createHash("sha256").update(input).digest(encoding);

    return length ? hash.slice(0, length) : hash;
  }

  /**
   * Generates a unique identifier with timestamp
   */
  createTimeBasedHash(id: string | number, options: HashOptions = {}): string {
    const timestamp = Date.now();
    return this.createHash(`${id}-${timestamp}`, options);
  }

  /**
   * Creates a URL-friendly hash
   */
  createUrlFriendlyHash(
    id: string | number,
    options: { length?: number } = {}
  ): string {
    const { length = HashGenerator.DEFAULT_LENGTH } = options;
    const ALPHABET =
      "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

    const hash = createHash("sha256")
      .update(`${id}${this.salt}`)
      .digest("hex");

    let result = "";
    const baseLength = ALPHABET.length;

    for (let i = 0; i < length; i++) {
      const index = parseInt(hash.substr(i * 2, 2), 16) % baseLength;
      result += ALPHABET[index];
    }

    return result;
  }
}