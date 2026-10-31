import base from "./tailwind.config.js";
export default {
  ...base,
  content: ["./src/components/Header.tsx"],
  corePlugins: { preflight: false },
};
