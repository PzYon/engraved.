import { JournalType } from "./JournalType";
import { IJournalAttributes } from "./IJournalAttributes";
import { IUserPermissions } from "./IUserPermissions";
import { IJournalThresholds } from "./IJournalThresholds";
import { IJournalCustomProps } from "./IJournalCustomProps";
import { IEntity } from "./IEntity";
import { ISchedule } from "./ISchedule";

export interface IJournal extends IEntity {
  attributes?: IJournalAttributes;
  name?: string;
  description?: string;
  notes?: string;
  type: JournalType;
  thresholds?: IJournalThresholds;
  permissions?: IUserPermissions;
  customProps?: IJournalCustomProps;
  schedule?: ISchedule;
}
