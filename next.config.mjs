/** @type {import('next').NextConfig} */

// const nextConfig = {
//   images: {
//     domains: ["s.gravatar.com"],
//   },
// };

// module.exports = nextConfig;

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s.gravatar.com",
        port: "",
        pathname: "/account123/**",
      },
    ],
  },
};

module.exports = nextConfig;
