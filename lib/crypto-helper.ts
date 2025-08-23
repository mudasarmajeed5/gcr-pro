import crypto from "crypto";

const key = crypto.scryptSync(process.env.ENCRYPTION_SECRET!, "salt", 32);
const algo = "aes-256-cbc";

export const encrypt = (text: string) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algo, key, iv);
  return iv.toString("hex") + ":" + cipher.update(text, "utf8", "hex") + cipher.final("hex");
};

export const decrypt = (data: string) => {
  const [ivHex, content] = data.split(":");
  const decipher = crypto.createDecipheriv(algo, key, Buffer.from(ivHex, "hex"));
  return decipher.update(content, "hex", "utf8") + decipher.final("utf8");
};
