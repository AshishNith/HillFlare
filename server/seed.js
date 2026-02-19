/**
 * Seed script: inserts 10 realistic fake users into the campusconnect DB.
 * Run with:  node seed.js
 */

const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://localhost:27017/hillflare';

const userSchema = new mongoose.Schema(
    {
        name: { type: String, default: '' },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        collegeId: { type: String, default: '' },
        department: { type: String, default: '' },
        year: { type: Number, default: 1 },
        interests: [{ type: String }],
        clubs: [{ type: String }],
        photos: [{ type: String }],
        bio: { type: String, default: '' },
        avatar: { type: String, default: '' },
        isSuspended: { type: Boolean, default: false },
        role: { type: String, enum: ['user', 'admin'], default: 'user' },
        isVerified: { type: Boolean, default: true },
        isProfileComplete: { type: Boolean, default: true },
        otp: { type: String },
        otpExpiresAt: { type: Date },
        refreshToken: { type: String },
        blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        reportCount: { type: Number, default: 0 },
    },
    { timestamps: true }
);

const User = mongoose.model('User', userSchema);

const users = [
    {
        name: 'Aanya Sharma',
        email: 'aanya.sharma@college.edu',
        collegeId: 'CS2021001',
        department: 'Computer Science',
        year: 3,
        interests: ['Photography', 'Hiking', 'Machine Learning', 'Coffee'],
        clubs: ['Photography Club', 'AI Club'],
        bio: 'CS junior obsessed with ML and sunsets. Always up for a chai and good conversation.',
        avatar: '',
        photos: [],
    },
    {
        name: 'Rohan Mehta',
        email: 'rohan.mehta@college.edu',
        collegeId: 'ME2022015',
        department: 'Mechanical Engineering',
        year: 2,
        interests: ['Football', 'Gaming', 'Music', 'Cooking'],
        clubs: ['Football Team', 'Music Club'],
        bio: 'Mech student who builds things by day and plays guitar by night. Big foodie.',
        avatar: '',
        photos: [],
    },
    {
        name: 'Priya Nair',
        email: 'priya.nair@college.edu',
        collegeId: 'EC2020008',
        department: 'Electronics & Communication',
        year: 4,
        interests: ['Dance', 'Robotics', 'Travel', 'Reading'],
        clubs: ['Dance Society', 'Robotics Club'],
        bio: 'Final year ECE. Dancer at heart, engineer by degree. Let\'s grab coffee!',
        avatar: '',
        photos: [],
    },
    {
        name: 'Arjun Kapoor',
        email: 'arjun.kapoor@college.edu',
        collegeId: 'CS2023042',
        department: 'Computer Science',
        year: 1,
        interests: ['Coding', 'Basketball', 'Anime', 'Sketching'],
        clubs: ['Coding Club', 'Basketball Team'],
        bio: 'Fresher figuring out college life. Anime nerd and weekend coder.',
        avatar: '',
        photos: [],
    },
    {
        name: 'Sneha Iyer',
        email: 'sneha.iyer@college.edu',
        collegeId: 'BT2021019',
        department: 'Biotechnology',
        year: 3,
        interests: ['Yoga', 'Painting', 'Research', 'Baking'],
        clubs: ['Fine Arts Club', 'Science Society'],
        bio: 'Biotech student, part-time artist, full-time chai addict. Love deep talks.',
        avatar: '',
        photos: [],
    },
    {
        name: 'Vikram Singh',
        email: 'vikram.singh@college.edu',
        collegeId: 'CE2022033',
        department: 'Civil Engineering',
        year: 2,
        interests: ['Cricket', 'Architecture', 'Movies', 'Trekking'],
        clubs: ['Cricket Team', 'Film Club'],
        bio: 'Civil engineer who dreams of building cities. Cricket on weekends, movies on weeknights.',
        avatar: '',
        photos: [],
    },
    {
        name: 'Kavya Reddy',
        email: 'kavya.reddy@college.edu',
        collegeId: 'CS2020005',
        department: 'Computer Science',
        year: 4,
        interests: ['UI/UX Design', 'Cycling', 'Podcasts', 'Cooking'],
        clubs: ['Design Club', 'Cycling Club'],
        bio: 'Senior dev with a design eye. Building cool things and cycling on weekends.',
        avatar: '',
        photos: [],
    },
    {
        name: 'Ishaan Verma',
        email: 'ishaan.verma@college.edu',
        collegeId: 'PH2023011',
        department: 'Physics',
        year: 1,
        interests: ['Astronomy', 'Guitar', 'Chess', 'Running'],
        clubs: ['Astronomy Club', 'Music Club'],
        bio: 'Physics fresher who stares at stars and strums guitar. Chess at midnight.',
        avatar: '',
        photos: [],
    },
    {
        name: 'Meera Joshi',
        email: 'meera.joshi@college.edu',
        collegeId: 'MA2021027',
        department: 'Mathematics',
        year: 3,
        interests: ['Puzzles', 'Swimming', 'Writing', 'Badminton'],
        clubs: ['Quiz Club', 'Swimming Team'],
        bio: 'Math major who loves puzzles and prose. Badminton in the morning, writing at night.',
        avatar: '',
        photos: [],
    },
    {
        name: 'Dev Patel',
        email: 'dev.patel@college.edu',
        collegeId: 'CS2022038',
        department: 'Computer Science',
        year: 2,
        interests: ['Startups', 'Gym', 'Photography', 'Travel'],
        clubs: ['Entrepreneurship Cell', 'Photography Club'],
        bio: 'CS sophomore building my first startup. Gym rat, travel junkie, always hustling.',
        avatar: '',
        photos: [],
    },
];

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        let inserted = 0;
        let skipped = 0;

        for (const userData of users) {
            const existing = await User.findOne({ email: userData.email });
            if (existing) {
                console.log(`⏭  Skipped (already exists): ${userData.name}`);
                skipped++;
                continue;
            }
            await User.create({ ...userData, isVerified: true, isProfileComplete: true });
            console.log(`✅ Created: ${userData.name} (${userData.department}, Year ${userData.year})`);
            inserted++;
        }

        console.log(`\n🎉 Done! ${inserted} users inserted, ${skipped} skipped.`);
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

seed();
