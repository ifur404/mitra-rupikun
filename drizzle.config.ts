
import type { Config } from 'drizzle-kit';

import fs from "fs";
import path from "path";

const getLocalD1 = () => {
  try {
    const basePath = path.resolve('.wrangler');
    const files = fs
      .readdirSync(basePath, { encoding: 'utf-8', recursive: true })
      .filter((f) => f.includes("d1") && f.endsWith('.sqlite'));

    if (files.length === 0) {
      throw new Error(`No .sqlite files found in ${basePath}`);
    }

    // Get the latest file based on modified time
    const latestFile = files
      .map((file) => {
        const filePath = path.join(basePath, file);
        const stats = fs.statSync(filePath);
        return { file, mtime: stats.mtime };
      })
      .sort((a, b) => b.mtime.getTime() - a.mtime.getTime())[0].file;

    const url = path.resolve(basePath, latestFile);
    return url;
  } catch (err) {
    console.log(`Error  ${err}`);
  }
}

const isProd = () => process.env.NODE_ENV === 'production'

const getCredentials = () => {
  const prod = {
    driver: 'd1-http',
    dbCredentials: {
      accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
      databaseId: process.env.CLOUDFLARE_DATABASE_ID!,
      token: process.env.CLOUDFLARE_TOKEN!,
    }

  }

  const dev = {
    dbCredentials: {
      url: getLocalD1()
    }
  }
  return isProd() ? prod : dev

}

export default {
  schema: './app/drizzle/schema.ts',
  out: './app/drizzle/migrations',
  dialect: 'sqlite',
  ...getCredentials()
} satisfies Config;