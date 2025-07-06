import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
// Simple User Schema - no complex stuff
const UserSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters long'],
        maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    phone: {
        type: String,
        required: false,
        trim: true,
        validate: {
            validator: function (v) {
                if (!v)
                    return true; // Allow empty values
                return /^[+]?[1-9]?[0-9]{7,15}$/.test(v); // International phone format
            },
            message: 'Please enter a valid phone number'
        }
    },
    location: {
        type: String,
        required: false,
        trim: true,
        maxlength: [100, 'Location cannot exceed 100 characters']
    },
    bio: {
        type: String,
        required: false,
        trim: true,
        maxlength: [500, 'Bio cannot exceed 500 characters']
    },
    avatar: {
        type: String,
        required: false
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters long'],
        select: false, // Don't include password in queries by default
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    status: {
        type: String,
        enum: ['active', 'disabled'],
        default: 'active'
    }
}, {
    timestamps: true // This adds createdAt and updatedAt automatically
});
// Hash password before saving
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password'))
        return next();
    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    }
    catch (error) {
        next(error);
    }
});
// Method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    }
    catch (error) {
        throw error;
    }
};
// Create and export the model
const User = mongoose.model('User', UserSchema);
export default User;
//# sourceMappingURL=User.js.map