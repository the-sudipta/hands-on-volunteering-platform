import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CommentEntity,
  Community_Help_RequestEntity,
  OtpEntity,
  ProfileEntity,
  SessionEntity,
  UserEntity,
} from './user.entity';
import { Repository } from 'typeorm';
import {
  CommentDto,
  CommentReceiverDto,
  CommunityHelpRequestDto,
  LoginDTO,
  User_ProfileDTO,
  UserDto,
} from './user.dto';
import { MapperService } from './mapper.service';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';

// import { instanceToPlain } from 'class-transformer';
import { Request } from 'express';
import * as bcrypt from 'bcrypt';
import { instanceToPlain } from 'class-transformer';

// import { User_ProfileDTO, UserDto } from './user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(ProfileEntity)
    private profileRepository: Repository<ProfileEntity>,

    @InjectRepository(SessionEntity)
    private sessionRepository: Repository<SessionEntity>,
    @InjectRepository(OtpEntity)
    private otpRepository: Repository<OtpEntity>,

    @InjectRepository(Community_Help_RequestEntity)
    private helpReqRepository: Repository<Community_Help_RequestEntity>,

    @InjectRepository(CommentEntity)
    private commentRepository: Repository<CommentEntity>,

    private mailerService: MailerService,
    private mapperService: MapperService,
    private jwtService: JwtService,
  ) {}

  get_service(): string {
    return 'UserService is working!';
  }

  async Create_Signup(signup_info: LoginDTO): Promise<any> {
    const user = this.mapperService.dtoToEntity(signup_info, UserEntity);
    const previous_data = await this.userRepository.findOneBy({
      email: user.email,
    });
    if (previous_data === null) {
      const saved_user = await this.userRepository.save(user);
      return saved_user.id;
    } else {
      return -1;
    }
  }

  async Create_UserProfile(profile_info_dto: UserDto): Promise<any> {
    try {
      const profileEntity = this.mapperService.dtoToEntity(
        profile_info_dto,
        ProfileEntity,
      );

      const user = await this.userRepository.findOneBy({
        id: profile_info_dto.user_id,
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }
      profileEntity.user = user;

      const nid_existence = await this.profileRepository.findOneBy({
        nid: profileEntity.nid,
      });

      if (nid_existence == null) {
        const saved_user = await this.profileRepository.save(profileEntity);
        return saved_user ? saved_user.id : -1;
      } else {
        throw new InternalServerErrorException('NID Already exists');
      }
    } catch (e) {
      throw new InternalServerErrorException(
        'User Service, Create User Error = ' + e.message,
      );
    }
  }

  async Login(login_info: LoginDTO): Promise<UserEntity> {
    try {
      const user = await this.userRepository.findOneBy({
        email: login_info.email,
      });
      if (user != null) {
        return user;
      } else {
        throw new NotFoundException('There is no user using this email');
      }
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async Create_Session(token: string, loginDTO: LoginDTO): Promise<boolean> {
    try {
      const user = (await this.userRepository.findOneBy({
        email: loginDTO.email,
      })) as UserEntity;
      const session = new SessionEntity();
      session.jwt_token = token;
      session.expiration_date = null;
      session.user = user as UserEntity;
      const saved_data = (await this.sessionRepository.save(
        session,
      )) as SessionEntity;
      return saved_data.id > 0;
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async Update_Password(req: Request, password: string): Promise<any> {
    try {
      const user = await this.get_user_from_Request(req);
      console.log('Update Password header Request  user email = ' + user.email);
      const update = await this.userRepository.update(user.id, {
        password: password,
      });
      console.log('Update result:', update);
      return update.affected;
    } catch (e) {
      throw new InternalServerErrorException(
        'Update Password User Service error = ' + e.message,
      );
    }
  }

  async ForgetPassword(email: string) {
    try {
      const user = await this.userRepository.findOneBy({ email: email });
      if (user != null) {
        //   Generate OTP
        const OTP = await this.Generate_OTP();
        const user_has_pin = await this.otpRepository.findOneBy({ user: user });
        if (user_has_pin) {
          console.log('Okay, Already have OTP. Needs to be updated');
          await this.otpRepository.update(user_has_pin.id, { otp: OTP });
          const user_has_pin_updated = await this.otpRepository.findOneBy({
            user: user,
          });
          console.log('Updated OTP = ' + (user_has_pin_updated?.otp ?? 'N/A'));
        } else {
          const new_otp = new OtpEntity();
          new_otp.id = -1;
          new_otp.otp = OTP;
          new_otp.user = user;
          const saved_data = await this.otpRepository.save(new_otp);
          console.log('New OTP = ' + saved_data.otp);
        }

        //   Send the OTP through email
        const body =
          (await process.env.EMAIL_BODY_P1) + OTP + (await process.env.EMAIL_BODY_P2);
        await this.Send_Email(email, process.env.EMAIL_SUBJECT as string, body);
        const new_token = await new LoginDTO();
        new_token.email = email;
        new_token.password = 'temp';
        console.log('Email Sending Done');
        return await this.create_token(new_token);
      } else {
        return false;
      }
    } catch (e) {
      throw new InternalServerErrorException(
        'Forget Password Service Error = ' + e.message,
      );
    }
  }

  async otp_verification(req: Request, otp: string): Promise<any> {
    try {
      // Get the user by the email
      const user = await this.get_user_from_Request(req);
      console.log('Got the user = ' + user.email);
      //   Get the saved otp for the user
      const saved_otp_row_for_user = await this.otpRepository.findOneBy({
        user: user,
      });
      console.log('User provided otp = ' + otp);
      console.log('Saved OTP = ' + (saved_otp_row_for_user?.otp ?? 'N/A'));

      if (!saved_otp_row_for_user) {
        throw new Error('Failed to save OTP. Entry not found.');
      }
      if (saved_otp_row_for_user.otp === otp) {
        console.log('OTP Matched! Changing the OTP Expiration Date');
        const current_time = await this.get_current_timestamp();
        saved_otp_row_for_user.expiration_date = current_time;
        const updated_otp_row = await this.otpRepository.save(saved_otp_row_for_user);
        return updated_otp_row.expiration_date === current_time;
      } else {
        return false;
      }
    } catch (e) {
      throw new InternalServerErrorException(
        'OTP verification service error = ' + e.message,
      );
    }
  }

  async Update_Own_Profile_Details(
    email: string,
    updated_data: User_ProfileDTO,
  ): Promise<any> {
    try {
      const previous_data = await this.get_user_profile_by_email(email);
      const previous_user = (await this.userRepository.findOneBy({
        email: email,
      })) as UserEntity;

      previous_data.name = updated_data.name;
      // previous_data.email = updated_data.email;
      previous_data.nid = updated_data.nid;
      previous_data.phone = updated_data.phone;
      previous_data.gender = updated_data.gender;
      previous_data.age = updated_data.age;
      previous_data.address = updated_data.address;
      previous_data.user = previous_user;


      const decision = await this.profileRepository.save(previous_data);

      if (decision != null) {

        return updated_data;
      }else {
        return new InternalServerErrorException('Sorry, the data could not be updated');
      }
    } catch (e) {
      return new InternalServerErrorException(e.message);
    }
  }

  async Show_My_Profile_Details(email: string): Promise<User_ProfileDTO> {
    const user = await this.get_user_from_email(email);
    // console.log('Got the user = ' + user.email);
    const profile_details = await this.profileRepository.findOneBy({
      user: user
    });
    // console.log('Returning User Profile Data from Service = ' + profile_details);
    if (!profile_details) {
      throw new InternalServerErrorException(
        'Can not fetch profile details for the current user',
      );
    }

    const profile_DTO = (await this.mapperService.entityToDto(
      profile_details,
      User_ProfileDTO,
    ));
    // profile_DTO.email = email;
    return profile_DTO;
  }


  // Feature 3 : Community Help Request

  async Create_HelpRequest(email: string, helpReq: CommunityHelpRequestDto): Promise<any> {
    try {
      // Find the user by email
      const userEntity = await this.userRepository.findOneBy({ email: email });

      // Check if userEntity is null before proceeding
      if (!userEntity) {
        throw new NotFoundException(`User with email ${email} not found`);
      }

      // Convert DTO to entity
      const helpReqEntity = await this.mapperService.dtoToEntity(helpReq, Community_Help_RequestEntity);

      // Assign the user entity
      helpReqEntity.user = userEntity;

      // Save the help request entity
      const returnedHelpReqEntity = await this.helpReqRepository.save(helpReqEntity);

      // Convert the saved entity back to DTO and return
      const helpRequestDto = await this.mapperService.entityToDto(returnedHelpReqEntity, CommunityHelpRequestDto);
      return helpRequestDto;

    } catch (e) {
      throw new InternalServerErrorException(
        'User Service, Create Help Request Error = ' + e.message,
      );
    }
  }

  async Get_Single_HelpRequest(id:number): Promise<CommunityHelpRequestDto | null> {
    try {

      const helpReqEntity = await this.helpReqRepository.findOneBy({id: id}) as Community_Help_RequestEntity;

      const helpRequestDto = await this.mapperService.entityToDto(helpReqEntity, CommunityHelpRequestDto) as CommunityHelpRequestDto;
      if (helpRequestDto !== null) {
        return helpRequestDto;
      }else {
        return null;
      }

    } catch (e) {
      throw new InternalServerErrorException(
        'User Service, Get Single Help Request Error = ' + e.message,
      );
    }
  }

  async Get_All_HelpRequest(): Promise<CommunityHelpRequestDto[] | null> {
    try {
      // Fetch all help request entities
      const allHelpRequestsEntities = await this.helpReqRepository.find();

      // Convert the list of entities to DTOs using mapperService
      const all_help_requests = this.mapperService.listEntitiesToListDtos(
        allHelpRequestsEntities,
        CommunityHelpRequestDto
      );

      // Check if the list is empty
      if (all_help_requests.length > 0) {
        return all_help_requests;
      } else {
        return null;
      }
    } catch (e) {
      throw new InternalServerErrorException(
        `User Service, Get All Help Requests Error = ${e.message}`
      );
    }
  }

  async Get_All_Comments_By_Blog_Number(req_id: number): Promise<CommentDto[] | null> {
    try {
      // Fetch the help request entity by ID
      const help_req = await this.helpReqRepository.findOneBy({ id: req_id });

      // If no help request is found, return null
      if (!help_req) {
        return null;
      }

      // Fetch all comments linked to this help request
      const all_commentsEntities = await this.commentRepository.findBy({
        community_help_request: help_req,
      });

      // Convert the list of entities to DTOs using mapperService
      const all_comments = this.mapperService.listEntitiesToListDtos(
        all_commentsEntities,
        CommentDto
      );

      // Return DTO array or null if empty
      return all_comments.length > 0 ? all_comments : null;
    } catch (e) {
      throw new InternalServerErrorException(
        `User Service, Get All Comments Error = ${e.message}`
      );
    }
  }

  async Get_User_From_Comment_ID(id: number): Promise<User_ProfileDTO | null> {
    try {
      const commentEntity = await this.commentRepository.findOne({
        where: { id: id },
        relations: ['user'],  // Load the related user entity
      });

      if (!commentEntity?.user) {
        throw new NotFoundException('User not found for this comment');
      }


      const userEntity = await this.userRepository.findOneBy({email: commentEntity.user.email}) as UserEntity;
      const profileEntity = await this.profileRepository.findOneBy({ user:  userEntity});

      console.log('Profile Entity = ', profileEntity);

      if (!profileEntity) {
        throw new NotFoundException('Profile not found');
      }

      const user_profile = await this.mapperService.entityToDto(profileEntity, User_ProfileDTO);
      return user_profile;

    } catch (error) {
      throw new InternalServerErrorException('Error in Get_User_From_Comment_ID = ' + error.message);
    }
  }

  async Get_User_By_Blog_Number(req_id: number): Promise<User_ProfileDTO | null> {
    try {
      const Help_ReqEntity = await this.commentRepository.findOne({
        where: { id: req_id },
        relations: ['user'],  // Load the related user entity
      });

      if (!Help_ReqEntity?.user) {
        throw new NotFoundException('User not found for this comment');
      }


      const userEntity = await this.userRepository.findOneBy({email: Help_ReqEntity.user.email}) as UserEntity;
      const profileEntity = await this.profileRepository.findOneBy({ user:  userEntity});

      console.log('Profile Entity = ', profileEntity);

      if (!profileEntity) {
        throw new NotFoundException('Profile not found');
      }

      const user_profile = await this.mapperService.entityToDto(profileEntity, User_ProfileDTO);
      return user_profile;

    } catch (error) {
      throw new InternalServerErrorException('Error in Get_User_From_Comment_ID = ' + error.message);
    }
  }


  async Post_a_Comment_For_a_Blog(email: string, commentReceiverDtoDTO: CommentReceiverDto): Promise<CommentDto | null> {
    try {
      // Debugging: Log the received DTO
      // console.log("Received DTO:", commentReceiverDtoDTO);

      // Step 1: Validate input
      if (!commentReceiverDtoDTO || !commentReceiverDtoDTO.community_help_request_id) {
        throw new BadRequestException("Invalid comment data: Missing community_help_request_id");
      }

      // Step 2: Find the user by email
      const userEntity = await this.userRepository.findOneBy({ email: email });
      if (!userEntity) {
        throw new NotFoundException(`User with email ${email} not found`);
      }

      // Step 3: Find the Community Help Request by ID
      const helpReqEntity = await this.helpReqRepository.findOneBy({ id: commentReceiverDtoDTO.community_help_request_id });
      if (!helpReqEntity) {
        throw new NotFoundException(`Help Request with ID ${commentReceiverDtoDTO.community_help_request_id} not found`);
      }

      // Step 4: Create and populate the new comment entity
      const comment = new CommentEntity();
      comment.text = commentReceiverDtoDTO.text;
      comment.time = new Date().toISOString(); // Set the current time as ISO string
      comment.user = userEntity;
      comment.community_help_request = helpReqEntity;

      // Step 5: Save the comment entity
      const savedCommentEntity = await this.commentRepository.save(comment);

      // Step 6: Convert to DTO and return
      return savedCommentEntity
        ? await this.mapperService.entityToDto(savedCommentEntity, CommentDto)
        : null;

    } catch (e) {
      throw new InternalServerErrorException(
        'User Service, Post a comment for Single Help Request Error = ' + e.message,
      );
    }
  }

















  //region JWT Functionalities

  async addToBlacklist(
    token: string,
    date_time: string,
    email: string,
  ): Promise<any> {
    try {
      const user = await this.userRepository.findOneBy({ email: email });

      const current_session = (await this.sessionRepository.findOneBy({
        jwt_token: token,
      })) as SessionEntity;
      current_session.expiration_date = date_time;
      const saved_data = await this.sessionRepository.save(current_session);
      return saved_data.id > 0;
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }



  async get_token_row_by_token(token: string): Promise<any> {
    try {
      return await this.sessionRepository.findOneBy({ jwt_token: token });
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async create_token(payload: LoginDTO): Promise<any> {
    try {
      const payloadObject = instanceToPlain(payload);
      return {
        access_token: await this.jwtService.signAsync(payloadObject, {
          secret: process.env.JWT_CUSTOM_SECRET, // Provide the same secret key used for OTP verification
        }),
      };
    } catch (e) {
      throw new InternalServerErrorException(
        'Create Token Service Error = ' + e.message,
      );
    }
  }

  async decode_token(token: string): Promise<any> {
    try {
      console.log('Decoding The Token');
      const decoded = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_CUSTOM_SECRET,
      }) ;
      return decoded;
    } catch (error) {
      // Handle decoding error
      throw new Error('Failed to decode token. Error = ',error.message);
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }

  //endregion JWT Functionalities

  //region Supportive Functions

  async get_user_from_Request(req: Request): Promise<UserEntity> {
    try {
      const token = (await this.extractTokenFromHeader(req)) as string;
      const decoded_object_login_dto = await this.decode_token(token);
      // Get the user by the email
      console.log('Retrieved Email = '+decoded_object_login_dto.email);
      return (await this.userRepository.findOneBy({
        email: decoded_object_login_dto.email,
      })) as UserEntity;
    } catch (e) {
      throw new InternalServerErrorException(
        'Get user from request, User service error = ' + e.message,
      );
    }
  }

  async get_user_from_email(email: string): Promise<UserEntity> {
    return await this.userRepository.findOneBy({email: email}) as UserEntity;
  }

  async Send_Email(
    emailTo: string,
    emailSubject: string,
    emailBody: string,
  ): Promise<any> {
    try {
      return await this.mailerService.sendMail({
        to: emailTo,
        subject: emailSubject,
        text: emailBody,
      });
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async Generate_OTP(): Promise<any> {
    return (Math.floor(Math.random() * 900000) + 100000).toString();
  }

  async updateUser_SingleInfo(id: number, column: string, data: any) {
    const updateData = {};
    updateData[column] = data;

    await this.userRepository.update(id, updateData);
  }

  async user_validity(email: string, password: string): Promise<boolean> {
    try {
      const saved_user = await this.userRepository.findOneBy({ email: email });
      if (!saved_user) {
        return false; // User not found, return false
      }

      return await bcrypt.compare(password, saved_user.password);
    } catch (e) {
      throw new InternalServerErrorException(
        'User Service, user validity Error = ' + e.message,
      );
    }
  }

  async get_current_timestamp(): Promise<string> {
    return new Date().toISOString();
  }

  async get_user_profile_by_email(email: string): Promise<any> {
    const user_data = await this.userRepository.findOneBy({ email: email });

    if (!user_data) {
      throw new Error('User data is null. Cannot fetch profile.');
    }
    //   Convert to customer Profile

    return await this.profileRepository.findOneBy({ user: user_data });
  }

  //endregion Supportive Functions
}
