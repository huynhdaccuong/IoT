import axiosClient from '../api/axiosClient';

const deviceService = {
    // Lấy danh sách thiết bị
    getAllDevices: async () => {
        // axiosClient đã xử lý .data trong interceptor, nên ở đây nhận data trực tiếp
        // Tuy nhiên, nếu BE trả về array trực tiếp thì axiosClient trả về array đó
        // Nếu BE trả về { data: [...] } thì cần check lại log
        // Hàm get trả về Promise, component sẽ await
        return await axiosClient.get('/devices');
    },

    // Thêm thiết bị mới
    addDevice: async (deviceData) => {
        // deviceData gồm { device_code, name }
        return await axiosClient.post('/devices', deviceData);
    },

    // Lấy chi tiết thiết bị
    getDeviceDetail: async (deviceId) => {
        return await axiosClient.get(`/devices/${deviceId}`);
    },

    // Xóa thiết bị
    deleteDevice: async (deviceId) => {
        return await axiosClient.delete(`/devices/${deviceId}`);
    },

    // Cập nhật tên thiết bị
    updateDevice: async (deviceId, deviceData) => {
        return await axiosClient.put(`/devices/${deviceId}`, deviceData);
    },

    // Chia sẻ thiết bị với user khác
    shareDevice: async (deviceId, data) => {
        return await axiosClient.post(`/devices/${deviceId}/share`, data);
    },

    // Lấy danh sách user đã được chia sẻ thiết bị
    getSharedUsers: async (deviceId) => {
        return await axiosClient.get(`/devices/${deviceId}/share`);
    },

    // Xóa user khỏi danh sách chia sẻ
    removeSharedUser: async (deviceId, shareUserId) => {
        return await axiosClient.delete(`/devices/${deviceId}/share/${shareUserId}`);
    }
};

export default deviceService;