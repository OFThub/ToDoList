const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Kullanıcı adı zorunludur"],
    unique: true,
    trim: true,
    minlength: [3, "Kullanıcı adı en az 3 karakter olmalıdır"]
  },
  email: {
    type: String,
    required: [true, "E-posta adresi zorunludur"],
    unique: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Lütfen geçerli bir e-posta adresi giriniz']
  },
  password: {
    type: String,
    required: [true, "Şifre zorunludur"],
    minlength: [8, "Şifre en az 8 karakter olmalıdır"],
    select: false
  },

  profile: {
    firstName: String,
    lastName: String,
    avatar: {
      type: String,
      default: "https://via.placeholder.com/150"
    },
    bio: { type: String, maxlength: 200 },
    jobTitle: String
  },

  role: {
    type: String,
    enum: ["user", "team_leader", "admin"],
    default: "user"
  },

  settings: {
    theme: { type: String, enum: ["light", "dark"], default: "light" },
    notifications: { type: Boolean, default: true },
    language: { type: String, default: "tr" }
  },

  teams: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team"
  }],
  
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  
  isVerified: { type: Boolean, default: false },
  passwordResetToken: String,
  passwordResetExpires: Date

}, { 
  timestamps: true,
  toJSON: { virtuals: true }, 
  toObject: { virtuals: true } 
});

userSchema.virtual('fullName').get(function() {
  return `${this.profile.firstName} ${this.profile.lastName}`;
});

module.exports = mongoose.model("User", userSchema);