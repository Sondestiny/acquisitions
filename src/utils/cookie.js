import dotenv from 'dotenv/config';
const cookie = {
  getOptions: () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  }),
  SetCookie: (res, name, value, options = {}) => {
    res.cookie(name, value, { ...cookie.getOptions(), ...options });
  },
  ClearCookie: (res, name, options = {}) => {
    res.clearCookie(name, { ...cookie.getOptions(), ...options });
  },
  GetCookie: (req, name) => {
    return req.cookies[name];
  }
};
export default cookie;