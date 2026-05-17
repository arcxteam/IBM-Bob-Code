module.exports = {
  apps: [
    {
      name: "aroma-bob-proxy",
      script: "npx",
      args: "tsx server.ts",
      cwd: "/root/antigravity/IBM-BOB-Aroma/bob-proxy",
      env: {
        BOB_PROXY_PORT: 3003,
        NODE_ENV: "production",
      },
      max_restarts: 10,
      restart_delay: 5000,
      watch: false,
      autorestart: true,
      max_memory_restart: "512M",
    },
  ],
};
