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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          created_at: string
          id: string
          message: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
        }
        Relationships: []
      }
      auction_config: {
        Row: {
          event_start: string
          freeze_base_seconds: number
          freeze_global_cooldown_seconds: number
          freeze_increment_seconds: number
          freeze_increment_unit_lakhs: number
          freeze_max_seconds: number
          freeze_min_seconds: number
          id: number
          retention_cost_first: number
          retention_cost_second: number
          retention_cost_third: number
          retention_max_per_team: number
          rtm_cards_per_team: number
          rtm_enabled: boolean
          rtm_window_seconds: number
          show_homepage_stats: boolean
          updated_at: string
        }
        Insert: {
          event_start?: string
          freeze_base_seconds?: number
          freeze_global_cooldown_seconds?: number
          freeze_increment_seconds?: number
          freeze_increment_unit_lakhs?: number
          freeze_max_seconds?: number
          freeze_min_seconds?: number
          id?: number
          retention_cost_first?: number
          retention_cost_second?: number
          retention_cost_third?: number
          retention_max_per_team?: number
          rtm_cards_per_team?: number
          rtm_enabled?: boolean
          rtm_window_seconds?: number
          show_homepage_stats?: boolean
          updated_at?: string
        }
        Update: {
          event_start?: string
          freeze_base_seconds?: number
          freeze_global_cooldown_seconds?: number
          freeze_increment_seconds?: number
          freeze_increment_unit_lakhs?: number
          freeze_max_seconds?: number
          freeze_min_seconds?: number
          id?: number
          retention_cost_first?: number
          retention_cost_second?: number
          retention_cost_third?: number
          retention_max_per_team?: number
          rtm_cards_per_team?: number
          rtm_enabled?: boolean
          rtm_window_seconds?: number
          show_homepage_stats?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      auction_log: {
        Row: {
          amount: number | null
          created_at: string
          id: string
          message: string
          player_id: string | null
          team_id: string | null
          type: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          id?: string
          message?: string
          player_id?: string | null
          team_id?: string | null
          type: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          id?: string
          message?: string
          player_id?: string | null
          team_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "auction_log_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auction_log_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      auction_state: {
        Row: {
          bid_increment: number
          bid_reset_seconds: number
          current_bid_amount: number
          current_phase: Database["public"]["Enums"]["auction_phase"]
          current_player_id: string | null
          id: number
          leading_team_id: string | null
          status: Database["public"]["Enums"]["auction_status"]
          timer_expires_at: number | null
          timer_running: boolean
          updated_at: string
        }
        Insert: {
          bid_increment?: number
          bid_reset_seconds?: number
          current_bid_amount?: number
          current_phase?: Database["public"]["Enums"]["auction_phase"]
          current_player_id?: string | null
          id?: number
          leading_team_id?: string | null
          status?: Database["public"]["Enums"]["auction_status"]
          timer_expires_at?: number | null
          timer_running?: boolean
          updated_at?: string
        }
        Update: {
          bid_increment?: number
          bid_reset_seconds?: number
          current_bid_amount?: number
          current_phase?: Database["public"]["Enums"]["auction_phase"]
          current_player_id?: string | null
          id?: number
          leading_team_id?: string | null
          status?: Database["public"]["Enums"]["auction_status"]
          timer_expires_at?: number | null
          timer_running?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "auction_state_current_player_id_fkey"
            columns: ["current_player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auction_state_leading_team_id_fkey"
            columns: ["leading_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      bids: {
        Row: {
          amount: number
          created_at: string
          id: string
          player_id: string
          team_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          player_id: string
          team_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          player_id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bids_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bids_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          base_price: number
          batting: number
          batting_style: string
          bowling: number
          bowling_style: string
          category: Database["public"]["Enums"]["player_category"]
          created_at: string
          fielding: number
          franchise: string
          id: string
          image_url: string
          name: string
          nationality: string
          previous_team_id: string | null
          rating: number
          role: Database["public"]["Enums"]["player_role"]
          sold_price: number | null
          sold_to_team_id: string | null
          sort_order: number
          status: Database["public"]["Enums"]["player_status"]
          sub_role: string
          updated_at: string
        }
        Insert: {
          base_price?: number
          batting?: number
          batting_style?: string
          bowling?: number
          bowling_style?: string
          category?: Database["public"]["Enums"]["player_category"]
          created_at?: string
          fielding?: number
          franchise?: string
          id?: string
          image_url?: string
          name: string
          nationality?: string
          previous_team_id?: string | null
          rating?: number
          role?: Database["public"]["Enums"]["player_role"]
          sold_price?: number | null
          sold_to_team_id?: string | null
          sort_order?: number
          status?: Database["public"]["Enums"]["player_status"]
          sub_role?: string
          updated_at?: string
        }
        Update: {
          base_price?: number
          batting?: number
          batting_style?: string
          bowling?: number
          bowling_style?: string
          category?: Database["public"]["Enums"]["player_category"]
          created_at?: string
          fielding?: number
          franchise?: string
          id?: string
          image_url?: string
          name?: string
          nationality?: string
          previous_team_id?: string | null
          rating?: number
          role?: Database["public"]["Enums"]["player_role"]
          sold_price?: number | null
          sold_to_team_id?: string | null
          sort_order?: number
          status?: Database["public"]["Enums"]["player_status"]
          sub_role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "players_previous_team_id_fkey"
            columns: ["previous_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "players_sold_to_team_id_fkey"
            columns: ["sold_to_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_player_freezes: {
        Row: {
          bid_amount: number
          created_at: string
          freeze_expires_at: number
          freeze_seconds: number
          id: string
          player_id: string
          team_id: string
        }
        Insert: {
          bid_amount: number
          created_at?: string
          freeze_expires_at: number
          freeze_seconds: number
          id?: string
          player_id: string
          team_id: string
        }
        Update: {
          bid_amount?: number
          created_at?: string
          freeze_expires_at?: number
          freeze_seconds?: number
          id?: string
          player_id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_player_freezes_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_player_freezes_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_squads: {
        Row: {
          created_at: string
          id: string
          is_retained: boolean
          player_id: string
          purchase_price: number
          team_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_retained?: boolean
          player_id: string
          purchase_price?: number
          team_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_retained?: boolean
          player_id?: string
          purchase_price?: number
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_squads_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_squads_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          city: string
          color: string
          created_at: string
          id: string
          initial_purse: number
          is_active: boolean
          name: string
          password_hash: string
          purse: number
          rtm_remaining: number
          slug: string
          updated_at: string
        }
        Insert: {
          city: string
          color?: string
          created_at?: string
          id?: string
          initial_purse?: number
          is_active?: boolean
          name: string
          password_hash: string
          purse?: number
          rtm_remaining?: number
          slug: string
          updated_at?: string
        }
        Update: {
          city?: string
          color?: string
          created_at?: string
          id?: string
          initial_purse?: number
          is_active?: boolean
          name?: string
          password_hash?: string
          purse?: number
          rtm_remaining?: number
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      auction_phase: "marquee" | "premium" | "mid-tier" | "budget"
      auction_status:
        | "pre"
        | "retention"
        | "live"
        | "pending_sale"
        | "rtm_window"
        | "complete"
      player_category: "marquee" | "premium" | "mid-tier" | "budget"
      player_role:
        | "batsman"
        | "fast-bowler"
        | "spinner"
        | "wicket-keeper"
        | "all-rounder"
      player_status:
        | "available"
        | "retained"
        | "live"
        | "pending_sale"
        | "sold"
        | "unsold"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      auction_phase: ["marquee", "premium", "mid-tier", "budget"],
      auction_status: [
        "pre",
        "retention",
        "live",
        "pending_sale",
        "rtm_window",
        "complete",
      ],
      player_category: ["marquee", "premium", "mid-tier", "budget"],
      player_role: [
        "batsman",
        "fast-bowler",
        "spinner",
        "wicket-keeper",
        "all-rounder",
      ],
      player_status: [
        "available",
        "retained",
        "live",
        "pending_sale",
        "sold",
        "unsold",
      ],
    },
  },
} as const
