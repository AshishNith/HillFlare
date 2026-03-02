export type College = {
  _id: string;
  name: string;
  domain: string;
};

export type UserProfile = {
  _id: string;
  name: string;
  email: string;
  collegeId: string;
  department: string;
  year: number;
  bio?: string;
  interests: string[];
  clubs: string[];
  lookingFor?: string;
  avatarUrl?: string;
  galleryUrls?: string[];
};
