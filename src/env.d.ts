/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  /**
   * Web3Forms access key. Sign up with max.richter.dev@proton.me at
   * https://web3forms.com/#start — every submission will be forwarded there.
   */
  readonly PUBLIC_WEB3FORMS_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
