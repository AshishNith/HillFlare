
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';


const envPath = path.resolve(process.cwd(), '.env');
console.log('Loading .env from:', envPath);
dotenv.config({ path: envPath });

console.log('MONGO_URI:', process.env.MONGO_URI ? 'Set' : 'Undefined');


const users = [
    {
        name: "Aarav Patel",
        email: "aarav.p@example.com",
        password: "password123",
        department: "Computer Science",
        year: 3,
        bio: "Code by day, shutterbug by night. Looking for someone to explore the city with! 📸💻",
        interests: ["Photography", "Coding", "Travel", "Coffee"],
        clubs: ["Photography Club", "GDSC"],
        photos: [
            "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=800",
            "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=800"
        ],
        avatar: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200",
        isProfileComplete: true,
        isVerified: true
    },
    {
        name: "Zara Khan",
        email: "zara.k@example.com",
        password: "password123",
        department: "Design",
        year: 2,
        bio: "Design student who loves minimal aesthetics and maximalist playlists. Let's go to an art gallery? 🎨✨",
        interests: ["Art", "Music", "Fashion", "Design"],
        clubs: ["Design Circle", "Music Society"],
        photos: [
            "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=800",
            "https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&w=800"
        ],
        avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200",
        isProfileComplete: true,
        isVerified: true
    },
    {
        name: "Rohan Gupta",
        email: "rohan.g@example.com",
        password: "password123",
        department: "Mechanical Engineering",
        year: 4,
        bio: "Gym rat and gearhead. If I'm not in the lab, I'm probably lifting or fixing my bike. 🏋️‍♂️🏍️",
        interests: ["Gym", "Biking", "Mechanics", "Cooking"],
        clubs: ["Robotics Club", "Fitness Club"],
        photos: [
            "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=800",
            "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=800"
        ],
        avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200",
        isProfileComplete: true,
        isVerified: true
    },
    {
        name: "Ishita Sharma",
        email: "ishita.s@example.com",
        password: "password123",
        department: "Biotechnology",
        year: 1,
        bio: "Total bookworm 📚. Love cozy cafes, rainy days, and deep conversations about the universe. 🌌",
        interests: ["Reading", "Astronomy", "Coffee", "Yoga"],
        clubs: ["Literary Society", "Astronomy Club"],
        photos: [
            "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=800",
            "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=800"
        ],
        avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200",
        isProfileComplete: true,
        isVerified: true
    },
    {
        name: "Vihaan Singh",
        email: "vihaan.s@example.com",
        password: "password123",
        department: "Computer Science",
        year: 2,
        bio: "Gamer, coder, and part-time comedian. Looking for a Player 2. 🎮👾",
        interests: ["Gaming", "Coding", "Memes", "Sci-Fi"],
        clubs: ["Esports Club", "Coding Club"],
        photos: [
            "https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=800",
            "https://images.pexels.com/photos/1043473/pexels-photo-1043473.jpeg?auto=compress&cs=tinysrgb&w=800"
        ],
        avatar: "https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=200",
        isProfileComplete: true,
        isVerified: true
    },
    {
        name: "Ananya Das",
        email: "ananya.d@example.com",
        password: "password123",
        department: "English Literature",
        year: 3,
        bio: "Writing my own story, one chapter at a time. aspiring novelist. 🖋️📖",
        interests: ["Writing", "Poetry", "Theatre", "History"],
        clubs: ["Debating Society", "Theatre Club"],
        photos: [
            "https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=800",
            "https://images.pexels.com/photos/3228727/pexels-photo-3228727.jpeg?auto=compress&cs=tinysrgb&w=800"
        ],
        avatar: "https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=200",
        isProfileComplete: true,
        isVerified: true
    },
    {
        name: "Kabir Malhotra",
        email: "kabir.m@example.com",
        password: "password123",
        department: "Business Administration",
        year: 4,
        bio: "Future CEO. Hustle hard, play hard. Interested in startups and innovation. 💼🚀",
        interests: ["Startups", "Investing", "Networking", "Golf"],
        clubs: ["E-Cell", "Management Club"],
        photos: [
            "https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=800",
            "https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=800"
        ],
        avatar: "https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=200",
        isProfileComplete: true,
        isVerified: true
    },
    {
        name: "Meera Reddy",
        email: "meera.r@example.com",
        password: "password123",
        department: "Psychology",
        year: 2,
        bio: "Here to listen. Fascinated by the human mind. Also, I make great chai. ☕🧠",
        interests: ["Psychology", "Cooking", "Volunteering", "Podcasts"],
        clubs: ["Psychology Club", "NSS"],
        photos: [
            "https://images.pexels.com/photos/712513/pexels-photo-712513.jpeg?auto=compress&cs=tinysrgb&w=800",
            "https://images.pexels.com/photos/1462630/pexels-photo-1462630.jpeg?auto=compress&cs=tinysrgb&w=800"
        ],
        avatar: "https://images.pexels.com/photos/712513/pexels-photo-712513.jpeg?auto=compress&cs=tinysrgb&w=200",
        isProfileComplete: true,
        isVerified: true
    },
    {
        name: "Arjun Verma",
        email: "arjun.v@example.com",
        password: "password123",
        department: "Electrical Engineering",
        year: 3,
        bio: "Building cool stuff with electronics. Love retro tech and synths. 🎹⚡",
        interests: ["Electronics", "Music Production", "DIY", "Sci-Fi"],
        clubs: ["Electronics Club", "Music Society"],
        photos: [
            "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=800",
            "https://images.pexels.com/photos/936019/pexels-photo-936019.jpeg?auto=compress&cs=tinysrgb&w=800"
        ],
        avatar: "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=200",
        isProfileComplete: true,
        isVerified: true
    },
    {
        name: "Sana Ali",
        email: "sana.a@example.com",
        password: "password123",
        department: "Architecture",
        year: 1,
        bio: "Designing the future. Love sketching, exploring old buildings, and urban planning. 🏙️✏️",
        interests: ["Architecture", "Sketching", "Photography", "Travel"],
        clubs: ["Architecture Society", "Photography Club"],
        photos: [
            "https://images.pexels.com/photos/3775120/pexels-photo-3775120.jpeg?auto=compress&cs=tinysrgb&w=800",
            "https://images.pexels.com/photos/3772510/pexels-photo-3772510.jpeg?auto=compress&cs=tinysrgb&w=800"
        ],
        avatar: "https://images.pexels.com/photos/3775120/pexels-photo-3775120.jpeg?auto=compress&cs=tinysrgb&w=200",
        isProfileComplete: true,
        isVerified: true
    }
];


const seedDB = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log('Connected!');

        console.log('Seeding users...');
        for (const user of users) {
            const exists = await User.findOne({ email: user.email });
            if (exists) {
                console.log(`User ${user.email} already exists. Skipping.`);
                continue;
            }

            // Remove password from user object before creating
            const { password, ...userData } = user as any;

            await User.create(userData);
            console.log(`Created user: ${user.name}`);
        }

        console.log('Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDB();
