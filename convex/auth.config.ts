export default {
  providers: [
    {
      type: "customJwt",
      applicationID: "convex-the-writing-platform",
      issuer: `https://${process.env.WORKOS_API_HOSTNAME}/user_management/${process.env.WORKOS_CLIENT_ID}`,
      jwks: process.env.CONVEX_SITE_URL + "/jwks",
      algorithm: "RS256",
    },
  ],
};
