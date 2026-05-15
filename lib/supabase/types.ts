// Minimal Database type so supabase-js can properly type insert/update calls.
// Keep this in sync with supabase/schema.sql.

export type Database = {
  public: {
    Tables: {
      pages: {
        Row: {
          id: string;
          slug: string;
          title: string;
          body: string;
          is_published: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          body?: string;
          is_published?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          body?: string;
          is_published?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      comments: {
        Row: {
          id: string;
          page_slug: string;
          author_name: string;
          author_email: string | null;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          page_slug: string;
          author_name: string;
          author_email?: string | null;
          body: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          page_slug?: string;
          author_name?: string;
          author_email?: string | null;
          body?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
