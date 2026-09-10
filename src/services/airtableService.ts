import { Event, UpdateEventData } from '../types/event';
import { Admin } from '../types/admin';
import { Attendee } from '../types/attendee';
import { Venue } from '../types/venue';
import { cacheService } from './cacheService';
import { databaseService } from './databaseService';

export class AirtableService {

  constructor() {}

  private mapEventRow(row: any): Event {
    return {
      id: row.airtable_id,
      name: row.event_name,
      eventName: row.event_name,
      pocFirstName: row.poc_first_name,
      pocLastName: row.poc_last_name,
      location: row.location,
      slug: row.slug,
      streetAddress: row.street_address,
      streetAddress2: row.street_address_2,
      city: row.city,
      state: row.state,
      country: row.country,
      zipcode: row.zipcode,
      eventFormat: row.event_format,
      subOrganizers: row.sub_organizers,
      email: row.email,
      pocPreferredName: row.poc_preferred_name,
      pocSlackId: row.poc_slack_id,
      pocDob: row.poc_dob,
      pocAge: row.poc_age,
      estimatedAttendeeCount: row.estimated_attendee_count,
      maxAttendees: row.estimated_attendee_count,
      projectUrl: row.project_url,
      projectDescription: row.project_description,
      lat: row.lat,
      long: row.long,
      triageStatus: row.triage_status,
      status: row.triage_status,
      startDate: row.start_date,
      endDate: row.end_date,
      registrationDeadline: row.registration_deadline,
      notes: row.notes,
      actionTriggerApprovalEmail: row.action_trigger_approval_email,
      actionTriggerRejectionEmail: row.action_trigger_rejection_email,
      actionTriggerHoldEmail: row.action_trigger_hold_email,
      actionTriggerAskEmail: row.action_trigger_ask_email,
      hasConfirmedVenue: row.has_confirmed_venue,
    };
  }

  private mapAdminRow(row: any): Admin {
    return {
      id: row.airtable_id,
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
      userStatus: row.user_status,
    };
  }

  private mapAttendeeRow(row: any): Attendee {
    return {
      id: row.airtable_id,
      email: row.email,
      preferredName: row.preferred_name,
      firstName: row.first_name,
      lastName: row.last_name,
      dob: row.dob ? new Date(row.dob) : undefined,
      phone: row.phone,
      event: row.event_airtable_id || undefined,
      deleted_in_cockpit: row.deleted_in_cockpit || false,
      event_volunteer: row.event_volunteer || false,
      shirt_size: row.shirt_size,
      additional_accommodations: row.additional_accommodations,
      dietary_restrictions: row.dietary_restrictions,
      emergency_contact_1_phone: row.emergency_contact_1_phone,
      emergency_contact_1_name: row.emergency_contact_1_name,
      checkin_completed: row.checkin_completed || false,
      scanned_in: row.scanned_in || false,
      referral_information: row.referral_information,
    };
  }

  private mapVenueRow(row: any): Venue {
    return {
      id: row.airtable_id,
      venueId: row.venue_id,
      eventName: row.event_name,
      venueName: row.venue_name,
      address1: row.address_1,
      address2: row.address_2,
      city: row.city,
      state: row.state,
      country: row.country,
      zipCode: row.zip_code,
      venueContactName: row.venue_contact_name,
      venueContactEmail: row.venue_contact_email,
    };
  }

  async getEventsByOrganizer(organizerEmail: string): Promise<Event[]> {
    const cacheKey = cacheService.getEventsCacheKey(organizerEmail);
    const cachedEvents = cacheService.get<Event[]>(cacheKey);
    if (cachedEvents) {
      return cachedEvents;
    }

    try {
      const result = await databaseService.query(
        `SELECT * FROM events WHERE email = $1 ORDER BY event_name ASC`,
        [organizerEmail]
      );
      const events = result.rows.map(this.mapEventRow);
      cacheService.cacheEventsByOrganizer(organizerEmail, events);
      return events;
    } catch (error) {
      throw new Error(`Failed to fetch events for organizer ${organizerEmail}: ${error}`);
    }
  }

  async getEventById(eventId: string): Promise<Event | null> {
    const cacheKey = cacheService.getEventCacheKey(eventId);
    const cachedEvent = cacheService.get<Event>(cacheKey);
    if (cachedEvent) {
      return cachedEvent;
    }

    try {
      const result = await databaseService.query(
        `SELECT * FROM events WHERE airtable_id = $1`,
        [eventId]
      );
      if (result.rows.length === 0) {
        return null;
      }
      const event = this.mapEventRow(result.rows[0]);
      cacheService.cacheEvent(eventId, event);
      return event;
    } catch (error) {
      throw new Error(`Failed to fetch event ${eventId}: ${error}`);
    }
  }

