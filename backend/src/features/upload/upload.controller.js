import { cloudinary } from '../../config/cloudinary.js';

export const postUpload = async (req, res) => {
    try {
        const { file, folder, schoolName } = req.body;
        if (!file) return res.status(400).json({ error: "No file provided" });

        const safeSchool = (schoolName || 'General').replace(/[^a-zA-Z0-9-_]/g, '_');
        const targetFolder = `scoolg/${safeSchool}/${folder || 'Uploads'}`;

        const result = await cloudinary.uploader.upload(file, {
            folder: targetFolder,
            resource_type: 'auto' // supports images + pdf + raw
        });

        res.json({
            url: result.secure_url,
            publicId: result.public_id,
            type: result.resource_type,
            format: result.format
        });
    } catch (err) {
        console.error("Upload error:", err);
        res.status(500).json({ error: err.message || "Upload failed" });
    }
};
