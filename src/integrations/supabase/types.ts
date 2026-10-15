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
      initialization_state: {
        Row: {
          consumed_at: string
          key: string
          user_id: string
        }
        Insert: {
          consumed_at?: string
          key: string
          user_id: string
        }
        Update: {
          consumed_at?: string
          key?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          active: boolean
          created_at: string
          display_name: string
          id: string
          is_test: boolean
          last_access_at: string | null
          must_change_password: boolean
          username: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          display_name: string
          id: string
          is_test?: boolean
          last_access_at?: string | null
          must_change_password?: boolean
          username: string
        }
        Update: {
          active?: boolean
          created_at?: string
          display_name?: string
          id?: string
          is_test?: boolean
          last_access_at?: string | null
          must_change_password?: boolean
          username?: string
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
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      account_test_default: { Args: never; Returns: boolean }
      admin_audit_password_reset: {
        Args: { actor: string; target: string }
        Returns: undefined
      }
      admin_finalize_account: {
        Args: {
          account_role: Database["public"]["Enums"]["app_role"]
          actor: string
          confirmed?: boolean
          full_name: string
          login_name: string
          target: string
        }
        Returns: undefined
      }
      admin_manage_account: {
        Args: {
          action: string
          confirmed?: boolean
          new_role?: Database["public"]["Enums"]["app_role"]
          target: string
        }
        Returns: undefined
      }
      admin_mutate_record: {
        Args: {
          patch: Json
          reason: string
          record_id: string
          remove_record?: boolean
          table_name: string
        }
        Returns: undefined
      }
      bootstrap_existing_admin: { Args: { target: string }; Returns: undefined }
      can_operate: { Args: never; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      import_legacy_fuel_logs: {
        Args: { filename: string; records: Json }
        Returns: Json
      }
      is_active_account: { Args: never; Returns: boolean }
      record_access: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "colaborador"
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
    Enums: {
      app_role: ["admin", "colaborador"],
    },
  },
} as const
