import mongoose from "mongoose";

export enum CameraStatus {
  ONLINE = "online",
  OFFLINE = "offline",
}

export type ICamera = {
  cameraAiId: string,
  name: string;
  ip: string;
  location: string;
  rtspUrl: string,
  status?: CameraStatus;
  lastHeartbeat?: Date;
  isEnabled?:boolean;
  createdAt?: Date;
  isDeleted?:boolean;
};

export type UpdateCameraInput = {
  cameraAiId?: string;
  name?: string;
  location?: string;
  rtspUrl?: string;
  isEnabled?: boolean;
};


const CameraSchema = new mongoose.Schema<ICamera>({
  cameraAiId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index:true,
  },
  name: {
    type: String,
    required: true,
    minlength: 2,
  },
  ip: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  rtspUrl:{
     type: String,
      required: true,
      unique: true,
      trim: true,
  },
  status: {
    type: String,
    enum: Object.values(CameraStatus),
    default: CameraStatus.OFFLINE,
  },
  lastHeartbeat: {
    type: Date,
    default: Date.now,
  },
  isEnabled:{
    type:Boolean,
    default: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
},
 {timestamps: true }
);

const Camera = mongoose.model("Camera", CameraSchema);

export default Camera;