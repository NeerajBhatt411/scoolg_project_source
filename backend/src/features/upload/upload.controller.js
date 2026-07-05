import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, s3Enabled, s3Bucket, s3Region } from '../../config/s3.js';
import { cloudinary } from '../../config/cloudinary.js';

// Map common mime types to a file extension for the S3 object key.
const EXT = {
    'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/png': 'png', 'image/webp': 'webp',
    'image/gif': 'gif', 'image/svg+xml': 'svg', 'image/avif': 'avif', 'application/pdf': 'pdf',
};

// Normalise the frontend "folder" label into a clean category folder so every
// school's bucket looks like <school>/<category>/ (logo, cover, gallery, ...).
const CATEGORY = {
    logos: 'logo', logo: 'logo', cover: 'cover', gallery: 'gallery', leadership: 'leadership',
    teachers: 'teacher', teacher: 'teacher', students: 'student', student: 'student',
    homework: 'homework', posts: 'posts', post: 'posts',
};

// A short, clean school folder from the school name's first word (matches the
// migrated layout, e.g. "Gajera International School" -> "gajera"). If the caller
// passes the exact website `slug`, that wins (e.g. "ptgpnayak").
const firstWordSlug = (name) => String(name || '').trim().toLowerCase().split(/\s+/)[0].replace(/[^a-z0-9]/g, '');

export const postUpload = async (req, res) => {
    try {
        const { file, folder, schoolName, slug } = req.body;
        if (!file) return res.status(400).json({ error: "No file provided" });

        const rawFolder = String(folder || 'uploads').toLowerCase().trim();
        const category = CATEGORY[rawFolder] || rawFolder.replace(/[^a-z0-9-]/g, '') || 'uploads';
        const schoolFolder = (slug ? String(slug).toLowerCase().replace(/[^a-z0-9-]/g, '') : '')
            || firstWordSlug(schoolName) || 'school';

        // --- AWS S3 (default when configured) ---
        if (s3Enabled) {
            // Frontend sends a data URI: "data:<mime>;base64,<data>".
            const m = /^data:([^;]+);base64,(.+)$/s.exec(file);
            const contentType = m ? m[1] : 'application/octet-stream';
            const buffer = Buffer.from(m ? m[2] : file, 'base64');
            const ext = EXT[contentType] || 'bin';
            const key = `${schoolFolder}/${category}/${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;

            await s3Client.send(new PutObjectCommand({
                Bucket: s3Bucket,
                Key: key,
                Body: buffer,
                ContentType: contentType,
                // No ACL: bucket has "Bucket owner enforced"; public read is granted
                // by the bucket policy, not per-object ACLs.
            }));

            const url = `https://${s3Bucket}.s3.${s3Region}.amazonaws.com/${key}`;
            return res.json({ url, publicId: key, type: (contentType.split('/')[0] || 'raw'), format: ext });
        }

        // --- Cloudinary fallback (kept so we can revert instantly if needed) ---
        const targetFolder = `scoolg/${schoolFolder}/${category}`;
        const result = await cloudinary.uploader.upload(file, {
            folder: targetFolder,
            resource_type: 'auto', // supports images + pdf + raw
        });
        res.json({
            url: result.secure_url,
            publicId: result.public_id,
            type: result.resource_type,
            format: result.format,
        });
    } catch (err) {
        console.error("Upload error:", err);
        res.status(500).json({ error: err.message || "Upload failed" });
    }
};
