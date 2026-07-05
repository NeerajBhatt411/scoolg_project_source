import mongoose from 'mongoose';

// Singleton config for the single platform super-admin account. Lets the
// super-admin change their password from the Settings page and have it persist.
// Login checks this hash first and falls back to the SUPERADMIN_PASSWORD env
// (the bootstrap credential) when no hash has been set yet.
const SuperAdminConfigSchema = new mongoose.Schema({
    key: { type: String, default: 'default', unique: true },
    passwordHash: { type: String, default: '' },
}, { timestamps: true });

export const SuperAdminConfig = mongoose.models.SuperAdminConfig || mongoose.model('SuperAdminConfig', SuperAdminConfigSchema);
export default SuperAdminConfig;
