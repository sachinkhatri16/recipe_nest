const crypto = require("crypto");

// Ideally this should be a 64-character hex string in .env: process.env.ENCRYPTION_KEY
// Fallback: scrypt generated key from JWT_SECRET
const secretKey = process.env.ENCRYPTION_KEY 
  ? Buffer.from(process.env.ENCRYPTION_KEY, "hex")
  : crypto.scryptSync(process.env.JWT_SECRET || "fallback_secret", "salt", 32);

const ALGORITHM = "aes-256-cbc";

const encrypt = (text) => {
  if (!text) return text;
  
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, secretKey, iv);
  
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  return `${iv.toString("hex")}:${encrypted}`;
};

const decrypt = (encryptedText) => {
  if (!encryptedText) return encryptedText;
  if (!encryptedText.includes(':')) return encryptedText; // Probably plain text, legacy

  try {
    const [ivHex, encryptedHex] = encryptedText.split(":");
    const iv = Buffer.from(ivHex, "hex");
    
    const decipher = crypto.createDecipheriv(ALGORITHM, secretKey, iv);
    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");
    
    return decrypted;
  } catch (err) {
    console.error("Decryption failed:", err);
    return "Error decrypting data";
  }
};

module.exports = { encrypt, decrypt };
