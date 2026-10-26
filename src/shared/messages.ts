export enum MessageType {
    SWITCHER_READY = "SWITCHER_READY",
    UPDATE_SWITCHER = "UPDATE_SWITCHER",
    SHOW_SWITCHER = "SHOW_SWITCHER",
    HIDE_SWITCHER = "HIDE_SWITCHER",
    CONFIRM_SELECTION = "CONFIRM_EXTENSION"
}

export interface RecentTab {
    id: number;
    title: string;
    favIconUrl?: string;
}

export type BackgroundMessage =
    | {
          type: MessageType.SWITCHER_READY;
          tabs: RecentTab[];
          selectedTabId: number;
      }
    | {
          type: MessageType.UPDATE_SWITCHER;
          tabs: RecentTab[];
          selectedTabId: number;
      }
    | {
          type: MessageType.HIDE_SWITCHER;
      };

export type ContentMessage =
    | {
          type: MessageType.SWITCHER_READY;
      }
    | {
          type: MessageType.CONFIRM_SELECTION;
          selectedTabId: number;
      };
