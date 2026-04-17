const mongoose = require('mongoose');

// ── Fallback URI to bypass SRV completely ─────────────────────────────────
// When networks block DNS SRV (yielding ECONNREFUSED on querySrv),
// we must use a direct 'mongodb://' connection string instead of 'mongodb+srv://'.

const connectDB = async () => {
  const originalUri = process.env.MONGO_URI;

  // ── Attempt 1: Standard SRV ──────────────────────────────────────────────
  try {
    const conn = await mongoose.connect(originalUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 30000,
    });
    console.log(`✅ MongoDB Connected (SRV): ${conn.connection.host}`);
    return;
  } catch (err1) {
    console.warn(`⚠️  SRV DNS failed (Reason: ${err1.message}). Enabling direct connection fallback...`);
  }

  // ── Attempt 2: Direct connection (Bypasses SRV lookup) ───────────────────
  // We extract credentials and build a direct mongodb:// URI with Atlas shards.
  try {
    const match = originalUri.match(/mongodb\+srv:\/\/([^@]+)@([^/?]+)\/([^?]+)/);
    if (!match) throw new Error("Could not parse SRV URI");

    const credentials = match[1]; // user:pass
    const clusterPart = match[2]; // cluster0.hz2i38u.mongodb.net
    const dbName = match[3];      // TruthifyDB

    // Standard Atlas Clusters follow this shard naming convention. 
    // We try to connect to the common shards directly.
    const shards = [
      `ac-p1clpqc-shard-00-00.hz2i38u.mongodb.net:27017`,
      `ac-p1clpqc-shard-00-01.hz2i38u.mongodb.net:27017`,
      `ac-p1clpqc-shard-00-02.hz2i38u.mongodb.net:27017`
    ].join(',');

    const directUri = `mongodb://${credentials}@${shards}/${dbName}?ssl=true&authSource=admin&retryWrites=true&w=majority`;

    console.log(`🔌 Attempting Direct Connection to Shards...`);
    const conn = await mongoose.connect(directUri, {
        serverSelectionTimeoutMS: 8000,
        family: 4,
    });

    console.log(`✅ MongoDB Connected (Direct): ${conn.connection.host}`);
  } catch (err2) {
    console.error(`❌ FINAL DATABASE ERROR: ${err2.message}`);
    console.log('⚠️  BACKEND IS ACTIVE: Running WITHOUT MongoDB persistency.');
    console.log('   (History/Profile scans will be mocked in local memory only)');
  }
};

module.exports = connectDB;