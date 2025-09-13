import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

interface PasswordComparable {
  password?: string;
}

@ValidatorConstraint({ name: 'MatchPasswords', async: false })
export class MatchPasswordsConstraint implements ValidatorConstraintInterface {
  validate(confirm_password: string, args: ValidationArguments) {
    const { password } = args.object as PasswordComparable;
    return password === confirm_password;
  }

  defaultMessage(_args: ValidationArguments) {
    return 'Passwords do not match';
  }
}
