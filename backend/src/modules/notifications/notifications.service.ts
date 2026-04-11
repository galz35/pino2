import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { EventsGateway } from '../../common/gateways/events.gateway';
import * as admin from 'firebase-admin';
import * as path from 'path';

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger('NotificationsService');
  private fcmInitialized = false;

  constructor(
    private readonly db: DatabaseService,
    private readonly events: EventsGateway,
  ) {}

  onModuleInit() {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    const credPath = process.env.FIREBASE_CREDENTIALS_PATH;
    const credInline = process.env.FIREBASE_KEY_JSON;

    if (!credPath && !credInline) {
      this.logger.warn('⚠️ Firebase no configurado. Agregue FIREBASE_CREDENTIALS_PATH o FIREBASE_KEY_JSON en .env');
      return;
    }

    try {
      if (admin.apps.length === 0) {
        let serviceAccount: any;
        if (credInline) {
          serviceAccount = JSON.parse(credInline);
          this.logger.log(`📱 Firebase: Usando credenciales desde variable FIREBASE_KEY_JSON (proyecto: ${serviceAccount.project_id})`);
        } else {
          const fullPath = path.resolve(process.cwd(), credPath!);
          serviceAccount = require(fullPath);
          this.logger.log(`📱 Firebase: Usando archivo ${credPath} (proyecto: ${serviceAccount.project_id})`);
        }

        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        this.fcmInitialized = true;
        this.logger.log('✅ Firebase Admin SDK inicializado correctamente');
      } else {
        this.fcmInitialized = true;
      }
    } catch (error) {
      this.logger.error('❌ Error inicializando Firebase Admin:', error.message);
    }
  }

  async findAll(storeId?: string, limit?: number) {
    let q = 'SELECT * FROM notifications';
    const params: any[] = [];
    if (storeId) {
      q += ' WHERE store_id = $1';
      params.push(storeId);
    }
    q += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1);
    params.push(limit || 50);

    const res = await this.db.query(q, params);
    return res.rows.map(this.mapRow);
  }

  async create(dto: {
    storeId: string;
    userId?: string;
    type: string;
    title: string;
    message: string;
    metadata?: any;
  }) {
    const res = await this.db.query(
      `INSERT INTO notifications (store_id, user_id, type, title, message, metadata, read)
       VALUES ($1, $2, $3, $4, $5, $6, false) RETURNING *`,
      [
        dto.storeId,
        dto.userId || null,
        dto.type,
        dto.title,
        dto.message,
        JSON.stringify(dto.metadata || {}),
      ],
    );
    const notification = this.mapRow(res.rows[0]);

    // Broadcast via WebSocket to connected dashboards
    this.events.emitSyncUpdate({
      type: 'NOTIFICATION',
      payload: notification,
      storeId: dto.storeId,
    });

    // Also send PUSH if userId is present
    if (dto.userId) {
      this.sendPushToUser(dto.userId, dto.title, dto.message, dto.metadata).catch(
        (err) => this.logger.error('Background Push Error', err.message),
      );
    }

    return notification;
  }

  async sendPushToUser(userId: string, title: string, body: string, data?: any) {
    if (!this.fcmInitialized) return;

    const tokens = await this.getTokensForUser(userId);
    if (tokens.length === 0) return;

    try {
      const message: admin.messaging.MulticastMessage = {
        tokens,
        notification: { title, body },
        data: this.sanitizeData(data || {}),
        android: {
          priority: 'high',
          notification: { sound: 'default', clickAction: 'FLUTTER_NOTIFICATION_CLICK' },
        },
        apns: { payload: { aps: { sound: 'default', badge: 1 } } },
      };

      const response = await admin.messaging().sendEachForMulticast(message);
      this.logger.log(`Push sent: ${response.successCount} success, ${response.failureCount} failed.`);
      
      // Optional: Cleanup dead tokens if response.failureCount > 0
    } catch (error) {
      this.logger.error('Error sending push', error.message);
    }
  }

  private sanitizeData(data: any): Record<string, string> {
    const result: Record<string, string> = {};
    for (const key in data) {
      if (data[key] !== null && data[key] !== undefined) {
        result[key] = typeof data[key] === 'object' ? JSON.stringify(data[key]) : String(data[key]);
      }
    }
    return result;
  }

  async getTokensForUser(userId: string): Promise<string[]> {
    const res = await this.db.query(
      'SELECT token FROM device_tokens WHERE user_id = $1',
      [userId],
    );
    return res.rows.map((row) => row.token);
  }

  async registerToken(userId: string, token: string, platform: string) {
    await this.db.query(
      `INSERT INTO device_tokens (user_id, token, platform, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (token) DO UPDATE SET 
         user_id = EXCLUDED.user_id,
         platform = EXCLUDED.platform,
         updated_at = NOW()`,
      [userId, token, platform],
    );
    return { success: true };
  }

  async unregisterToken(token: string) {
    await this.db.query('DELETE FROM device_tokens WHERE token = $1', [token]);
    return { success: true };
  }

  async markAsRead(id: string) {
    const res = await this.db.query(
      'UPDATE notifications SET read = true WHERE id = $1 RETURNING *',
      [id],
    );
    if (res.rowCount === 0) return null;
    return this.mapRow(res.rows[0]);
  }

  async markAllAsRead(storeId: string) {
    await this.db.query(
      'UPDATE notifications SET read = true WHERE store_id = $1 AND read = false',
      [storeId],
    );
    return { updated: true };
  }

  private mapRow(row: any) {
    return {
      id: row.id,
      storeId: row.store_id,
      userId: row.user_id,
      type: row.type,
      title: row.title,
      message: row.message,
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : (row.metadata || {}),
      read: row.read,
      createdAt: row.created_at,
    };
  }
}
