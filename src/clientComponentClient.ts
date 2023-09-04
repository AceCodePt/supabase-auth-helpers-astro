import {
  BrowserCookieAuthStorageAdapter,
  createSupabaseClient,
  type CookieOptionsWithName,
  type SupabaseClientOptionsWithoutAuth,
} from "@supabase/auth-helpers-shared";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { GenericSchema } from "@supabase/supabase-js/dist/module/lib/types";

// can't type this properly as `Database`, `SchemaName` and `Schema` are only available within `createClientComponentClient` function
let supabase: any;

export function createClientComponentClient<
  Database = any,
  SchemaName extends string & keyof Database = "public" extends keyof Database
    ? "public"
    : string & keyof Database,
  Schema extends GenericSchema = Database[SchemaName] extends GenericSchema
    ? Database[SchemaName]
    : any
>({
  supabaseUrl,
  supabaseKey,
  options,
  cookieOptions,
  isSingleton = true,
}: {
  supabaseUrl?: string;
  supabaseKey?: string;
  options?: SupabaseClientOptionsWithoutAuth<SchemaName>;
  cookieOptions?: CookieOptionsWithName;
  isSingleton?: boolean;
} = {}): SupabaseClient<Database, SchemaName, Schema> {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "either PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY env variables or supabaseUrl and supabaseKey are required!"
    );
  }

  const createNewClient = () =>
    createSupabaseClient<Database, SchemaName, Schema>(
      supabaseUrl,
      supabaseKey,
      {
        ...options,
        global: {
          ...options?.global,
          headers: {
            ...options?.global?.headers,
            "X-Client-Info": `${PACKAGE_NAME}@${PACKAGE_VERSION}`,
          },
        },
        auth: {
          storageKey: cookieOptions?.name,
          storage: new BrowserCookieAuthStorageAdapter(cookieOptions),
        },
      }
    );

  if (isSingleton) {
    // The `Singleton` pattern is the default to simplify the instantiation
    // of a Supabase client across Client Components.
    const _supabase = supabase ?? createNewClient();
    // For SSG and SSR always create a new Supabase client
    if (typeof window === "undefined") return _supabase;
    // Create the Supabase client once in the client
    if (!supabase) supabase = _supabase;
    return supabase;
  }

  // This allows for multiple Supabase clients, which may be required when using
  // multiple schemas. The user will be responsible for ensuring a single
  // instance of Supabase is used across Client Components, for each schema.
  return createNewClient();
}
