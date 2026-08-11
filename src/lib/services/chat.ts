'use server';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import db from '@/lib/db';
import type { Message as MessageType } from '@/types/db';
import { getDoctorById } from './doctors';

export type Message = MessageType;
export type ChatMessage = MessageType;

export async function getChatMessages(
  userEmail: string,
  doctorId: string
): Promise<Message[]> {
  const stmt = db.prepare(
    'SELECT * FROM chat_messages WHERE user_email = ? AND doctor_id = ? ORDER BY timestamp ASC'
  );
  const rows = stmt.all(userEmail, doctorId) as any[];

  if (rows.length > 0) {
    return rows.map(r => ({
      id: String(r.id),
      user_email: r.user_email,
      doctor_id: r.doctor_id,
      text: r.text,
      sender: r.sender as 'user' | 'doctor',
      avatar: r.avatar,
      attachment: r.attachment_name ? { name: r.attachment_name, url: r.attachment_url } : undefined,
      timestamp: r.timestamp,
    }));
  }

  // If no chat history exists yet, create welcome message
  const doctor = await getDoctorById(doctorId);
  if (!doctor) return [];

  const welcomeMessage: Omit<Message, 'id'> = {
    text: `Hello! I am ${doctor.name}. How can I assist you with your health today?`,
    sender: 'doctor',
    avatar: doctor.avatar,
    user_email: userEmail,
    doctor_id: doctorId,
  };

  const savedMessage = await saveChatMessage(userEmail, doctorId, welcomeMessage);
  return [savedMessage];
}

export async function saveChatMessage(
  userEmail: string,
  doctorId: string,
  message: Omit<Message, 'id'>
): Promise<Message> {
  const timestamp = message.timestamp || new Date().toISOString();
  const stmt = db.prepare(
    'INSERT INTO chat_messages (user_email, doctor_id, text, sender, avatar, attachment_name, attachment_url, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );
  const result = stmt.run(
    userEmail,
    doctorId,
    message.text,
    message.sender,
    message.avatar,
    message.attachment?.name || null,
    message.attachment?.url || null,
    timestamp
  );
  const newId = String(result.lastInsertRowid);

  return {
    ...message,
    id: newId,
    timestamp,
  };
}

// Alias used by chat room page — saves message then returns full updated list
export async function sendChatMessage(
  userEmail: string,
  doctorId: string,
  text: string,
  sender: 'user' | 'doctor',
  avatar: string,
  attachmentName?: string,
  attachmentUrl?: string
): Promise<Message[]> {
  await saveChatMessage(userEmail, doctorId, {
    user_email: userEmail,
    doctor_id: doctorId,
    text,
    sender,
    avatar,
    attachment: attachmentName ? { name: attachmentName, url: attachmentUrl || '' } : undefined,
  });
  return getChatMessages(userEmail, doctorId);
}
