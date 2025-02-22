import { NetworkError } from './NetworkError';

export class RegistrationError extends NetworkError {
  constructor(message: string, public originalError?: Error) {
    super(500, `Registration failed: ${message}`);
    this.name = 'RegistrationError';
    this.stack = originalError?.stack;
  }
}
