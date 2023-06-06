<template>
  <div class="event-notify-block">
    <info-event-pdf :data="event" />
    <verification-record />
    <el-button
      type="primary"
      icon="el-icon-plus"
      class="btn-create"
      @click="openCreateDiv"
    >
      Tạo công việc
    </el-button>

    <el-button
      type="warning"
      style="float: right; opacity: 0"
      icon="el-icon-refresh-right"
      @click="resetListJob()"
    >
      Cập nhật mặc định
    </el-button>

    <div
      class="table-container"
      :class="{
        'table-container-button': !loadingTable && jobList
      }"
    >
      <el-table
        ref="notifyTable"
        :key="flagKey"
        v-loading="loadingTable"
        :data="jobList"
        :row-class-name="rowTableClass"
        border
        @row-click="showDetail"
        @selection-change="handleSelectionChange"
        @select="hanleCheckJob"
      >
        <el-table-column
          type="selection"
          width="55"
          :selectable="canSelectRow"
          align="center"
        />
        <el-table-column prop="name" label="Công việc" width="230">
          <template slot-scope="scope">
            <span v-if="!scope.row.disable">{{
              detectJobType(scope.row.jobType)
            }}</span>
            <span v-else>{{ scope.row.jobTypeName }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="group" label="Đội" width="200">
          <template slot-scope="scope">
            <span v-if="!scope.row.disable">{{
              detectGroupId(scope.row.groupId)
            }}</span>
            <span v-else>{{ scope.row.groupname }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="group" label="Người xử lý">
          <template slot-scope="scope">
            <span v-if="!scope.row.disable && scope.row.type !== 1">{{
              detectUserId(scope.row.userIds)
            }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createdDate" label="Ngày hết hạn">
          <template slot-scope="scope">
            <span v-if="scope.row.endTime && !scope.row.disable">{{
              scope.row.endTime | formatDateVietNam
            }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="group" label="Mức độ">
          <template slot-scope="scope">
            <span
              v-if="!scope.row.disable && scope.row.type !== 1"
              :class="scope.row.priority"
            >{{ detectLevel(scope.row.priority) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="Trạng thái">
          <template slot-scope="scope">
            <span
              v-if="!scope.row.disable && scope.row.type !== 1"
              :class="scope.row.status.toLowerCase()"
            >{{ detectStatus(scope.row.status) }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div id="create-container">
      <div id="add-edit-div">
        <el-form ref="addJobForm" :model="createInfo" :rules="rules">
          <div class="item-job width100">
            <el-form-item label="Loại công việc" prop="jobType">
              <el-select
                v-model="createInfo.jobType"
                placeholder="- Lựa chọn -"
              >
                <el-option
                  v-for="item in jobTypeList"
                  :key="item.value"
                  :label="item.name"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </div>
          <div v-if="createInfo.jobType" class="item-job">
            <el-form-item label="Đội" prop="groupId">
              <el-select
                v-model="createInfo.groupId"
                filterable
                clearable
                placeholder="- Lựa chọn -"
              >
                <el-option
                  v-for="item in groupsList"
                  :key="item.uuid"
                  :label="item.name"
                  :value="item.uuid"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="Người xử lý" prop="userId">
              <el-select
                v-model="createInfo.userId"
                multiple
                filterable
                collapse-tags
                clearable
                placeholder="- Lựa chọn -"
              >
                <el-option
                  v-for="item in userList"
                  :key="item.uuid"
                  :label="item.fullName"
                  :value="item.uuid"
                />
              </el-select>
            </el-form-item>
          </div>
          <!-- Cứu hộ phương tiện -->
          <template v-if="createInfo.jobType === 'chpt'">
            <div class="item-job width100">
              <el-form-item label="Mức độ" prop="priority">
                <el-select
                  v-model="createInfo.priority"
                  placeholder="- Lựa chọn -"
                >
                  <el-option
                    v-for="item in levelList"
                    :key="item.value"
                    :label="item.name"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </div>
            <div class="item-job">
              <el-form-item label="Vị trí" prop="startSiteId">
                <el-select
                  v-model="createInfo.startSiteId"
                  collapse-tags
                  placeholder="- Lựa chọn -"
                >
                  <el-option
                    v-for="item in siteList"
                    :key="item.siteId"
                    :label="item.siteName"
                    :value="item.siteId"
                  />
                </el-select>
              </el-form-item>
              <!-- <el-form-item label="Vị trí" prop="startSiteId">
                  <el-input
                    maxlength="255"
                    v-model="createInfo.startSiteId"
                    placeholder="Vị trí">
                  </el-input>
                </el-form-item> -->
              <el-form-item label="Chiều" prop="directionCode">
                <el-select
                  v-model="createInfo.directionCode"
                  collapse-tags
                  placeholder="- Lựa chọn -"
                >
                  <el-option
                    v-for="item in directionList"
                    :key="item.value"
                    :label="item.name"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </div>
            <div class="item-job">
              <el-form-item label="Loại phương tiện" prop="vehicleType">
                <el-select
                  v-model="createInfo.vehicleType"
                  placeholder="- Lựa chọn -"
                >
                  <el-option
                    v-for="item in vehicleList"
                    :key="item.value"
                    :label="item.name"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="Trọng tải" prop="vehicleWeight">
                <el-input
                  v-model="createInfo.vehicleWeight"
                  maxlength="255"
                  placeholder="Trọng tải"
                />
              </el-form-item>
            </div>
            <div class="item-job">
              <el-form-item label="Ngày hết hạn" prop="endTime">
                <el-date-picker
                  v-model="createInfo.endTime"
                  type="datetime"
                  format="dd-MM-yyyy HH:mm:ss"
                  placeholder="Ngày hết hạn"
                />
              </el-form-item>
              <el-form-item label="Phương thức" prop="notifyMethod">
                <el-select
                  v-model="createInfo.notifyMethod"
                  collapse-tags
                  multiple
                  placeholder="- Lựa chọn -"
                >
                  <el-option
                    v-for="item in methodList"
                    :key="item.value"
                    :label="item.name"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </div>
          </template>
          <!-- ket thuc -->
          <!-- Cập nhật biển báo VMS -->
          <template v-if="createInfo.jobType === 'cnbbvms'">
            <div class="item-job">
              <el-form-item label="Từ ngày" prop="startTime">
                <el-date-picker
                  v-model="createInfo.startTime"
                  type="datetime"
                  format="dd-MM-yyyy HH:mm:ss"
                  placeholder="Từ ngày"
                />
              </el-form-item>
              <el-form-item label="Đến ngày" prop="endTime">
                <el-checkbox
                  v-model="createInfo.endTime"
                  class="finish-event"
                >Kết thúc sự kiện</el-checkbox>
                <el-date-picker
                  v-model="createInfo.endTime"
                  type="datetime"
                  format="dd-MM-yyyy HH:mm:ss"
                  placeholder="Đến ngày"
                />
              </el-form-item>
            </div>
            <div class="item-job width100">
              <el-form-item label="Thiết bị" prop="deviceIds">
                <el-select
                  v-model="createInfo.deviceIds"
                  multiple
                  collapse-tags
                  placeholder="Lựa chọn"
                >
                  <el-option
                    v-for="item in deviceList"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </div>
            <div class="item-job width100">
              <el-form-item label="Mức độ" prop="priority">
                <el-select
                  v-model="createInfo.priority"
                  placeholder="- Lựa chọn -"
                >
                  <el-option
                    v-for="item in levelList"
                    :key="item.value"
                    :label="item.name"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </div>
          </template>
          <!-- ket thuc -->
          <!-- Liên hệ cơ quan hữu quan -->
          <template v-if="createInfo.jobType === 'lhcqhq'">
            <div class="item-job">
              <el-form-item label="Ngày hết hạn" prop="endTime">
                <el-date-picker
                  v-model="createInfo.endTime"
                  type="datetime"
                  format="dd-MM-yyyy HH:mm:ss"
                  placeholder="Từ ngày"
                />
              </el-form-item>
              <el-form-item label="Mức độ" prop="priority">
                <el-select
                  v-model="createInfo.priority"
                  placeholder="- Lựa chọn -"
                >
                  <el-option
                    v-for="item in levelList"
                    :key="item.value"
                    :label="item.name"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </div>
            <div class="item-job">
              <el-form-item label="Phương thức" prop="notifyMethod">
                <el-select
                  v-model="createInfo.notifyMethod"
                  collapse-tags
                  multiple
                  placeholder="- Lựa chọn -"
                >
                  <el-option
                    v-for="item in methodList"
                    :key="item.value"
                    :label="item.name"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="Cơ quan" prop="notifyOrganization">
                <el-select
                  v-model="createInfo.notifyOrganization"
                  collapse-tags
                  multiple
                  placeholder="- Lựa chọn -"
                >
                  <el-option
                    v-for="item in organizationList"
                    :key="item.value"
                    :label="item.name"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </div>
          </template>
          <!-- ket thuc -->
          <!-- Kiểm tra hiện trường -->
          <template v-if="createInfo.jobType === 'ktht'">
            <div class="item-job">
              <el-form-item label="Ngày hết hạn" prop="endTime">
                <el-date-picker
                  v-model="createInfo.endTime"
                  type="datetime"
                  format="dd-MM-yyyy HH:mm:ss"
                  placeholder="Từ ngày"
                />
              </el-form-item>
              <el-form-item label="Mức độ" prop="priority">
                <el-select
                  v-model="createInfo.priority"
                  placeholder="- Lựa chọn -"
                >
                  <el-option
                    v-for="item in levelList"
                    :key="item.value"
                    :label="item.name"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </div>
            <div class="item-job">
              <el-form-item label="Từ vị trí" prop="startSiteId">
                <el-select
                  v-model="createInfo.startSiteId"
                  collapse-tags
                  placeholder="- Lựa chọn -"
                >
                  <el-option
                    v-for="item in siteList"
                    :key="item.siteId"
                    :label="item.siteName"
                    :value="item.siteId"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="Đến vị trí" prop="endSiteId">
                <el-select
                  v-model="createInfo.endSiteId"
                  collapse-tags
                  placeholder="- Lựa chọn -"
                >
                  <el-option
                    v-for="item in siteList"
                    :key="item.siteId"
                    :label="item.siteName"
                    :value="item.siteId"
                  />
                </el-select>
              </el-form-item>
            </div>
            <div class="item-job width100">
              <el-form-item label="Chiều" prop="directionCode">
                <el-select
                  v-model="createInfo.directionCode"
                  collapse-tags
                  placeholder="- Lựa chọn -"
                >
                  <el-option
                    v-for="item in directionList"
                    :key="item.value"
                    :label="item.name"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </div>
          </template>
          <!-- ket thuc -->
          <!-- Sửa chữa, khắc phục sự cố -->
          <template v-if="createInfo.jobType === 'sckpsc'">
            <div class="item-job">
              <el-form-item label="Ngày hết hạn">
                <el-date-picker
                  v-model="createInfo.endTime"
                  type="datetime"
                  format="dd-MM-yyyy HH:mm:ss"
                  placeholder="Từ ngày"
                />
              </el-form-item>
              <el-form-item label="Thiết bị">
                <el-select
                  v-model="createInfo.deviceIds"
                  multiple
                  collapse-tags
                  placeholder="Lựa chọn"
                >
                  <el-option
                    v-for="item in deviceList"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </div>
            <div class="item-job">
              <el-form-item label="Từ vị trí">
                <el-select
                  v-model="createInfo.startSiteId"
                  collapse-tags
                  placeholder="- Lựa chọn -"
                >
                  <el-option
                    v-for="item in siteList"
                    :key="item.siteId"
                    :label="item.siteName"
                    :value="item.siteId"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="Đến vị trí" prop="endSiteId">
                <el-select
                  v-model="createInfo.endSiteId"
                  collapse-tags
                  placeholder="- Lựa chọn -"
                >
                  <el-option
                    v-for="item in siteList"
                    :key="item.siteId"
                    :label="item.siteName"
                    :value="item.siteId"
                  />
                </el-select>
              </el-form-item>
            </div>
            <div class="item-job">
              <el-form-item label="Chiều" prop="directionCode">
                <el-select
                  v-model="createInfo.directionCode"
                  collapse-tags
                  placeholder="- Lựa chọn -"
                >
                  <el-option
                    v-for="item in directionList"
                    :key="item.value"
                    :label="item.name"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="Mức độ">
                <el-select
                  v-model="createInfo.priority"
                  placeholder="- Lựa chọn -"
                >
                  <el-option
                    v-for="item in levelList"
                    :key="item.value"
                    :label="item.name"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </div>
          </template>
          <!-- ket thuc -->
          <!-- Đóng làn đường -->
          <template v-if="createInfo.jobType === 'dld'">
            <div class="item-job">
              <el-form-item label="Từ ngày" prop="startTime">
                <el-date-picker
                  v-model="createInfo.startTime"
                  type="datetime"
                  format="dd-MM-yyyy HH:mm:ss"
                  placeholder="Từ ngày"
                />
              </el-form-item>
              <el-form-item label="Đến ngày" prop="endTime">
                <el-checkbox
                  v-model="createInfo.endTime"
                  class="finish-event"
                >Kết thúc sự kiện</el-checkbox>
                <el-date-picker
                  v-model="createInfo.endTime"
                  type="datetime"
                  format="dd-MM-yyyy HH:mm:ss"
                  placeholder="Đến ngày"
                />
              </el-form-item>
            </div>
            <div class="item-job">
              <el-form-item label="Từ vị trí" prop="startSiteId">
                <el-select
                  v-model="createInfo.startSiteId"
                  collapse-tags
                  placeholder="- Lựa chọn -"
                >
                  <el-option
                    v-for="item in siteList"
                    :key="item.siteId"
                    :label="item.siteName"
                    :value="item.siteId"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="Đến vị trí" prop="endSiteId">
                <el-select
                  v-model="createInfo.endSiteId"
                  collapse-tags
                  placeholder="- Lựa chọn -"
                >
                  <el-option
                    v-for="item in siteList"
                    :key="item.siteId"
                    :label="item.siteName"
                    :value="item.siteId"
                  />
                </el-select>
              </el-form-item>
            </div>
            <div class="item-job">
              <el-form-item label="Chiều" prop="directionCode">
                <el-select
                  v-model="createInfo.directionCode"
                  collapse-tags
                  placeholder="- Lựa chọn -"
                >
                  <el-option
                    v-for="item in directionList"
                    :key="item.value"
                    :label="item.name"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="Làn đường">
                <el-select v-model="createInfo.lane" placeholder="- Lựa chọn -">
                  <el-option
                    v-for="item in laneList"
                    :key="item.id"
                    :label="item.laneName"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </div>
            <div class="item-job">
              <el-form-item label="Mức độ">
                <el-select
                  v-model="createInfo.priority"
                  placeholder="- Lựa chọn -"
                >
                  <el-option
                    v-for="item in levelList"
                    :key="item.value"
                    :label="item.name"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </div>
          </template>
          <!-- ket thuc -->
          <!-- Cấm đường -->
          <template
            v-if="
              createInfo.jobType === 'cd' ||
                createInfo.jobType === 'gsht' ||
                createInfo.jobType === 'khac'
            "
          >
            <div class="item-job">
              <el-form-item label="Từ ngày" prop="startTime">
                <el-date-picker
                  v-model="createInfo.startTime"
                  type="datetime"
                  format="dd-MM-yyyy HH:mm:ss"
                  placeholder="Từ ngày"
                />
              </el-form-item>
              <el-form-item label="Đến ngày" prop="endTime">
                <el-checkbox
                  v-model="createInfo.endTime"
                  class="finish-event"
                >Kết thúc sự kiện</el-checkbox>
                <el-date-picker
                  v-model="createInfo.endTime"
                  type="datetime"
                  format="dd-MM-yyyy HH:mm:ss"
                  placeholder="Đến ngày"
                />
              </el-form-item>
            </div>
            <div class="item-job">
              <el-form-item label="Từ vị trí" prop="startSiteId">
                <el-select
                  v-model="createInfo.startSiteId"
                  collapse-tags
                  placeholder="- Lựa chọn -"
                >
                  <el-option
                    v-for="item in siteList"
                    :key="item.siteId"
                    :label="item.siteName"
                    :value="item.siteId"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="Đến vị trí" prop="endSiteId">
                <el-select
                  v-model="createInfo.endSiteId"
                  collapse-tags
                  placeholder="- Lựa chọn -"
                >
                  <el-option
                    v-for="item in siteList"
                    :key="item.siteId"
                    :label="item.siteName"
                    :value="item.siteId"
                  />
                </el-select>
              </el-form-item>
            </div>
            <div class="item-job">
              <el-form-item label="Chiều" prop="directionCode">
                <el-select
                  v-model="createInfo.directionCode"
                  collapse-tags
                  placeholder="- Lựa chọn -"
                >
                  <el-option
                    v-for="item in directionList"
                    :key="item.value"
                    :label="item.name"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="Mức độ">
                <el-select
                  v-model="createInfo.priority"
                  placeholder="- Lựa chọn -"
                >
                  <el-option
                    v-for="item in levelList"
                    :key="item.value"
                    :label="item.name"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </div>
          </template>
          <!-- ket thuc -->
          <!-- Công bố thông tin -->
          <template v-if="createInfo.jobType === 'cbtt'">
            <div class="item-job">
              <el-form-item label="Ngày hết hạn" prop="endTime">
                <el-date-picker
                  v-model="createInfo.endTime"
                  type="datetime"
                  format="dd-MM-yyyy HH:mm:ss"
                  placeholder="Ngày hết hạn"
                />
              </el-form-item>
              <el-form-item label="Mức độ">
                <el-select
                  v-model="createInfo.priority"
                  placeholder="- Lựa chọn -"
                >
                  <el-option
                    v-for="item in levelList"
                    :key="item.value"
                    :label="item.name"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </div>
          </template>
          <!-- ket thuc -->
          <el-form-item
            v-if="createInfo.jobType"
            label="Mô tả"
            prop="description"
          >
            <ckeditor
              v-model="createInfo.description"
              :editor="editor"
              :config="editorConfig"
            />
          </el-form-item>
        </el-form>
        <div class="footer">
          <el-button type="info" @click="closeAddEditDiv">Hủy bỏ</el-button>
          <el-button
            type="primary"
            :loading="loadingAddEdit"
            @click="confirmJob()"
          >
            Xác nhận
          </el-button>
        </div>
      </div>
      <!-- Gưi kết quả xử lý -->
      <div id="send-result-process-vms-div">
        <div class="title">
          Gửi kết quả xử lý
          <i class="el-icon-close close-detail" @click="closeResultProcess" />
        </div>
        <div class="content form-view">
          <el-form ref="addForm" :model="resultInfo" :rules="rulesResult">
            <div class="item-job width100">
              <el-form-item label="Mô tả" prop="description">
                <ckeditor
                  v-model="createInfo.description"
                  :editor="editor"
                  :config="editorConfig"
                />
              </el-form-item>
            </div>
            <div class="item-job width100">
              <UploadMultiFile
                :key="flagUploadImg"
                @removeUploadImage="removeUploadImageHandle"
                @getListFile="getListFile"
              />
            </div>
          </el-form>
          <div class="footer">
            <el-button
              type="info"
              @click="closeResultProcess"
            >Hủy bỏ</el-button>
            <el-button
              type="primary"
              :loading="loadingJobProcess"
              @click="sendResultProcess()"
            >
              Gửi kết quả xử lý
            </el-button>
          </div>
        </div>
      </div>
      <!-- ket thuc -->
      <!-- Gưi kết quả xử lý sua chua khac phuc su co -->
      <div id="send-result-process-vms-repair-div">
        <div class="title">
          Gửi kết quả xử lý
          <i
            class="el-icon-close close-detail"
            @click="closeResultProcessRepair"
          />
        </div>
        <div
          v-if="deviceListJob && deviceListJob.length > 0"
          class="content form-view"
        >
          <el-form
            ref="repairForm"
            :model="resultInfoRepair"
            :rules="rulesResultRepair"
          >
            <div v-for="(val, ind) in deviceListJob" class="item-job width100">
              <el-form-item label="Tên thiết bị">
                {{ val.name }}
                <input
                  v-model="(resultInfoRepair.deviceId[ind] = val.id)"
                  type="hidden"
                >
              </el-form-item>
              <el-form-item label="Nội dung" prop="comment">
                <el-input
                  v-model="resultInfoRepair.repairComment[ind]"
                  maxlength="255"
                  placeholder="Nội dung"
                />
              </el-form-item>
              <el-form-item label="Loại thiết bị" prop="type">
                <el-input
                  v-model="resultInfoRepair.deviceType[ind]"
                  maxlength="255"
                  placeholder="Loại thiết bị"
                />
              </el-form-item>
            </div>
          </el-form>
          <!-- <div class="footer">
            <el-button type="info" @click="closeResultProcessRepair">Hủy bỏ</el-button>
            <el-button
              type="primary"
              :loading="loadingJobProcess"
              @click="sendResultProcessRepair()">
              Gửi kết quả xử lý
            </el-button>
          </div> -->
        </div>
        <div v-else class="content form-view">
          <i>Không có thiết bị</i>
        </div>
      </div>
      <!-- ket thuc -->
      <!-- Xac minh lai -->
      <div id="send-result-process-vms-reverify-div">
        <div class="title">
          Xác minh lại
          <i
            class="el-icon-close close-detail"
            @click="closeResultProcessVerify"
          />
        </div>
        <div class="content form-view">
          <el-form
            ref="reverifyForm"
            :model="reverifyInfo"
            :rules="rulesResultReverify"
          >
            <div class="item-job width100">
              <el-form-item label="Mô tả" prop="description">
                <ckeditor
                  v-model="reverifyInfo.description"
                  :editor="editor"
                  :config="editorConfig"
                />
              </el-form-item>
            </div>
          </el-form>
          <div class="footer">
            <el-button
              type="info"
              @click="closeResultProcessVerify"
            >Hủy bỏ</el-button>
            <el-button
              type="primary"
              :loading="loadingConfirm"
              @click="reVerifyJob()"
            >
              Xác minh lại
            </el-button>
          </div>
        </div>
      </div>
      <!-- ket thuc -->
      <!-- cap nhat bien bao vms -->
      <div id="update-notice-broad-vms-div">
        <div class="title">
          Cập nhật biển báo VMS
          <i class="el-icon-close close-detail" @click="closeUpdateVms" />
        </div>
        <div class="content form-view">
          <el-form ref="addForm" :model="createInfo" :rules="rules">
            <div class="item">
              <div class="key">ID</div>
              <div class="value">VMSCD0001</div>
            </div>
            <div class="item">
              <div class="key">Loại biển báo</div>
              <div class="value">Biển chỉ dẫn</div>
            </div>
            <div class="item">
              <div class="key">Vị trí</div>
              <div class="value">KM220+100</div>
            </div>
            <div class="item-job width100">
              <el-form-item label="Mẫu bản tin">
                <el-select
                  v-model="vmsInfo.typeTemplate"
                  placeholder="- Lựa chọn -"
                  @change="changeJobTemplate"
                >
                  <el-option
                    v-for="item in newsTemplateList"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </div>
            <div class="item-job width100">
              <el-form-item label="Nội dung">
                <!-- <img :src="vmsInfo.typeTemplate" style="width: 100%;" alt="" /> -->
              </el-form-item>
            </div>
          </el-form>
          <div class="footer">
            <el-button type="info" @click="closeUpdateVms">Hủy bỏ</el-button>
            <!-- <el-button
              type="primary"
              @click="confirmVms()">
              Xác nhận
            </el-button> -->
          </div>
        </div>
      </div>
      <!-- ket thuc -->
    </div>
    <!-- xem detail cong viec -->
    <div id="detail-container">
      <div id="detail-div">
        <div class="title">
          {{ detectJobType(detailInfo.jobType) }}
          <i class="el-icon-close close-detail" @click="closeDetailDiv" />
        </div>
        <div class="content form-view">
          <div class="item">
            <div class="key">Đội</div>
            <div class="value">
              {{ detectGroupId(detailInfo.groupId) }}
            </div>
          </div>
          <div class="item">
            <div class="key">Người xử lý</div>
            <div class="value">
              {{ detectUserId(detailInfo.userIds) }}
            </div>
          </div>
          <div
            v-if="detailInfo.jobType === 'chpt' && detailInfo.toDate"
            class="item"
          >
            <div class="key">Ngày hết hạn</div>
            <div class="value">
              {{ detailInfo.toDate | formatDateVietNam }}
            </div>
          </div>
          <div class="item">
            <div class="key">Mức độ</div>
            <div class="value" :class="detailInfo.priority">
              {{ detectLevel(detailInfo.priority) }}
            </div>
          </div>
          <div class="item">
            <div class="key">Trạng thái</div>
            <div class="value">
              {{ detectStatus(detailInfo.status) }}
            </div>
          </div>
        </div>
        <hr>
        <div class="title">Thông tin công việc</div>
        <!-- cap nhat bien bao vms -->
        <div v-if="detailInfo.jobType === 'cnbbvms'" class="content form-view">
          <div class="item">
            <div class="key">Thiết bị</div>
            <div class="value">
              {{ detectDevice(detailInfo.deviceIds) }}
            </div>
          </div>
          <div class="item">
            <div class="key">Bắt đầu</div>
            <div class="value">
              {{ detailInfo.startTime | formatDateVietNam }}
            </div>
          </div>
          <div class="item">
            <div class="key">Kết thúc</div>
            <div class="value">
              {{ detailInfo.endTime | formatDateVietNam }}
            </div>
          </div>
          <div
            v-if="detailInfo.description"
            class="item"
            style="margin-bottom: 0"
          >
            <div class="key">Mô tả</div>
            <div class="value" v-html="detailInfo.description" />
          </div>
          <!-- cap nhat bien bao vms -->
          <div
            v-if="detailInfo.status === 'PROCESSING'"
            class="footer"
            style="display: block; margin-top: 0"
          >
            <el-button
              style="background: #30b7f8; border: #30b7f8"
              @click="openUpdateVms()"
            >
              Cập nhật biển báo VMS
            </el-button>
            <el-button @click="finishUpdate(detailInfo)">
              Hoàn thành cập nhật
            </el-button>
          </div>
          <hr>
          <template v-if="detailInfo.flagStatusVms">
            <h5 style="font-size: 14px">Tình trạng VMS</h5>
            <el-table
              :data="statusVms"
              class="status-vms-table"
              border
              style="width: 100%"
            >
              <el-table-column label="ID">
                <template slot-scope="scope">
                  <span>{{ scope.row.id }}</span>
                </template>
              </el-table-column>
              <el-table-column label="Vị trí">
                <template slot-scope="scope">
                  <span>{{ scope.row.siteName }}</span>
                </template>
              </el-table-column>
              <el-table-column width="160" label="Thời gian cập nhật">
                <template slot-scope="scope">
                  <span>{{ scope.row.updated_at }}</span>
                </template>
              </el-table-column>
              <el-table-column width="200" label="Nội dung">
                <template slot-scope="scope">
                  <span>
                    <img
                      v-if="event.eventType === 'accident'"
                      style="width: 100%"
                      src="@/assets/images/event/accident.png"
                      alt=""
                    >
                    <img
                      v-else
                      style="width: 100%"
                      :src="scope.row.imagesUrl"
                      alt=""
                    >
                  </span>
                </template>
              </el-table-column>
            </el-table>
          </template>
        </div>
        <!-- cuu ho phuong tien -->
        <div v-if="detailInfo.jobType === 'chpt'" class="content form-view">
          <div class="item">
            <div class="key">Vị trí</div>
            <div class="value">
              {{ detectSite(detailInfo.startSiteId) }}
            </div>
          </div>
          <div class="item">
            <div class="key">Chiều</div>
            <div class="value">
              {{ detectDirection(detailInfo.direction) }}
            </div>
          </div>
          <div v-if="detailInfo.vehicleType" class="item">
            <div class="key">Loại phương tiện</div>
            <div class="value">
              {{ detectVehicelType(detailInfo.vehicleType) }}
            </div>
          </div>
          <div v-if="detailInfo.tonnage" class="item">
            <div class="key">Tải trọng</div>
            <div class="value">
              {{ detailInfo.tonnage }}
            </div>
          </div>
          <div v-if="detailInfo.description" class="item">
            <div class="key">Mô tả</div>
            <div class="value" v-html="detailInfo.description" />
          </div>
          <!-- cu ho phuong tien -->
          <!-- <div class="footer" style="display: block;margin-bottom: 0;" v-if="detailInfo.status === 'PROCESSING'">
            <el-button
              @click="openResultProcess()">
              Gửi kết quả xử lý
            </el-button>
          </div> -->
          <!-- cap nhat bien bao vms -->
          <div
            v-if="detailInfo.status === 'CHECKING'"
            class="footer"
            style="display: block; margin-top: 0"
          >
            <el-button
              :loading="loadingConfirm"
              style="background: #30b7f8; border: #30b7f8"
              @click="openResultProcessVerify()"
            >
              Xác minh lại
            </el-button>
            <el-button @click="finishUpdate(detailInfo)"> Kết thúc </el-button>
          </div>
        </div>
        <!-- Lien he co quan huu quan -->
        <div v-if="detailInfo.jobType === 'lhcqhq'" class="content form-view">
          <div class="item">
            <div class="key">Thời hạn</div>
            <div class="value">
              {{ detailInfo.endTime | formatDateVietNam }}
            </div>
          </div>
          <div class="item">
            <div class="key">Phương thức</div>
            <div class="value">
              {{ detectMethod(detailInfo.notifyMethod) }}
            </div>
          </div>
          <div class="item">
            <div class="key">Cơ quan</div>
            <div class="value">
              {{ detectOrganization(detailInfo.notifyOrganization) }}
            </div>
          </div>
          <div v-if="detailInfo.description" class="item">
            <div class="key">Mô tả</div>
            <div class="value" v-html="detailInfo.description" />
          </div>
        </div>
        <!-- Kiem tra hien truong -->
        <div v-if="detailInfo.jobType === 'ktht'" class="content form-view">
          <div class="item">
            <div class="key">Ngày xử lý</div>
            <div class="value">
              {{ detailInfo.endTime | formatDateVietNam }}
            </div>
          </div>
          <div class="item">
            <div class="key">Từ vị trí</div>
            <div class="value">
              {{ detectSite(detailInfo.startSiteId) }}
            </div>
          </div>
          <div class="item">
            <div class="key">Đến vị trí</div>
            <div class="value">
              {{ detectSite(detailInfo.endSiteId) }}
            </div>
          </div>
          <div class="item">
            <div class="key">Chiều</div>
            <div class="value">
              {{ detectDirection(detailInfo.direction) }}
            </div>
          </div>
          <div v-if="detailInfo.description" class="item">
            <div class="key">Mô tả</div>
            <div class="value" v-html="detailInfo.description" />
          </div>
          <div
            v-if="detailInfo.status === 'CHECKING'"
            class="footer"
            style="display: block; margin-top: 0"
          >
            <el-button
              :loading="loadingConfirm"
              style="background: #30b7f8; border: #30b7f8"
              @click="openResultProcessVerify()"
            >
              Xác minh lại
            </el-button>
            <el-button @click="finishUpdate(detailInfo)"> Kết thúc </el-button>
          </div>
          <!-- cu ho phuong tien -->
          <!--  <div class="footer" style="display: block;margin-bottom: 0;" v-if="detailInfo.status === 'PROCESSING'">
            <el-button
              @click="openResultProcess()">
              Gửi kết quả xử lý
            </el-button>
          </div> -->
        </div>
        <!-- Sửa chữa khắc phục sự cố -->
        <div v-if="detailInfo.jobType === 'sckpsc'" class="content form-view">
          <div class="item">
            <div class="key">Ngày xử lý</div>
            <div class="value">
              {{ detailInfo.endTime | formatDateVietNam }}
            </div>
          </div>
          <div class="item">
            <div class="key">Từ vị trí</div>
            <div class="value">
              {{ detectSite(detailInfo.startSiteId) }}
            </div>
          </div>
          <div class="item">
            <div class="key">Đến vị trí</div>
            <div class="value">
              {{ detectSite(detailInfo.endSiteId) }}
            </div>
          </div>
          <div class="item">
            <div class="key">Chiều</div>
            <div class="value">
              {{ detectDirection(detailInfo.direction) }}
            </div>
          </div>
          <div class="item">
            <div class="key">Thiết bị</div>
            <div class="value">
              {{ detectDevice(detailInfo.deviceIds) }}
            </div>
          </div>
          <div v-if="detailInfo.description" class="item">
            <div class="key">Mô tả</div>
            <div class="value" v-html="detailInfo.description" />
          </div>
          <!-- cu ho phuong tien -->
          <!-- <div class="footer" style="display: block;margin-bottom: 0;" v-if="detailInfo.status === 'PROCESSING'">
            <el-button
              @click="openResultProcessRepair()">
              Gửi kết quả xử lý
            </el-button>
          </div> -->
          <div
            v-if="detailInfo.status === 'CHECKING'"
            class="footer"
            style="display: block; margin-top: 0"
          >
            <el-button
              :loading="loadingConfirm"
              style="background: #30b7f8; border: #30b7f8"
              @click="openResultProcessVerify()"
            >
              Xác minh lại
            </el-button>
            <el-button @click="finishUpdate(detailInfo)"> Kết thúc </el-button>
          </div>
        </div>
        <!-- Đóng làn đường -->
        <div v-if="detailInfo.jobType === 'dld'" class="content form-view">
          <div class="item">
            <div class="key">Bắt đầu</div>
            <div class="value">
              {{ detailInfo.startTime | formatDateVietNam }}
            </div>
          </div>
          <div class="item">
            <div class="key">Kết thúc</div>
            <div class="value">
              {{ detailInfo.endTime | formatDateVietNam }}
            </div>
          </div>
          <div class="item">
            <div class="key">Từ vị trí</div>
            <div class="value">
              {{ detectSite(detailInfo.startSiteId) }}
            </div>
          </div>
          <div class="item">
            <div class="key">Đến vị trí</div>
            <div class="value">
              {{ detectSite(detailInfo.endSiteId) }}
            </div>
          </div>
          <div class="item">
            <div class="key">Chiều</div>
            <div class="value">
              {{ detectDirection(detailInfo.direction) }}
            </div>
          </div>
          <div class="item">
            <div class="key">Làn đường</div>
            <div class="value">
              {{ detecLane(detailInfo.lane) }}
            </div>
          </div>
          <div v-if="detailInfo.description" class="item">
            <div class="key">Mô tả</div>
            <div class="value" v-html="detailInfo.description" />
          </div>
          <div
            v-if="detailInfo.status === 'CHECKING'"
            class="footer"
            style="display: block; margin-top: 0"
          >
            <el-button
              :loading="loadingConfirm"
              style="background: #30b7f8; border: #30b7f8"
              @click="openResultProcessVerify()"
            >
              Xác minh lại
            </el-button>
            <el-button @click="finishUpdate(detailInfo)"> Kết thúc </el-button>
          </div>
          <!-- cu ho phuong tien -->
          <!-- <div class="footer" style="display: block;margin-bottom: 0;" v-if="detailInfo.status === 'PROCESSING'">
            <el-button
              @click="openResultProcess()">
              Gửi kết quả xử lý
            </el-button>
          </div> -->
        </div>
        <!-- Cấm đường -->
        <div
          v-if="
            detailInfo.jobType === 'cd' ||
              detailInfo.jobType === 'gsht' ||
              detailInfo.jobType === 'khac'
          "
          class="content form-view"
        >
          <div class="item">
            <div class="key">Bắt đầu</div>
            <div class="value">
              {{ detailInfo.startTime | formatDateVietNam }}
            </div>
          </div>
          <div class="item">
            <div class="key">Kết thúc</div>
            <div class="value">
              {{ detailInfo.endTime | formatDateVietNam }}
            </div>
          </div>
          <div class="item">
            <div class="key">Từ vị trí</div>
            <div class="value">
              {{ detectSite(detailInfo.startSiteId) }}
            </div>
          </div>
          <div class="item">
            <div class="key">Đến vị trí</div>
            <div class="value">
              {{ detectSite(detailInfo.endSiteId) }}
            </div>
          </div>
          <div class="item">
            <div class="key">Chiều</div>
            <div class="value">
              {{ detectDirection(detailInfo.direction) }}
            </div>
          </div>
          <div class="item">
            <div class="key">Mức độ</div>
            <div class="value">
              {{ detectLevel(detailInfo.priority) }}
            </div>
          </div>
          <div v-if="detailInfo.description" class="item">
            <div class="key">Mô tả</div>
            <div class="value" v-html="detailInfo.description" />
          </div>
          <!-- cu ho phuong tien -->
          <div
            v-if="detailInfo.status === 'CHECKING'"
            class="footer"
            style="display: block; margin-top: 0"
          >
            <el-button
              :loading="loadingConfirm"
              style="background: #30b7f8; border: #30b7f8"
              @click="openResultProcessVerify()"
            >
              Xác minh lại
            </el-button>
            <el-button @click="finishUpdate(detailInfo)"> Kết thúc </el-button>
          </div>
          <!-- <div class="footer" style="display: block;margin-bottom: 0;" v-if="detailInfo.status === 'PROCESSING'">
            <el-button
              @click="openResultProcess()">
              Gửi kết quả xử lý
            </el-button>
          </div> -->
        </div>
        <!-- Công bố thông tin -->
        <div v-if="detailInfo.jobType === 'cbtt'" class="content form-view">
          <div class="item">
            <div class="key">Ngày xử lý</div>
            <div class="value">
              {{ detailInfo.endTime | formatDateVietNam }}
            </div>
          </div>
          <div class="item">
            <div class="key">Mức độ</div>
            <div class="value">
              {{ detectLevel(detailInfo.priority) }}
            </div>
          </div>
          <div v-if="detailInfo.description" class="item">
            <div class="key">Mô tả</div>
            <div class="value" v-html="detailInfo.description" />
          </div>
          <!-- cu ho phuong tien -->
          <!-- <div class="footer" style="display: block;margin-bottom: 0;" v-if="detailInfo.status === 'PROCESSING'">
            <el-button
              @click="openResultProcess()">
              Gửi kết quả xử lý
            </el-button>
          </div> -->
        </div>
        <div class="footer">
          <el-button
            v-if="detailInfo.status !== 'COMPLETE'"
            class="update"
            @click="openEditDiv"
          >
            Chỉnh sửa
          </el-button>
          <!-- <el-button
            v-if="detailInfo.status === 'RECEIVE_PROCESSING'"
            class="verify"
            :loading="loadingConfirm"
            @click="verifyJob(detailInfo)">
            Xác nhận
          </el-button> -->
        </div>
        <!-- thong tin comment -->
        <div class="view-comment">
          <template v-if="detailInfo.actionHistory">
            <div v-for="val in detailInfo.actionHistory" class="item">
              <div class="avatar">
                <img src="@/assets/images/vms/avatar.png" alt="">
              </div>
              <div class="content">
                <span class="name">{{ val.actorName }}</span>
                <span class="status">{{ val.actionName }}</span>
                <span class="time">{{
                  val.actionTime | formatDateVietNamTimeDate
                }}</span>
              </div>
              <div v-if="val.actionCode === 'COMMENT'" class="comment">
                <span v-html="val.content" />
              </div>
            </div>
          </template>
        </div>
        <div class="item comment-input">
          <el-form>
            <el-form-item>
              <ckeditor
                v-model="commentContent"
                :editor="editor"
                :config="editorConfig"
              />
            </el-form-item>
          </el-form>
        </div>
        <div class="footer" style="clear: both; float: right; margin-top: 0">
          <el-button
            class="verify"
            :loading="loadingComment"
            @click="handleComment()"
          >
            Bình luận
          </el-button>
        </div>
        <!-- ket thuc -->
      </div>
    </div>
    <!-- ket thuc -->
  </div>
</template>
<script type="text/javascript">
import axios from 'axios'
import Resource from '@/api/resource'
import ResourceBFF from '@/api/resourceBFF'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import InfoEventPdf from '../print/infoEventPdf'
import VerificationRecord from '../print/verificationRecord'

// data demo
import jobList from '../data/jobList'
import vmsStatus from '@/assets/images/vms/vmsStatus.png'
import UploadMultiFile from './uploadMultiFile'
import { isLogged } from '@/utils/auth'

const groupsResource = new Resource('user/unit/all')
const userResource = new ResourceBFF('system/user')
const eventNotifyCenterResource = new Resource(
  'management/security/center/event-notification-by-event'
)
const jobResource = new Resource('management/center/job')
const jobListResource = new Resource('management/common/job')
const siteResource = new Resource('systemconfig/site?page=0&size=2000')
const deviceResource = new Resource('vmsboard')
const confirmJobResource = new Resource('management/base/job/confirm')
const reVerifyJobResource = new Resource(
  'management/center/job/reverification-request'
)
const laneResource = new Resource('systemconfig/lanes?page=0&size=200')
const jobProcessResource = new Resource('management/base/job/process')
const finishJobResource = new Resource('management/center/job/finish')
const newsTemplateResource = new Resource(
  'systemconfig/news-letter?page=0&size=20'
)
const processRepairJobResource = new Resource(
  'management/base/job/process-repair-job'
)
const commentResource = new Resource('management/common/job/comment')
export default {
  components: {
    VerificationRecord,
    InfoEventPdf,
    UploadMultiFile
  },
  props: {
    event: {
      type: Object,
      default: null
    },
    activeName: {
      type: String,
      default: 'infomation'
    }
  },
  data() {
    const validateEditorContent = (rule, value, callback) => {
      if (value) {
        const regex = /(<([^>]+)>)/gi
        let result = value.replaceAll('&nbsp;', ' ')
        result = result.replace(regex, '')
        if (result.length > 500) {
          callback(new Error('Tối đa 500 ký tự'))
        }
        callback()
      } else {
        callback()
      }
    }
    return {
      editor: ClassicEditor,
      flagKey: 1,
      flagUploadImg: 0,
      listFile: [],
      commentContent: null,
      loadingComment: false,
      dialogVisibleResultProcess: false,
      loadingConfirm: false,
      loadingJobProcess: false,
      deviceListJob: null,
      editorConfig: {
        toolbarLocation: 'bottom',
        toolbar: {
          plugins: [],
          items: [
            'bold',
            'italic',
            'underline',
            '|',
            'bulletedList',
            'numberedList',
            '|',
            'undo',
            'redo'
          ]
        }
      },
      deviceList: [],
      status: {
        RECEIVE_PROCESSING: 'Nhận xử lý',
        PROCESSING: 'Đang xử lý',
        UPDATED_BOARD: 'Cập nhật bảng tin',
        CHECKING: 'Kiểm tra',
        COMPLETE: 'Hoàn thành'
      },
      newsTemplateList: [],
      newsTemplateDetail: null,
      directionList: [
        {
          name: 'HN-NB',
          value: 'HN_NB'
        },
        {
          name: 'NB-HN',
          value: 'NB_HN'
        }
      ],
      laneList: [],
      statusVms: [
        {
          id: 'VMSCD0001',
          siteName: 'KM220+100',
          updated_at: '04/11/2021 12:12:00',
          imagesUrl: vmsStatus
        }
        // {
        //   id: 'VMSCD0001',
        //   siteName: 'KM220+100',
        //   updated_at: '04/11/2021 12:12:00',
        //   imagesUrl: vmsStatus,
        // }
      ],
      reverifyInfo: {
        description: null
      },
      rulesResultReverify: {
        description: [
          {
            required: true,
            message: 'Nội dung là bắt buộc',
            trigger: 'blur'
          }
        ]
      },
      jobTypeList: [
        {
          name: 'Cứu hộ phương tiện',
          value: 'chpt'
        },
        {
          name: 'Cập nhật biển báo VMS',
          value: 'cnbbvms'
        },
        {
          name: 'Liên hệ cơ quan hữu quan',
          value: 'lhcqhq'
        },
        {
          name: 'Kiểm tra hiện trường',
          value: 'ktht'
        },
        {
          name: 'Sửa chữa, khắc phục sự cố',
          value: 'sckpsc'
        },
        {
          name: 'Đóng làn đường',
          value: 'dld'
        },
        {
          name: 'Cấm đường',
          value: 'cd'
        },
        {
          name: 'Công bố thông tin',
          value: 'cbtt'
        },
        {
          name: 'Giám sát hiện trường',
          value: 'gsht'
        },
        {
          name: 'Khác',
          value: 'khac'
        }
      ],
      groupsList: [],
      levelList: [
        {
          name: 'Thấp',
          value: 'LOW_IMPORTANCE'
        },
        {
          name: 'Trung bình',
          value: 'AVERAGE_IMPORTANCE'
        },
        {
          name: 'Cao',
          value: 'HIGH_IMPORTANCE'
        }
      ],
      userList: [],
      siteList: [],
      organizationList: [
        {
          name: 'Cấp cứu',
          value: 'cc'
        },
        {
          name: 'Công an địa phương',
          value: 'cadp'
        },
        {
          name: 'Công an giao thông',
          value: 'cagt'
        },
        {
          name: 'Cứu hỏa',
          value: 'ch'
        }
      ],
      methodList: [
        {
          name: 'SMS',
          value: 'sms'
        },
        {
          name: 'Zalo',
          value: 'zalo'
        },
        {
          name: 'Email',
          value: 'email'
        },
        {
          name: 'Gọi điện',
          value: 'phone'
        }
      ],
      vehicleList: [
        {
          name: 'Xe tải',
          value: 'truck'
        },
        {
          name: 'Container',
          value: 'container'
        },
        {
          name: 'Xe khách',
          value: 'coach'
        },
        {
          name: 'Ô tô con',
          value: 'car'
        }
      ],
      vmsInfo: {
        typeTemplate: null
      },
      createInfo: {
        jobType: null,
        groupId: null,
        userId: null,
        priority: 'LOW_IMPORTANCE',
        startSiteId: null,
        endSiteId: null,
        directionCode: null,
        vehicleType: null,
        vehicleWeight: null,
        endTime: null,
        description: null,
        startTime: null,
        deviceIds: null,
        notifyMethod: null,
        notifyOrganization: null,
        lane: null
      },
      detailInfo: {
        group: null,
        verifiedBy: null
      },
      jobList: null,
      loadingTable: false,
      multipleSelection: [],
      resultInfo: {},
      resultInfoRepair: {
        repairComment: [],
        deviceType: [],
        deviceId: []
      },
      rulesResultRepair: {
        repairComment: [
          {
            required: true,
            message: 'Nội dung là bắt buộc',
            trigger: 'blur'
          }
        ]
      },
      rulesResult: {
        description: [
          {
            required: true,
            message: 'Mô tả là bắt buộc',
            trigger: 'blur'
          }
        ]
      },
      rules: {
        jobType: [
          {
            required: true,
            message: 'Loại công việc là bắt buộc',
            trigger: 'blur'
          }
        ],
        groupId: [
          {
            required: true,
            message: 'Đội là bắt buộc',
            trigger: 'blur'
          }
        ],
        startTime: [
          {
            required: true,
            message: 'Ngày là bắt buộc',
            trigger: 'blur'
          }
        ],
        endTime: [
          {
            required: true,
            message: 'Ngày là bắt buộc',
            trigger: 'blur'
          }
        ],
        deviceIds: [
          {
            required: true,
            message: 'Thiết bị là bắt buộc',
            trigger: 'blur'
          }
        ],
        startSiteId: [
          {
            required: true,
            message: 'Vị trí là bắt buộc',
            trigger: 'blur'
          }
        ],
        notifyMethod: [
          {
            required: true,
            message: 'Phương thức là bắt buộc',
            trigger: 'blur'
          }
        ],
        notifyOrganization: [
          {
            required: true,
            message: 'Tổ chức là bắt buộc',
            trigger: 'blur'
          }
        ],
        directionCode: [
          {
            required: true,
            message: 'Chiều là bắt buộc',
            trigger: 'blur'
          }
        ],
        description: [{ validator: validateEditorContent, trigger: 'change' }]
      },
      loadingAddEdit: false,
      jobKey: 'listJob'
    }
  },
  watch: {
    activeName: function() {
      this.resetFlexDiv()
      this.closeFlexDiv()
    }
  },
  created() {
    this.jobKey = this.jobKey + '_' + this.event.id
    this.initListJob()
    this.getGroupListBySite()
    this.getUser()
    this.getDevice()
    this.getSite()
    this.getLane()
  },
  methods: {
    sendZalo(data = null, image = null) {
      // let apiPath = 'http://103.21.151.166:8685/v1.0/message/zalo'
      // let params = {
      //     // "job": "Liên hệ cơ quan hữu quan",
      //     // "group": this.detectGroupId(data.groupId),
      //     // "process": this.detectUserId(data.userId),
      //     // "expired": moment(data.toDate).format('YYYY-MM-DD HH:mm:ss'),
      //     // "level": this.detectLevel(data.level),
      //     // "organization": this.detectOrganization(data.organization),
      //     // "description": data.description ? data.description.replace(/<\/?[^>]+(>|$)/g, "") : null,
      //     "message": data,
      //     // "image": "http://103.21.151.157:8181/event/9a53e664-0bec-457c-9974-d2ea14d11908/20211105/13/8b8cdce7-57cf-446a-a558-6f69e4894083/845_DROPSPEED_20211105_134430_8b8cdce7-57cf-446a-a558-6f69e4894083.jpg"
      //     "image": image
      // }
      // axios.post(apiPath,params).then(response=>{
      // }).catch(err=>{
      //   console.log(err)
      // })
    },
    initListJob() {
      this.flagKey = Math.floor(Math.random() * 1000 + 500)
      const params = {
        eventId: this.event.parentId
      }
      this.jobList = null
      jobListResource
        .list(params)
        .then((res) => {
          if (res.data) {
            this.jobList = res.data.concat(jobList)
          } else {
            this.jobList = jobList
          }
        })
        .catch((err) => {
          console.log(err)
        })
      // if (localStorage.getItem(this.jobKey) !== null) {
      //     jobListInit = JSON.parse(localStorage.getItem(this.jobKey))
      //     let jobListFilter = this.filterInitListJob(jobListInit)
      //     this.jobList = jobListInit.concat(jobListFilter)
      // }else{
      //   this.jobList = jobList
      // }
    },
    filterInitListJob(jobListInit) {
      // check tồn tại chpt
      let result = jobList
      const chpt = jobListInit.filter(function(val) {
        return val.jobType === 'chpt'
      })
      if (chpt && chpt.length > 0) {
        result = result.filter(function(val) {
          return val.jobType !== 'chpt'
        })
      }
      // check tồn tại cnbbvms
      const cnbbvms = jobListInit.filter(function(val) {
        return val.jobType === 'cnbbvms'
      })
      if (cnbbvms && cnbbvms.length > 0) {
        result = result.filter(function(val) {
          return val.jobType !== 'cnbbvms'
        })
      }
      // check tồn tại lhcqhq
      const lhcqhq = jobListInit.filter(function(val) {
        return val.jobType === 'lhcqhq'
      })
      if (lhcqhq && lhcqhq.length > 0) {
        result = result.filter(function(val) {
          return val.jobType !== 'lhcqhq'
        })
      }
      return result
    },
    getLogTitle(type) {
      switch (type) {
        case 'create':
          return 'đã tạo tin báo này'
        case 'update':
          return 'đã chỉnh sửa tin báo'
        case 'confirm':
          return 'đã xác nhận thông tin'
        case 'verify':
          return 'đã gửi kết quả xác minh'
        case 'update-verify-result':
          return 'đã thay đổi kết quả xác minh'
      }
    },
    resetCreate() {
      this.createInfo = {
        jobType: null,
        groupId: null,
        userId: null,
        priority: 'LOW_IMPORTANCE',
        startSiteId: null,
        endSiteId: null,
        directionCode: null,
        vehicleType: null,
        vehicleWeight: null,
        endTime: null,
        description: null,
        startTime: null,
        deviceIds: null,
        notifyMethod: null,
        notifyOrganization: null,
        lane: null
      }
    },
    convertDate(date) {
      return moment(date, 'YYYY-MM-DD HH:mm:ss').format('DD/MM/YYYY HH:mm:ss')
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    convertDateStr(resDate) {
      const date = moment(resDate, 'YYYY-MM-DD HH:mm:ss')
      const currentTime = moment()
      const yesterday = moment().subtract(1, 'days')
      if (currentTime.isSame(date, 'days')) {
        return 'Hôm nay lúc ' + date.format('HH:mm')
      }
      if (yesterday.isSame(date, 'days')) {
        return 'Hôm qua lúc ' + date.format('HH:mm')
      }

      return date.format('DD/MM/YYYY HH:mm')
    },
    resetFlexDiv() {
      this.closeAddEditDiv()
      this.closeDetailDiv()
      this.closeUpdateVms()
      this.closeResultProcess()
      this.closeResultProcessRepair()
      this.closeResultProcessVerify()
    },
    openCreateDiv(template = false) {
      // this.getGroupListBySite()
      // this.getUser()
      // this.getDevice()
      // this.getSite()
      this.resetFlexDiv()
      if (template === false) {
        this.resetCreate()
      }
      const addEditDiv = document.getElementById('add-edit-div')
      this.openFlexDiv(addEditDiv)
    },
    openEditDiv() {
      this.resetFlexDiv()
      this.initEditJob()
      const addEditDiv = document.getElementById('add-edit-div')
      this.openFlexDiv(addEditDiv)
    },
    initEditJob() {
      const data = _.cloneDeep(this.detailInfo)
      this.createInfo = {
        id: data.id,
        jobType: data.jobType,
        groupId: data.groupId,
        userId: data.userIds ? data.userIds.split(',') : null,
        priority: data.priority,
        startSiteId: data.startSiteId,
        endSiteId: data.endSiteId,
        directionCode: data.direction,
        vehicleType: data.vehicleType,
        vehicleWeight: data.vehicleWeight,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        deviceIds: data.deviceIds ? data.deviceIds.split(',') : null,
        notifyMethod: data.notifyMethod ? data.notifyMethod.split(',') : null,
        notifyOrganization: data.notifyOrganization,
        lane: data.lane
      }
      console.log(this.createInfo)
    },
    openUpdateVms() {
      this.resetFlexDiv()
      this.createInfo = Object.assign({}, this.detailInfo)
      const addEditDiv = document.getElementById('update-notice-broad-vms-div')
      this.openFlexDiv(addEditDiv)
    },
    closeUpdateVms() {
      this.closeFlexDiv()
      const addEditDiv = document.getElementById('update-notice-broad-vms-div')
      const createContainer = document.getElementById('create-container')
      addEditDiv.style.display = 'none'
      createContainer.appendChild(addEditDiv)
    },
    openResultProcess() {
      this.resetFlexDiv()
      this.createInfo = Object.assign({}, this.detailInfo)
      const addEditDiv = document.getElementById('send-result-process-vms-div')
      this.openFlexDiv(addEditDiv)
    },
    closeResultProcess() {
      this.closeFlexDiv()
      const addEditDiv = document.getElementById('send-result-process-vms-div')
      const createContainer = document.getElementById('create-container')
      addEditDiv.style.display = 'none'
      createContainer.appendChild(addEditDiv)
    },
    openResultProcessRepair() {
      this.resetFlexDiv()
      this.detectListDevice(this.detailInfo.deviceIds)
      const addEditDiv = document.getElementById(
        'send-result-process-vms-repair-div'
      )
      this.openFlexDiv(addEditDiv)
    },
    closeResultProcessRepair() {
      this.closeFlexDiv()
      const addEditDiv = document.getElementById(
        'send-result-process-vms-repair-div'
      )
      const createContainer = document.getElementById('create-container')
      addEditDiv.style.display = 'none'
      createContainer.appendChild(addEditDiv)
    },
    openResultProcessVerify() {
      this.resetFlexDiv()
      this.detectListDevice(this.detailInfo.deviceIds)
      const addEditDiv = document.getElementById(
        'send-result-process-vms-reverify-div'
      )
      this.openFlexDiv(addEditDiv)
    },
    closeResultProcessVerify() {
      this.closeFlexDiv()
      const addEditDiv = document.getElementById(
        'send-result-process-vms-reverify-div'
      )
      const createContainer = document.getElementById('create-container')
      addEditDiv.style.display = 'none'
      createContainer.appendChild(addEditDiv)
    },
    closeAddEditDiv() {
      this.loadingAddEdit = false
      this.closeFlexDiv()
      const addEditDiv = document.getElementById('add-edit-div')
      const createContainer = document.getElementById('create-container')
      addEditDiv.style.display = 'none'
      createContainer.appendChild(addEditDiv)
    },
    openDetailDiv() {
      this.resetFlexDiv()
      const detailDiv = document.getElementById('detail-div')
      this.openFlexDiv(detailDiv)
    },
    closeDetailDiv() {
      this.closeFlexDiv()
      const detailDiv = document.getElementById('detail-div')
      const detailContainer = document.getElementById('detail-container')
      detailDiv.style.display = 'none'
      detailContainer.appendChild(detailDiv)
    },
    openFlexDiv(divInside) {
      const flexDiv = document.getElementById('flex-right-div')
      divInside.style.display = 'block'
      flexDiv.appendChild(divInside)
      flexDiv.style.right = '0'
    },
    closeFlexDiv() {
      const flexDiv = document.getElementById('flex-right-div')
      flexDiv.style.right = '-645px'
    },
    async getSite() {
      this.siteList = []
      const { data } = await siteResource.list()
      if (data.data) {
        this.siteList = data.data
      } else {
        this.siteList = []
      }
    },
    async getDevice() {
      this.deviceList = []
      const { data } = await deviceResource.list()
      if (data) {
        this.deviceList = data
      } else {
        this.deviceList = []
      }
    },
    async getNewsTemplate() {
      this.newsTemplateList = []
      const { data } = await newsTemplateResource.list()
      if (data) {
        this.newsTemplateList = data
      } else {
        this.newsTemplateList = []
      }
    },
    async getLane() {
      this.laneList = []
      const { data } = await laneResource.list()
      if (data.content) {
        this.laneList = data.content
      } else {
        this.laneList = []
      }
    },
    async getListNotify() {
      this.notifyList = []
      const queryCustom = {
        eventId: this.event.parentId
      }
      this.loadingTable = true
      const result = await eventNotifyCenterResource.list(queryCustom)
      if (result && result.data) {
        this.notifyList = result.data
      } else {
        this.notifyList = []
      }
      this.loadingTable = false
    },
    async getGroupListBySite() {
      const { data } = await groupsResource.list()
      if (data) {
        this.groupsList = data
      } else {
        this.groupsList = []
      }
    },
    async getUser() {
      const { data } = await userResource.list()
      if (data) {
        this.userList = data
      } else {
        this.userList = []
      }
    },
    reVerifyJob() {
      this.reverifyInfo = this.$root.trimData(this.reverifyInfo)
      this.$refs.reverifyForm.validate((valid) => {
        if (valid) {
          this.loadingConfirm = true
          const params = {
            content: this.reverifyInfo.description
          }
          reVerifyJobResource
            .storeCustom(this.detailInfo.id, params)
            .then((res) => {
              this.loadingConfirm = false
              this.closeResultProcess()
              this.initListJob()
              this.$message({
                type: 'success',
                message: 'Xác minh thành công'
              })
            })
            .catch((err) => {
              this.loadingConfirm = false
              console.log(err)
            })
        } else {
          return false
        }
      })
    },
    verifyJob(data) {
      this.loadingConfirm = true
      confirmJobResource
        .storeSpecJson(data.id)
        .then((res) => {
          this.loadingConfirm = false
          this.closeResultProcess()
          this.initListJob()
          this.$message({
            type: 'success',
            message: 'Xác nhận thành công'
          })
        })
        .catch((err) => {
          this.loadingConfirm = false
          console.log(err)
        })
    },
    showDetail(row) {
      this.detailInfo = Object.assign({}, row)
      if (!this.detailInfo.disable && row.type !== 1) {
        this.openDetailDiv()
      }
    },
    canSelectRow(row, index) {
      return !row.disable
    },
    getListFile(listFile) {
      this.listFile = listFile
    },
    sendResultProcess() {
      this.loadingJobProcess = true
      const params = new FormData()
      this.listFile.forEach((everyFile) => {
        params.append('file', everyFile.raw)
      })
      params.append('keepFileName', true)
      const headers = {
        'Content-Type': 'multipart/form-data',
        Authorization: 'Bearer ' + isLogged()
      }
      axios
        .post(process.env.VUE_APP_UPLOAD_URL + 'file', params, {
          headers: headers
        })
        .then((res) => {
          this.saveResultProcess([])
          // console.log(res)
        })
        .catch((_) => {
          this.loadingJobProcess = false
        })
    },
    sendResultProcessRepair() {
      this.resultInfoRepair = this.$root.trimData(this.resultInfoRepair)
      if (!this.checkVidateArray(this.resultInfoRepair)) {
        this.$message({
          type: 'error',
          message: 'Nội dung và thiết bị không được để trống !'
        })
        return
      }
      const listRepairJobProcessing = []
      let item = null
      for (let i = 0; i < this.resultInfoRepair.deviceType.length; i++) {
        item = {
          deviceId: this.resultInfoRepair.deviceId[i],
          repairComment: this.resultInfoRepair.repairComment[i],
          deviceType: this.resultInfoRepair.deviceType[i]
        }
        listRepairJobProcessing.push(item)
      }
      const params = {
        jobId: this.detailInfo.id,
        listRepairJobProcessing: listRepairJobProcessing
      }
      processRepairJobResource
        .store(params)
        .then((res) => {
          this.closeAddEditDiv()
          this.initListJob()
          this.$message({
            type: 'success',
            message: 'Gửi kết quả xử lý thành công'
          })
          console.log(res)
        })
        .catch((err) => {
          console.log(err)
        })
    },
    checkVidateArray(data) {
      if (data.deviceType.length < 2 || data.repairComment.length < 2) {
        return false
      }
      data.deviceType.forEach((val) => {
        if (!val) {
          return false
        }
      })
      data.repairComment.forEach((val) => {
        if (!val) {
          return false
        }
      })
      return true
    },
    saveResultProcess(listFile) {
      const params = {
        content: 'Kết quả xử lý',
        listFile: listFile
      }
      jobProcessResource
        .storeCustom(this.detailInfo.id, params)
        .then((res) => {
          this.loadingJobProcess = false
          this.closeAddEditDiv()
          this.initListJob()
          this.$message({
            type: 'success',
            message: 'Gửi kết quả xử lý thành công'
          })
        })
        .catch((err) => {
          this.loadingJobProcess = false
          console.log(err)
        })
    },
    removeUploadImageHandle(file) {
      this.listFile = this.listFile.filter(function(val) {
        return val !== file
      })
    },
    confirmJob() {
      this.createInfo = this.$root.trimData(this.createInfo)
      this.$refs.addJobForm.validate((valid) => {
        if (valid) {
          if (this.createInfo.id) {
            this.editJob()
          } else {
            this.addJob()
          }
        } else {
          return false
        }
      })
    },
    addJob() {
      this.loadingAddEdit = true
      const params = _.cloneDeep(this.createInfo)
      const job = {
        eventId: this.event.parentId,
        jobType: params.jobType,
        groupId: params.groupId,
        userId: params.userId ? params.userId.join() : null,
        startTime: params.startTime
          ? moment(params.startTime).format('YYYY-MM-DD HH:mm:ss')
          : null,
        endTime: params.endTime
          ? moment(params.endTime).format('YYYY-MM-DD HH:mm:ss')
          : null,
        startSiteId: params.startSiteId ? params.startSiteId : null,
        endSiteId: params.endSiteId ? params.endSiteId : null,
        priority: params.priority ? params.priority : null,
        directionCode: params.directionCode ? params.directionCode : null,
        directionName: params.directionCode
          ? this.getDirectionName(params.directionCode)
          : null,
        vehicleType: params.vehicleType ? params.vehicleType : null,
        vehicleWeight: params.vehicleWeight ? params.vehicleWeight : null,
        deviceIds: params.deviceIds ? params.deviceIds.join() : null,
        lane: params.lane ? params.lane : null,
        notifyMethod: params.notifyMethod ? params.notifyMethod.join() : null,
        notifyOrganization: params.notifyOrganization
          ? params.notifyOrganization
          : null, // aray
        description: params.description ? params.description : null
      }
      jobResource
        .store(job)
        .then((res) => {
          this.loadingAddEdit = false
          this.closeAddEditDiv()
          this.initListJob()
          this.$message({
            type: 'success',
            message: 'Thêm mới thành công'
          })
        })
        .catch((_) => {
          this.loadingAddEdit = false
        })
      // if(params.jobType === 'lhcqhq'){
      //   job.status = 'PROCESSED'
      // }
      // if(params.jobType === 'lhcqhq' || params.jobType === 'chpt'){
      //   if(params.method.includes('zalo')){
      //     let dataZalo = this.handleDataSendZalo(params)
      //     let image = null
      //     if(this.event.eventType === 'hongxe') {
      //       image = 'http://103.21.151.158:8683/v1.0/upload/layout/image/hongxe1.png'

      //     }else if(this.event.eventType === 'tacduong') {
      //       image = 'http://103.21.151.158:8683/v1.0/upload/layout/image/tacduong1.png'

      //     }else if(this.event.eventType === 'accident') {
      //       image = 'http://103.21.151.158:8683/v1.0/upload/layout/image/tainan1.png'

      //     }else if(this.event.eventType === 'hoahoan') {
      //       image = 'http://103.21.151.158:8683/v1.0/upload/layout/image/hoahoan.png'

      //     }
      //     // this.sendZalo(dataZalo, image)
      //   }
      // }
      // this.addListJob(job)
      // this.initListJob()
    },
    getDirectionName(directionCode) {
      let result = ''
      const text = this.directionList.filter(function(val) {
        return val.value === directionCode
      })
      if (text.length > 0) {
        result = text[0].name
      }
      return result
    },
    hanleCheckJob(selection, row) {
      if (this.checkInArrayObject(row, selection) && row.type === 1) {
        this.resetCreate()
        this.createInfo.jobType = row.jobType
        if (this.createInfo.jobType === 'cnbbvms') {
          this.createInfo.groupId = 'qlbbvms'
        }
        if (this.createInfo.jobType === 'lhcqhq') {
          this.createInfo.groupId = 'qlsk'
        }
        this.openCreateDiv(true)
      }
    },
    checkInArrayObject(obj, list) {
      var i
      for (i = 0; i < list.length; i++) {
        if (list[i] === obj) {
          return true
        }
      }

      return false
    },
    handleDataSendZalo(data) {
      let result = ''
      if (data.jobType === 'lhcqhq') {
        result += 'Loại sự kiện: ' + this.event.eventTypeName + '\n'
        result +=
          'Thời gian: ' +
          moment(this.event.startTime).format('HH:mm DD/MM/YYYY') +
          '\n'
        result += 'Vị trí: ' + this.event.siteName + '\n'
        result += 'Làn đường: Làn 3' + '\n'
        result +=
          'Mô tả: ' + data.description.replace(/<\/?[^>]+(>|$)/g, '') + '\n'
        return result
      }
      if (data.jobType === 'chpt') {
        result += 'Loại sự kiện: ' + this.event.eventTypeName + '\n'
        result +=
          'Thời gian: ' +
          moment(this.event.startTime).format('HH:mm DD/MM/YYYY') +
          '\n'
        result += 'Vị trí: ' + this.event.siteName + '\n'
        result += 'Làn đường: Làn 3' + '\n'
        result += 'Chiều: ' + this.detectDirection(data.direction) + '\n'
        if (data.vehicleType) {
          result +=
            'Loại phương tiện: ' +
            this.detectVehicelType(data.vehicleType) +
            '\n'
        }
        if (data.tonnage) {
          result += 'Trọng tải: ' + data.tonnage + '\n'
        }
        result +=
          'Ngày hết hạn: ' +
          moment(data.toDate).format('DD-MM-YYYY HH:mm:ss') +
          '\n'
        if (data.description) {
          result +=
            'Mô tả: ' + data.description.replace(/<\/?[^>]+(>|$)/g, '') + '\n'
        }
        return result
      }
      return result
    },
    editJob() {
      this.loadingAddEdit = true
      const params = _.cloneDeep(this.createInfo)
      const job = {
        eventId: this.event.parentId,
        jobType: params.jobType,
        groupId: params.groupId,
        userId: params.userId ? params.userId.join() : null,
        startTime: params.startTime
          ? moment(params.startTime).format('YYYY-MM-DD HH:mm:ss')
          : null,
        endTime: params.endTime
          ? moment(params.endTime).format('YYYY-MM-DD HH:mm:ss')
          : null,
        startSiteId: params.startSiteId ? params.startSiteId : null,
        endSiteId: params.endSiteId ? params.endSiteId : null,
        priority: params.priority ? params.priority : null,
        directionCode: params.directionCode ? params.directionCode : null,
        directionName: params.directionCode
          ? this.getDirectionName(params.directionCode)
          : null,
        vehicleType: params.vehicleType ? params.vehicleType : null,
        vehicleWeight: params.vehicleWeight ? params.vehicleWeight : null,
        deviceIds: params.deviceIds ? params.deviceIds.join() : null,
        lane: params.lane ? params.lane : null,
        notifyMethod: params.notifyMethod ? params.notifyMethod.join() : null,
        notifyOrganization: params.notifyOrganization
          ? params.notifyOrganization
          : null, // aray
        description: params.description ? params.description : null
      }
      jobResource
        .update(params.id, job)
        .then((res) => {
          this.loadingAddEdit = false
          this.closeAddEditDiv()
          this.initListJob()
          this.$message({
            type: 'success',
            message: 'Cập nhật thành công'
          })
        })
        .catch((_) => {
          this.loadingAddEdit = false
        })
      // let params = this.createInfo
      // let job = {
      //   uuid: params.uuid,
      //   jobType: params.jobType,
      //   groupId: params.groupId,
      //   level: params.level,
      //   userId: params.userId,
      //   position: params.position,
      //   direction: params.direction,
      //   vehicleType: params.vehicleType,
      //   tonnage: params.tonnage,
      //   expireDate: params.expireDate ? moment(params.expireDate).format('YYYY-MM-DD HH:mm:ss') : null,
      //   description: params.description,
      //   fromDate: params.fromDate ? moment(params.fromDate).format('YYYY-MM-DD HH:mm:ss') : null,
      //   toDate: params.toDate ? moment(params.toDate).format('YYYY-MM-DD HH:mm:ss') : null,
      //   device: params.device,
      //   method: params.method,
      //   organization: params.organization,
      //   disable: false,
      //   status: 'RECEIVE_PROCESSING',
      // }
      // this.removeJob(params.uuid)
      // this.addListJob(job, true)
      // this.initListJob()
    },
    removeJob(id) {
      let jobList = []
      if (localStorage.getItem(this.jobKey) !== null) {
        jobList = JSON.parse(localStorage.getItem(this.jobKey))
      }
      jobList = jobList.filter(function(val) {
        return val.uuid !== id
      })
      jobList = JSON.stringify(jobList)
      localStorage.setItem(this.jobKey, jobList)
    },
    addListJob(job, flagEdit = false) {
      let jobList = []
      if (localStorage.getItem(this.jobKey) !== null) {
        jobList = JSON.parse(localStorage.getItem(this.jobKey))
      }
      jobList.unshift(job)
      jobList = JSON.stringify(jobList)
      localStorage.setItem(this.jobKey, jobList)
      if (flagEdit) {
        this.$message({
          type: 'success',
          message: 'Cập nhật thành công'
        })
      } else {
        this.$message({
          type: 'success',
          message: 'Thêm mới thành công'
        })
      }
      this.closeAddEditDiv()
      // this.$emit('reload-event')
    },
    confirmVms() {
      const params = _.cloneDeep(this.detailInfo)
      const job = {
        uuid: params.uuid,
        jobType: params.jobType,
        groupId: params.groupId,
        level: params.level,
        userId: params.userId,
        position: params.position,
        direction: params.direction,
        vehicleType: params.vehicleType,
        tonnage: params.tonnage,
        expireDate: params.expireDate
          ? moment(params.expireDate).format('YYYY-MM-DD HH:mm:ss')
          : null,
        description: params.description,
        fromDate: params.fromDate
          ? moment(params.fromDate).format('YYYY-MM-DD HH:mm:ss')
          : null,
        toDate: params.toDate
          ? moment(params.toDate).format('YYYY-MM-DD HH:mm:ss')
          : null,
        device: params.device,
        method: params.method,
        organization: params.organization,
        disable: false,
        status: params.status,
        flagStatusVms: true
      }
      this.removeJob(params.uuid)
      this.addListJob(job, true)
      this.initListJob()
      this.detailInfo = job
      this.openDetailDiv()
      // this.closeUpdateVms()
    },
    rowTableClass(row) {
      let className = null
      if (row.row.disable === true) {
        className = 'disable'
      }
      if (row.row.type === 1) {
        className = 'template'
      }
      return className
    },
    handleComment() {
      const params = {
        comment: this.commentContent
      }
      console.log(this.commentContent)
      if (this.commentContent) {
        this.loadingComment = true
        commentResource
          .storeCustom(this.detailInfo.id, params)
          .then((res) => {
            console.log(res)
            this.commentContent = ''
            this.loadingComment = false
          })
          .catch((err) => {
            this.loadingComment = false
            console.log(err)
          })
      }
    },
    reVerify() {},
    finishUpdate(job) {
      this.loadingFinishJob = true
      finishJobResource
        .get(job.id)
        .then((res) => {
          this.loadingFinishJob = false
          this.$message({
            type: 'success',
            message: 'Cập nhật thành công'
          })
          this.closeAddEditDiv()
          this.initListJob()
        })
        .catch((err) => {
          this.loadingFinishJob = false
          console.log(err)
        })
    },
    sendResult(job) {
      this.dialogVisibleResultProcess = true
    },
    // sendResultProcess() {
    //   let job = this.detailInfo
    //   this.removeJob(job.uuid)
    //   job.status = 'CHECKING'
    //   this.addListJob(job, true)
    //   this.initListJob()
    // },
    changeJobTemplate(type) {
      this.newsTemplateDetail
      console.log(type)
    },
    uuid() {
      var dt = new Date().getTime()
      var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
        /[xy]/g,
        function(c) {
          var r = (dt + Math.random() * 16) % 16 | 0
          dt = Math.floor(dt / 16)
          return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
        }
      )
      return uuid
    },
    detectGroupId(type) {
      let result = null
      const data = this.groupsList.filter(function(val) {
        return val.uuid === type
      })
      if (data.length > 0) {
        result = data[0].name
      }
      return result
    },
    detectJobType(type) {
      let result = null
      const data = this.jobTypeList.filter(function(val) {
        return val.value === type
      })
      if (data.length > 0) {
        result = data[0].name
      }
      return result
    },
    detectLevel(type) {
      let result = null
      const data = this.levelList.filter(function(val) {
        return val.value === type
      })
      if (data.length > 0) {
        result = data[0].name
      }
      return result
    },
    detectUserId(type) {
      let result = ''
      if (type) {
        type = type.split(',')
        const data = this.userList.filter(function(val) {
          return type.includes(val.uuid)
        })
        if (data.length > 0) {
          data.forEach(function(val, key) {
            if (key > 0) {
              result += ', ' + val.userName
            } else {
              result += val.userName
            }
          })
        }
      }
      return result
    },
    detectStatus(type) {
      const result = this.status[type]
      return result
    },
    detectDevice(type) {
      let result = ''
      if (type) {
        type = type.split(',')
        const data = this.deviceList.filter(function(val) {
          return type.includes(val.id)
        })
        if (data.length > 0) {
          data.forEach(function(val, key) {
            if (key > 0) {
              result += ', ' + val.name
            } else {
              result += val.name
            }
          })
        }
      }
      return result
    },
    detectListDevice(type) {
      let result = null
      if (type) {
        type = type.split(',')
        const data = this.deviceList.filter(function(val) {
          return type.includes(val.id)
        })
        result = data
      }
      this.deviceListJob = result
    },
    detectSite(type) {
      let result = ''
      if (type) {
        type = type.split(',')
        const data = this.siteList.filter(function(val) {
          return type.includes(val.siteId)
        })
        if (data.length > 0) {
          data.forEach(function(val, key) {
            if (key > 0) {
              result += ', ' + val.siteName
            } else {
              result += val.siteName
            }
          })
        }
      }
      return result
    },
    detectVehicelType(type) {
      let result = null
      const data = this.vehicleList.filter(function(val) {
        return val.value === type
      })
      if (data.length > 0) {
        result = data[0].name
      }
      return result
    },
    detectOrganization(type) {
      let result = ''
      if (type) {
        const data = this.organizationList.filter(function(val) {
          return type.includes(val.value)
        })
        if (data.length > 0) {
          data.forEach(function(val, key) {
            if (key > 0) {
              result += ', ' + val.name
            } else {
              result += val.name
            }
          })
        }
      }
      return result
    },
    detectMethod(type) {
      let result = ''
      if (type) {
        const data = this.methodList.filter(function(val) {
          return type.includes(val.value)
        })
        if (data.length > 0) {
          data.forEach(function(val, key) {
            if (key > 0) {
              result += ', ' + val.name
            } else {
              result += val.name
            }
          })
        }
      }
      return result
    },
    detecLane(type) {
      let result = ''
      if (type) {
        const data = this.laneList.filter(function(val) {
          return type === val.id
        })
        if (data.length > 0) {
          data.forEach(function(val, key) {
            if (key > 0) {
              result += ', ' + val.name
            } else {
              result += val.name
            }
          })
        }
      }
      return result
    },
    detectDirection(type) {
      let result = ''
      if (type) {
        const data = this.directionList.filter(function(val) {
          return type.includes(val.value)
        })
        if (data.length > 0) {
          data.forEach(function(val, key) {
            if (key > 0) {
              result += ', ' + val.name
            } else {
              result += val.name
            }
          })
        }
      }
      return result
    },
    resetListJob() {
      localStorage.removeItem(this.jobKey)
      this.initListJob()
    }
  }
}
</script>
<style lang="scss">
.complete {
  color: #67c23a;
}
.receive_processing {
  /*color: #e6a23c;*/
}
.event-page .el-tabs__content {
  overflow: auto;
}
.info-process {
  clear: both;
  margin-top: 10px;
  display: inline-block;
  max-width: calc(100% - 28px);
  float: right;
  .description {
    margin-bottom: 10px;
  }
}
.finish-event {
  margin-bottom: 0;
  float: right;
  .el-checkbox__label {
    font-weight: normal;
  }
}
.comment-input {
  clear: both;
  margin-top: 15px;
  float: left;
  width: 100%;
}
.view-comment {
  background: #f8f8f8;
  margin-top: 20px;
  float: left;
  width: 100%;
  padding: 15px;
  border-radius: 4px;
  .item:first-child {
    margin-top: 0;
  }
  .item {
    clear: both;
    margin-top: 15px;
    float: left;
    width: 100%;
    .avatar {
      width: 28px;
      float: left;
      margin-right: 10px;
      img {
        border-radius: 50%;
        width: 28px;
        height: 28px;
      }
    }
    .content {
      width: calc(100% - 38px);
      float: left;
      padding-top: 2px;
      .status {
        font-weight: 500;
        margin-right: 10px;
      }
      .time {
        color: #aaaaaa;
        font-size: 14px;
        font-weight: 400;
      }
    }
    .name {
      color: #1c9ad6;
      font-weight: 500;
      margin-right: 5px;
    }
  }
}
.el-table.status-vms-table td.el-table__cell,
.el-table.status-vms-table th.el-table__cell.is-leaf {
  border-right: 1px solid #dbd3d3;
}
.status-vms-table {
  th {
    background: #f0f0f0 !important;
  }
  td:last-child {
    padding: 0 !important;
    .cell {
      padding: 0 !important;
    }
  }
}
.line-horizontal {
  width: 100%;
  height: 1px;
  background: #ddd;
  margin-top: 10px;
  margin-bottom: 10px;
}
.low {
  color: #cf8787;
}
.medium {
  color: #fdb441;
}
.high {
  color: #db3332;
}
.init {
  color: #cf8787;
}
.checking {
  color: #fdb441;
}
.processing {
  color: #1f7ff5;
}
.processed {
  color: green;
}
#pane-notify {
  .el-table__body-wrapper {
    table {
      height: 100%;
    }
  }
  .el-table__body {
    td {
      height: 100%;
    }
  }
}
.item-job.width100 {
  .el-form-item {
    width: 100% !important;
  }
}
.event-page {
  #send-result-process-vms-repair-div {
    .item-job {
      .el-form-item:nth-child(1) {
        margin-right: 0;
      }
      .el-form-item:nth-child(2) {
        margin-left: 0;
      }
      .el-form-item {
        margin-bottom: 5px;
      }
    }
  }
}
.item-job {
  .el-form-item {
    width: calc(50% - 10px) !important;
    float: left;
    display: inline-block !important;
    clear: initial !important;
    .el-date-editor {
      width: 100% !important;
    }
    .el-form-item__label {
      margin-bottom: 0;
    }
  }
  .el-form-item:nth-child(1) {
    margin-right: 10px;
  }
  .el-form-item:nth-child(2) {
    margin-left: 10px;
  }
  input {
    height: 41px !important;
  }
}
.event-notify-block {
  background: #f5f5f5;
  padding: 20px;
  height: calc(100vh - 200px);
  .btn-create {
    background-color: #1f7ff5;
    /*width: 147px;*/
    height: 40px;
    border-radius: 4px;
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 20px;
  }
  .el-table--border {
    border-bottom: 1px solid #b6b6b6;
  }
  .table-container-button {
    top: 80px !important;
  }
  .table-container {
    transition: all 0.5s ease-in-out;
    /*position: absolute;
      bottom: 20px;
      right: 20px;
      left: 42px;
      top: 30px;*/
    .el-table {
      thead {
        th {
          background-color: #eef5ff;
          height: 45px;
          font-size: 14px;
          font-weight: bold;
          .cell {
            text-align: left;
          }
        }
        th:first-child {
          .cell {
            text-align: center;
          }
        }
        th.is-leaf {
          border-left: 1px solid #b6b6b6;
        }
        th:first-child {
          border-left: none;
          padding: 0;
          .cell {
            padding: 0 !important;
          }
        }
      }
      tbody {
        td {
          font-size: 14px;
          border-left: 1px solid #b6b6b6;
          border-bottom: 1px solid #b6b6b6;
          .cell {
            /*text-align: center !important;*/
          }
        }
        td:first-child {
          display: flex;
          justify-content: center;
          border-left: none;
          .cell {
            padding: 0 !important;
          }
        }
      }
    }
  }
}
tr.template {
  opacity: 0.6;
}
tr.disable {
  opacity: 0.6;
  cursor: initial;
}
.status-1 {
  color: #f5651f;
}
.status-2 {
  color: #ff6161;
}
.status-3 {
  color: #1f7ff5;
}

#add-edit-div {
  display: none;
  form {
    display: flex;
    flex-direction: column;
    .el-form-item {
      width: 100%;
      display: flex;
      flex-direction: column;
      label {
        text-align: left;
        color: black;
      }
      .el-form-item__content {
        .el-select {
          width: 100%;
        }
      }
    }
  }
  .footer {
    display: flex;
    justify-content: space-between;
    margin-top: 15px;
    button {
      width: 147px;
      height: 40px;
      border-radius: 4px;
      font-size: 16px;
      font-weight: bold;
    }
  }
  .ck-editor__editable {
    min-height: 150px;
    max-height: 150px;
  }
}

#detail-div::-webkit-scrollbar {
  display: none;
}
#send-result-process-vms-reverify-div,
#send-result-process-vms-repair-div,
#send-result-process-vms-div {
  display: none;
  .el-form-item__label {
    width: 100%;
  }
  .title {
    font-size: 20px;
    font-weight: 500;
    margin-bottom: 10px;
    color: #292663;
    .close-detail {
      background: #e3e3e3;
      height: 30px;
      width: 30px;
      border-radius: 50%;
      text-align: center;
      line-height: 30px;
      color: #878787;
      font-size: 16px;
      position: absolute;
      right: 10px;
      top: 10px;
      cursor: pointer;
    }
  }
  form {
    display: flex;
    flex-direction: column;
    .el-form-item {
      width: 100%;
      display: flex;
      flex-direction: column;
      label {
        text-align: left;
        color: black;
      }
      .el-form-item__content {
        .el-select {
          width: 100%;
        }
      }
    }
  }
  .footer {
    display: flex;
    justify-content: space-between;
    margin-top: 15px;
    button {
      /*width: 165px;*/
      height: 40px;
      border-radius: 4px;
      font-size: 16px;
      font-weight: bold;
    }
  }
  .ck-editor__editable {
    min-height: 150px;
    max-height: 150px;
  }
}
#update-notice-broad-vms-div {
  display: none;
  .title {
    font-size: 20px;
    font-weight: 500;
    margin-bottom: 10px;
    color: #292663;
    .close-detail {
      background: #e3e3e3;
      height: 30px;
      width: 30px;
      border-radius: 50%;
      text-align: center;
      line-height: 30px;
      color: #878787;
      font-size: 16px;
      position: absolute;
      right: 10px;
      top: 10px;
      cursor: pointer;
    }
  }
  form {
    display: flex;
    flex-direction: column;
    .el-form-item {
      width: 100%;
      display: flex;
      flex-direction: column;
      label {
        text-align: left;
        color: black;
      }
      .el-form-item__content {
        .el-select {
          width: 100%;
        }
      }
    }
  }
  .footer {
    display: flex;
    justify-content: space-between;
    margin-top: 15px;
    button {
      width: 147px;
      height: 40px;
      border-radius: 4px;
      font-size: 16px;
      font-weight: bold;
    }
  }
  .ck-editor__editable {
    min-height: 150px;
    max-height: 150px;
  }
}
.content.form-view {
  .item {
    display: flex;
    flex-direction: row;
    font-size: 14px;
    margin-bottom: 12px;

    .key {
      width: 130px;
      opacity: 0.7;
    }

    .value {
      font-weight: 500;
    }

    #detail-des {
      margin-top: -14px;
    }
  }
}
#detail-div {
  display: none;
  overflow-y: scroll;
  height: 100%;
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
  .title {
    font-size: 20px;
    color: #292663;
    font-weight: 500;
    margin-bottom: 10px;
    .close-detail {
      background: #e3e3e3;
      height: 30px;
      width: 30px;
      border-radius: 50%;
      text-align: center;
      line-height: 30px;
      color: #878787;
      font-size: 16px;
      position: absolute;
      right: 10px;
      top: 10px;
      cursor: pointer;
    }
  }
  .footer {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
    margin-bottom: 20px;
    button {
      height: 40px;
      border-radius: 4px;
      font-size: 16px;
      font-weight: 500;
      background-color: #1c9ad6;
      color: white;
      text-align: center;
      border: 1px solid #1c9ad6;
    }
    .update {
      /*width: 120px;*/
    }
    .verify {
      /*width: 120px;*/
    }
  }

  .history {
    border-radius: 3px;
    background-color: #f8f8f8;
    font-size: 14px;
    line-height: 24px;
    padding: 5px 8px;
    .margin-bottom-6 {
      margin-bottom: 10px;
    }

    .item {
      display: flex;
      flex-direction: row;

      .avatar {
        width: 24px;
        height: 24px;

        img {
          object-fit: cover;
          border-radius: 100%;
        }
      }

      .content {
        color: black;
        font-weight: bold;
        padding-left: 5px;

        .name {
          color: #26c6da;
        }

        .time {
          font-size: 12px;
          color: #aaaaaa;
          padding-left: 5px;
          font-weight: normal;

          .dot {
            width: 2px;
            height: 2px;
            color: #707070;
          }
        }
      }
    }

    .sub-item {
      display: flex;
      flex-direction: row;
      margin-left: 29px;

      .verify-content > * {
        margin-top: 0;
        margin-bottom: 0;
      }

      .content {
        color: #565656;

        .group {
          font-weight: bold;
        }

        .time {
          font-size: 12px;
          color: #aaaaaa;
          padding-left: 5px;

          .dot {
            width: 2px;
            height: 2px;
            color: #707070;
          }
        }
      }
    }

    .list-item-upload {
      display: grid;
      grid-template-columns: 130px 130px 130px 130px;
      column-gap: 4px;
      row-gap: 4px;
      margin-bottom: 10px;
      .document {
        button:last-child {
          display: none;
        }
      }
    }
  }
}
</style>
