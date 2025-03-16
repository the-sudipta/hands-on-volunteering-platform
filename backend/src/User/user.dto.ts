import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Column } from 'typeorm';

// Signup Purpose My Profile
export class UserDto {
  @IsNotEmpty({ message: 'Id cannot be empty or null' })
  id: number;
  // Name
  @IsNotEmpty({ message: 'Name cannot be empty or null' })
  @IsString({ message: 'Name should be a string' })
  @MinLength(3, { message: 'Name should be at least 3 characters long' })
  @MaxLength(50, {
    message: 'Name should not be more than 50 characters long',
  })
  name: string;

  // Nid
  @IsNotEmpty({ message: 'NID cannot be empty or null' })
  nid: string;

  // Gender
  @IsNotEmpty({ message: 'Gender cannot be empty or null' })
  gender: string;

  // Age
  @IsNotEmpty({ message: 'Age cannot be empty or null' })
  age: string;

  // Address
  @IsNotEmpty({ message: 'Address cannot be empty or null' })
  address: string;

  // Phone
  @IsNotEmpty({ message: 'Phone number cannot be empty or null' })
  phone: string;

  // User ID
  @IsNotEmpty({ message: 'User id cannot be empty or null' })
  user_id: number;
}

export class LoginDTO {
  // Email
  @IsNotEmpty({ message: 'Email cannot be empty or null' })
  @IsEmail({}, { message: 'Please enter a valid email address' })
  @MaxLength(100, {
    message: 'Email should not be more than 100 characters long',
  })
  email: string;

  // Password
  @IsNotEmpty({ message: 'Password cannot be empty or null' })
  @IsString({ message: 'Password should be a string' })
  @Matches(
    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+])[0-9a-zA-Z!@#$%^&*()_+]{8,}$/,
    {
      message:
        'Password should contain at least one uppercase letter, one lowercase letter, one number, and one special character, and is at least 8 characters long.',
    },
  )
  password: string;
}

// My Profile Showcase
export class User_ProfileDTO {
  @IsNotEmpty({ message: 'Id cannot be empty or null' })
  id: number;
  // Name
  @IsNotEmpty({ message: 'Name cannot be empty or null' })
  @IsString({ message: 'Name should be a string' })
  name: string;

  // Email
  // @IsNotEmpty({ message: 'Email cannot be empty or null' })
  // @IsEmail({}, { message: 'Please enter a valid email address' })
  // email: string;

  // Nid
  @IsNotEmpty({ message: 'Gender cannot be empty or null' })
  nid: string;

  // Phone
  @IsNotEmpty({ message: 'Phone number cannot be empty or null' })
  phone: string;

  @IsNotEmpty({ message: 'Phone number cannot be empty or null' })
  gender: string;

  @IsNotEmpty({ message: 'Phone number cannot be empty or null' })
  age: string;

  @IsNotEmpty({ message: 'Phone number cannot be empty or null' })
  address: string;
}

export class ForgetPasswordDTO {
  // Email
  @IsNotEmpty({ message: 'Email cannot be empty or null' })
  email: string;
}

export class OTP_ReceiverDTO {
  // OTP
  @IsNotEmpty({ message: 'OTP cannot be empty or null' })
  otp: string;
}

export class New_PasswordDTO {
  // Password
  @IsNotEmpty({ message: 'Password cannot be empty or null' })
  @IsString({ message: 'Password should be a string' })
  @Matches(
    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+])[0-9a-zA-Z!@#$%^&*()_+]{8,}$/,
    {
      message:
        'Password should contain at least one uppercase letter, one lowercase letter, one number, and one special character, and is at least 8 characters long.',
    },
  )
  password: string;
}


export class EventDto {
  @IsNotEmpty({ message: 'Id cannot be empty or null' })
  id: number;

  @IsNotEmpty({ message: 'Title cannot be empty or null' })
  title: string;

  @IsNotEmpty({ message: 'Category cannot be empty or null' })
  category: string;

  @IsNotEmpty({ message: 'Location cannot be empty or null' })
  location: string;

  @IsNotEmpty({ message: 'Description cannot be empty or null' })
  description: string;

  @IsNotEmpty({ message: 'Time cannot be empty or null' })
  time: string;

  @IsNotEmpty({ message: 'User id cannot be empty or null' })
  user_id: number;
}

export class CommunityHelpRequestDto {
  @IsNotEmpty({ message: 'Id cannot be empty or null' })
  id: number;

  @IsNotEmpty({ message: 'Title cannot be empty or null' })
  title: string;

  @IsNotEmpty({ message: 'Status cannot be empty or null' })
  status: string;

  @IsNotEmpty({ message: 'Description cannot be empty or null' })
  description: string;

  @IsNotEmpty({ message: 'User id cannot be empty or null' })
  user_id: number;
}

export class AttendeeDto {
  @IsNotEmpty({ message: 'Id cannot be empty or null' })
  id: number;

  @IsNotEmpty({ message: 'Start time cannot be empty or null' })
  start_time: string;

  @IsNotEmpty({ message: 'End time cannot be empty or null' })
  end_time: string;

  @IsNotEmpty({ message: 'User id cannot be empty or null' })
  user_id: number;

  @IsNotEmpty({ message: 'Event id cannot be empty or null' })
  event_id: number;
}

export class CommentDto {
  @IsNotEmpty({ message: 'Id cannot be empty or null' })
  id: number;

  @IsNotEmpty({ message: 'Text cannot be empty or null' })
  text: string;

  @IsNotEmpty({ message: 'Time cannot be empty or null' })
  time: string;

  @IsNotEmpty({ message: 'User id cannot be empty or null' })
  user_id: number;

  @IsNotEmpty({ message: 'Community help request id cannot be empty or null' })
  community_help_request_id: number;
}

export class TeamDto {
  @IsNotEmpty({ message: 'Id cannot be empty or null' })
  id: number;

  @IsNotEmpty({ message: 'Title cannot be empty or null' })
  title: string;

  @IsNotEmpty({ message: 'Type cannot be empty or null' })
  type: string;

  @IsNotEmpty({ message: 'Task description cannot be empty or null' })
  task_description: string;

  @IsNotEmpty({ message: 'User id cannot be empty or null' })
  user_id: number;
}

export class CertificateDto {
  @IsNotEmpty({ message: 'Id cannot be empty or null' })
  id: number;

  @IsNotEmpty({ message: 'Title cannot be empty or null' })
  title: string;

  @IsNotEmpty({ message: 'User id cannot be empty or null' })
  user_id: number;
}


