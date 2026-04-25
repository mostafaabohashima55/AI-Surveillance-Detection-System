import mongoose, { Schema, Types } from "mongoose";

export enum AlertType {
  WEAPON = "weapon",
  HARASSMENT = "harassment",
}

export enum AlertStatus {
  NEW = "new",
  INCIDENT_CREATED = "incident_created",
  FALSE = "false",
}

export interface IAlert {
  type: AlertType;
  cameraId?: Types.ObjectId;
  cameraAiId: string;
  frameImageUrl: string;
  timestamp: Date;
  confidence: Number;
  status?: AlertStatus;
  isDeleted?: boolean;
  /** UI-facing numeric id (monotonic). */
  sid?: number;
}


const AlertSchema = new Schema<IAlert>(
  {
    type: {
      type: String,
      enum: Object.values(AlertType),
      required: true,
    },
    cameraAiId:{
      type: String,
      required: true,
    },

    cameraId: {
      type: Schema.Types.ObjectId,
      ref: "Camera",
      required: true,
    },
    confidence: {
      type: Number,
      required: true,
    },

    frameImageUrl: {
      type: String,
    },

    timestamp: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: Object.values(AlertStatus),
      default: AlertStatus.NEW,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    sid: {
      type: Number,
      sparse: true,
      unique: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const Alert = mongoose.model<IAlert>("Alert", AlertSchema);

export default Alert;