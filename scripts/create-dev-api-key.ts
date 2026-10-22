import { prisma } from "../src/lib/prisma"
import { writeFile, readFile } from "node:fs/promises"
import path from "node:path"
import { randomBytes, createHash } from "node:crypto"

const generateApiKey = (): string => {
    const secret = randomBytes(32).toString("base64url");
    return `wt_dev_${secret}`;
};

const hashApiKey = (apiKey: string): string => {
    return createHash("sha256").update(apiKey).digest("hex");
};

const envPath = path.resolve(process.cwd(), ".env");

const getEnvValue = async (key: string): Promise<string | undefined> => {
    const envContents = await readFile(envPath, "utf8");

    const line = envContents.split(/\r?\n/).find((line) => line.startsWith(`${key}=`));

    return line?.slice(key.length + 1).trim();
};

const getOrCreateDevOwner = async (): Promise<string> => {
    const existingOwnerId = await getEnvValue("DEV_API_KEY_OWNER_ID");
  
  if (existingOwnerId) {
    const owner = await prisma.apiKeyOwner.findUnique({
      where: { id: existingOwnerId },
    });

    if (!owner) {
      throw new Error(
      "DEV_API_KEY_OWNER_ID exists in .env, but no matching owner exists in the database.",
    );
  }

    return owner.id;
  }

  const owner = await prisma.apiKeyOwner.create({
    data: {},
  });

  const currentEnv = await readFile(envPath, "utf8");
  const separator = currentEnv.endsWith("\n") ? "" : "\n";

  await writeFile(
    envPath,
    `${currentEnv}${separator}DEV_API_KEY_OWNER_ID=${owner.id}\n`,
    "utf8",
  );

  return owner.id;
};

const createDevApiKey = async (ownerId: string): Promise<string> => {
  const apiKey = generateApiKey();
  const keyHash = hashApiKey(apiKey);

  await prisma.apiKey.create({
    data: {
      ownerId,
      name: "Development API Key",
      keyHash,
    },
  });

  return apiKey;
};

const hasActiveDevApiKey = async (ownerId: string): Promise<boolean> => {
    const existingKey = await prisma.apiKey.findFirst({
        where: {
            ownerId,
            name:"Development API Key",
            revokedAt: null,
            OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
    });

    return existingKey !== null;
}

const main = async (): Promise<void> => {
    const ownerId = await getOrCreateDevOwner();
    const createNew = process.argv.includes("--new");
  
    if (!createNew && (await hasActiveDevApiKey(ownerId))) {
      console.log(
        "An active development API key already exists. Use --new to create another.",
      );
      return;
    }
  
    const apiKey = await createDevApiKey(ownerId);
  
    console.log("\nDevelopment API key created:\n");
    console.log(apiKey);
    console.log(
      "\nSave this key securely. It cannot be recovered from the database.",
    );
  };
    
main()
  .catch((error: unknown) => {
    console.error("Failed to create development API key:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });