import {
  CookieAuthStorageAdapter,
  createSupabaseClient,
  parseCookies,
  serializeCookie,
  type CookieOptions,
  type CookieOptionsWithName,
  type SupabaseClientOptionsWithoutAuth,
} from "@supabase/auth-helpers-shared";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { GenericSchema } from "@supabase/supabase-js/dist/module/lib/types";
import { splitCookiesString } from "set-cookie-parser";

class AstroServerRouteAuthStorageAdapter extends CookieAuthStorageAdapter {
  constructor(
    private readonly context: {
      request: { headers: Request["headers"] };
      response: { headers: Response["headers"] };
    },
    cookieOptions?: CookieOptions
  ) {
    super(cookieOptions);
  }

  protected getCookie(name: string): string | null | undefined {
    const setCookie = splitCookiesString(
      this.context.response.headers.get("set-cookie")?.toString() ?? ""
    )
      .map((c) => parseCookies(c)[name])
      .find((c) => !!c);

    if (setCookie) {
      return setCookie;
    }

    const cookies = parseCookies(
      this.context.request.headers.get("cookie") ?? ""
    );
    return cookies[name];
  }
  protected setCookie(name: string, value: string): void {
    this._setCookie(name, value);
  }
  protected deleteCookie(name: string): void {
    this._setCookie(name, "", {
      maxAge: 0,
    });
  }

  private _setCookie(
    name: string,
    value: string,
    options?: Partial<CookieOptions>
  ) {
    const newSessionStr = serializeCookie(name, value, {
      ...this.cookieOptions,
      ...options,
      // Allow supabase-js on the client to read the cookie as well
      httpOnly: false,
    });

    if (this.context.response.headers) {
      this.context.response.headers.append("set-cookie", newSessionStr);
      this.context.response.headers.append("cookie", newSessionStr);
    }
  }
}

export function createServerRouteClient<
  Database = any,
  SchemaName extends string & keyof Database = "public" extends keyof Database
    ? "public"
    : string & keyof Database,
  Schema extends GenericSchema = Database[SchemaName] extends GenericSchema
    ? Database[SchemaName]
    : any
>(
  context: {
    request: { headers: Request["headers"] };
    response: { headers: Response["headers"] };
  },
  {
    supabaseUrl = import.meta.env.SUPABASE_URL,
    supabaseKey = import.meta.env.SUPABASE_KEY,
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
        storage: new AstroServerRouteAuthStorageAdapter(context, cookieOptions),
      },
    }
  );
}
