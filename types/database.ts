export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      allocations: {
        Row: {
          allocated_at: string
          application_id: string | null
          bed_id: string
          created_at: string
          ends_at: string | null
          hostel_id: string
          id: string
          starts_at: string
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          allocated_at?: string
          application_id?: string | null
          bed_id: string
          created_at?: string
          ends_at?: string | null
          hostel_id: string
          id?: string
          starts_at: string
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          allocated_at?: string
          application_id?: string | null
          bed_id?: string
          created_at?: string
          ends_at?: string | null
          hostel_id?: string
          id?: string
          starts_at?: string
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "allocations_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "allocations_bed_id_fkey"
            columns: ["bed_id"]
            isOneToOne: false
            referencedRelation: "beds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "allocations_hostel_id_fkey"
            columns: ["hostel_id"]
            isOneToOne: false
            referencedRelation: "hostels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "allocations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          audience_type: string
          body: string
          created_at: string
          created_by: string
          expires_at: string | null
          hostel_id: string
          id: string
          published_at: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          audience_type: string
          body: string
          created_at?: string
          created_by: string
          expires_at?: string | null
          hostel_id: string
          id?: string
          published_at?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          audience_type?: string
          body?: string
          created_at?: string
          created_by?: string
          expires_at?: string | null
          hostel_id?: string
          id?: string
          published_at?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_hostel_id_fkey"
            columns: ["hostel_id"]
            isOneToOne: false
            referencedRelation: "hostels"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          applicant_user_id: string
          application_number: string
          created_at: string
          expires_at: string | null
          hostel_id: string
          id: string
          status: string
          submitted_at: string | null
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          applicant_user_id: string
          application_number: string
          created_at?: string
          expires_at?: string | null
          hostel_id: string
          id?: string
          status?: string
          submitted_at?: string | null
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          applicant_user_id?: string
          application_number?: string
          created_at?: string
          expires_at?: string | null
          hostel_id?: string
          id?: string
          status?: string
          submitted_at?: string | null
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_hostel_id_fkey"
            columns: ["hostel_id"]
            isOneToOne: false
            referencedRelation: "hostels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_user_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          hostel_id: string | null
          id: string
          metadata: Json | null
          result: string
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          hostel_id?: string | null
          id?: string
          metadata?: Json | null
          result: string
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          hostel_id?: string | null
          id?: string
          metadata?: Json | null
          result?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_hostel_id_fkey"
            columns: ["hostel_id"]
            isOneToOne: false
            referencedRelation: "hostels"
            referencedColumns: ["id"]
          },
        ]
      }
      beds: {
        Row: {
          bed_number: string
          created_at: string
          id: string
          room_id: string
          status: string
          updated_at: string
        }
        Insert: {
          bed_number: string
          created_at?: string
          id?: string
          room_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          bed_number?: string
          created_at?: string
          id?: string
          room_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "beds_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      buildings: {
        Row: {
          code: string | null
          created_at: string
          hostel_id: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          hostel_id: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          code?: string | null
          created_at?: string
          hostel_id?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "buildings_hostel_id_fkey"
            columns: ["hostel_id"]
            isOneToOne: false
            referencedRelation: "hostels"
            referencedColumns: ["id"]
          },
        ]
      }
      charges: {
        Row: {
          amount: number
          application_id: string | null
          created_at: string
          currency: string
          description: string
          due_at: string | null
          fee_plan_id: string | null
          hostel_id: string
          id: string
          status: string
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          application_id?: string | null
          created_at?: string
          currency: string
          description: string
          due_at?: string | null
          fee_plan_id?: string | null
          hostel_id: string
          id?: string
          status?: string
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          application_id?: string | null
          created_at?: string
          currency?: string
          description?: string
          due_at?: string | null
          fee_plan_id?: string | null
          hostel_id?: string
          id?: string
          status?: string
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "charges_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charges_fee_plan_id_fkey"
            columns: ["fee_plan_id"]
            isOneToOne: false
            referencedRelation: "fee_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charges_hostel_id_fkey"
            columns: ["hostel_id"]
            isOneToOne: false
            referencedRelation: "hostels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charges_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      complaints: {
        Row: {
          created_at: string
          description: string
          handled_by: string | null
          hostel_id: string
          id: string
          resolved_at: string | null
          status: string
          subject: string
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          handled_by?: string | null
          hostel_id: string
          id?: string
          resolved_at?: string | null
          status?: string
          subject: string
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          handled_by?: string | null
          hostel_id?: string
          id?: string
          resolved_at?: string | null
          status?: string
          subject?: string
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaints_hostel_id_fkey"
            columns: ["hostel_id"]
            isOneToOne: false
            referencedRelation: "hostels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_plans: {
        Row: {
          amount: number
          created_at: string
          currency: string
          description: string | null
          ends_at: string | null
          hostel_id: string
          id: string
          name: string
          starts_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency: string
          description?: string | null
          ends_at?: string | null
          hostel_id: string
          id?: string
          name: string
          starts_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          description?: string | null
          ends_at?: string | null
          hostel_id?: string
          id?: string
          name?: string
          starts_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fee_plans_hostel_id_fkey"
            columns: ["hostel_id"]
            isOneToOne: false
            referencedRelation: "hostels"
            referencedColumns: ["id"]
          },
        ]
      }
      files: {
        Row: {
          created_at: string
          file_name: string
          hostel_id: string
          id: string
          mime_type: string
          related_entity: string | null
          related_id: string | null
          size_bytes: number
          storage_path: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          file_name: string
          hostel_id: string
          id?: string
          mime_type: string
          related_entity?: string | null
          related_id?: string | null
          size_bytes: number
          storage_path: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          file_name?: string
          hostel_id?: string
          id?: string
          mime_type?: string
          related_entity?: string | null
          related_id?: string | null
          size_bytes?: number
          storage_path?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "files_hostel_id_fkey"
            columns: ["hostel_id"]
            isOneToOne: false
            referencedRelation: "hostels"
            referencedColumns: ["id"]
          },
        ]
      }
      floors: {
        Row: {
          building_id: string
          created_at: string
          floor_number: number | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          building_id: string
          created_at?: string
          floor_number?: number | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          building_id?: string
          created_at?: string
          floor_number?: number | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "floors_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
        ]
      }
      hostel_memberships: {
        Row: {
          created_at: string
          hostel_id: string
          id: string
          membership_role: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          hostel_id: string
          id?: string
          membership_role: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          hostel_id?: string
          id?: string
          membership_role?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hostel_memberships_hostel_id_fkey"
            columns: ["hostel_id"]
            isOneToOne: false
            referencedRelation: "hostels"
            referencedColumns: ["id"]
          },
        ]
      }
      hostels: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          id: string
          location: string
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          location: string
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          location?: string
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      incidents: {
        Row: {
          created_at: string
          description: string
          handled_by: string | null
          hostel_id: string
          id: string
          incident_type: string
          occurred_at: string | null
          reported_by: string
          resolved_at: string | null
          room_id: string | null
          status: string
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          handled_by?: string | null
          hostel_id: string
          id?: string
          incident_type: string
          occurred_at?: string | null
          reported_by: string
          resolved_at?: string | null
          room_id?: string | null
          status?: string
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          handled_by?: string | null
          hostel_id?: string
          id?: string
          incident_type?: string
          occurred_at?: string | null
          reported_by?: string
          resolved_at?: string | null
          room_id?: string | null
          status?: string
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "incidents_hostel_id_fkey"
            columns: ["hostel_id"]
            isOneToOne: false
            referencedRelation: "hostels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_requests: {
        Row: {
          assigned_staff_id: string | null
          bed_id: string | null
          created_at: string
          description: string
          hostel_id: string
          id: string
          priority: string
          resolved_at: string | null
          room_id: string | null
          status: string
          tenant_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_staff_id?: string | null
          bed_id?: string | null
          created_at?: string
          description: string
          hostel_id: string
          id?: string
          priority?: string
          resolved_at?: string | null
          room_id?: string | null
          status?: string
          tenant_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_staff_id?: string | null
          bed_id?: string | null
          created_at?: string
          description?: string
          hostel_id?: string
          id?: string
          priority?: string
          resolved_at?: string | null
          room_id?: string | null
          status?: string
          tenant_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_requests_assigned_staff_id_fkey"
            columns: ["assigned_staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_requests_bed_id_fkey"
            columns: ["bed_id"]
            isOneToOne: false
            referencedRelation: "beds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_requests_hostel_id_fkey"
            columns: ["hostel_id"]
            isOneToOne: false
            referencedRelation: "hostels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_requests_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_requests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          hostel_id: string
          id: string
          read_at: string | null
          related_entity: string | null
          related_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          hostel_id: string
          id?: string
          read_at?: string | null
          related_entity?: string | null
          related_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          hostel_id?: string
          id?: string
          read_at?: string | null
          related_entity?: string | null
          related_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_hostel_id_fkey"
            columns: ["hostel_id"]
            isOneToOne: false
            referencedRelation: "hostels"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          application_id: string | null
          charge_id: string | null
          created_at: string
          currency: string
          hostel_id: string
          id: string
          internal_reference: string
          metadata: Json | null
          paid_at: string | null
          provider: string
          provider_reference: string
          status: string
          tenant_id: string | null
          updated_at: string
          verified_at: string | null
        }
        Insert: {
          amount: number
          application_id?: string | null
          charge_id?: string | null
          created_at?: string
          currency: string
          hostel_id: string
          id?: string
          internal_reference: string
          metadata?: Json | null
          paid_at?: string | null
          provider: string
          provider_reference: string
          status?: string
          tenant_id?: string | null
          updated_at?: string
          verified_at?: string | null
        }
        Update: {
          amount?: number
          application_id?: string | null
          charge_id?: string | null
          created_at?: string
          currency?: string
          hostel_id?: string
          id?: string
          internal_reference?: string
          metadata?: Json | null
          paid_at?: string | null
          provider?: string
          provider_reference?: string
          status?: string
          tenant_id?: string | null
          updated_at?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_charge_id_fkey"
            columns: ["charge_id"]
            isOneToOne: false
            referencedRelation: "charges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_hostel_id_fkey"
            columns: ["hostel_id"]
            isOneToOne: false
            referencedRelation: "hostels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_path: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_path?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_path?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      rooms: {
        Row: {
          capacity: number
          created_at: string
          floor_id: string
          id: string
          room_number: string
          status: string
          updated_at: string
        }
        Insert: {
          capacity: number
          created_at?: string
          floor_id: string
          id?: string
          room_number: string
          status?: string
          updated_at?: string
        }
        Update: {
          capacity?: number
          created_at?: string
          floor_id?: string
          id?: string
          room_number?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rooms_floor_id_fkey"
            columns: ["floor_id"]
            isOneToOne: false
            referencedRelation: "floors"
            referencedColumns: ["id"]
          },
        ]
      }
      staff: {
        Row: {
          created_at: string
          department: string | null
          hostel_id: string
          id: string
          staff_number: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          hostel_id: string
          id?: string
          staff_number?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          department?: string | null
          hostel_id?: string
          id?: string
          staff_number?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_hostel_id_fkey"
            columns: ["hostel_id"]
            isOneToOne: false
            referencedRelation: "hostels"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_tasks: {
        Row: {
          assigned_staff_id: string
          completed_at: string | null
          created_at: string
          description: string | null
          due_at: string | null
          hostel_id: string
          id: string
          maintenance_request_id: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_staff_id: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_at?: string | null
          hostel_id: string
          id?: string
          maintenance_request_id?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_staff_id?: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_at?: string | null
          hostel_id?: string
          id?: string
          maintenance_request_id?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_tasks_assigned_staff_id_fkey"
            columns: ["assigned_staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_tasks_hostel_id_fkey"
            columns: ["hostel_id"]
            isOneToOne: false
            referencedRelation: "hostels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_tasks_maintenance_request_id_fkey"
            columns: ["maintenance_request_id"]
            isOneToOne: false
            referencedRelation: "maintenance_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      stays: {
        Row: {
          allocation_id: string
          checked_in_at: string | null
          checked_out_at: string | null
          created_at: string
          hostel_id: string
          id: string
          scheduled_check_in_at: string | null
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          allocation_id: string
          checked_in_at?: string | null
          checked_out_at?: string | null
          created_at?: string
          hostel_id: string
          id?: string
          scheduled_check_in_at?: string | null
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          allocation_id?: string
          checked_in_at?: string | null
          checked_out_at?: string | null
          created_at?: string
          hostel_id?: string
          id?: string
          scheduled_check_in_at?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stays_allocation_id_fkey"
            columns: ["allocation_id"]
            isOneToOne: false
            referencedRelation: "allocations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stays_hostel_id_fkey"
            columns: ["hostel_id"]
            isOneToOne: false
            referencedRelation: "hostels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stays_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          hostel_id: string
          id: string
          status: string
          tenant_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          hostel_id: string
          id?: string
          status?: string
          tenant_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          hostel_id?: string
          id?: string
          status?: string
          tenant_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenants_hostel_id_fkey"
            columns: ["hostel_id"]
            isOneToOne: false
            referencedRelation: "hostels"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_provision_user: {
        Args: {
          p_actor_user_id: string
          p_email: string
          p_full_name: string
          p_hostel_id: string
          p_role: string
          p_target_user_id: string
        }
        Returns: Json
      }
      create_application_with_charge: {
        Args: { p_fee_plan_id: string }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