  async updateEvent(eventId: string, updateData: UpdateEventData): Promise<Event> {
    try {
      const setClauses: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      const fieldMap: Record<string, string> = {
        pocFirstName: 'poc_first_name',
        pocLastName: 'poc_last_name',
        pocPreferredName: 'poc_preferred_name',
        pocSlackId: 'poc_slack_id',
        location: 'location',
        streetAddress: 'street_address',
        streetAddress2: 'street_address_2',
        city: 'city',
        state: 'state',
        zipcode: 'zipcode',
        country: 'country',
        eventFormat: 'event_format',
        estimatedAttendeeCount: 'estimated_attendee_count',
        projectUrl: 'project_url',
        projectDescription: 'project_description',
        triageStatus: 'triage_status',
        notes: 'notes',
      };

      for (const [jsKey, pgColumn] of Object.entries(fieldMap)) {
        const value = (updateData as any)[jsKey];
        if (value !== undefined) {
          setClauses.push(`${pgColumn} = $${paramIndex}`);
          values.push(value);
          paramIndex++;
        }
      }

      if (setClauses.length === 0) {
        const existing = await this.getEventById(eventId);
        if (!existing) throw new Error(`Event ${eventId} not found`);
        return existing;
      }

      setClauses.push(`updated_at = NOW()`);
      values.push(eventId);

      const query = `
        UPDATE events SET ${setClauses.join(', ')}
        WHERE airtable_id = $${paramIndex}
        RETURNING *
      `;

      const result = await databaseService.query(query, values);
      if (result.rows.length === 0) {
        throw new Error(`Event ${eventId} not found`);
      }

      const updatedEvent = this.mapEventRow(result.rows[0]);
      cacheService.invalidateEventCaches(eventId, updatedEvent.email);
      return updatedEvent;
    } catch (error) {
      throw new Error(`Failed to update event ${eventId}: ${error}`);
    }
  }

  async getAllOrganizerEmails(): Promise<string[]> {
    const cacheKey = cacheService.getOrganizerEmailsCacheKey();
    const cachedEmails = cacheService.get<string[]>(cacheKey);
    if (cachedEmails) {
      return cachedEmails;
    }

    try {
      const result = await databaseService.query(
        `SELECT DISTINCT email FROM events WHERE email IS NOT NULL ORDER BY email ASC`
      );
      const emails = result.rows.map((row: any) => row.email);
      cacheService.cacheOrganizerEmails(emails);
      return emails;
    } catch (error) {
      console.error('Database error fetching organizer emails:', error);
      throw new Error(`Failed to fetch organizer emails: ${error}`);
    }
  }

  async getAllEvents(): Promise<Event[]> {
    const cacheKey = 'all-events';
    const cachedEvents = cacheService.get<Event[]>(cacheKey);
    if (cachedEvents) {
      return cachedEvents;
    }

    try {
      const result = await databaseService.query(
        `SELECT * FROM events ORDER BY event_name ASC`
      );
      const events = result.rows.map(this.mapEventRow);
      cacheService.set(cacheKey, events, 2 * 60 * 1000);
      return events;
    } catch (error) {
      throw new Error(`Failed to fetch all events: ${error}`);
    }
  }

  async isAdmin(email: string): Promise<boolean> {
    const cacheKey = `admin-check:${email}`;
    const cachedResult = cacheService.get<boolean>(cacheKey);
    if (cachedResult !== null) {
      return cachedResult;
    }

    try {
      const result = await databaseService.query(
        `SELECT user_status FROM admins WHERE email = $1 LIMIT 1`,
        [email.toLowerCase()]
      );

      const isAdmin = result.rows.length > 0 &&
        (result.rows[0].user_status === 'active' || result.rows[0].user_status === 'admin');

      cacheService.set(cacheKey, isAdmin, 10 * 60 * 1000);
      return isAdmin;
    } catch (error) {
      console.error('Admin check error:', error);
      return false;
    }
  }

