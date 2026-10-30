import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.verxl.workspace",
  appName: "Verxl",
  webDir: "www",
  server: {
    url: "https://verxl.com/chat?app=1",
    cleartext: false,
    androidScheme: "https",
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
