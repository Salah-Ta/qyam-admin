import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react"; // make sure to import from better-auth/react

export const authClient = createAuthClient({
  //you can pass client configuration here
  plugins: [
    inferAdditionalFields({
      user: {
        cvKey: { type: "string" },
        // bio: { type: "string" },
        phone: { type: "number" },
        acceptenceState: { type: "string" },
        region: { type: "string" },
        role: { type: "string" }, // Add the role field here
      },
    }),
  ],
});

export const { useSession } = authClient;
