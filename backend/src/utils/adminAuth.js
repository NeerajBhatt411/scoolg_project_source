import { School } from '../../models/School.js';
import { StaffUser } from '../../models/StaffUser.js';

// Find an admin-side account (school owner OR staff sub-user) by email.
export const findAdminAccountByEmail = async (email) => {
    const school = await School.findOne({ $or: [{ email }, { "formData.email": email }] });
    if (school) return { account: school, kind: 'owner' };
    const staff = await StaffUser.findOne({ email });
    if (staff) return { account: staff, kind: 'staff' };
    return { account: null, kind: null };
};

// Resolve the School document for the authenticated admin/staff request.
export const schoolFromReq = async (req) => {
    const sid = req.user?.schoolId || req.user?.id;
    if (!sid) return null;
    return School.findOne({ id: sid });
};

// Readable temp password, e.g. "Scoolg@4821"
export const genPassword = () => {
    const n = (Math.floor(Date.now() % 9000) + 1000);
    return `Scoolg@${n}`;
};
