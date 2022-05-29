export enum WalletEventType {
    Connected = "Connected",
    Disconnected = "Disconnected",
    Selected = "Selected",
    NetworkSwitched = "NetworkSwitched"
}

export interface WalletEvent {
    type: WalletEventType;
    walletName: string;
    walletId: string;
}