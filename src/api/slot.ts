export enum ServerSlotDataType {
  SERVER_ID_SLOT,
  PLAYER_ID_SLOT,
}

export interface ServerSlot {
  slotId: string;
  data: string;
  mark: string;
  dataType: ServerSlotDataType;
  expireToClean: boolean;
  slotTime: number;
  expire: number;
}
