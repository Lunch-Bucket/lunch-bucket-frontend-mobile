import axios from 'axios';

const lunchBucketAPI = axios.create({baseURL: 'https://1p8cy9d7v2.execute-api.ap-south-1.amazonaws.com/dev/'});
// const auth2API = axios.create({baseURL: 'https://fmrlw0xn6h.execute-api.ap-south-1.amazonaws.com/dev/'});

// const lunchBucketAPI = axios.create({baseURL: 'https://m9sbeatlg0.execute-api.ap-south-1.amazonaws.com/prod/'});

const auth2API = axios.create({baseURL: 'https://fmrlw0xn6h.execute-api.ap-south-1.amazonaws.com/dev/'});

export {lunchBucketAPI, auth2API};