



// src/types/roles.ts


export type Control = {
    id: number;
    name: string;
    key: string;
  };
  
  export type PermissionGroup = {
    name: string;
    controls: Control[];
  };
  

export type { Role, Permission } from "@/store/roles/types";






// // types/roles.ts

//   export type Role = {
//     id: number;
//     name?: string;
//     name_ar?: string;
//     name_en?: string;
//     slug: string;
//     is_active?: number ;
//     created_at: string;
//     permissions: PermissionGroup[];
//   };
  
//   export type RolesResponse = {
//     status: number;
//     message: string;
//     data: {
//       data: Role[];
//     };
//   };
  