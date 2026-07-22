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
      {
        // cartRes.ok is checked right after reading the body text; the text
        // read is needed for error details on both paths.
        files: ["**/functions/api/checkout.js"],
        rules: ["react-doctor/no-fetch-response-used-without-status-check"],
      },
      {
        // Backend always responds 200 with a body-level `ok` flag, and the
        // call already has a .catch() fallback for non-JSON responses.
        files: ["**/src/libs/api.ts"],
        rules: ["react-doctor/no-fetch-response-used-without-status-check"],
      },
    ],
  },
} satisfies ReactDoctorConfig;
