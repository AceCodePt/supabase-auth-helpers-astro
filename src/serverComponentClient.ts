import {
  CookieAuthStorageAdapter,
  createSupabaseClient,
  type CookieOptions,
  type CookieOptionsWithName,
  type SupabaseClientOptionsWithoutAuth,
} from "@supabase/auth-helpers-shared";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { GenericSchema } from "@supabase/supabase-js/dist/module/lib/types";
import type { AstroCookies } from "astro";

class AstroServerComponentAuthStorageAdapter extends CookieAuthStorageAdapter {
  constructor(
    private readonly context: {
      cookies: AstroCookies;
    },
    cookieOptions?: CookieOptions
  ) {
    super(cookieOptions);
  }

  protected getCookie(name: string): string | null | undefined {
    const astroCookies = this.context.cookies;
    return astroCookies.get(name)?.value;
  }
  protected setCookie(name: string, value: string): void {
    const astroCookies = this.context.cookies;
    astroCookies.set(name, value, this.cookieOptions);
  }
  protected deleteCookie(name: string): void {
    const astroCookies = this.context.cookies;
    astroCookies.set(name, "", {
      maxAge: 0,
    });
  }
}

export function createServerComponentClient<
  Database = any,
  SchemaName extends string & keyof Database = "public" extends keyof Database
    ? "public"
    : string & keyof Database,
  Schema extends GenericSchema = Database[SchemaName] extends GenericSchema
    ? Database[SchemaName]
    : any
>(
  context: {
    cookies: AstroCookies;
  },
  {
    supabaseUrl,
    supabaseKey,
    options,
    cookieOptions,
  }: {
    supabaseUrl?: string;
    supabaseKey?: string;
    options?: SupabaseClientOptionsWithoutAuth<SchemaName>;
    cookieOptions?: CookieOptionsWithName;
  } = {}
): SupabaseClient<Database, SchemaName, Schema> {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "either SUPABASE_URL and SUPABASE_ANON_KEY env variables or supabaseUrl and supabaseKey are required!"
    );
  }

  return createSupabaseClient<Database, SchemaName, Schema>(
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
        storage: new AstroServerComponentAuthStorageAdapter(
          context,
          cookieOptions
        ),
      },
    }
  );
}
