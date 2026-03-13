module.exports = ({ env }) => ({
  "users-permissions": {
    config: {
      jwtSecret: env("JWT_SECRET"),
    },
  },
  upload: {
    config: {
      provider: "strapi-provider-cloudflare-r2",
      providerOptions: {
        accessKeyId: env("CF_ACCESS_KEY_ID"),
        secretAccessKey: env("CF_ACCESS_SECRET"),
        endpoint: env("CF_ENDPOINT"),
        params: {
          Bucket: env("CF_BUCKET"),
        },
        cloudflarePublicAccessUrl: env("CF_PUBLIC_ACCESS_URL"),
        pool: false,
      },
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
    },
  },
email: {
  config: {
    provider: 'nodemailer',
    providerOptions: {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // Port 587 uses STARTTLS
      auth: {
        type: 'OAuth2',
        user: 'lotus.dream.cambodia@gmail.com',
        clientId: env('GOOGLE_CLIENT_ID'),
        clientSecret: env('GOOGLE_CLIENT_SECRET'),
        refreshToken: env('GOOGLE_REFRESH_TOKEN'),
      },
      tls: {
        rejectUnauthorized: true
      }
    },
    settings: {
      defaultFrom: 'lotus.dream.cambodia@gmail.com',
      defaultReplyTo: 'lotus.dream.cambodia@gmail.com',
    },
  },
},
});