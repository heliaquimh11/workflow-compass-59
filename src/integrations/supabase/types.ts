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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          actor_id: string | null
          actor_label: string
          after_data: Json | null
          before_data: Json | null
          created_at: string
          details: Json
          id: string
          operation: string
          reason: string | null
          target_id: string | null
          target_table: string | null
        }
        Insert: {
          actor_id?: string | null
          actor_label: string
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          details?: Json
          id?: string
          operation: string
          reason?: string | null
          target_id?: string | null
          target_table?: string | null
        }
        Update: {
          actor_id?: string | null
          actor_label?: string
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          details?: Json
          id?: string
          operation?: string
          reason?: string | null
          target_id?: string | null
          target_table?: string | null
        }
        Relationships: []
      }
      fuel_logs: {
        Row: {
          created_at: string | null
          fuel_date_time: string
          id: string
          import_key: string | null
          is_legacy: boolean
          is_test: boolean
          license_plate: string
          liters: number
          odometer: number
          photo_urls: string[]
          source_file: string | null
          tank_location: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          fuel_date_time?: string
          id?: string
          import_key?: string | null
          is_legacy?: boolean
          is_test?: boolean
          license_plate: string
          liters: number
          odometer: number
          photo_urls: string[]
          source_file?: string | null
          tank_location: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          fuel_date_time?: string
          id?: string
          import_key?: string | null
          is_legacy?: boolean
          is_test?: boolean
          license_plate?: string
          liters?: number
          odometer?: number
          photo_urls?: string[]
          source_file?: string | null
          tank_location?: string
          user_id?: string
        }
        Relationships: []
      }
      fuel_requests: {
        Row: {
          created_at: string | null
          current_tank_level: number
          id: string
          is_test: boolean
          last_delivery_date_time: string
          photo_urls: string[] | null
          request_date_time: string
          requested_liters: number
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_tank_level: number
          id?: string
          is_test?: boolean
          last_delivery_date_time: string
          photo_urls?: string[] | null
          request_date_time?: string
          requested_liters: number
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_tank_level?: number
          id?: string
          is_test?: boolean
          last_delivery_date_time?: string
          photo_urls?: string[] | null
          request_date_time?: string
          requested_liters?: number
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      tank_levels: {
        Row: {
          created_at: string | null
          current_liters: number
          id: string
          is_test: boolean
          measurement_date_time: string
          photo_urls: string[] | null
          tank_name: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_liters: number
          id?: string
          is_test?: boolean
          measurement_date_time?: string
          photo_urls?: string[] | null
          tank_name: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_liters?: number
          id?: string
          is_test?: boolean
          measurement_date_time?: string
          photo_urls?: string[] | null
          tank_name?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      import_legacy_fuel_logs: {
        Args: { filename: string; records: Json }
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
