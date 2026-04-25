import mongoose, { Schema, Types } from "mongoose";

export enum IncidentStatus {
  OPEN = "open",
  IN_PROGRESS = "in_progress",
  CLOSED = "closed",
}

export interface IIncident {
  alertId: Types.ObjectId;

  cameraId: Types.ObjectId;

  frameImageUrl: string;

  handledBy?: Types.ObjectId;

  status: IncidentStatus;
  isDeleted?: boolean;

  responseNotes?: string;

  resolvedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
  /** UI-facing numeric id (monotonic). */
  sid?: number;
  /** Copy of alert.sid at creation time. */
  alertSid?: number;
}
export interface CreateIncidentDto {
  alertId: string;
  cameraId: string;
  frameImageUrl: string;
  /** Required when creator is admin/super_admin; ignored for security (self-assign). */
  handledBy?: string;
}

export interface UpdateIncidentDto {
  status?: IncidentStatus;
  responseNotes?: string;
  resolvedAt?: Date | null;
  handledBy?: string;
}

const IncidentSchema = new Schema<IIncident>(
  {
    alertId: {
      type: Schema.Types.ObjectId,
      ref: "Alert",
      required: true,
      index: true,
    },

    cameraId: {
      type: Schema.Types.ObjectId,
      ref: "Camera",
      required: true,
      index: true,
    },

    frameImageUrl: {
      type: String,
      required: true,
    },

    handledBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: Object.values(IncidentStatus),
      default: IncidentStatus.OPEN,
      index: true,
    },
    isDeleted:{
      type: Boolean,
      default:false
    },

    responseNotes: {
      type: String,
      default:"N/A",
    },

    resolvedAt: {
      type: Date,
      default:null
    },
    sid: {
      type: Number,
      sparse: true,
      unique: true,
      index: true,
    },
    alertSid: {
      type: Number,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const Incident = mongoose.model<IIncident>("Incident", IncidentSchema);

export default Incident;