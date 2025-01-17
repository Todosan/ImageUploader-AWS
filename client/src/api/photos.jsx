const API_URL = 'http://localhost:3000'

export const uploadPhoto = (body) => {
    return fetch(API_URL, {
        method: 'POST',
        body,
    });
};
