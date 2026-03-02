import { connectDb } from './config/db';
import { User } from './models/User';
import { College } from './models/College';

const seed = async (): Promise<void> => {
  await connectDb();

  // Create or get college
  let college = await College.findOne({ domain: 'example.com' });
  if (!college) {
    college = await College.create({
      name: 'University of Examples',
      domain: 'example.com',
    });
  }

  const collegeId = college._id.toString();

  await User.deleteMany({});
  await User.insertMany([
    {
      name: 'Aanya Sharma',
      email: 'aanya@example.com',
      collegeId,
      department: 'Computer Science',
      year: 3,
      bio: 'Design systems, chai, and late-night debates. Always curious.',
      interests: ['UI/UX', 'Debate', 'Travel'],
      clubs: ['Design Club'],
      lookingFor: 'Dating',
      gender: 'female',
      interestedIn: ['male'],
      avatarUrl: 'https://randomuser.me/api/portraits/women/1.jpg',
      galleryUrls: [
        'https://picsum.photos/400/600?random=101',
        'https://picsum.photos/400/600?random=102',
        'https://picsum.photos/400/600?random=103'
      ],
      verified: true,
    },
    {
      name: 'Rohan Mehta',
      email: 'rohan@example.com',
      collegeId,
      department: 'Electronics',
      year: 2,
      bio: 'Signal processing nerd. Weekend trekker. Coffee addict.',
      interests: ['Music', 'Trekking', 'Chess'],
      clubs: ['Music Society'],
      lookingFor: 'Friends',
      gender: 'male',
      interestedIn: ['female'],
      avatarUrl: 'https://randomuser.me/api/portraits/men/2.jpg',
      galleryUrls: [
        'https://picsum.photos/400/600?random=201',
        'https://picsum.photos/400/600?random=202',
        'https://picsum.photos/400/600?random=203',
        'https://picsum.photos/400/600?random=204'
      ],
      verified: true,
    },
    {
      name: 'Priya Patel',
      email: 'priya@example.com',
      collegeId,
      department: 'Mechanical',
      year: 4,
      bio: 'Motorsports enthusiast. Build, test, repeat. Espresso lover.',
      interests: ['Fitness', 'Coding', 'Photography'],
      clubs: ['Sports Club'],
      lookingFor: 'Dating',
      gender: 'female',
      interestedIn: ['male', 'female'],
      avatarUrl: 'https://randomuser.me/api/portraits/women/3.jpg',
      galleryUrls: [
        'https://picsum.photos/400/600?random=301',
        'https://picsum.photos/400/600?random=302'
      ],
      verified: true,
    },
    {
      name: 'Arjun Singh',
      email: 'arjun@example.com',
      collegeId,
      department: 'Computer Science',
      year: 1,
      bio: 'Freshman trying to figure out life. Loves gaming and anime.',
      interests: ['Gaming', 'Anime', 'Coding'],
      clubs: ['Coding Club'],
      lookingFor: 'Friends',
      gender: 'male',
      interestedIn: ['female'],
      avatarUrl: 'https://randomuser.me/api/portraits/men/4.jpg',
      galleryUrls: [
        'https://picsum.photos/400/600?random=401',
        'https://picsum.photos/400/600?random=402',
        'https://picsum.photos/400/600?random=403',
        'https://picsum.photos/400/600?random=404',
        'https://picsum.photos/400/600?random=405'
      ],
      verified: true,
    },
    {
      name: 'Meera Kapoor',
      email: 'meera@example.com',
      collegeId,
      department: 'Architecture',
      year: 3,
      bio: 'Sketching skylines and dreaming in blueprints. Tea > coffee.',
      interests: ['Art', 'Travel', 'Photography'],
      clubs: ['Design Club', 'Photography Club'],
      lookingFor: 'Dating',
      gender: 'female',
      interestedIn: ['male'],
      avatarUrl: 'https://randomuser.me/api/portraits/women/5.jpg',
      galleryUrls: [
        'https://picsum.photos/400/600?random=501',
        'https://picsum.photos/400/600?random=502',
        'https://picsum.photos/400/600?random=503'
      ],
      verified: true,
    },
    {
      name: 'Kabir Desai',
      email: 'kabir@example.com',
      collegeId,
      department: 'Civil Engineering',
      year: 2,
      bio: 'Part-time poet, full-time dreamer. Theatre kid at heart.',
      interests: ['Theatre', 'Reading', 'Music'],
      clubs: ['Drama Club', 'Debate Society'],
      lookingFor: 'Both',
      gender: 'male',
      interestedIn: ['female', 'non-binary'],
      avatarUrl: 'https://randomuser.me/api/portraits/men/6.jpg',
      galleryUrls: [
        'https://picsum.photos/400/600?random=601',
        'https://picsum.photos/400/600?random=602'
      ],
      verified: true,
    },
    {
      name: 'Ananya Reddy',
      email: 'ananya@example.com',
      collegeId,
      department: 'Biotechnology',
      year: 4,
      bio: 'Lab rat by day, dancer by night. Living life one experiment at a time.',
      interests: ['Dance', 'Cooking', 'Nature'],
      clubs: ['Music Society'],
      lookingFor: 'Dating',
      gender: 'female',
      interestedIn: ['male'],
      avatarUrl: 'https://randomuser.me/api/portraits/women/7.jpg',
      galleryUrls: [
        'https://picsum.photos/400/600?random=701',
        'https://picsum.photos/400/600?random=702',
        'https://picsum.photos/400/600?random=703',
        'https://picsum.photos/400/600?random=704'
      ],
      verified: true,
    },
    {
      name: 'Vivaan Joshi',
      email: 'vivaan@example.com',
      collegeId,
      department: 'Information Technology',
      year: 3,
      bio: 'Full-stack developer. Open source contributor. Hackathon junkie.',
      interests: ['Coding', 'Gaming', 'Music'],
      clubs: ['Coding Club', 'Entrepreneurship Cell'],
      lookingFor: 'Friends',
      gender: 'male',
      interestedIn: ['female'],
      avatarUrl: 'https://randomuser.me/api/portraits/men/8.jpg',
      galleryUrls: [
        'https://picsum.photos/400/600?random=801',
        'https://picsum.photos/400/600?random=802',
        'https://picsum.photos/400/600?random=803'
      ],
      verified: true,
    },
    {
      name: 'Ishita Verma',
      email: 'ishita@example.com',
      collegeId,
      department: 'Psychology',
      year: 2,
      bio: 'Bookworm with too many opinions. Will debate you about anything.',
      interests: ['Reading', 'Debate', 'Movies'],
      clubs: ['Debate Society'],
      lookingFor: 'Dating',
      gender: 'female',
      interestedIn: ['male', 'female'],
      avatarUrl: 'https://randomuser.me/api/portraits/women/9.jpg',
      galleryUrls: [
        'https://picsum.photos/400/600?random=901',
        'https://picsum.photos/400/600?random=902'
      ],
      verified: true,
    },
    {
      name: 'Dev Malhotra',
      email: 'dev@example.com',
      collegeId,
      department: 'Electrical Engineering',
      year: 1,
      bio: 'Robotics enthusiast. Can fix anything except my sleep schedule.',
      interests: ['Coding', 'Fitness', 'Sports'],
      clubs: ['Sports Club', 'Coding Club'],
      lookingFor: 'Both',
      gender: 'male',
      interestedIn: ['female', 'non-binary'],
      avatarUrl: 'https://randomuser.me/api/portraits/men/10.jpg',
      galleryUrls: [
        'https://picsum.photos/400/600?random=1001',
        'https://picsum.photos/400/600?random=1002',
        'https://picsum.photos/400/600?random=1003',
        'https://picsum.photos/400/600?random=1004'
      ],
      verified: true,
    },
  ]);

  console.log('[seed] 10 users seeded successfully');
  process.exit(0);
};

seed().catch((error) => {
  console.error('[seed] failed', error);
  process.exit(1);
});
