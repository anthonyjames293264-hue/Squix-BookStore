export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: "admin" | "user";
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: "admin" | "user";
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: "admin" | "user";
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      books: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string;
          long_description: string | null;
          price: number;
          compare_at_price: number | null;
          category: string;
          format: "physical" | "digital" | "both";
          isbn: string | null;
          pages: number | null;
          publisher: string | null;
          publish_date: string | null;
          language: string;
          cover_image: string;
          file_url: string | null;
          is_featured: boolean;
          is_published: boolean;
          stock: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          description: string;
          long_description?: string | null;
          price: number;
          compare_at_price?: number | null;
          category?: string;
          format?: "physical" | "digital" | "both";
          isbn?: string | null;
          pages?: number | null;
          publisher?: string | null;
          publish_date?: string | null;
          language?: string;
          cover_image: string;
          file_url?: string | null;
          is_featured?: boolean;
          is_published?: boolean;
          stock?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          slug?: string;
          description?: string;
          long_description?: string | null;
          price?: number;
          compare_at_price?: number | null;
          category?: string;
          format?: "physical" | "digital" | "both";
          isbn?: string | null;
          pages?: number | null;
          publisher?: string | null;
          publish_date?: string | null;
          language?: string;
          cover_image?: string;
          file_url?: string | null;
          is_featured?: boolean;
          is_published?: boolean;
          stock?: number;
          updated_at?: string;
        };
      };
      book_images: {
        Row: {
          id: string;
          book_id: string;
          image_url: string;
          alt_text: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          book_id: string;
          image_url: string;
          alt_text?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          book_id?: string;
          image_url?: string;
          alt_text?: string | null;
          sort_order?: number;
        };
      };
      orders: {
        Row: {
          id: string;
          customer_id: string;
          stripe_session_id: string | null;
          stripe_payment_intent: string | null;
          status: "pending" | "paid" | "shipped" | "delivered" | "cancelled" | "refunded";
          subtotal: number;
          shipping_cost: number;
          total: number;
          shipping_name: string | null;
          shipping_address: string | null;
          shipping_city: string | null;
          shipping_state: string | null;
          shipping_zip: string | null;
          shipping_country: string | null;
          tracking_number: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          stripe_session_id?: string | null;
          stripe_payment_intent?: string | null;
          status?: "pending" | "paid" | "shipped" | "delivered" | "cancelled" | "refunded";
          subtotal: number;
          shipping_cost?: number;
          total: number;
          shipping_name?: string | null;
          shipping_address?: string | null;
          shipping_city?: string | null;
          shipping_state?: string | null;
          shipping_zip?: string | null;
          shipping_country?: string | null;
          tracking_number?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: "pending" | "paid" | "shipped" | "delivered" | "cancelled" | "refunded";
          shipping_name?: string | null;
          shipping_address?: string | null;
          shipping_city?: string | null;
          shipping_state?: string | null;
          shipping_zip?: string | null;
          shipping_country?: string | null;
          tracking_number?: string | null;
          notes?: string | null;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          book_id: string;
          quantity: number;
          unit_price: number;
          format: "physical" | "digital";
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          book_id: string;
          quantity?: number;
          unit_price: number;
          format?: "physical" | "digital";
          created_at?: string;
        };
        Update: {
          quantity?: number;
          unit_price?: number;
          format?: "physical" | "digital";
        };
      };
      customers: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          phone: string | null;
          stripe_customer_id: string | null;
          total_orders: number;
          total_spent: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name: string;
          phone?: string | null;
          stripe_customer_id?: string | null;
          total_orders?: number;
          total_spent?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string;
          full_name?: string;
          phone?: string | null;
          stripe_customer_id?: string | null;
          total_orders?: number;
          total_spent?: number;
          updated_at?: string;
        };
      };
      downloads: {
        Row: {
          id: string;
          order_id: string;
          book_id: string;
          customer_id: string;
          download_token: string;
          download_count: number;
          max_downloads: number;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          book_id: string;
          customer_id: string;
          download_token: string;
          download_count?: number;
          max_downloads?: number;
          expires_at: string;
          created_at?: string;
        };
        Update: {
          download_count?: number;
          max_downloads?: number;
          expires_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          book_id: string;
          customer_name: string;
          rating: number;
          comment: string | null;
          is_approved: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          book_id: string;
          customer_name: string;
          rating: number;
          comment?: string | null;
          is_approved?: boolean;
          created_at?: string;
        };
        Update: {
          rating?: number;
          comment?: string | null;
          is_approved?: boolean;
        };
      };
      newsletter_subscribers: {
        Row: {
          id: string;
          email: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          email?: string;
          is_active?: boolean;
        };
      };
      contact_messages: {
        Row: {
          id: string;
          name: string;
          email: string;
          subject: string;
          message: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          subject: string;
          message: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          is_read?: boolean;
        };
      };
    };
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Book = Database["public"]["Tables"]["books"]["Row"];
export type BookImage = Database["public"]["Tables"]["book_images"]["Row"];
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];
export type Customer = Database["public"]["Tables"]["customers"]["Row"];
export type Download = Database["public"]["Tables"]["downloads"]["Row"];
export type Review = Database["public"]["Tables"]["reviews"]["Row"];
export type NewsletterSubscriber = Database["public"]["Tables"]["newsletter_subscribers"]["Row"];
export type ContactMessage = Database["public"]["Tables"]["contact_messages"]["Row"];

export type OrderWithItems = Order & {
  order_items: (OrderItem & { books: Book })[];
  customers: Customer;
};

export type BookWithImages = Book & {
  book_images: BookImage[];
  reviews: Review[];
};
