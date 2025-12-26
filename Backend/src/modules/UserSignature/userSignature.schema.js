import { z } from "zod";

export const signAgreementSchema = z.object({
    agreementId: z.string().uuid()
});
