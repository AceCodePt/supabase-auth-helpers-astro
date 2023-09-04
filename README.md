# supabase-auth-helpers-astro

`supabase-auth-helpers-astro` is an NPM package that provides authentication utility functions for integrating Supabase authentication seamlessly into Astro framework applications.

## Features

- Create Supabase client instances for different scenarios within the Astro framework.
- Simplify authentication and authorization workflows with Supabase.
- Reusable functions for client-side components, server-side components, and server-side route rendering.

## Installation

This library supports the following tooling versions:

- Node.js: `^16.15.0`

To install the package, you can use pnpm:

```bash
pnpm install supabase-auth-helpers-astro
```

To install the package, you can use npm:

```bash
npm install supabase-auth-helpers-astro
```

Or with yarn:

```bash
yarn add supabase-auth-helpers-astro
```

## Usage

First define environment variables:

```bash
# Find these in your Supabase project settings > API
# Client Side
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
# Server Side
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

If needed added server side rendering

```js
// astro.config.mjs
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  output: "server",
});
```

Here's an example of how you can use the package in your Astro application:

```javascript
import {
  createClientComponentClient,
  createServerComponentClient,
  createServerRouteClient,
} from "supabase-auth-helpers-astro";

// Example usage of createClientComponentClient
const clientComponentClient = createClientComponentClient({
  supabaseUrl: import.meta.env.PUBLIC_SUPABASE_URL,
  supabaseKey: import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
});

// Example usage of createServerComponentClient could also be on routes
const serverComponentClient = createServerComponentClient(
  {
    cookies: Astro.cookies,
  },
  {
    supabaseUrl: import.meta.env.SUPABASE_URL,
    supabaseKey: import.meta.env.SUPABASE_ANON_KEY,
  }
);

// Example usage of createServerRouteClient I recommed to use (createServerComponentClient)
const serverRouteClient = createServerRouteClient(
  {
    request: { headers: astroContext.request.headers },
    response: { headers: astroContext.response.headers },
  },
  {
    supabaseUrl: import.meta.env.SUPABASE_URL,
    supabaseKey: import.meta.env.SUPABASE_ANON_KEY,
  }
);
```

For more detailed usage examples and configuration options, please refer to the official documentation.

## License

This project is licensed under the [MIT License](link-to-license).
