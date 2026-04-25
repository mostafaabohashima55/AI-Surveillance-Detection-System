import mongoose from "mongoose";
import bcrypt from "bcrypt";


export enum UserRole {
  ADMIN = "admin",
  SUPER_ADMIN = "super_admin",
  SECURITY = "security",
}

export interface IUser {
  name: string;
  email: string;
  password: string;
  phone: string;
  // pfpImageUrl?: string;
  role: UserRole;
  isDeleted: boolean;
  lastActiveAt?: Date;
}
export type UpdateUserInput = {
  name?: string;
  email?: string;
  phone?: string;
  // pfpImageUrl?: string;
  role?: UserRole;
}

const UserSchema = new mongoose.Schema<IUser>({
    name: {type: String , required: true, minLength: 2},
    email: {type: String , required: true},
    password: {type: String , required: true},
    phone:{type:String ,required: true},
    // pfpImageUrl:{type:String},
    role: {type: String , required: true, enum: Object.values(UserRole)},  
    isDeleted: {type:Boolean, default:false},
    lastActiveAt: {type:Date}
},
 { timestamps: true }

);
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  const saltRounds = 10;
  this.password = await bcrypt.hash(this.password, saltRounds);

});


const User = mongoose.model('User',UserSchema);
export default User;