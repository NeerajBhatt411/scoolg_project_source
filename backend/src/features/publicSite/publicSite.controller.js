import { School } from '../../../models/School.js';
import { slugify } from '../../utils/slug.js';

// Public, no-auth: a school's website data by its subdomain slug.
// e.g. GET /api/public/school/gajera  ->  { slug, name, logo, campusCode, formData }
export const getPublicSchool = async (req, res) => {
    try {
        const slug = (req.params.slug || '').toLowerCase().trim();
        if (!slug) return res.status(400).json({ error: 'slug required' });

        // 1) Fast path: a stored slug (new onboards have this).
        let school = await School.findOne({ slug }).lean();

        // 2) Fallback for existing schools without a stored slug: match by the
        //    slugified school name. (Lets gajera.scoolg.com work immediately.)
        if (!school) {
            const all = await School.find({ status: 'COMPLETED' })
                .select('id slug campusCode formData')
                .lean();
            school = all.find((s) => slugify(s.formData?.schoolName) === slug) || null;
        }

        if (!school) return res.status(404).json({ error: 'School not found' });

        const fd = school.formData || {};
        res.json({
            slug: school.slug || slug,
            campusCode: school.campusCode || '',
            name: fd.schoolName || '',
            logo: fd.logo || fd.schoolLogo || '',
            formData: fd,
        });
    } catch (err) {
        console.error('public school error:', err);
        res.status(500).json({ error: 'Failed to load school' });
    }
};
