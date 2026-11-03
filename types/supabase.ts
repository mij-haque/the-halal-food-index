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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      areas: {
        Row: {
          centroid: unknown
          city: string
          created_at: string | null
          id: string
          name: string
          parent_id: string | null
          region: string
          slug: string
        }
        Insert: {
          centroid?: unknown
          city?: string
          created_at?: string | null
          id?: string
          name: string
          parent_id?: string | null
          region?: string
          slug: string
        }
        Update: {
          centroid?: unknown
          city?: string
          created_at?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          region?: string
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "areas_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
        ]
      }
      certification_bodies: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string
          name: string
          slug: string
          stunning: string
          website: string | null
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          name: string
          slug: string
          stunning?: string
          website?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          name?: string
          slug?: string
          stunning?: string
          website?: string | null
        }
        Relationships: []
      }
      chain_branch_status: {
        Row: {
          branch_name: string
          chain_id: string
          id: string
          last_verified_at: string | null
          source_note: string | null
          status: string
          venue_id: string | null
        }
        Insert: {
          branch_name: string
          chain_id: string
          id?: string
          last_verified_at?: string | null
          source_note?: string | null
          status: string
          venue_id?: string | null
        }
        Update: {
          branch_name?: string
          chain_id?: string
          id?: string
          last_verified_at?: string | null
          source_note?: string | null
          status?: string
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chain_branch_status_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "chains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chain_branch_status_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "review_queue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chain_branch_status_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      chain_items: {
        Row: {
          chain_id: string
          id: string
          item_label: string
          note: string | null
          sort_order: number | null
          status: string
        }
        Insert: {
          chain_id: string
          id?: string
          item_label: string
          note?: string | null
          sort_order?: number | null
          status: string
        }
        Update: {
          chain_id?: string
          id?: string
          item_label?: string
          note?: string | null
          sort_order?: number | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "chain_items_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "chains"
            referencedColumns: ["id"]
          },
        ]
      }
      chains: {
        Row: {
          created_at: string | null
          id: string
          last_reviewed_at: string | null
          logo_url: string | null
          name: string
          serves_alcohol: boolean | null
          slug: string
          status_summary: string | null
          uk_status: string
          updated_at: string | null
          website: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_reviewed_at?: string | null
          logo_url?: string | null
          name: string
          serves_alcohol?: boolean | null
          slug: string
          status_summary?: string | null
          uk_status?: string
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_reviewed_at?: string | null
          logo_url?: string | null
          name?: string
          serves_alcohol?: boolean | null
          slug?: string
          status_summary?: string | null
          uk_status?: string
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      collection_venues: {
        Row: {
          collection_id: string
          pinned_rank: number | null
          venue_id: string
        }
        Insert: {
          collection_id: string
          pinned_rank?: number | null
          venue_id: string
        }
        Update: {
          collection_id?: string
          pinned_rank?: number | null
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_venues_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_venues_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "review_queue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_venues_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          created_at: string | null
          h1: string | null
          id: string
          intro: string | null
          meta_desc: string | null
          meta_title: string | null
          min_venues: number
          rule_area_id: string | null
          rule_cuisine_id: string | null
          rule_tags: string[] | null
          slug: string
          status: string
          title: string
        }
        Insert: {
          created_at?: string | null
          h1?: string | null
          id?: string
          intro?: string | null
          meta_desc?: string | null
          meta_title?: string | null
          min_venues?: number
          rule_area_id?: string | null
          rule_cuisine_id?: string | null
          rule_tags?: string[] | null
          slug: string
          status?: string
          title: string
        }
        Update: {
          created_at?: string | null
          h1?: string | null
          id?: string
          intro?: string | null
          meta_desc?: string | null
          meta_title?: string | null
          min_venues?: number
          rule_area_id?: string | null
          rule_cuisine_id?: string | null
          rule_tags?: string[] | null
          slug?: string
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "collections_rule_area_id_fkey"
            columns: ["rule_area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collections_rule_cuisine_id_fkey"
            columns: ["rule_cuisine_id"]
            isOneToOne: false
            referencedRelation: "cuisines"
            referencedColumns: ["id"]
          },
        ]
      }
      corrections: {
        Row: {
          chain_id: string | null
          created_at: string | null
          detail: string
          id: string
          issue_type: string
          reporter_email: string | null
          resolution: string | null
          resolved_at: string | null
          status: string
          venue_id: string | null
        }
        Insert: {
          chain_id?: string | null
          created_at?: string | null
          detail: string
          id?: string
          issue_type: string
          reporter_email?: string | null
          resolution?: string | null
          resolved_at?: string | null
          status?: string
          venue_id?: string | null
        }
        Update: {
          chain_id?: string | null
          created_at?: string | null
          detail?: string
          id?: string
          issue_type?: string
          reporter_email?: string | null
          resolution?: string | null
          resolved_at?: string | null
          status?: string
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "corrections_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "chains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "corrections_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "review_queue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "corrections_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      cuisines: {
        Row: {
          colour_hex: string
          created_at: string | null
          id: string
          name: string
          pattern_key: string | null
          slug: string
          sort_order: number | null
        }
        Insert: {
          colour_hex: string
          created_at?: string | null
          id?: string
          name: string
          pattern_key?: string | null
          slug: string
          sort_order?: number | null
        }
        Update: {
          colour_hex?: string
          created_at?: string | null
          id?: string
          name?: string
          pattern_key?: string | null
          slug?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      external_place_cache: {
        Row: {
          expires_at: string
          external_id: string
          fetched_at: string
          id: string
          payload: Json
          provider: string
          venue_id: string
        }
        Insert: {
          expires_at: string
          external_id: string
          fetched_at?: string
          id?: string
          payload: Json
          provider?: string
          venue_id: string
        }
        Update: {
          expires_at?: string
          external_id?: string
          fetched_at?: string
          id?: string
          payload?: Json
          provider?: string
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "external_place_cache_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "review_queue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "external_place_cache_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          address: string | null
          created_at: string | null
          cuisine_hint: string | null
          halal_claim: string | null
          id: string
          is_owner: boolean | null
          notes: string | null
          postcode: string | null
          status: string
          submitter_email: string | null
          submitter_name: string | null
          venue_id: string | null
          venue_name: string
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          cuisine_hint?: string | null
          halal_claim?: string | null
          id?: string
          is_owner?: boolean | null
          notes?: string | null
          postcode?: string | null
          status?: string
          submitter_email?: string | null
          submitter_name?: string | null
          venue_id?: string | null
          venue_name: string
        }
        Update: {
          address?: string | null
          created_at?: string | null
          cuisine_hint?: string | null
          halal_claim?: string | null
          id?: string
          is_owner?: boolean | null
          notes?: string | null
          postcode?: string | null
          status?: string
          submitter_email?: string | null
          submitter_name?: string | null
          venue_id?: string | null
          venue_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "review_queue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      venue_cuisines: {
        Row: {
          cuisine_id: string
          is_primary: boolean | null
          venue_id: string
        }
        Insert: {
          cuisine_id: string
          is_primary?: boolean | null
          venue_id: string
        }
        Update: {
          cuisine_id?: string
          is_primary?: boolean | null
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "venue_cuisines_cuisine_id_fkey"
            columns: ["cuisine_id"]
            isOneToOne: false
            referencedRelation: "cuisines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "venue_cuisines_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "review_queue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "venue_cuisines_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      venue_photos: {
        Row: {
          alt_text: string | null
          created_at: string | null
          id: string
          kind: string
          look_key: string | null
          original_path: string | null
          permission_note: string | null
          sort_order: number
          source: string
          status: string
          storage_path: string
          taken_at: string | null
          venue_id: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string | null
          id?: string
          kind: string
          look_key?: string | null
          original_path?: string | null
          permission_note?: string | null
          sort_order?: number
          source?: string
          status?: string
          storage_path: string
          taken_at?: string | null
          venue_id: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string | null
          id?: string
          kind?: string
          look_key?: string | null
          original_path?: string | null
          permission_note?: string | null
          sort_order?: number
          source?: string
          status?: string
          storage_path?: string
          taken_at?: string | null
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "venue_photos_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "review_queue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "venue_photos_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      venues: {
        Row: {
          address_line: string | null
          area_id: string | null
          cert_expires_on: string | null
          cert_reference: string | null
          certification_id: string | null
          chain_id: string | null
          created_at: string | null
          google_place_id: string | null
          halal_scope: string | null
          halal_status: string
          id: string
          last_verified_at: string | null
          location: unknown
          name: string
          phone: string | null
          postcode: string | null
          price_band: string | null
          published_at: string | null
          score: number | null
          serves_alcohol: boolean | null
          shared_kitchen: boolean | null
          slug: string
          status: string
          stunning: string | null
          summary: string | null
          tags: string[]
          updated_at: string | null
          venue_type: string
          verification_tier: string
          website: string | null
        }
        Insert: {
          address_line?: string | null
          area_id?: string | null
          cert_expires_on?: string | null
          cert_reference?: string | null
          certification_id?: string | null
          chain_id?: string | null
          created_at?: string | null
          google_place_id?: string | null
          halal_scope?: string | null
          halal_status?: string
          id?: string
          last_verified_at?: string | null
          location?: unknown
          name: string
          phone?: string | null
          postcode?: string | null
          price_band?: string | null
          published_at?: string | null
          score?: number | null
          serves_alcohol?: boolean | null
          shared_kitchen?: boolean | null
          slug: string
          status?: string
          stunning?: string | null
          summary?: string | null
          tags?: string[]
          updated_at?: string | null
          venue_type?: string
          verification_tier?: string
          website?: string | null
        }
        Update: {
          address_line?: string | null
          area_id?: string | null
          cert_expires_on?: string | null
          cert_reference?: string | null
          certification_id?: string | null
          chain_id?: string | null
          created_at?: string | null
          google_place_id?: string | null
          halal_scope?: string | null
          halal_status?: string
          id?: string
          last_verified_at?: string | null
          location?: unknown
          name?: string
          phone?: string | null
          postcode?: string | null
          price_band?: string | null
          published_at?: string | null
          score?: number | null
          serves_alcohol?: boolean | null
          shared_kitchen?: boolean | null
          slug?: string
          status?: string
          stunning?: string | null
          summary?: string | null
          tags?: string[]
          updated_at?: string | null
          venue_type?: string
          verification_tier?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "venues_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "venues_certification_id_fkey"
            columns: ["certification_id"]
            isOneToOne: false
            referencedRelation: "certification_bodies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "venues_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "chains"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_events: {
        Row: {
          checked_at: string
          checked_by: string | null
          confidence: string
          created_at: string | null
          evidence_note: string | null
          evidence_url: string | null
          id: string
          method: string
          scope_note: string | null
          venue_id: string
          verdict: string
        }
        Insert: {
          checked_at?: string
          checked_by?: string | null
          confidence?: string
          created_at?: string | null
          evidence_note?: string | null
          evidence_url?: string | null
          id?: string
          method: string
          scope_note?: string | null
          venue_id: string
          verdict: string
        }
        Update: {
          checked_at?: string
          checked_by?: string | null
          confidence?: string
          created_at?: string | null
          evidence_note?: string | null
          evidence_url?: string | null
          id?: string
          method?: string
          scope_note?: string | null
          venue_id?: string
          verdict?: string
        }
        Relationships: [
          {
            foreignKeyName: "verification_events_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "review_queue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_events_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      review_queue: {
        Row: {
          id: string | null
          last_verified_at: string | null
          method: string | null
          name: string | null
          slug: string | null
          urgency: string | null
        }
        Relationships: []
      }
      venue_current_verification: {
        Row: {
          confidence: string | null
          is_stale: boolean | null
          last_verified_at: string | null
          method: string | null
          venue_id: string | null
          verdict: string | null
        }
        Relationships: [
          {
            foreignKeyName: "verification_events_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "review_queue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_events_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      [_ in never]: never
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
