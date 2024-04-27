import { z } from 'zod';

export const OrdersImportZod = z
  .object({
    externalId: z
      .string()
      .trim()
      .min(3)
      .max(20)
      .refine((value) => /^\S+$/.test(value), "External ID can't have space"),
    shippingMethod: z
      .enum(['Standard', 'Express'], {
        errorMap: (issue, _ctx) => {
          // eslint-disable-next-line sonarjs/no-small-switch, sonarjs/no-all-duplicated-branches
          switch (issue.code) {
            case 'invalid_enum_value': {
              return { message: 'Expected Standard or Express' };
            }

            default: {
              return { message: 'Expected Standard or Express' };
            }
          }
        },
      })
      .optional(),
    firstName: z.string().trim().min(3).max(40),
    lastName: z.string().trim().min(1).max(40).optional(),
    email: z
      .string()
      .trim()
      .min(3)
      .max(40)
      .refine((value) => /^\w+(\.?\w+)*@\w+([.-]?\w+)*(\.\w{2,8})+$/.test(value), 'Invalid email')
      .optional(),
    phone: z.string().trim().min(8).max(12).optional(),
    country: z.string().trim().min(2).max(20),
    region: z.string().trim().min(2).max(40),
    addressLine1: z.string().trim().min(2).max(100),
    addressLine2: z.string().trim().min(2).max(100).optional(),
    city: z.string().trim().min(2).max(40),
    zip: z.string().trim().min(1).max(10),
    quantity: z
      .string()
      .trim()
      .min(1)
      .max(3)
      .refine((value) => /^\d+$/.test(value), 'Quantity must be number'),
    variantId: z.string().trim().min(3).max(30),
    frontArtworkUrl: z.string().trim().min(10).max(255).optional(),
    backArtworkUrl: z.string().trim().min(10).max(255).optional(),
    mockUpUrl1: z.string().trim().min(10).max(255).optional(),
    mockUpUrl2: z.string().trim().min(10).max(255).optional(),
    externalLink: z.string().trim().min(10).max(255).optional(),
  })
  .array();
