import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Edit2, 
  X, 
  Check, 
  LogOut, 
  User, 
  BookOpen, 
  Users, 
  Loader2, 
  Camera, 
  Trash2, 
  ImagePlus,
  Sparkles,
  GraduationCap,
  Mail,
  Calendar,
  Trophy,
  Settings
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { GlassCard, Avatar, NeonTag, GradientButton, GlassInput } from '../components/ui';
import api from '../services/api';

const INTERESTS = ['Music', 'Movies', 'Gaming', 'Reading', 'Travel', 'Photography', 'Fitness', 'Art', 'Technology', 'Sports', 'Cooking', 'Dance', 'Writing', 'Anime'];
const CLUBS = ['Coding Club', 'Drama Society', 'Music Club', 'Dance Club', 'Debate Society', 'Photography Club', 'Sports Club', 'Robotics Club', 'Literary Club', 'Quiz Club'];
const DEPARTMENTS = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Electrical', 'IT', 'Mathematics', 'Physics', 'Chemistry', 'MBA'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
  }
};

export default function ProfilePage() {
  const { user, updateProfile, logout, fetchUser } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingIdx, setDeletingIdx] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    department: user?.department || '',
    year: user?.year || 1,
    interests: user?.interests || [],
    clubs: user?.clubs || [],
  });

  const photos = user?.photos || [];
  const completionItems = [user?.name, user?.department, user?.bio, (user?.interests?.length || 0) > 0, (user?.clubs?.length || 0) > 0];
  const completion = Math.round((completionItems.filter(Boolean).length / completionItems.length) * 100);

  const toggle = (field: 'interests' | 'clubs', item: string) => {
    setForm(p => ({ ...p, [field]: p[field].includes(item) ? p[field].filter(i => i !== item) : [...p[field], item] }));
  };

  const startEdit = () => {
    setForm({ 
      name: user?.name || '', 
      bio: user?.bio || '', 
      department: user?.department || '', 
      year: user?.year || 1, 
      interests: user?.interests || [], 
      clubs: user?.clubs || [] 
    });
    setEditing(true);
  };

  const save = async () => {
    setSaving(true);
    await updateProfile(form);
    setSaving(false);
    setEditing(false);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (photos.length >= 6) { alert('Maximum 6 photos allowed'); return; }
    
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        await api.post('/users/photos/upload', { image: reader.result });
        await fetchUser();
      } catch (err: any) {
        alert(err?.response?.data?.error || 'Upload failed. Check Cloudinary credentials.');
      }
      setUploading(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handlePhotoDelete = async (index: number) => {
    setDeletingIdx(index);
    try {
      await api.delete(`/users/photos/${index}`);
      await fetchUser();
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Delete failed');
    }
    setDeletingIdx(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-purple-950/20 p-6 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 bg-purple-600/8 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-pink-600/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
      </div>

      {/* Hidden file input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        accept="image/*" 
        onChange={handlePhotoUpload} 
        className="hidden" 
      />

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header Section */}
          <motion.div variants={itemVariants} className="mb-8">
            <GlassCard className="p-8 relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute top-0 right-0 w-64 h-64 opacity-[0.03]">
                <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-3xl" />
              </div>

              <div className="flex flex-col md:flex-row items-start gap-6 relative">
                {/* Avatar with Progress Ring */}
                <div className="relative">
                  {/* Progress Ring */}
                  <svg className="absolute -inset-2 w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="45" 
                      fill="none" 
                      stroke="rgba(255,255,255,0.1)" 
                      strokeWidth="2"
                    />
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="45" 
                      fill="none" 
                      stroke="url(#gradient)" 
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={`${completion * 2.827} 282.7`}
                      className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FF2E63" />
                        <stop offset="50%" stopColor="#9B5CFF" />
                        <stop offset="100%" stopColor="#FF8A00" />
                      </linearGradient>
                    </defs>
                  </svg>

                  <Avatar 
                    src={photos[0]} 
                    name={user?.name || ''} 
                    size="2xl" 
                    glowEffect={completion === 100}
                    className="w-20 h-20"
                  />

                  {completion === 100 && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                      <Trophy className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>

                {/* Profile Info */}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-white mb-2 gradient-text">
                    {user?.name || 'Your Name'} ✨
                  </h1>
                  
                  <div className="flex flex-wrap gap-4 text-white/70 mb-4">
                    {user?.department && (
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4" />
                        <span className="text-sm">{user.department}</span>
                      </div>
                    )}
                    
                    {user?.year && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">Year {user.year}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">{user?.email}</span>
                    </div>
                  </div>

                  {/* Profile Completion */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-white/80">Profile Completion</span>
                      <span className={`text-sm font-bold ${completion === 100 ? 'text-green-400' : 'gradient-text'}`}>
                        {completion}%
                      </span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${completion}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Edit Button */}
                <div className="flex gap-3">
                  <GradientButton
                    variant={editing ? "secondary" : "primary"}
                    onClick={editing ? () => setEditing(false) : startEdit}
                    className="flex items-center gap-2"
                  >
                    {editing ? (
                      <>
                        <X className="w-4 h-4" />
                        Cancel
                      </>
                    ) : (
                      <>
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </>
                    )}
                  </GradientButton>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Photos Section */}
          <motion.div variants={itemVariants} className="mb-8">
            <GlassCard className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <Camera className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">Photos</h3>
                <span className="text-sm text-white/60">({photos.length}/6)</span>
              </div>

              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                {photos.map((url: string, i: number) => (
                  <div key={i} className="relative group">
                    <div className="aspect-square rounded-2xl overflow-hidden bg-white/5 border border-white/10">
                      <img 
                        src={url} 
                        alt={`Photo ${i + 1}`} 
                        className="w-full h-full object-cover" 
                      />
                      
                      {/* Profile Badge */}
                      {i === 0 && (
                        <div className="absolute top-2 left-2 glass-card px-2 py-1">
                          <span className="text-xs font-bold gradient-text">Profile</span>
                        </div>
                      )}
                      
                      {/* Delete Button */}
                      <button
                        onClick={() => handlePhotoDelete(i)}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/70 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        disabled={deletingIdx === i}
                      >
                        {deletingIdx === i ? (
                          <Loader2 className="w-3 h-3 text-white animate-spin" />
                        ) : (
                          <Trash2 className="w-3 h-3 text-red-400" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add Photo Button */}
                {photos.length < 6 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="aspect-square rounded-2xl border-2 border-dashed border-white/20 bg-white/5 hover:bg-white/10 flex flex-col items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {uploading ? (
                      <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
                    ) : (
                      <ImagePlus className="w-6 h-6 text-white/60" />
                    )}
                    <span className="text-xs text-white/60 font-medium">
                      {uploading ? 'Uploading...' : 'Add Photo'}
                    </span>
                  </button>
                )}
              </div>
            </GlassCard>
          </motion.div>

          {/* Main Content */}
          <AnimatePresence mode="wait">
            {editing ? (
              <EditView
                key="edit"
                form={form}
                setForm={setForm}
                saving={saving}
                save={save}
                toggle={toggle}
              />
            ) : (
              <ViewMode key="view" user={user} logout={logout} />
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

function EditView({ form, setForm, saving, save, toggle }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Basic Info */}
      <GlassCard className="p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          Basic Info
        </h3>
        
        <div className="space-y-4">
          <GlassInput
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Enter your full name"
          />
          
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">Bio</label>
            <div className="relative">
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value.slice(0, 300) })}
                placeholder="Write a short bio about yourself..."
                maxLength={300}
                rows={4}
                className="glass-input resize-none"
              />
              <span className="absolute bottom-3 right-3 text-xs text-white/50">
                {form.bio.length}/300
              </span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Department */}
      <GlassCard className="p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          Department
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {DEPARTMENTS.map(dept => (
            <button
              key={dept}
              onClick={() => setForm({ ...form, department: dept })}
              className={`p-3 rounded-xl text-sm font-medium transition-all ${
                form.department === dept
                  ? 'bg-gradient-to-br from-purple-500/20 to-violet-500/20 border-purple-400 text-purple-300'
                  : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
              } border`}
            >
              {dept}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Year */}
      <GlassCard className="p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-white" />
          </div>
          Academic Year
        </h3>
        
        <div className="flex gap-3">
          {[1, 2, 3, 4, 5].map(year => (
            <button
              key={year}
              onClick={() => setForm({ ...form, year })}
              className={`w-16 h-16 rounded-2xl font-bold text-lg transition-all ${
                form.year === year
                  ? 'bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-400 text-orange-300'
                  : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
              } border`}
            >
              {year}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Interests */}
      <GlassCard className="p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          Interests ({form.interests.length} selected)
        </h3>
        
        <div className="flex flex-wrap gap-3">
          {INTERESTS.map(interest => (
            <NeonTag
              key={interest}
              variant="pink"
              size="md"
              interactive
              selected={form.interests.includes(interest)}
              onClick={() => toggle('interests', interest)}
            >
              {interest}
            </NeonTag>
          ))}
        </div>
      </GlassCard>

      {/* Clubs */}
      <GlassCard className="p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <Users className="w-4 h-4 text-white" />
          </div>
          Clubs ({form.clubs.length} selected)
        </h3>
        
        <div className="flex flex-wrap gap-3">
          {CLUBS.map(club => (
            <NeonTag
              key={club}
              variant="purple"
              size="md"
              interactive
              selected={form.clubs.includes(club)}
              onClick={() => toggle('clubs', club)}
            >
              {club}
            </NeonTag>
          ))}
        </div>
      </GlassCard>

      {/* Save Button */}
      <GradientButton
        onClick={save}
        disabled={saving}
        size="lg"
        fullWidth
        className="group"
      >
        {saving ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Saving Changes...
          </>
        ) : (
          <>
            <Check className="w-5 h-5 mr-2" />
            Save Changes
            <Sparkles className="w-5 h-5 ml-2 group-hover:animate-pulse" />
          </>
        )}
      </GradientButton>
    </motion.div>
  );
}

function ViewMode({ user, logout }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* About */}
      {user?.bio && (
        <GlassCard className="p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            About
          </h3>
          <p className="text-white/80 leading-relaxed">{user.bio}</p>
        </GlassCard>
      )}

      {/* Interests */}
      <GlassCard className="p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          Interests
        </h3>
        
        <div className="flex flex-wrap gap-3">
          {user?.interests?.length ? (
            user.interests.map((interest: string) => (
              <NeonTag key={interest} variant="pink" size="md">
                {interest}
              </NeonTag>
            ))
          ) : (
            <p className="text-white/50">No interests added yet</p>
          )}
        </div>
      </GlassCard>

      {/* Clubs */}
      <GlassCard className="p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <Users className="w-4 h-4 text-white" />
          </div>
          Clubs
        </h3>
        
        <div className="flex flex-wrap gap-3">
          {user?.clubs?.length ? (
            user.clubs.map((club: string) => (
              <NeonTag key={club} variant="purple" size="md">
                {club}
              </NeonTag>
            ))
          ) : (
            <p className="text-white/50">No clubs added yet</p>
          )}
        </div>
      </GlassCard>

      {/* Account Info */}
      <GlassCard className="p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-gray-500 to-slate-500 flex items-center justify-center">
            <Settings className="w-4 h-4 text-white" />
          </div>
          Account
        </h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-white/70">Email</span>
            <span className="text-white font-medium">{user?.email}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/70">Department</span>
            <span className="text-white font-medium">{user?.department || '—'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/70">Year</span>
            <span className="text-white font-medium">{user?.year ? `Year ${user.year}` : '—'}</span>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10">
          <button
            onClick={logout}
            className="flex items-center gap-3 text-red-400 hover:text-red-300 transition-colors font-medium"
          >
            <LogOut className="w-5 h-5" />
            Sign out
          </button>
        </div>
      </GlassCard>
    </motion.div>
  );
}
