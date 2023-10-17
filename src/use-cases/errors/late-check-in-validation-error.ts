export class LateCheckInValidationError extends Error {
  constructor() {
    super('Check-in can only be validateduntil 20 minutes after creation')
  }
}
