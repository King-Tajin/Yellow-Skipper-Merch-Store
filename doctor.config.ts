import type { ReactDoctorConfig } from "react-doctor/api";

// noinspection JSUnusedGlobalSymbols
export default {
  rules: {
    "react-doctor/no-giant-component": "off",
    "deslop/unused-file": "off",
  },
  ignore: {
    overrides: [
      {
        // Standard AnimatePresence pattern for unknown-height content; no
        // transform-only substitute without a real behavior change.
        files: [
          "**/src/components/store/ProductModal.tsx",
          "**/src/components/store/SizeGuideModal.tsx",
          "**/src/components/store/CartDrawer.tsx",
        ],
        rules: ["react-doctor/no-layout-property-animation"],
      },
    ],
  },
} satisfies ReactDoctorConfig;
