import client from "./client";

const makeApiRequest = async (method, endpoint, data) => {
    try {
        const response = await client.request({
            method,
            url: endpoint,
            data // add the data parameter to the request options
        });
        return { data: response.data, status: response.status };
    } catch (error) {
        const { response } = error;
        if (response?.data) {
            return { data: response.data, status: response.status };
        }
        return { error: error.message || error };
    }
};

const buildQueryString = (params) => {
    if (typeof params === 'string') return params;

    if (params && typeof params === 'object') {
        const searchParams = new URLSearchParams();
        for (const [key, value] of Object.entries(params)) {
            if (value !== undefined && value !== null && value !== '') {
                searchParams.append(key, value);
            }
        }
        return searchParams.toString();
    }

    return '';
};

export const loginUser = async (data) => {
    const response = await makeApiRequest('POST', '/auth/login', data);
    return response;
};


// organization 

export const createOrganization = async (data) => {
    const response = await makeApiRequest('POST', '/organization/', data);
    return response;
};


// students
export const createUserByRole = async (data) => {
    return await makeApiRequest('POST', '/organization/users/', data);
};

export const getUsers = async (params = {}) => {
    const queryString = buildQueryString(params);
    const endpoint = `/organization/users/${queryString ? `?${queryString}` : ''}`;
    return await makeApiRequest('GET', endpoint);
};

export const updateUser = async (id, data) => {
    return await makeApiRequest('PUT', `/organization/users/${id}`, data);
};

export const deleteUser = async (id) => {
    return await makeApiRequest('DELETE', `/organization/users/${id}`);
};

// courses 
export const createCourse = async (data) => {
    return await makeApiRequest('POST', '/organization/course/', data);
};

export const getCourses = async (params = {}) => {
    const queryString = buildQueryString(params);
    const endpoint = `/organization/course/${queryString ? `?${queryString}` : ''}`;
    return await makeApiRequest('GET', endpoint);
};


export const updateCourse = async (id, data) => {
    return await makeApiRequest('PUT', `/organization/course/${id}`, data);
};

export const deleteCourse = async (id) => {
    return await makeApiRequest('DELETE', `/organization/course/${id}`);
};


export const fetchDashboard = async () => {
    return await makeApiRequest('GET', `/organization/users/dashboard`);
};

export const fetchTutorDashboard = async () => {
    return await makeApiRequest('GET', `/organization/users/dashboard/tutor`);
};

export const fetchStudentDashboard = async () => {
    return await makeApiRequest('GET', `/organization/users/dashboard/student`);
};

// classes 
export const createClass = async (data) => {
    return await makeApiRequest('POST', '/organization/classes/', data);
};

export const getClass = async (params = {}) => {
    const queryString = buildQueryString(params);
    const endpoint = `/organization/classes/${queryString ? `?${queryString}` : ''}`;
    return await makeApiRequest('GET', endpoint);
};

export const updateClass = async (classId, data) => {
    return await makeApiRequest('PUT', `/organization/classes/${classId}`, data);
};

export const deleteClass = async (classId) => {
    return await makeApiRequest('DELETE', `/organization/classes/${classId}`);
};

// attendance 

export const createAttendance = async (data) => {
    return await makeApiRequest('POST', '/organization/attendance/', data);
};

export const getAttendanceDetails = async (classId) => {
    return await makeApiRequest('GET', `/organization/attendance/${classId}`);
};

export const signInAttendance = async (data) => {
    return await makeApiRequest('POST', '/organization/attendance/signin', data);
};


export const signOutAttendance = async (data) => {
    return await makeApiRequest('POST', '/organization/attendance/signout', data);
};
////

export const getActiveAttendanceSessions = async () => {
    return await makeApiRequest('GET', '/organization/attendance/active',);
};

export const getPastAttendanceSessions = async () => {
    return await makeApiRequest('GET', '/organization/attendance/past',);
};

export const closeAttendance = async (sessionId) => {
    return await makeApiRequest('POST', `/organization/attendance/close/${sessionId}`,);
};

// marking attendance

export const fetchStudentClass = async () => {
    return await makeApiRequest('GET', `/organization/classes/student`,);
};

export const fetchPastAttendance = async () => {
    return await makeApiRequest('GET', `/organization/attendance/history`,);
};
