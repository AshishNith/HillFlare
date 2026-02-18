import { IUserDocument } from '../models/User';

const WEIGHTS = {
    SHARED_INTERESTS: 5,
    SHARED_CLUBS: 8,
    SAME_DEPARTMENT: 3,
    SAME_YEAR: 2,
};

export const calculateCompatibility = (user1: IUserDocument, user2: IUserDocument): number => {
    let score = 0;

    // Shared interests
    const sharedInterests = user1.interests.filter((i) => user2.interests.includes(i));
    score += sharedInterests.length * WEIGHTS.SHARED_INTERESTS;

    // Shared clubs
    const sharedClubs = user1.clubs.filter((c) => user2.clubs.includes(c));
    score += sharedClubs.length * WEIGHTS.SHARED_CLUBS;

    // Same department
    if (user1.department && user2.department && user1.department === user2.department) {
        score += WEIGHTS.SAME_DEPARTMENT;
    }

    // Same year
    if (user1.year && user2.year && user1.year === user2.year) {
        score += WEIGHTS.SAME_YEAR;
    }

    return score;
};

export const getCompatibilityBreakdown = (user1: IUserDocument, user2: IUserDocument) => {
    const sharedInterests = user1.interests.filter((i) => user2.interests.includes(i));
    const sharedClubs = user1.clubs.filter((c) => user2.clubs.includes(c));
    const sameDepartment = user1.department === user2.department;
    const sameYear = user1.year === user2.year;

    return {
        score: calculateCompatibility(user1, user2),
        sharedInterests,
        sharedClubs,
        sameDepartment,
        sameYear,
    };
};
