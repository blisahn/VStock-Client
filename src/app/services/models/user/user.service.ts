import { Injectable } from '@angular/core';
import { combineLatest, debounceTime, firstValueFrom } from 'rxjs';
import { CreateUserDto } from '../../../contract/user/common/CreateUserDto';
import { CustomHttpClient } from '../../common/customhttp.service';
import { UpdateProfileDto } from '../../../contract/user/common/UpdateProfileDto';
import { BaseApiResponse } from '../../../contract/helpers/BaseApiResponse';
import { FetchProfileDto } from '../../../contract/user/common/FetchProfileDto';
import { FetchUserDto } from '../../../contract/user/admin/user/FetchUserDto';
import { AssignRoleDto } from '../../../contract/user/admin/user/AssignRoleDto';
import { GetAllUsersResponseDto } from '../../../contract/user/admin/user/GetAllUsersResponseDto';
import { UpdateUserDto } from '../../../contract/user/admin/user/UpdateUserDto';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private customHttpClient: CustomHttpClient,
  ) {

  }

  async create(user: CreateUserDto): Promise<BaseApiResponse> {
    try {
      debugger;
      const observable = await this.customHttpClient.post<BaseApiResponse, CreateUserDto>({
        controller: 'users',
        action: 'createuser'
      }, user);
      debugger;
      const res = await firstValueFrom(observable);
      return res;
    } catch (err) {
      throw err;
    }
  }

  async getUserDetails(id: string): Promise<BaseApiResponse<FetchUserDto>> {
    try {
      const request$ = this.customHttpClient.get<BaseApiResponse<FetchUserDto>>({
        controller: "users",
        action: "getuserDetails",
      }, id);
      const res = await firstValueFrom(request$);
      return res;
    } catch (err) {
      throw err;
    }
  }


  async getAllUsers(): Promise<BaseApiResponse<GetAllUsersResponseDto>> {
    const request$ = this.customHttpClient.get<BaseApiResponse<GetAllUsersResponseDto>>({
      controller: "users",
      action: "getallusers"
    });
    const res = await firstValueFrom(request$);
    return res;
  }

  async assignRole(roleRequestDto: AssignRoleDto): Promise<BaseApiResponse> {
    try {
      const observable = this.customHttpClient.put<BaseApiResponse, AssignRoleDto>({
        controller: "users",
        action: "assignRole"
      }, roleRequestDto);
      const res = await firstValueFrom(observable);
      return res;
    } catch (err) {
      throw err;
    }
  }

  async updateUser(updateUserDto: UpdateUserDto): Promise<BaseApiResponse> {
    try {
      const observable = this.customHttpClient.put<BaseApiResponse, UpdateUserDto>({
        controller: "users",
        action: "updateUser"
      }, updateUserDto);
      const res = await firstValueFrom(observable);
      return res;
    } catch (err) {
      throw err;
    }
  }
  async deleteUser(userId: string): Promise<BaseApiResponse> {
    try {
      const observable = this.customHttpClient.delete<BaseApiResponse>({
        controller: "users",
        action: "deleteuser"
      }, userId)
      return await firstValueFrom(observable);
    } catch (err) {
      throw err;
    }
  }


  async getProfileDetails(): Promise<BaseApiResponse<FetchProfileDto>> {
    try {
      const request$ = await this.customHttpClient.get<BaseApiResponse<FetchProfileDto>>({
        controller: "users",
        action: "getprofiledetails"
      });
      const res = await firstValueFrom(request$);
      return res;
    } catch (err) {
      throw err;
    }
  }

  async updateProfile(payload: UpdateProfileDto): Promise<BaseApiResponse> {
    try {
      const request$ = await this.customHttpClient.put<BaseApiResponse, UpdateProfileDto>({
        controller: "users",
        action: "updateProfile"
      }, payload);
      const res = await firstValueFrom(request$);
      return res;
    } catch (err) {
      throw err;
    }
  }







}
