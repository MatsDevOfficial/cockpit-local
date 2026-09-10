import {
  LoopsApiResponse,
  MagicLinkEmailData,
  WelcomeEmailData,
  EventUpdateEmailData,
  CapacityAlertEmailData,
} from '../types/loops';

export class LoopsService {
  async sendMagicLinkEmail(data: MagicLinkEmailData): Promise<LoopsApiResponse> {
    console.log('\n' + '='.repeat(60));
    console.log('  MAGIC LINK (local mode - no email sent)');
    console.log('='.repeat(60));
    console.log(`  To:   ${data.email}`);
    console.log(`  URL:  ${data.loginUrl}`);
    console.log(`  TTL:  ${data.expirationMinutes} minutes`);
    console.log('='.repeat(60) + '\n');

    return {
      success: true,
      message: 'Magic link printed to console',
    };
  }

  async sendWelcomeEmail(data: WelcomeEmailData): Promise<LoopsApiResponse> {
    console.log('Welcome email skipped (local mode) - would send to:', data.email);
    return { success: true, message: 'Welcome email skipped (local mode)' };
  }

  async sendEventUpdateEmail(data: EventUpdateEmailData): Promise<LoopsApiResponse> {
    console.log('Event update email skipped (local mode) - would send to:', data.email);
    return { success: true, message: 'Event update email skipped (local mode)' };
  }

  async sendCapacityAlertEmail(data: CapacityAlertEmailData): Promise<LoopsApiResponse> {
    console.log('Capacity alert email skipped (local mode) - would send to:', data.email);
    return { success: true, message: 'Capacity alert email skipped (local mode)' };
  }

  async sendBulkEventNotification(
    attendeeEmails: string[],
    eventUpdateData: Omit<EventUpdateEmailData, 'email'>
  ): Promise<LoopsApiResponse[]> {
    console.log('Bulk notification skipped (local mode) - would send to:', attendeeEmails.length, 'attendees');
    return attendeeEmails.map(email => ({
      success: true,
      message: `Bulk notification skipped (local mode) - would send to ${email}`
    }));
  }
}

export const loopsService = new LoopsService();
