import { Prisma, CheckIn } from '@prisma/client'

export interface CheckInsRepository {
  // findById(id: string): Promise<CheckIn | null>
  create(data: Prisma.CheckInUncheckedCreateInput): Promise<CheckIn>
}
