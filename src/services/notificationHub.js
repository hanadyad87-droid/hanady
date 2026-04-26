import * as signalR from "@microsoft/signalr";
import { API_ORIGIN } from "../config";
import { notificationStore } from "../stores/notificationStore";

let connection = null;
let connectPromise = null;

export function getHubConnectionState() {
  return connection?.state ?? "Disconnected";
}

/**
 * يبدأ اتصال WebSocket بـ /notificationHub (متوافق مع JwtBearer + access_token في الاستعلام).
 */
export async function ensureNotificationHubConnected() {
  const token = localStorage.getItem("token");
  if (!token) return;

  if (connection?.state === signalR.HubConnectionState.Connected) return;

  if (connectPromise) return connectPromise;

  connectPromise = (async () => {
    if (connection) {
      try {
        await connection.stop();
      } catch {
        /* ignore */
      }
      connection = null;
    }

    const url = `${API_ORIGIN}/notificationHub`;

    connection = new signalR.HubConnectionBuilder()
      .withUrl(url, {
        accessTokenFactory: () => localStorage.getItem("token") || "",
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connection.on("ReceiveNotification", (payload) => {
      notificationStore.prependFromHub(payload || {});
    });

    try {
      await connection.start();
    } catch (e) {
      console.warn("SignalR notification hub:", e);
      connection = null;
    }
  })().finally(() => {
    connectPromise = null;
  });

  return connectPromise;
}

export async function stopNotificationHub() {
  if (!connection) return;
  try {
    await connection.stop();
  } catch {
    /* ignore */
  }
  connection = null;
}
