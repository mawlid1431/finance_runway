// Lets the dashboard call Convex with the signed-in Clerk user's token
// (Clerk JWT template "convex"). CLERK_JWT_ISSUER_DOMAIN is set per deployment
// with `npx convex env set`.
const authConfig = {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ],
};

export default authConfig;
