import * as z from "zod";

export const RoleCreateSchema = z.object({
  name: z.string().min(2, "Role name is required"),
  permissions: z
    .array(z.number())
    .min(1, "Select at least one permission"),
});

export type RoleCreateFormType = z.infer<typeof RoleCreateSchema>;
