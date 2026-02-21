import dynamic from "next/dynamic";
export const CkEditor = dynamic(() => import("../ckEditor/CKEditor"), {
    ssr: false,
  });
   