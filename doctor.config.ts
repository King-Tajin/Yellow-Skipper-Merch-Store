import type { ReactDoctorConfig } from "react-doctor/api";

// noinspection JSUnusedGlobalSymbols
export default {
  rules: {
    "react-doctor/no-giant-component": "off",
    "deslop/unused-file": "off",
  },
  ignore: {
    overrides: [],
  },
} satisfies ReactDoctorConfig;
