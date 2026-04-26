/**
 * SellSpark IoT & Wearable Bridge
 * Web Bluetooth + Web Serial integrations for creator studios:
 * streaming mic levels, ring-light control, stream deck events,
 * and smart-watch commerce notifications.
 */

export type DeviceKind = 'bluetooth' | 'serial' | 'hid' | 'usb';

export async function scanDevices(): Promise<{ kind: DeviceKind; available: boolean }[]> {
  const n = (globalThis as unknown as { navigator?: Record<string, unknown> }).navigator ?? {};
  return [
    { kind: 'bluetooth', available: !!n.bluetooth },
    { kind: 'serial', available: !!n.serial },
    { kind: 'hid', available: !!n.hid },
    { kind: 'usb', available: !!n.usb },
  ];
}

export interface StreamDeckEvent { key: number; action: 'press' | 'release'; at: number }

export const DECK_ACTIONS: Record<number, { label: string; trigger: string }> = {
  1: { label: 'Go Live', trigger: 'stream.start' },
  2: { label: 'Drop Offer', trigger: 'offer.broadcast' },
  3: { label: 'Mute', trigger: 'audio.mute' },
  4: { label: 'Highlight Product', trigger: 'overlay.product' },
  5: { label: 'Tip Jar', trigger: 'tip.show' },
  6: { label: 'End Stream', trigger: 'stream.end' },
};

export function watchNotification(saleUsd: number): { title: string; vibrate: number[] } {
  return {
    title: `💸 $${saleUsd.toFixed(2)} sale!`,
    vibrate: saleUsd > 100 ? [200, 100, 200, 100, 400] : [100, 50, 100],
  };
}
