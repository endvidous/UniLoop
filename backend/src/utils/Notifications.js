// utils/notifications.js
import { Expo } from "expo-server-sdk";
// import admin from "../config/firebase-admin.js";

const expo = new Expo({
  accessToken: process.env.EXPO_ACCESS_TOKEN,
});
export const sendBulkNotifications = async (tokens, notificationData) => {
  try {
    const messages = [];

    // Validate and format tokens
    for (const token of tokens) {
      if (!Expo.isExpoPushToken(token)) {
        console.error(`Invalid Expo push token: ${token}`);
        continue;
      }

      messages.push({
        to: token,
        sound: "default",
        title: notificationData.title,
        body: notificationData.body,
        data: notificationData.payload,
      });
    }

    // Chunk and send notifications
    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error("Error sending chunk:", error);
      }
    }
    return tickets;
  } catch (error) {
    console.error("Notification error:", error);
    throw error;
  }
};
