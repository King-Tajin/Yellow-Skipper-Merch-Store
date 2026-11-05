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
        // Collapsing to zero and expanding to unknown content height has no transform-only equivalent.
        files: [
          "**/src/components/store/ProductModal.tsx",
          "**/src/components/store/SizeGuideModal.tsx",
          "**/src/components/store/CartDrawer.tsx",
          "**/src/components/store/CollapsibleSection.tsx",
          "**/src/components/store/DonationNotice.tsx",
        ],
        rules: ["react-doctor/no-layout-property-animation"],
      },
      {
        // The lightbox stage is a pointer gesture surface; keyboard users have +, -, 0 and a real close button.
        files: ["**/src/components/store/ImageLightbox.tsx"],
        rules: [
          "react-doctor/click-events-have-key-events",
          "react-doctor/no-static-element-interactions",
        ],
      },
      {
        // The effect only re-subscribes when the active image changes, which is rare and cheap.
        files: ["**/src/components/store/ImageLightbox.tsx"],
        rules: ["react-doctor/prefer-use-effect-event"],
      },
      {
        // activeSlug is app state also written by openProduct and the unknown-slug reset, not a mirror of an external store.
        files: ["**/src/components/store/StorePage.tsx"],
        rules: ["react-doctor/prefer-use-sync-external-store"],
      },
      {
        // These lists hold a handful of variant IDs, so building a Set costs more than it saves.
        files: [
          "**/src/components/store/StorePage.tsx",
          "**/src/components/store/CartDrawer.tsx",
        ],
        rules: ["react-doctor/js-set-map-lookups"],
      },
      {
        // The call is wrapped in try/catch and only succeeds on success === true, so HTTP errors fail closed.
        files: ["**/functions/api/unlisted.js"],
        rules: ["react-doctor/no-fetch-response-used-without-status-check"],
      },
    ],
  },
} satisfies ReactDoctorConfig;