  async getAdminByEmail(email: string): Promise<Admin | null> {
    try {
      const result = await databaseService.query(
        `SELECT * FROM admins WHERE email = $1 LIMIT 1`,
        [email.toLowerCase()]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return this.mapAdminRow(result.rows[0]);
    } catch (error) {
      throw new Error(`Failed to fetch admin ${email}: ${error}`);
    }
  }

  async getAllAdmins(): Promise<Admin[]> {
    try {
      const result = await databaseService.query(
        `SELECT * FROM admins ORDER BY email ASC`
      );
      return result.rows.map(this.mapAdminRow);
    } catch (error) {
      throw new Error(`Failed to fetch all admins: ${error}`);
    }
  }

  async checkEmailAccess(email: string): Promise<{ hasAccess: boolean; isAdmin: boolean; adminData?: Admin }> {
    try {
      const normalizedEmail = email.toLowerCase();

      const adminRecord = await this.getAdminByEmail(normalizedEmail);
      if (adminRecord) {
        console.log(`[Email Access Check] Admin record found for ${normalizedEmail}:`, {
          id: adminRecord.id,
          email: adminRecord.email,
          userStatus: adminRecord.userStatus,
          firstName: adminRecord.firstName,
          lastName: adminRecord.lastName
        });
        const isAdmin = adminRecord.userStatus === 'admin';
        console.log(`[Email Access Check] isAdmin result: ${isAdmin} (userStatus: "${adminRecord.userStatus}")`);
        return {
          hasAccess: true,
          isAdmin,
          adminData: adminRecord
        };
      }

      const eventResult = await databaseService.query(
        `SELECT 1 FROM events WHERE email = $1 LIMIT 1`,
        [normalizedEmail]
      );

      const hasEventAccess = eventResult.rows.length > 0;

      return {
        hasAccess: hasEventAccess,
        isAdmin: false
      };
    } catch (error) {
      console.error('Email access check error:', error);
      return {
        hasAccess: false,
        isAdmin: false
      };
    }
  }

  async getAllAttendees(): Promise<Attendee[]> {
    try {
      const result = await databaseService.query(
        `SELECT * FROM attendees ORDER BY email ASC`
      );
      return result.rows.map(this.mapAttendeeRow);
    } catch (error) {
      console.error('Error fetching attendees from database:', error);
      throw error;
    }
  }

  async getAttendeesByEvent(eventAirtableId: string): Promise<Attendee[]> {
    try {
      const result = await databaseService.query(
        `SELECT * FROM attendees WHERE event_airtable_id = $1 ORDER BY email ASC`,
        [eventAirtableId]
      );
      return result.rows.map(this.mapAttendeeRow);
    } catch (error) {
      console.error('Error fetching attendees for event from database:', error);
      throw error;
    }
  }

  async getAllVenues(): Promise<Venue[]> {
    try {
      const result = await databaseService.query(
        `SELECT * FROM venues ORDER BY event_name ASC`
      );
      return result.rows.map(this.mapVenueRow);
    } catch (error) {
      console.error('Error fetching venues from database:', error);
      throw error;
    }
  }

  async getVenueByEventName(eventName: string): Promise<Venue | null> {
    try {
      const result = await databaseService.query(
        `SELECT * FROM venues WHERE event_name = $1 LIMIT 1`,
        [eventName]
      );
      if (result.rows.length === 0) {
        return null;
      }
      return this.mapVenueRow(result.rows[0]);
    } catch (error) {
      console.error('Error fetching venue for event from database:', error);
      throw error;
    }
  }

  async updateAttendeeDeletedStatus(attendeeId: string, deleted_in_cockpit: boolean): Promise<void> {
    try {
      await databaseService.query(
        `UPDATE attendees SET deleted_in_cockpit = $1, updated_at = NOW() WHERE airtable_id = $2`,
        [deleted_in_cockpit, attendeeId]
      );
      console.log(`Updated attendee ${attendeeId} deleted_in_cockpit to ${deleted_in_cockpit}`);
    } catch (error) {
      console.error('Error updating attendee deleted status:', error);
      throw error;
    }
  }

  async updateAttendeeScannedInStatus(attendeeId: string, scanned_in: boolean): Promise<void> {
    try {
      await databaseService.query(
        `UPDATE attendees SET scanned_in = $1, updated_at = NOW() WHERE airtable_id = $2`,
        [scanned_in, attendeeId]
      );
      console.log(`Updated attendee ${attendeeId} scanned_in to ${scanned_in}`);
    } catch (error) {
      console.error('Error updating attendee scanned_in status:', error);
      throw error;
    }
  }

}

export const airtableService = new AirtableService();
